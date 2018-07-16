import Data from './data'
import SettingData from './settings'
import StageData from './stages'
import RowData from './rows'
import ColumnData from './columns'
import FieldData from './fields'
import { uuid } from '../common/utils'

export const settings = SettingData.data
export const stages = StageData.data
export const rows = RowData.data
export const columns = ColumnData.data
export const fields = FieldData.data

const DEFAULT_DATA = {
  id: uuid,
  settings,
  stages,
  rows,
  columns,
  fields,
}

class FormeoData extends Data {
  constructor() {
    super('form')
    this.data = DEFAULT_DATA
  }
  load = data => {
    console.log(data)
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    Object.entries(data).forEach(([key, val]) => {
      console.log(key, val)
      // if (val instanceof Object && !Array.isArray(val)) {
      // val = objToMap(val)
      // }
      // formData.set(key, val)
    })
    return this.data
  }
}

const formeoData = new FormeoData()

export default formeoData
