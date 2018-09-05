import ComponentData from '../component-data'
import Field from './field'
import { helpers } from '../../common/helpers'
import Controls from '../controls'

export default class Fields extends ComponentData {
  constructor(fieldData) {
    super('fields', fieldData)
  }
  Component = Field
  get = path => {
    let found = path && helpers.get(this.data, path)
    if (!found) {
      const { controlData } = Controls.get(path)
      found = this.add(null, controlData)
    }
    return found
  }
}
