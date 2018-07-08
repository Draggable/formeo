import { uuid, objToMap, mapToObj } from '../common/utils'

const mergeStageData = stageData => {
  const defaultStageData = {
    settings: {},
    rows: [],
  }
  return objToMap(Object.assign({}, defaultStageData, stageData))
}

export const stages = new Map()

export default Object.create(null, {
  js: {
    get() {
      return mapToObj(stages)
    },
  },
  add: {
    value: (stageData = {}) => {
      const { id } = stageData
      const stageId = id || uuid()
      stages.set(stageId, mergeStageData(stageData))
      return stageId
    },
  },
  get: {
    value: stageId => stages.get(stageId),
  },
})
