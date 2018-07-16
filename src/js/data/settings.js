import Data from './data'

export class SettingData extends Data {
  constructor(data) {
    super('settings')
    this.data = data || Object.create(null)
  }
}

const settingsData = new SettingData()

export default settingsData
