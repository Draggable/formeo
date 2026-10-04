import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultMatrix, hasInputs } from '../../../common/table.mjs'
import { Components } from '../../index.js'
import { Controls } from '../index.js'
import formControls from './index.js'
import MatrixControl from './matrix.js'
import RadioGroupControl from './radio-group.js'

describe('Matrix control (#349 phase 2)', () => {
  it('is a common control with id matrix, a hidden label, an empty name and a radio grid', () => {
    const { controlData } = new MatrixControl()
    assert.deepEqual(controlData.meta, { group: 'common', icon: 'matrix', id: 'matrix' })
    assert.equal(controlData.tag, 'table')
    assert.deepEqual(controlData.attrs, { className: '', name: '' })
    assert.deepEqual(controlData.config, { label: 'Matrix', hideLabel: true })
    assert.deepEqual(controlData.table, defaultMatrix())
    assert.equal(hasInputs(controlData.table), true)
  })

  it('is registered with the form controls, right after the radio group', () => {
    assert.equal(formControls.indexOf(MatrixControl), formControls.indexOf(RadioGroupControl) + 1)
  })

  it('adds a field with the control id and its own copy of the matrix', () => {
    const controls = new Controls(new Components())
    const control = controls.add(new MatrixControl())
    const first = controls.describeControl(control.id)
    const second = controls.describeControl(control.id)
    assert.equal(first.data.config.controlId, 'matrix')
    first.data.table.rows[0].cells[0] = 'changed'
    assert.equal(second.data.table.rows[0].cells[0], 'Row 1')
  })

  it('is replaced by a user control with meta.id matrix', async () => {
    const userMatrix = { tag: 'div', config: { label: 'Mine' }, meta: { group: 'common', id: 'matrix' } }
    const controls = new Controls(new Components())
    await Promise.all(controls.registerControls([MatrixControl, userMatrix]))
    assert.equal(controls.get('matrix').table, undefined)
    assert.equal(controls.get('matrix').tag, 'div')
  })
})
