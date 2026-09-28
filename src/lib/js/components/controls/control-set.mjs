import mergeWith from 'lodash/mergeWith.js'
import { indexOfNode } from '../../common/helpers.mjs'
import { clone } from '../../common/utils/index.mjs'

/**
 * The componentType a control set reports to onBeforeAdd (#227)
 */
export const CONTROL_SET = 'controlSet'

/**
 * A control set adds one row holding several fields, like formBuilder's inputSets (#227)
 * @param {Object} controlData a control definition
 * @return {Boolean}
 */
export const isControlSet = controlData => Array.isArray(controlData?.controlSet?.fields)

// member overrides replace arrays (e.g. a select's options) instead of appending to them
const replaceArrays = (_value, override) => (Array.isArray(override) ? clone(override) : undefined)

/**
 * What a control set adds, as fresh copies: its layout, its row's data and each member's field data.
 * A member naming a `control` starts from that control's data and merges its other keys over it; a member
 * without one is used as it is. Unknown controls are skipped with a warning.
 * @param {Object} controlData a control definition with controlSet
 * @param {Function} lookupControl controlId => a copy of that field control's data without meta, or undefined
 * @return {{layout: String, row: Object, fields: Array<Object>}}
 */
export const expandControlSet = (controlData, lookupControl) => {
  const { controlSet, meta } = controlData
  const warn = message => console.warn(`formeo: control set "${meta?.id}" ${message}`)
  const fields = []
  for (const { control, id: _id, meta: memberMeta, ...member } of controlSet.fields) {
    if (!control) {
      const data = clone(member)
      if (memberMeta?.id) {
        data.config = { ...data.config, controlId: memberMeta.id }
      }
      fields.push(data)
      continue
    }
    const base = lookupControl(control)
    if (!base) {
      warn(`skips a member: "${control}" is not a field control.`)
      continue
    }
    const data = mergeWith(base, clone(member), replaceArrays)
    data.config = { ...data.config, controlId: control }
    fields.push(data)
  }
  if (!fields.length) {
    warn('has no fields, so it adds nothing.')
  }
  const { id: _rowId, ...row } = clone(controlSet.row || {})
  return { layout: controlSet.layout === 'columns' ? 'columns' : 'stacked', row, fields }
}

/**
 * Adds a control set to a stage as one new row (#227)
 * @param {Stage} stage
 * @param {{layout: String, row: Object, fields: Array<Object>}} expanded what expandControlSet returned
 * @param {Number} [index] the new row's position in the stage; the end by default
 * @return {Row} the new row
 */
export const insertControlSet = (stage, { layout, row, fields }, index) => {
  const newRow = stage.addChild(clone(row), index)
  if (layout === 'columns') {
    for (const fieldData of fields) {
      newRow.addChild().addChild(clone(fieldData))
    }
    newRow.autoColumnWidths()
    return newRow
  }
  const column = newRow.addChild()
  for (const fieldData of fields) {
    column.addChild(clone(fieldData))
  }
  return newRow
}

/**
 * Where a control set dropped on a component goes: a stage takes it at the drop index; a row, column or field
 * sends it to a new row right after its own row (#227)
 * @param {Component} component the stage, row, column or field that received the drop
 * @param {Number} newIndex the drop index
 * @return {{stage: Stage, index: Number}}
 */
export const controlSetDropTarget = (component, newIndex) => {
  if (component.name === 'stage') {
    return { stage: component, index: newIndex }
  }
  let row = component
  while (row.name !== 'row') {
    row = row.parent
  }
  return { stage: row.parent, index: indexOfNode(row.dom) + 1 }
}
