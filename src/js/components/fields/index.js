import ComponentData from '../component-data'
import Field from './field'

export default class Fields extends ComponentData {
  constructor(fieldData) {
    super('fields', fieldData)
  }
  Component = Field
}
