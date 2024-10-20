import ComponentData from '../component-data.js'
import Stage from './stage.js'

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
