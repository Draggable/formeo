import Data from '../../data/data'

const DEFAULT_DATA = {
  config: {},
  children: [],
}

export class ColumnData extends Data {
  constructor(data) {
    super('columns', DEFAULT_DATA)
  }
}

const columnsData = new ColumnData()

export const columns = columnsData.data

export default columnsData
