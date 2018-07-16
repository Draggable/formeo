import Data from './data'

const DEFAULT_DATA = {
  config: {},
  children: [],
}

export class ColumnData extends Data {
  constructor(data) {
    super('columns', DEFAULT_DATA)
    this.data = data || Object.create(null)
  }
}

const columnsData = new ColumnData()

export default columnsData
