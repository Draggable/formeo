import ComponentData from '../component-data'
import Column from './column'

export default class Columns extends ComponentData {
  constructor(columnData) {
    super('columns', columnData)
  }
  Component = Column
}
