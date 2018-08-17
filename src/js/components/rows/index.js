import Data from '../../data/data'
import { helpers } from '../../common/helpers'
import Column from '../columns/column'

export class RowData extends Data {
  constructor(rowData) {
    super('rows', rowData)
  }
  get = path => (path ? helpers.get(this.data, path) : new Column())
}

const rowsData = new RowData()
export const rows = rowsData.data

export default rowsData
