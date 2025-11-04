import { suite, test } from 'node:test'
import { get, set } from '../../common/utils/object.mjs'
import { EditPanelItem } from './edit-panel-item.mjs'

// Create a mock Field class with get/set on prototype
class MockField {
  constructor() {
    this.indexName = 'mockIndex'
    this.id = 'mockId'
    this.shortId = 'mockShortId'
    this.config = { panels: { mockPanel: { hideDisabled: true } } }
    this._data = {}
  }

  get(path) {
    return get(this._data, path)
  }

  set(path, value) {
    return set(this._data, path, value)
  }

  remove() {}
  resizePanelWrap() {}
  isDisabledProp() {
    return false
  }
  isLockedProp() {
    return false
  }
}

const mockPanel = {
  name: 'mockPanel',
  editPanels: new Map(),
}

suite('EditPanelItem snapshots', () => {
  test('should match attribute item snapshot', t => {
    const mockField = new MockField()
    const item = new EditPanelItem({
      key: 'attrs.type',
      data: { type: 'checkbox' },
      field: mockField,
      panel: mockPanel,
    })
    t.assert.snapshot(item)
  })
  test('should match option snapshot', t => {
    const mockField = new MockField()
    const itemData = { label: 'Checkbox 1', value: 'checkbox-1', checked: false }
    const item = new EditPanelItem({ key: 'options[0]', data: itemData, index: 0, field: mockField, panel: mockPanel })
    t.assert.snapshot(item)
  })

  test('EditPanelItem constructor', t => {
    const mockField = new MockField()
    const itemData = { key1: 'value1' }
    const editPanelItem = new EditPanelItem({
      key: 'key1',
      data: itemData,
      index: 0,
      field: mockField,
      panel: mockPanel,
    })

    t.assert.equal(editPanelItem.itemKey, 'key1')
    t.assert.equal(editPanelItem.field, mockField)
    t.assert.equal(editPanelItem.panelName, 'mockPanel')
  })

  test('itemInputs getter', t => {
    const mockField = new MockField()
    const itemData = { key1: 'value1' }
    const editPanelItem = new EditPanelItem({
      key: 'key1',
      data: itemData,
      index: 0,
      field: mockField,
      panel: mockPanel,
    })

    const inputs = editPanelItem.itemInputs()
    t.assert.equal(inputs.className, 'mockPanel-prop-inputs prop-inputs f-input-group')
  })

  test('generateConditionFields method', t => {
    const mockField = new MockField()
    const itemData = { conditions: [{ type: 'eq', value: '1' }] }
    const editPanelItem = new EditPanelItem({
      key: 'conditions',
      data: itemData,
      index: 0,
      field: mockField,
      panel: mockPanel,
    })

    const conditionFields = editPanelItem.generateConditionFields('eq', [{ type: 'eq', value: '1' }])
    // generateConditionFields returns a DOM wrapper element, check children count
    t.assert.equal(conditionFields.children.length, 1)
  })

  test('itemControls getter with isLocked', t => {
    const mockField = new MockField()
    mockField.isLockedProp = () => true
    const itemData = { key1: 'value1' }
    const editPanelItem = new EditPanelItem({
      key: 'key1',
      data: itemData,
      index: 0,
      field: mockField,
      panel: mockPanel,
    })

    const controls = editPanelItem.itemControls
    t.assert.equal(controls.content.length, 0)
  })

  test('itemInput method with checkbox type', t => {
    const mockField = new MockField()
    const itemData = { key1: 'value1' }
    const editPanelItem = new EditPanelItem({
      key: 'key1',
      data: itemData,
      index: 0,
      field: mockField,
      panel: mockPanel,
    })

    const inputConfig = editPanelItem.itemInput('checked', true)
    t.assert.equal(inputConfig.children.attrs.name, 'mockShortId-key1[]')
  })
})
