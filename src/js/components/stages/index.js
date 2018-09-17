import ComponentData from '../component-data'
import Stage from './stage'

export class Stages extends ComponentData {
  constructor(stageData) {
    super('stages', stageData)
  }
  Component(data) {
    return new Stage(data)
  }
}

const stages = new Stages()

export default stages
