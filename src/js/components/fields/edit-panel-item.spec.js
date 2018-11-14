import EditPanelItem from './edit-panel-item'

const mockField = {
  data: {
    attrs: {},
  },
  isDisabledProp: () => null,
  isLockedProp: () => null,
}

describe('EditPanelItem', () => {
  it('should match attribute item snapshot', () => {
    const item = new EditPanelItem('attrs.type', { type: 'checkbox' }, mockField)
    expect(item).toMatchSnapshot()
  })
  it('should match option snapshot', () => {
    const itemData = { label: 'Checkbox 1', value: 'checkbox-1', checked: false }
    const item = new EditPanelItem('options.0', itemData, mockField)
    expect(item).toMatchSnapshot()
  })
})
