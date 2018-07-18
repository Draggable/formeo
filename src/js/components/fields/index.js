import Data from '../../data/data'

export class FieldData extends Data {
  constructor(data) {
    super('fields')
    this.data = data || Object.create(null)
  }
}

const fieldsData = new FieldData()

export const fields = fieldsData.data

export default fieldsData
