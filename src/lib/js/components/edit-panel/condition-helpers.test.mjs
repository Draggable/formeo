import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'
import {
  adoptPickedProperty,
  adoptStageTargetProperty,
  tablePropertyOptions,
  toggleFieldVisibility,
} from './condition-helpers.mjs'

/**
 * The inputs of one then-row, as Condition#fields holds them
 * @param {String} target
 * @param {String} targetProperty
 * @return {Map<String, HTMLElement>}
 */
const thenFields = (target, targetProperty) => {
  const select = document.createElement('select')
  for (const value of ['value', 'isChecked', 'isNotChecked', 'isVisible', 'isNotVisible']) {
    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    select.append(option)
  }
  select.value = targetProperty
  const text = value => Object.assign(document.createElement('input'), { value })
  return new Map([
    ['target', text(target)],
    ['targetProperty', select],
    ['assignment', text('')],
    ['value', text('')],
  ])
}
const offered = fields =>
  [...fields.get('targetProperty').options]
    .filter(option => !option.classList.contains('hidden-option'))
    .map(option => option.value)

describe('condition fields for a page target (#122)', () => {
  it('a page target offers only isVisible and isNotVisible', () => {
    const fields = thenFields('stages.s-2', 'isNotVisible')
    toggleFieldVisibility(fields)
    assert.deepEqual(offered(fields), ['isVisible', 'isNotVisible'])
    assert.equal(fields.get('targetProperty').value, 'isNotVisible')
  })

  it('a stored property a page cannot take is shown as-is, not rewritten', () => {
    const fields = thenFields('stages.s-2', 'value')
    toggleFieldVisibility(fields)
    assert.equal(fields.get('targetProperty').value, 'value')
  })

  it('switching back to a field target offers its properties again', () => {
    const fields = thenFields('stages.s-2', 'isVisible')
    toggleFieldVisibility(fields)
    fields.get('target').value = 'fields.f-1'
    toggleFieldVisibility(fields)
    assert.deepEqual(offered(fields), ['value', 'isVisible', 'isNotVisible'])
  })

  it('picking a page as the target turns a property it cannot take into isNotVisible', () => {
    const picked = thenFields('stages.s-2', 'value')
    adoptStageTargetProperty(picked)
    assert.equal(picked.get('targetProperty').value, 'isNotVisible')

    const kept = thenFields('stages.s-2', 'isVisible')
    adoptStageTargetProperty(kept)
    assert.equal(kept.get('targetProperty').value, 'isVisible')

    const field = thenFields('fields.f-1', 'value')
    adoptStageTargetProperty(field)
    assert.equal(field.get('targetProperty').value, 'value')
  })
})

describe('condition fields for a matrix row or cell (#349 phase 2)', () => {
  const components = (() => {
    const events = new Events().init({})
    const editor = new Components({ events, actions: new Actions(events).init({}) })
    editor.load({
      id: 'form-m',
      stages: { 's-1': { id: 's-1', config: {}, children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['m1'] } },
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
              { label: 'Note', value: 'note', input: 'text' },
            ],
            rows: [{ value: 'speed', cells: ['Speed', '', ''] }],
          },
        },
      },
    })
    return editor
  })()

  it('offers per row and per cell type, for sources and for targets', () => {
    const row = 'fields.m1.table.rows[0]'
    assert.deepEqual(tablePropertyOptions(row, 'source', components), ['value', 'isChecked', 'isNotChecked'])
    assert.deepEqual(tablePropertyOptions(row, 'target', components), ['isNotVisible', 'isVisible'])
    assert.deepEqual(tablePropertyOptions(`${row}.cells[1]`, 'source', components), ['isChecked', 'isNotChecked'])
    assert.deepEqual(tablePropertyOptions(`${row}.cells[1]`, 'target', components), [
      'isChecked',
      'isNotChecked',
      'isNotVisible',
      'isVisible',
    ])
    assert.deepEqual(tablePropertyOptions(`${row}.cells[2]`, 'source', components), ['value'])
    assert.deepEqual(tablePropertyOptions(`${row}.cells[2]`, 'target', components), [
      'value',
      'isNotVisible',
      'isVisible',
    ])
    assert.equal(tablePropertyOptions('fields.m1', 'source', components), null)
  })

  it('a then-row targeting a matrix row offers only visibility and picks isNotVisible', () => {
    const fields = thenFields('fields.m1.table.rows[0]', 'value')
    toggleFieldVisibility(fields, components)
    assert.deepEqual(offered(fields), ['isVisible', 'isNotVisible'])
    // shown as stored until the author picks the row
    assert.equal(fields.get('targetProperty').value, 'value')
    adoptPickedProperty(fields, 'target', components)
    assert.equal(fields.get('targetProperty').value, 'isNotVisible')
  })

  it('a then-row targeting a text cell offers value and visibility', () => {
    const fields = thenFields('fields.m1.table.rows[0].cells[2]', 'value')
    toggleFieldVisibility(fields, components)
    assert.deepEqual(offered(fields), ['value', 'isVisible', 'isNotVisible'])
    assert.equal(fields.get('targetProperty').value, 'value')
  })

  it('an if-row whose source is the whole matrix offers only visibility', () => {
    const select = document.createElement('select')
    for (const value of ['value', 'isChecked', 'isNotChecked', 'isVisible', 'isNotVisible']) {
      select.add(Object.assign(document.createElement('option'), { value, textContent: value }))
    }
    select.value = 'value'
    const fields = new Map([
      ['source', Object.assign(document.createElement('input'), { value: 'fields.m1' })],
      ['sourceProperty', select],
    ])
    toggleFieldVisibility(fields, components)
    const visible = [...select.options].filter(o => !o.classList.contains('hidden-option')).map(o => o.value)
    assert.deepEqual(visible, ['isVisible', 'isNotVisible'])
    adoptPickedProperty(fields, 'source', components)
    assert.equal(select.value, 'isVisible')
  })

  it('an if-row whose source is a matrix row keeps the value property; a radio cell takes isChecked', () => {
    const sourceFields = (address, property) => {
      const select = document.createElement('select')
      for (const value of ['value', 'isChecked', 'isNotChecked', 'isVisible', 'isNotVisible']) {
        select.add(Object.assign(document.createElement('option'), { value, textContent: value }))
      }
      select.value = property
      return new Map([
        ['source', Object.assign(document.createElement('input'), { value: address })],
        ['sourceProperty', select],
      ])
    }
    const row = sourceFields('fields.m1.table.rows[0]', 'value')
    adoptPickedProperty(row, 'source', components)
    assert.equal(row.get('sourceProperty').value, 'value')
    const radio = sourceFields('fields.m1.table.rows[0].cells[1]', 'value')
    adoptPickedProperty(radio, 'source', components)
    assert.equal(radio.get('sourceProperty').value, 'isChecked')
  })
})
