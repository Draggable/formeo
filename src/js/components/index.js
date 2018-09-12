import Data from './data'
import { uuid } from '../common/utils'
import StagesData from './stages'
import RowsData from './rows'
import ColumnsData from './columns'
import FieldsData from './fields'

export let Stages
export let Rows
export let Columns
export let Fields

const DEFAULT_DATA = {
  id: uuid(),
}

export class Components extends Data {
  constructor(opts) {
    super('components')
    this.opts = opts
    this.data = DEFAULT_DATA
  }

  sessionFormData = () => {
    if (this.opts && this.opts.sessionStorage && window.sessionStorage) {
      return window.sessionStorage.getItem('formData')
    }
  }

  load = (formData, opts = Object.create(null)) => {
    this.opts = opts
    const { stages, rows, columns, fields, id } = Object.assign({}, this.sessionFormData(), formData)
    Stages = new StagesData(stages)
    Rows = new RowsData(rows)
    Columns = new ColumnsData(columns)
    Fields = new FieldsData(fields)
    this.add('stages', Stages)
    this.add('rows', Rows)
    this.add('columns', Columns)
    this.add('fields', Fields)
    if (id) {
      this.set('id', id)
    }

    return this.data
  }

  get json() {
    return window.JSON.stringify(this.getData())
  }

  get formData() {
    return this.getData()
  }

  // init = (opts, userFormData = {}) => {}
}

const components = new Components()
export default components
