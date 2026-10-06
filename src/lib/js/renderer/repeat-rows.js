import dom from '../common/dom.js'
import {
  ADD_ROW_CLASSNAME,
  matrixRowConfig,
  normalizeTable,
  parseMatrixKey,
  REMOVE_ROW_CLASSNAME,
  REPEAT_CLASSNAME,
  REQUIRED_ROW_ATTR,
  ROW_STATUS_CLASSNAME,
  repeatRowName,
} from '../common/table.mjs'
import { tableText } from '../common/table-text.mjs'
import { looksLikeArrayIndex } from '../common/utils/index.mjs'
import { CLONE_ATTR } from './input-groups.js'
import { focusFirst, SKIPPED_ATTR } from './pagination.js'
import { adoptInto, announce, dispatchRowsChange, focusAfterRemove, SETTER_ROW_LIMIT } from './row-actions.js'

/**
 * A repeating table's rows at run time (#349 phase 3). Every row is built by matrixRowConfig from the field data the
 * renderer cached, so added and renumbered rows match the first render. The limits ride on the wrapper's data
 * attributes, so they re-sync from the DOM alone.
 */

const tableOf = wrap => wrap.querySelector(':scope > table')
const bodyOf = wrap => tableOf(wrap)?.tBodies[0]
/**
 * The cached field behind a repeating table. A table inside an input-group copy has none: it renders, but neither
 * clicks nor the userData setter add or remove its rows.
 * @param {HTMLElement} wrap
 * @param {FormeoRenderer} renderer
 * @return {Object|undefined}
 */
const fieldOf = (wrap, renderer) =>
  wrap.closest(`[${CLONE_ATTR}]`) ? undefined : renderer.components[tableOf(wrap)?.id]
const limitsOf = wrap => ({
  min: Number(wrap.dataset.repeatMin ?? 0),
  max: wrap.dataset.repeatMax ? Number(wrap.dataset.repeatMax) : null,
})

/**
 * @param {ParentNode} root a form, stage or document
 * @return {HTMLElement[]} the rendered repeating tables' wrappers, leaving out those in input-group copies, which
 * don't repeat and keep their buttons hidden and disabled
 */
export const repeatingTables = root =>
  [...root.querySelectorAll(`.${REPEAT_CLASSNAME}`)].filter(wrap => !wrap.closest(`[${CLONE_ATTR}]`))

/**
 * @param {HTMLElement} wrap
 * @return {Number}
 */
export const rowCount = wrap => bodyOf(wrap)?.rows.length ?? 0

/** "Item 2", or "Row 2" without row headers */
const rowName = (field, r) => repeatRowName(normalizeTable(field.table), r, tableText)

const buildRow = (field, r) => dom.create(matrixRowConfig(field, r, dom.tableOptions(false)))

/**
 * Disables remove at min rows or fewer and Add at max rows or more. On a skipped page the buttons stay as the skip
 * left them; bringing the page back re-syncs.
 * @param {HTMLElement} wrap
 */
export function syncLimits(wrap) {
  if (wrap.closest(`[${SKIPPED_ATTR}]`)) {
    return
  }
  const { min, max } = limitsOf(wrap)
  const count = rowCount(wrap)
  for (const button of wrap.querySelectorAll(`.${REMOVE_ROW_CLASSNAME}`)) {
    button.disabled = count <= min
  }
  const add = wrap.querySelector(`:scope > .${ADD_ROW_CLASSNAME}`)
  if (add) {
    add.disabled = max !== null && count >= max
  }
}

/**
 * Appends a row, unless the table is at its max
 * @param {HTMLElement} wrap
 * @param {FormeoRenderer} renderer
 * @param {Object} [opts]
 * @param {Boolean} [opts.interactive] focus, announce and fire formeo:rowschange; false for the userData setter
 * @param {Boolean} [opts.sync] re-sync the buttons' limits; setRowCount turns it off and syncs once after its loop
 * @return {HTMLTableRowElement|null} the new row
 */
export function addRow(wrap, renderer, { interactive = true, sync = true } = {}) {
  const field = fieldOf(wrap, renderer)
  const body = bodyOf(wrap)
  const { max } = limitsOf(wrap)
  const r = rowCount(wrap)
  if (!field || !body || (max !== null && r >= max)) {
    return null
  }
  const tr = buildRow(field, r)
  body.append(tr)
  adoptInto(tr)
  if (sync) {
    syncLimits(wrap)
  }
  if (interactive) {
    focusFirst(tr)
    announce(
      wrap.querySelector(`:scope > .${ROW_STATUS_CLASSNAME}`),
      tableText('table.rowAdded', { row: rowName(field, r) })
    )
    dispatchRowsChange(wrap, 'add', r)
  }
  return tr
}

// moves what the person entered from a row to its rebuilt copy, cell by cell
const carryValues = (from, to) => {
  ;[...from.cells].forEach((cell, c) => {
    const source = cell.querySelector('input')
    const target = to.cells[c]?.querySelector('input')
    if (!source || !target) {
      return
    }
    if (['checkbox', 'radio'].includes(source.type)) {
      target.checked = source.checked
    } else {
      target.value = source.value
    }
  })
}

/**
 * Removes a row, unless the table is at its min, and renumbers every later row so keys stay contiguous
 * @param {HTMLTableRowElement} tr
 * @param {FormeoRenderer} renderer
 */
export function removeRow(tr, renderer) {
  const wrap = tr.closest(`.${REPEAT_CLASSNAME}`)
  const field = wrap && fieldOf(wrap, renderer)
  const body = wrap && bodyOf(wrap)
  const index = body ? [...body.rows].indexOf(tr) : -1
  if (!field || index === -1 || rowCount(wrap) <= limitsOf(wrap).min) {
    return
  }
  const name = rowName(field, index)
  tr.remove()
  // in order, so a rebuilt row's radios never share a name with a row still waiting to be renumbered
  for (const later of [...body.rows].slice(index)) {
    const fresh = buildRow(field, later.sectionRowIndex)
    carryValues(later, fresh)
    later.replaceWith(fresh)
    adoptInto(fresh)
    if (fresh.hasAttribute(REQUIRED_ROW_ATTR)) {
      dom.syncCheckboxGroupRequired(fresh)
    }
  }
  syncLimits(wrap)
  const buttons = [...wrap.querySelectorAll(`.${REMOVE_ROW_CLASSNAME}`)]
  focusAfterRemove(buttons, index, wrap.querySelector(`:scope > .${ADD_ROW_CLASSNAME}`))
  announce(wrap.querySelector(`:scope > .${ROW_STATUS_CLASSNAME}`), tableText('table.rowRemoved', { row: name }))
  dispatchRowsChange(wrap, 'remove', index)
}

/**
 * One delegated listener for every repeating table in a rendered form
 * @param {HTMLFormElement} form
 * @param {FormeoRenderer} renderer
 */
export function bindRepeatRows(form, renderer) {
  form.addEventListener('click', event => {
    const origin = event.target.nodeType === 3 ? event.target.parentElement : event.target
    const button = origin?.closest?.(`.${ADD_ROW_CLASSNAME}, .${REMOVE_ROW_CLASSNAME}`)
    const wrap = button?.closest(`.${REPEAT_CLASSNAME}`)
    if (!wrap || button.disabled || !form.contains(wrap)) {
      return
    }
    if (button.classList.contains(ADD_ROW_CLASSNAME)) {
      addRow(wrap, renderer)
    } else {
      removeRow(button.closest('tr'), renderer)
    }
  })
}

/**
 * Grows a repeating table to `count` rows and never shrinks it. The ceiling is the table's max; SETTER_ROW_LIMIT only
 * applies when there is no max. Rows are added quietly: no focus, no announcement, no event.
 * @param {HTMLElement} wrap
 * @param {Number} count
 * @param {FormeoRenderer} renderer
 * @return {Number} the row count after growing
 */
export function setRowCount(wrap, count, renderer) {
  const { max } = limitsOf(wrap)
  const target = Math.min(count, max ?? SETTER_ROW_LIMIT)
  while (rowCount(wrap) < target) {
    if (!addRow(wrap, renderer, { interactive: false, sync: false })) {
      break
    }
  }
  // once, not per row: syncLimits walks the whole table
  syncLimits(wrap)
  return rowCount(wrap)
}

/**
 * Before the userData setter fills the form, gives every repeating table the rows its saved answers name
 * @param {HTMLFormElement} form
 * @param {String[]} keys userData keys
 * @param {FormeoRenderer} renderer
 */
export function growForAnswers(form, keys, renderer) {
  for (const wrap of repeatingTables(form)) {
    const field = fieldOf(wrap, renderer)
    if (!field) {
      continue
    }
    const base = String(field.attrs?.name ?? '').trim() || field.id
    let highest = -1
    for (const key of keys) {
      const parsed = parseMatrixKey(key, base)
      if (parsed && looksLikeArrayIndex(parsed.row)) {
        highest = Math.max(highest, Number(parsed.row))
      }
    }
    if (highest >= 0) {
      setRowCount(wrap, highest + 1, renderer)
    }
  }
}
