import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import { duplicateNameIds, fieldNameKey } from '../fields/duplicate-names.mjs'

const HINT_CLASSNAME = 'duplicate-name-hint'
const pending = new Set()
const watchedFields = new WeakSet()

const hintText = name =>
  i18n.get('duplicateFieldName', { name }) ||
  `Another field is also named "${name}", so their answers will share one key.`

/**
 * The fields placed in one editor's form. `field.components` is that editor's own Components (#152),
 * so another editor's fields never count.
 * @param {Components} components
 * @return {Field[]}
 */
const formFields = components => {
  if (!components?.data?.stages) {
    return []
  }
  return Object.entries(components.flatList())
    .filter(([key]) => key.startsWith('fields.'))
    .map(([, field]) => field)
}

/**
 * The hint lives in the name row as a status region that stays in place and is emptied when the name
 * is unique, so screen readers announce it when it fills.
 * @param {Field} field
 * @param {HTMLElement} row the field's `.field-attrs-name` row
 * @param {String} [name] the shared name, or nothing when this field's name is unique
 */
const renderHint = (field, row, name) => {
  let hint = row.querySelector(`.${HINT_CLASSNAME}`)
  if (!hint) {
    hint = dom.create({
      ...dom.helpText(''),
      className: ['f-help-text', 'text-warning', HINT_CLASSNAME],
      attrs: { id: `${field.id}-${HINT_CLASSNAME}`, role: 'status' },
    })
    row.appendChild(hint)
  }
  hint.textContent = name ? hintText(name) : ''

  const input = row.querySelector('.prop-inputs input')
  if (name) {
    input?.setAttribute('aria-describedby', hint.id)
  } else {
    input?.removeAttribute('aria-describedby')
  }
}

/**
 * Show or clear the duplicate-name hint on every field in one editor whose attrs panel is built
 * @param {Components} components the editor to scan
 */
export const refreshDuplicateNameHints = components => {
  const fields = formFields(components)
  const duplicates = duplicateNameIds(fields.map(field => [field.id, field.get('attrs.name')]))

  for (const field of fields) {
    const row = field.dom?.querySelector('.field-attrs-name')
    if (row) {
      renderHint(field, row, duplicates.has(field.id) ? fieldNameKey(field.get('attrs.name')) : '')
    }
  }
}

/**
 * Refresh once the current task is done, so loading or cloning many fields costs one scan per editor
 * @param {Components} components
 */
export const scheduleDuplicateNameHints = components => {
  if (!components || pending.has(components)) {
    return
  }
  pending.add(components)
  queueMicrotask(() => {
    pending.delete(components)
    refreshDuplicateNameHints(components)
  })
}

const nameChanged = ({ path }) => {
  const changed = Array.isArray(path) ? path.join('.') : String(path)
  return changed === 'attrs' || changed === 'attrs.name'
}

/**
 * Refresh an editor's hints whenever this field's name changes or the field is removed.
 * Uses the field's own component events; registered once per field.
 * @param {Field} field
 */
export const watchFieldName = field => {
  if (watchedFields.has(field)) {
    return
  }
  watchedFields.add(field)
  field.addEventListener('onUpdate', evt => nameChanged(evt) && scheduleDuplicateNameHints(field.components))
  field.addEventListener('onRemove', () => scheduleDuplicateNameHints(field.components))
}
