import dom, { getName } from '../common/dom.js'
import { inputGroupText } from '../common/input-group-text.mjs'
import { hasInputs, isTableField, SR_ONLY_CLASSNAME } from '../common/table.mjs'
import { clone, uuid } from '../common/utils/index.mjs'
import { RENDER_PREFIX } from './helpers.js'
import { focusFirst } from './pagination.js'
import { announce, dispatchRowsChange, focusAfterRemove, SETTER_ROW_LIMIT } from './row-actions.js'

/**
 * Input groups (a row with `config.inputGroup`): the person filling in the form adds copies of the row and removes
 * them. A copy's single-value controls keep the original's name, so they post arrays. Its grouped controls (radio and
 * checkbox groups, multiple selects, matrices) get `<name>-<n>`, n being the copy's 1-based position, renumbered when
 * an earlier copy is removed (#349 phase 3).
 */

export const INPUT_GROUP_WRAP_CLASSNAME = `${RENDER_PREFIX}input-group-wrap`
/** Marks every element of a copy with the rendered id of the element it copies */
export const CLONE_ATTR = 'data-clone-of'
const ADD_CLASSNAME = 'add-input-group'
const REMOVE_CLASSNAME = 'remove-input-group'
const STATUS_CLASSNAME = 'f-input-group-status'

// each copy's cached component ids and, for grouped controls, the name its `-<n>` suffix extends
const CLONE_RECORDS = new WeakMap()
// how many copies each input group wrapper holds, and its Add button once found
const CLONE_COUNTS = new WeakMap()
const ADD_BUTTONS = new WeakMap()

/**
 * How a copy names a control: 'group' gets `<name>-<n>`, 'single' keeps the original's name, null has no name
 * @param {Object} source processed component data
 * @return {'group'|'single'|null}
 */
const cloneNameKind = source => {
  if (isTableField(source)) {
    return hasInputs(source.table) ? 'group' : null
  }
  const { tag, attrs = {}, options } = source
  if (options && ['checkbox', 'radio'].includes(attrs.type)) {
    return 'group'
  }
  if (tag === 'select') {
    return attrs.multiple ? 'group' : 'single'
  }
  return tag === 'input' || tag === 'textarea' ? 'single' : null
}

// the name a grouped control's copies extend: its configured name without `[]`, else its rendered id
const groupBaseName = source =>
  String(source.attrs?.name ?? '')
    .trim()
    .replace(/\[\]$/, '') || source.id

/**
 * A copy of a cached component and its children for input group copy n. Every copied component is cached under its
 * new id, so userFormData can label its answers.
 * @param {FormeoRenderer} renderer
 * @param {String} componentId rendered id, e.g. 'f-abc'
 * @param {Number} [n] the copy's 1-based position
 * @param {Array<{id: String, base: String|null}>} [entries] collects what was cached, for renumbering
 * @return {Object} dom.create config
 */
export function cloneComponentData(renderer, componentId, n = 1, entries = []) {
  const source = renderer.components[componentId]
  const { children, id, attrs = {}, ...rest } = source
  const cloneAttrs = { ...attrs, [CLONE_ATTR]: id }
  const kind = cloneNameKind(source)
  let base = null
  if (kind === 'group') {
    // a shared radio name would link the groups, and merged multi-value answers couldn't be split again
    base = groupBaseName(source)
    cloneAttrs.name = `${base}-${n}`
  } else if (kind === 'single') {
    cloneAttrs.name = getName(source)
  }
  const cloneId = RENDER_PREFIX + uuid(id)
  const data = {
    ...rest,
    id: cloneId,
    attrs: cloneAttrs,
    children: Array.isArray(children)
      ? children.map(child =>
          // a plain DOM config (no cached component behind it) is copied as it is
          child?.id && renderer.components[child.id] ? cloneComponentData(renderer, child.id, n, entries) : clone(child)
        )
      : children,
  }
  renderer.components[cloneId] = data
  entries.push({ id: cloneId, base })
  return data
}

/**
 * @param {HTMLElement} wrap the input group's wrapper
 * @return {HTMLElement[]} its copies, in order
 */
export const clonesOf = wrap => [...wrap.children].filter(child => child.hasAttribute(CLONE_ATTR))

const addButtonOf = wrap => {
  if (!ADD_BUTTONS.has(wrap)) {
    ADD_BUTTONS.set(wrap, wrap.querySelector(`:scope > .${ADD_CLASSNAME}`))
  }
  return ADD_BUTTONS.get(wrap)
}
const statusOf = wrap => wrap.querySelector(`:scope > .${STATUS_CLASSNAME}`)
const removeButtonOf = copy => copy.querySelector(`:scope > .${REMOVE_CLASSNAME}`)

const labelRemoveButton = (button, groupNumber) => {
  const label = inputGroupText('inputGroup.remove', { n: groupNumber })
  button.setAttribute('aria-label', label)
  button.title = label
}

const removeButtonConfig = (renderer, groupNumber) => {
  const label = inputGroupText('inputGroup.remove', { n: groupNumber })
  return {
    tag: 'button',
    attrs: { type: 'button', className: REMOVE_CLASSNAME, 'aria-label': label, title: label },
    content: dom.icon('remove'),
    action: {
      // currentTarget, not target: a click can land on the icon inside the button
      mouseover: ({ currentTarget }) => currentTarget.parentElement.classList.add('will-remove'),
      mouseleave: ({ currentTarget }) => currentTarget.parentElement.classList.remove('will-remove'),
      click: ({ currentTarget }) => removeGroup(renderer, currentTarget.parentElement),
    },
  }
}

/**
 * The Add button and status region that follow an input group's row
 * @param {FormeoRenderer} renderer
 * @param {String} rowId the original row's rendered id
 * @return {Array<Object>} dom.create configs
 */
export const inputGroupControls = (renderer, rowId) => [
  {
    tag: 'button',
    attrs: { className: `${ADD_CLASSNAME} btn pull-right`, type: 'button' },
    textContent: inputGroupText('inputGroup.add'),
    action: { click: ({ currentTarget }) => addGroup(renderer, currentTarget.parentElement, rowId) },
  },
  { tag: 'span', attrs: { className: `${STATUS_CLASSNAME} ${SR_ONLY_CLASSNAME}`, role: 'status' } },
]

/**
 * Adds a copy of the group's row before its Add button
 * @param {FormeoRenderer} renderer
 * @param {HTMLElement} wrap
 * @param {String} rowId the original row's rendered id
 * @param {Object} [opts]
 * @param {Boolean} [opts.interactive] focus, announce and fire formeo:rowschange; false for the userData setter
 * @return {HTMLElement} the copy
 */
export function addGroup(renderer, wrap, rowId, { interactive = true } = {}) {
  // counted, not looked up: scanning the wrapper's children for every copy would make growing it quadratic
  const n = (CLONE_COUNTS.get(wrap) ?? 0) + 1
  const entries = []
  const copy = dom.create(cloneComponentData(renderer, rowId, n, entries))
  CLONE_RECORDS.set(copy, entries)
  // the original is group 1, so copy n is group n + 1
  copy.appendChild(dom.create(removeButtonConfig(renderer, n + 1)))
  wrap.insertBefore(copy, addButtonOf(wrap))
  CLONE_COUNTS.set(wrap, n)
  if (interactive) {
    focusFirst(copy)
    announce(statusOf(wrap), inputGroupText('inputGroup.added', { n: n + 1 }))
    dispatchRowsChange(wrap, 'add', n)
  }
  return copy
}

// the rest of a name after `prefix`, when it continues a grouped name: '', '[…]', '[]' or '-other'; else null
const suffixTail = (name, prefix) => {
  if (!name.startsWith(prefix)) {
    return null
  }
  const tail = name.slice(prefix.length)
  return tail === '' || tail.startsWith('[') || tail === '-other' ? tail : null
}

const renumberClone = (renderer, copy, from, to) => {
  for (const { id, base } of CLONE_RECORDS.get(copy) ?? []) {
    if (!base) {
      continue
    }
    const oldName = `${base}-${from}`
    const newName = `${base}-${to}`
    const component = renderer.components[id]
    if (component?.attrs) {
      component.attrs.name = newName
    }
    // the attribute, not the property: any element may carry a name attribute
    for (const elem of copy.querySelectorAll('[name]')) {
      const tail = suffixTail(elem.getAttribute('name'), oldName)
      if (tail !== null) {
        elem.setAttribute('name', newName + tail)
      }
    }
  }
  const button = removeButtonOf(copy)
  if (button) {
    labelRemoveButton(button, to + 1)
  }
}

/**
 * Removes a copy and renumbers the later ones, so their `-<n>` names stay contiguous
 * @param {FormeoRenderer} renderer
 * @param {HTMLElement} copy
 */
export function removeGroup(renderer, copy) {
  const wrap = copy.parentElement
  const copies = clonesOf(wrap)
  const index = copies.indexOf(copy)
  if (index === -1) {
    return
  }
  for (const { id } of CLONE_RECORDS.get(copy) ?? []) {
    delete renderer.components[id]
  }
  copy.remove()
  CLONE_COUNTS.set(wrap, copies.length - 1)
  // ascending, so a renamed radio group never shares a name with one still waiting
  for (let i = index + 1; i < copies.length; i++) {
    // copies[i] was copy i + 1 and becomes copy i
    renumberClone(renderer, copies[i], i + 1, i)
  }
  focusAfterRemove(clonesOf(wrap).map(removeButtonOf), index, addButtonOf(wrap))
  announce(statusOf(wrap), inputGroupText('inputGroup.removed', { n: index + 2 }))
  dispatchRowsChange(wrap, 'remove', index + 1)
}

/**
 * The names an input group's original row posts under: single-value controls' names (shared by copies) and grouped
 * controls' bases (extended by copies)
 * @param {FormeoRenderer} renderer
 * @param {String} rowId the original row's rendered id
 * @return {{singles: Set<String>, bases: Set<String>}}
 */
export function groupNamesOf(renderer, rowId) {
  const singles = new Set()
  const bases = new Set()
  const visit = id => {
    const source = renderer.components[id]
    if (!source) {
      return
    }
    const kind = cloneNameKind(source)
    if (kind === 'group') {
      bases.add(groupBaseName(source))
    } else if (kind === 'single') {
      singles.add(getName(source))
    }
    for (const child of Array.isArray(source.children) ? source.children : []) {
      if (child?.id) {
        visit(child.id)
      }
    }
  }
  visit(rowId)
  return { singles, bases }
}

/**
 * @param {String} key a userData key
 * @param {String} base a grouped control's base name
 * @return {Number} n when the key is `<base>-<n>`, `<base>-<n>[...]` or `<base>-<n>-other`; else 0
 */
export function cloneNumber(key, base) {
  if (!key.startsWith(`${base}-`)) {
    return 0
  }
  const match = /^([1-9]\d*)(?:$|\[|-other$)/.exec(key.slice(base.length + 1))
  return match ? Number(match[1]) : 0
}

/**
 * Before the userData setter fills the form, gives every input group the copies its saved answers need: one per extra
 * value of a shared single-value name, and up to the highest `<base>-<n>`. Copies are added quietly and never removed;
 * input groups have no max, so growth stops at SETTER_ROW_LIMIT.
 * @param {FormeoRenderer} renderer
 * @param {HTMLFormElement} form
 * @param {Object} data userData
 */
export function growGroupsForAnswers(renderer, form, data) {
  for (const wrap of form.querySelectorAll(`.${INPUT_GROUP_WRAP_CLASSNAME}`)) {
    // the wrapper holds the original row, its copies, the legend and the Add button
    const original = [...wrap.children].find(child => !child.hasAttribute(CLONE_ATTR) && renderer.components[child.id])
    if (!original) {
      continue
    }
    const { singles, bases } = groupNamesOf(renderer, original.id)
    let needed = 0
    for (const [key, value] of Object.entries(data)) {
      if (singles.has(key) && Array.isArray(value)) {
        needed = Math.max(needed, value.length - 1)
      }
      for (const base of bases) {
        needed = Math.max(needed, cloneNumber(key, base))
      }
    }
    needed = Math.min(needed, SETTER_ROW_LIMIT)
    for (let have = clonesOf(wrap).length; have < needed; have++) {
      addGroup(renderer, wrap, original.id, { interactive: false })
    }
  }
}
