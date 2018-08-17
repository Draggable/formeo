import Data from '../../data/data'
import { helpers } from '../../common/helpers'
import Column from './column'

export class ColumnData extends Data {
  constructor(columnData) {
    super('columns', columnData)
  }
  get = path => {
    const column = path && helpers.get(this.data, path)
    return column || new Column()
  }
}

const columnsData = new ColumnData()

export const columns = columnsData.data

export default columnsData
