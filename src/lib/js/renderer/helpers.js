import isEqual from 'lodash/isEqual.js'
import dom, { REQUIRED_GROUP_ATTR } from '../common/dom.js'
import { cleanFormData } from '../common/utils/index.mjs'
import { ASSIGNMENT_OPERATORS, COMPARISON_OPERATORS, UUID_REGEXP } from '../constants.js'

export const RENDER_PREFIX = 'f-'

export const containerLookup = container =>
  typeof container === 'string' ? document.querySelector(container) : container
export const processOptions = ({ editorContainer, renderContainer, formData, ...opts }) => {
  const processedOptions = {
    renderContainer: containerLookup(renderContainer),
    editorContainer: containerLookup(editorContainer),
    formData: cleanFormData(formData),
  }

  return { elements: {}, ...opts, ...processedOptions }
}

export const baseId = id => {
  const match = id.match(UUID_REGEXP)
  return match?.[0] || id
}

const isVisible = elem => {
  if (!elem) return false

  if (elem.hasAttribute('hidden') || elem.parentElement?.hasAttribute('hidden')) {
    return false
  }

  const computedStyle = window.getComputedStyle(elem)
  return !(computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0')
}

const CHECKABLE_INPUT_SELECTOR = 'input[type="checkbox"], input[type="radio"]'
const CHECKABLE_TYPES = new Set(['checkbox', 'radio'])

const tagName = elem => elem?.tagName?.toLowerCase()

const isCheckableInput = elem => tagName(elem) === 'input' && CHECKABLE_TYPES.has(elem.type)

/**
 * Radio and checkbox fields render as a wrapper holding one input per option, so a
 * field address resolves to the wrapper rather than to anything carrying a value.
 * @param  {Element} elem
 * @return {Array<Element>|null} option inputs, or null when elem is not a group
 */
export const checkableGroupInputs = elem => {
  if (!elem || isCheckableInput(elem) || typeof elem.querySelectorAll !== 'function') {
    return null
  }

  const inputs = elem.querySelectorAll(CHECKABLE_INPUT_SELECTOR)

  return inputs.length ? Array.from(inputs) : null
}

export const isCheckableGroup = elem => Boolean(checkableGroupInputs(elem))

/**
 * Value a condition compares against. Controls that can hold several values at once
 * yield an array so that a single selection still matches an `equals` comparison.
 * @param  {Element} elem
 * @return {String|Array<String>|undefined}
 */
export const elementValue = elem => {
  if (!elem) {
    return undefined
  }

  const groupInputs = checkableGroupInputs(elem)
  if (groupInputs) {
    const checkedValues = groupInputs.filter(input => input.checked).map(input => input.value)

    return groupInputs.every(input => input.type === 'radio') ? (checkedValues[0] ?? '') : checkedValues
  }

  if (tagName(elem) === 'select' && elem.multiple) {
    return Array.from(elem.selectedOptions, option => option.value)
  }

  if (isCheckableInput(elem)) {
    return elem.checked ? elem.value : ''
  }

  return elem.value
}

const isChecked = elem => {
  const groupInputs = checkableGroupInputs(elem)

  return groupInputs ? groupInputs.some(input => input.checked) : Boolean(elem?.checked)
}

export const propertyMap = {
  isChecked: elem => {
    return isChecked(elem)
  },
  isNotChecked: elem => {
    return !isChecked(elem)
  },
  value: elementValue,
  // "checked" is emitted by pre-v5 editors, where it stored the selected value rather than a boolean
  checked: elementValue,
  isVisible: elem => {
    return isVisible(elem)
  },
  isNotVisible: elem => {
    return !isVisible(elem)
  },
}

export const createRemoveButton = () =>
  dom.btnTemplate({
    className: 'remove-input-group',
    children: dom.icon('remove'),
    action: {
      mouseover: ({ target }) => target.parentElement.classList.add('will-remove'),
      mouseleave: ({ target }) => target.parentElement.classList.remove('will-remove'),
      click: ({ target }) => target.parentElement.remove(),
    },
  })

const equals = (source, target) =>
  Array.isArray(source) ? source.some(value => isEqual(value, target)) : isEqual(source, target)

const contains = (source, target) => {
  if (source == null) {
    return false
  }

  return Array.isArray(source) ? source.includes(target) : String(source).includes(target)
}

export const comparisonHandlers = {
  equals,
  notEquals: (source, target) => !equals(source, target),
  contains,
  notContains: (source, target) => !contains(source, target),
}

export const comparisonMap = Object.entries(COMPARISON_OPERATORS).reduce((acc, [key, value]) => {
  // support and new comparison operators for backwards compatibility
  acc[value] = comparisonHandlers[key]
  acc[key] = comparisonHandlers[key]

  return acc
}, {})

const assignmentHandlers = {
  equals: (elem, { targetProperty, value }) => {
    elem[`_${targetProperty}`] = elem[targetProperty]
    elem[targetProperty] = value
  },
}

export const assignmentMap = Object.entries(ASSIGNMENT_OPERATORS).reduce((acc, [key, value]) => {
  acc[value] = assignmentHandlers[key]
  acc[key] = assignmentHandlers[key]

  return acc
}, {})

/**
 * Setting `checked` fires no `change`, so a required checkbox group the box belongs to is
 * re-synced directly. A synthetic `change` could re-trigger conditions.
 * @param {Element} elem checkbox or radio input
 */
const syncRequiredGroupOf = elem => {
  const group = elem.closest?.(REQUIRED_GROUP_SELECTOR)
  if (group) {
    dom.syncCheckboxGroupRequired(group)
  }
}

export const targetPropertyMap = {
  isChecked: elem => {
    elem.checked = true
    syncRequiredGroupOf(elem)
  },
  isNotChecked: elem => {
    elem.checked = false
    syncRequiredGroupOf(elem)
  },
  value: (elem, { assignment, ...rest }) => {
    const assignmentAction = assignmentMap[assignment]?.(elem, rest)

    const event = new Event('input', { bubbles: true })
    elem.dispatchEvent(event)

    return assignmentAction
  },
  isNotVisible: elem => {
    elem.parentElement.setAttribute('hidden', true)
    suspendRequired(elem)
  },
  isVisible: elem => {
    elem.parentElement.removeAttribute('hidden')
    restoreRequired(elem)
  },
}

const FORM_CONTROL_SELECTOR = 'input, select, textarea'
const REQUIRED_GROUP_SELECTOR = `[data-${REQUIRED_GROUP_ATTR}]`

/**
 * The element itself when it matches, plus every descendant that does
 * @param {Element} elem
 * @param {String} selector
 * @return {Array<Element>}
 */
const selfAndDescendants = (elem, selector) => [
  ...(elem.matches(selector) ? [elem] : []),
  ...elem.querySelectorAll(selector),
]

/**
 * A hidden control can't be filled in, so it must not be required. Remembers each control's
 * `required` so that restoreRequired can put it back. Works for a field, a group or a whole row.
 * @param {Element} elem condition target
 */
export const suspendRequired = elem => {
  for (const control of selfAndDescendants(elem, FORM_CONTROL_SELECTOR)) {
    if (control._required === undefined) {
      control._required = control.required
    }
    control.required = false
  }
}

/**
 * Undoes suspendRequired. Controls that were never suspended are left alone.
 * @param {Element} elem condition target
 */
export const restoreRequired = elem => {
  for (const control of selfAndDescendants(elem, FORM_CONTROL_SELECTOR)) {
    if (control._required !== undefined) {
      control.required = control._required
      delete control._required
    }
  }
  // a required checkbox group's state depends on which boxes are checked now
  for (const group of selfAndDescendants(elem, REQUIRED_GROUP_SELECTOR)) {
    dom.syncCheckboxGroupRequired(group)
  }
}

const LOGICAL_AND = new Set(['&&', 'and'])

/**
 * Splits a condition's if-clauses into OR-groups of AND-ed clauses. A clause's `logical`
 * ('&&' / '||', or 'and' / 'or') joins it to the clause before it, and '&&' binds tighter
 * than '||' as in JavaScript. The first clause's `logical` is ignored, and a missing
 * `logical` means OR, which is how every clause behaved before AND was supported.
 * @param {Array<Object>} ifConditions
 * @return {Array<Array<Object>>} e.g. A || B && C -> [[A], [B, C]]
 */
export const groupIfConditions = (ifConditions = []) =>
  ifConditions.reduce((groups, clause, index) => {
    if (index > 0 && LOGICAL_AND.has(clause.logical)) {
      groups[groups.length - 1].push(clause)
    } else {
      groups.push([clause])
    }
    return groups
  }, [])
