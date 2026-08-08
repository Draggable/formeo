import isEqual from 'lodash/isEqual.js'
import dom from '../common/dom.js'
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

export const targetPropertyMap = {
  isChecked: elem => {
    elem.checked = true
  },
  isNotChecked: elem => {
    elem.checked = false
  },
  value: (elem, { assignment, ...rest }) => {
    const assignmentAction = assignmentMap[assignment]?.(elem, rest)

    const event = new Event('input', { bubbles: true })
    elem.dispatchEvent(event)

    return assignmentAction
  },
  isNotVisible: elem => {
    if (elem?._required === undefined) {
      elem._required = elem.required
    }
    elem.parentElement.setAttribute('hidden', true)
    elem.required = false // Hidden input cannot be required.
  },
  isVisible: elem => {
    elem.parentElement.removeAttribute('hidden')
    elem.required = elem._required
  },
}
