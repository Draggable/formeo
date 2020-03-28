import '../../../../tools/__mocks__/ResizeObserver'
import Field from './field'
const fieldConfig = { id: 'test-id', config: {} }

describe('Field', () => {
  it('should have data property matching snapshot', () => {
    const field = new Field(fieldConfig)
    expect(field.data).toMatchSnapshot()
  })

  it('should call onRender from constructor', () => {
    const spy = jest.spyOn(Field.prototype, 'onRender')
    const field = new Field(fieldConfig)
    expect(spy).toBeCalledWith(field.dom)
  })
})
