import Data from '../../data/data'
import Field from './field'
import helpers from '../../common/helpers'
import Controls from '../controls'

export class FieldData extends Data {
  constructor(data) {
    super('fields')
    // this.data = data || Object.create(null)
  }
  get = path => helpers.get(this.data, path) || new Field(Controls.get(path).controlData)
}

const fieldsData = new FieldData()

export const fields = fieldsData.data

export default fieldsData
