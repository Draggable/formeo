import Data from '../../data/data'

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

export const columns = columnsData.data

export default columnsData
