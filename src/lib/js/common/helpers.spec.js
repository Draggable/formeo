import { subtract } from './helpers'

describe('Helpers', () => {
  describe('subtract', () => {
    it('should subtract the contents of one array from another', () => {
      const remove = ['two']
      const from = ['one', 'two', 'three']
      expect(subtract(remove, from)).toEqual(['one', 'three'])
    })
  })
})
