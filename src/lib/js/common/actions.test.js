import { strict as assert } from 'node:assert'
import { afterEach, before, beforeEach, describe, it, mock } from 'node:test'
import actions from './actions.js'

before(() => {
  const proto = window.HTMLDialogElement.prototype
  proto.showModal ??= function () {
    this.setAttribute('open', '')
  }
  proto.close ??= function () {
    this.removeAttribute('open')
  }
  // jsdom's form and Node's built-in FormData live in different realms, so the
  // webidl brand check in `new FormData(form)` fails unless FormData comes from
  // the same jsdom window (see src/lib/js/renderer/renderer.test.js for the same fix).
  global.FormData = window.FormData
})

const addAttrEvt = () => ({
  message: { attr: 'What attribute would you like to add?', value: 'Default Value' },
  isDisabled: mock.fn(propName => propName === 'attrs.type'),
  addAction: mock.fn(),
})

const dialog = () => document.querySelector('dialog.add-attribute-dialog')

const typeName = name => {
  const input = dialog().querySelector('[name="attrName"]')
  input.value = name
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
  return input
}

const submit = (name, value = '') => {
  const input = typeName(name)
  dialog().querySelector('[name="attrValue"]').value = value
  dialog().querySelector('form').requestSubmit()
  return input
}

describe('actions.add.attrs default (#233)', () => {
  beforeEach(() => {
    globalThis.prompt = mock.fn()
    globalThis.alert = mock.fn()
    actions.init({})
  })

  afterEach(() => {
    for (const el of document.querySelectorAll('dialog')) el.remove()
  })

  it('opens an in-app dialog instead of window.prompt', () => {
    actions.add.attrs(addAttrEvt())
    assert.ok(dialog(), 'dialog is in the page')
    assert.equal(globalThis.prompt.mock.callCount(), 0)
  })

  it('adds the attribute and its value on confirm, then closes', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    submit('data-limit', '10')
    assert.deepEqual(evt.addAction.mock.calls[0].arguments, ['data-limit', '10'])
    assert.equal(dialog(), null)
  })

  it('cancel adds nothing', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    dialog().querySelector('.btn-secondary').click()
    assert.equal(evt.addAction.mock.callCount(), 0)
    assert.equal(dialog(), null)
  })

  it('keeps the dialog open for a disabled attribute', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    const input = submit('type')
    assert.equal(evt.addAction.mock.callCount(), 0)
    assert.ok(dialog(), 'still open')
    assert.equal(input.validity.valid, false)
    assert.deepEqual(evt.isDisabled.mock.calls.at(-1).arguments, ['attrs.type'])
  })

  it('rejects names that are not valid attribute names', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    submit('data limit')
    assert.equal(evt.addAction.mock.callCount(), 0)
  })

  it('accepts names with underscores, which HTML allows', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    submit('_data_x', '1')
    assert.deepEqual(evt.addAction.mock.calls[0].arguments, ['_data_x', '1'])
    assert.equal(dialog(), null)
  })

  it('rejects a dotted name, which the address system would store as a nested attrs object', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    const input = submit('data.x', '1')
    assert.equal(evt.addAction.mock.callCount(), 0)
    assert.ok(dialog(), 'still open')
    assert.equal(input.validity.valid, false)
  })

  it('keeps the dialog open for a whitespace-only name', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    const input = submit('   ')
    assert.equal(evt.addAction.mock.callCount(), 0)
    assert.ok(dialog(), 'still open')
    assert.equal(input.validity.valid, false)
  })

  it('keeps the dialog open for an empty name', () => {
    const evt = addAttrEvt()
    actions.add.attrs(evt)
    const input = submit('')
    assert.equal(evt.addAction.mock.callCount(), 0)
    assert.ok(dialog(), 'still open')
    assert.equal(input.validity.valid, false)
  })

  it('a custom actions.add.attr replaces the dialog', () => {
    const custom = mock.fn()
    actions.init({ add: { attr: custom } })
    actions.add.attrs(addAttrEvt())
    assert.equal(custom.mock.callCount(), 1)
    assert.equal(dialog(), null)
  })
})
