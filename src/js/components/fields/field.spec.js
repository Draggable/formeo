import Field from './field'

describe('Field', () => {
  it('should match snapshot', () => {
    const fieldConfig = { id: 'test-id' }
    const field = new Field(fieldConfig)
    expect(field).toMatchSnapshot()
  })
})
