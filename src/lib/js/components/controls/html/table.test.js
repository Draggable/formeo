import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultTable } from '../../../common/table.mjs'
import { Components } from '../../index.js'
import Control from '../control.js'
import { Controls } from '../index.js'
import htmlControls from './index.js'
import ParagraphControl from './paragraph.js'
import TableControl from './table.js'

describe('Table control (#349)', () => {
  it('is an html control with id table, a hidden label and a default 3 × 2 table', () => {
    const { controlData } = new TableControl()
    assert.deepEqual(controlData.meta, { group: 'html', icon: 'table', id: 'table' })
    assert.equal(controlData.tag, 'table')
    assert.deepEqual(controlData.attrs, { className: '' })
    assert.deepEqual(controlData.config, { label: 'Table', hideLabel: true })
    assert.deepEqual(controlData.table, defaultTable())
  })

  it('is registered with the other html controls, right after Paragraph', () => {
    assert.equal(htmlControls.indexOf(TableControl), htmlControls.indexOf(ParagraphControl) + 1)
  })

  it('adds a field with the control id and its own copy of the table', () => {
    const controls = new Controls(new Components())
    const control = controls.add(new TableControl())
    const first = controls.describeControl(control.id)
    const second = controls.describeControl(control.id)
    assert.equal(first.componentType, 'field')
    assert.equal(first.data.config.controlId, 'table')
    assert.deepEqual(first.data.table, defaultTable())
    first.data.table.rows[0].cells[0] = 'changed'
    assert.equal(second.data.table.rows[0].cells[0], '')
  })

  it('is replaced by a user control with meta.id table, as the #349 workaround registered', () => {
    const userTable = {
      tag: 'table',
      config: { label: 'Table', hideLabel: true },
      meta: { group: 'html', id: 'table', icon: 'columns' },
      content: [{ tag: 'tr', children: [{ tag: 'td', children: 'Cell' }] }],
    }
    const controls = new Controls(new Components())
    // registerControls adds the built-in controls first and the user's `elements` after them
    controls.add(new TableControl())
    controls.add(new Control(userTable))
    const registered = controls.get('table')
    assert.equal(registered.table, undefined)
    assert.deepEqual(registered.content, userTable.content)
  })
})
