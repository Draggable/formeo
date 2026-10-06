import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { ANIMATION_SPEED_FAST } from '../../constants.js'
import { Components } from '../index.js'

const IF_TEMPLATE = { source: '', sourceProperty: '', comparison: '', target: '', targetProperty: '' }
const THEN_TEMPLATE = { target: '', targetProperty: '', assignment: '', value: '' }

/**
 * An editor whose page holds a matrix (radio, checkbox and text columns) and a radio group, with one stored
 * condition on the page
 * @param {Object} [stored] the page's condition, an empty if/then by default
 * @return {Components}
 */
const editorWith = (stored = { if: [{ ...IF_TEMPLATE }], then: [{ ...THEN_TEMPLATE }] }) => {
  const events = new Events().init({})
  const components = new Components({ events, actions: new Actions(events).init({}) })
  components.load({
    id: 'form-c',
    stages: { 's-1': { id: 's-1', config: {}, children: ['r-1'], conditions: [stored] } },
    rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
    columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['m1', 'rg'] } },
    fields: {
      m1: {
        id: 'm1',
        tag: 'table',
        attrs: {},
        config: { label: 'Survey', hideLabel: true },
        table: {
          rowHeaders: true,
          columns: [
            { label: '' },
            { label: 'Good', value: 'good', input: 'radio' },
            { label: 'Tick', value: 'tick', input: 'checkbox' },
            { label: 'Note', value: 'note', input: 'text' },
          ],
          rows: [{ value: 'speed', cells: ['Speed', '', '', ''] }],
        },
      },
      rg: {
        id: 'rg',
        tag: 'input',
        attrs: { type: 'radio' },
        config: { label: 'Colour' },
        options: [
          { label: 'Red', value: 'red', selected: false },
          { label: 'Blue', value: 'blue', selected: false },
        ],
      },
    },
  })
  return components
}

/**
 * A real Condition row in the page's conditions panel, built from the stored condition as loading builds it
 * @param {Components} components
 * @param {String} conditionType 'if' or 'then'
 * @return {Condition}
 */
const conditionRow = (components, conditionType) => {
  const stage = components.stages.get('s-1')
  const [item] = stage.editPanels.get('conditions').editPanelItems
  const conditionValues = stage.get('conditions')[0][conditionType][0]
  return item.addConditionType(conditionType, { index: 0, conditionCount: 1, conditionValues })
}

const settle = () => new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_FAST + 50))

/**
 * Picks an address in a condition's source or target, as clicking it in the picker does, and waits for the save
 * @param {Condition} condition
 * @param {String} key 'source' or 'target'
 * @param {String} address
 */
const pick = async (condition, key, address) => {
  condition.fields.get(key).setValue({ dataset: { label: address, value: address } })
  await settle()
}

const saved = (components, conditionType) => components.getAddress('stages.s-1.conditions')[0][conditionType][0]

describe('Condition: a picked source or target saves the property it shows (#349 phase 2)', () => {
  it('a then-target matrix row saves isNotVisible', async () => {
    const components = editorWith()
    const condition = conditionRow(components, 'then')
    await pick(condition, 'target', 'fields.m1.table.rows[0]')
    assert.equal(condition.fields.get('targetProperty').value, 'isNotVisible')
    assert.deepEqual(saved(components, 'then'), {
      target: 'fields.m1.table.rows[0]',
      targetProperty: 'isNotVisible',
      assignment: '=',
      value: '',
    })
  })

  it('an if-source radio cell saves isChecked', async () => {
    const components = editorWith()
    const condition = conditionRow(components, 'if')
    await pick(condition, 'source', 'fields.m1.table.rows[0].cells[1]')
    assert.equal(condition.fields.get('sourceProperty').value, 'isChecked')
    assert.equal(saved(components, 'if').source, 'fields.m1.table.rows[0].cells[1]')
    assert.equal(saved(components, 'if').sourceProperty, 'isChecked')
  })

  it('a then-target checkbox cell saves isChecked', async () => {
    const components = editorWith()
    const condition = conditionRow(components, 'then')
    await pick(condition, 'target', 'fields.m1.table.rows[0].cells[2]')
    assert.equal(condition.fields.get('targetProperty').value, 'isChecked')
    assert.equal(saved(components, 'then').targetProperty, 'isChecked')
  })

  it('a text cell saves value, also after a checkbox cell was picked', async () => {
    const components = editorWith()
    const then = conditionRow(components, 'then')
    await pick(then, 'target', 'fields.m1.table.rows[0].cells[2]')
    await pick(then, 'target', 'fields.m1.table.rows[0].cells[3]')
    assert.equal(then.fields.get('targetProperty').value, 'value')
    assert.equal(saved(components, 'then').targetProperty, 'value')

    const condition = conditionRow(components, 'if')
    await pick(condition, 'source', 'fields.m1.table.rows[0].cells[1]')
    await pick(condition, 'source', 'fields.m1.table.rows[0].cells[3]')
    assert.equal(condition.fields.get('sourceProperty').value, 'value')
    assert.equal(saved(components, 'if').sourceProperty, 'value')
  })

  it('a whole-matrix if-source saves isVisible', async () => {
    const components = editorWith()
    const condition = conditionRow(components, 'if')
    await pick(condition, 'source', 'fields.m1')
    assert.equal(condition.fields.get('sourceProperty').value, 'isVisible')
    assert.equal(saved(components, 'if').sourceProperty, 'isVisible')
  })

  it('an options[n] if-source saves isChecked', async () => {
    const components = editorWith()
    const condition = conditionRow(components, 'if')
    await pick(condition, 'source', 'fields.rg.options[1]')
    const sourceProperty = condition.fields.get('sourceProperty')
    assert.equal(sourceProperty.value, 'isChecked')
    assert.equal(saved(components, 'if').sourceProperty, 'isChecked')
    const offered = [...sourceProperty.options].filter(o => !o.classList.contains('hidden-option')).map(o => o.value)
    assert.deepEqual(offered, ['isChecked', 'isNotChecked'])
  })

  it('a property the new pick can still take is kept', async () => {
    const components = editorWith()
    const condition = conditionRow(components, 'then')
    await pick(condition, 'target', 'fields.m1.table.rows[0].cells[2]')
    condition.fields.get('targetProperty').value = 'isNotVisible'
    condition.onChangeCondition({ key: 'targetProperty', target: condition.fields.get('targetProperty') })
    await pick(condition, 'target', 'fields.m1.table.rows[0].cells[1]')
    assert.equal(saved(components, 'then').targetProperty, 'isNotVisible')
  })
})

describe('Condition: loading never rewrites a stored property (#349 phase 2)', () => {
  it('a stored property the row or cell can no longer take is shown and kept as-is', async () => {
    const stored = {
      if: [{ ...IF_TEMPLATE, source: 'fields.m1.table.rows[0].cells[3]', sourceProperty: 'isChecked' }],
      then: [{ ...THEN_TEMPLATE, target: 'fields.m1.table.rows[0]', targetProperty: 'value', assignment: '=' }],
    }
    const components = editorWith(structuredClone(stored))
    const ifRow = conditionRow(components, 'if')
    const thenRow = conditionRow(components, 'then')
    ifRow.processUiState()
    thenRow.processUiState()
    await settle()
    assert.equal(ifRow.fields.get('sourceProperty').value, 'isChecked')
    assert.equal(thenRow.fields.get('targetProperty').value, 'value')
    assert.deepEqual(components.getAddress('stages.s-1.conditions')[0], stored)

    // editing another part of the row saves what the row shows, so the stored property survives that too
    const comparison = ifRow.fields.get('comparison')
    comparison.value = '!='
    ifRow.onChangeCondition({ key: 'comparison', target: comparison })
    await settle()
    assert.equal(saved(components, 'if').sourceProperty, 'isChecked')
    assert.equal(saved(components, 'if').comparison, '!=')
  })
})
