import { mapToObj } from '../common/utils'
// import { Map } from 'immutable'
// import { baseHandler } from './index'

export const settings = new Map()

export default Object.create(null, {
  js: {
    get() {
      return mapToObj(settings)
    },
  },
  get: { value: key => settings.get(key) },
})
