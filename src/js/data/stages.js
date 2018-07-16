import Data from './data'

const DEFAULT_DATA = {
  settings: {},
  children: [],
}

export class StageData extends Data {
  constructor(data) {
    super('stages', DEFAULT_DATA)
    this.data = data || Object.create(null)
  }
}

const stagesData = new StageData()

export default stagesData
