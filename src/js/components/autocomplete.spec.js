import { componentOptions, labelCount } from './autocomplete'

jest.mock('./index', () => ({
  flatList: jest.fn(() => ({
    'test.id': {
      get: key => key,
    },
  })),
}))

describe('Autolinker', () => {
  describe('componentOptions utility', () => {
    it('should generate an array of dom options', () => {
      const options = componentOptions('test.id')
      expect(options).toMatchSnapshot()
    })
  })
  describe('labelCount utility', () => {
    const labels = ['Text', 'Text', 'Text', 'TextArea']
    it('should return number of duplicates of "Text" in an array', () => {
      const count = labelCount(labels, 'Text')
      expect(count).toBe(3)
    })
    it('should return number of duplicates of "TextArea" in an array', () => {
      const count = labelCount(labels, 'TextArea')
      expect(count).toBe(1)
    })
    it('should return number of duplicates of "Select" in an array', () => {
      const count = labelCount(labels, 'Select')
      expect(count).toBe(0)
    })
  })
})
