import Data from '../../data/data'

const DEFAULT_DATA = {
  config: {
    fieldset: false, // wrap contents of row in fieldset
    legend: '', // Legend for fieldset
    inputGroup: false, // is repeatable input-group?
  },
  children: [],
}

export class RowData extends Data {
  constructor() {
    super('rows', DEFAULT_DATA)
  }
}

const rowsData = new RowData()
export const rows = rowsData.data

export default rowsData
