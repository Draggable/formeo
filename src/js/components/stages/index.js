import ComponentData from '../component-data'
import Stage from './stage'

export default class Stages extends ComponentData {
  constructor(stageData) {
    super('stages', stageData)
    if (!stageData) {
      this.activeStage = this.add()
    }
  }
  Component = Stage
}
