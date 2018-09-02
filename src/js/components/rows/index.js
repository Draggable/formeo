import ComponentData from '../component-data'
import Row from './row'

export default class Rows extends ComponentData {
  constructor(rowData) {
    super('rows', rowData)
  }
  Component = Row
}
