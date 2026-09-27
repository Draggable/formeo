import { looksLikeArrayIndex, nonIndexId, unique } from '../../common/utils/index.mjs'
import ComponentData from '../component-data.js'
import { pageText } from './page-text.mjs'
import Stage from './stage.js'

const DEFAULT_CONFIG = () => ({
  actionButtons: {
    buttons: ['edit'],
    disabled: [],
  },
  panels: {
    disabled: [],
    // The 'order' array specifies the sequence in which the panels should be displayed.
    // Each string in the array represents a panel type, such as 'attrs', 'options', or 'conditions'.
    // By default, these panels are ordered as you see below, but can be override via formeo options.
    order: ['attrs', 'options', 'conditions'],
  },
})

/**
 * Whether an order can be kept as an object's key order. JS lists integer-like keys ("1", "2") first, in ascending
 * numeric order, whatever their insertion order (#122), so they must already lead, in that order.
 * @param {String[]} ids
 * @return {Boolean}
 */
const isRepresentableOrder = ids => {
  const indexIds = ids.filter(looksLikeArrayIndex)
  return indexIds.every((id, i) => ids[i] === id && (i === 0 || Number(indexIds[i - 1]) < Number(id)))
}

export class Stages extends ComponentData {
  constructor(stageData) {
    super('stages', stageData)
    this.config = { all: DEFAULT_CONFIG() }
  }
  Component(data) {
    return new Stage(this.withPageTitle(data), this.components)
  }

  /**
   * A fresh id that never looks like an array index: page order is this store's key order, and an integer-like
   * key would jump to the front regardless of when it was added (#122).
   * @returns {String}
   */
  generateId = () => nonIndexId()

  /**
   * With the editor's `pages` option every stage carries a string `config.title` (#122), so its edit panel always
   * offers one. An empty title shows as "Page {n}".
   * @param {Object} data stage data
   * @return {Object}
   */
  withPageTitle(data) {
    const title = data.config?.title
    if (!this.components?.opts?.pages || typeof title === 'string') {
      return data
    }
    return { ...data, config: { ...data.config, title: title == null ? '' : String(title) } }
  }

  /**
   * A page's title: its config.title, or "Page {n}" (1-based) when that is empty
   * @param {Stage} stage
   * @param {Number} [index] the page's 0-based position, when the caller already knows it
   * @return {String}
   */
  pageTitle(stage, index = Object.keys(this.data).indexOf(stage.id)) {
    const title = stage.get('config.title')
    return typeof title === 'string' && title.trim() ? title : pageText('pages.untitled', { n: index + 1 })
  }

  /**
   * Puts the stages (pages) in a new order. Page order is the key order of this store's data, the same object as
   * the editor's formData.stages, so the keys are re-inserted in place. Integer-like ids always come first, in
   * ascending order, so an order that moves another page before one of them, or reorders them, is refused.
   * @param {String[]} ids stage ids in the new order; unknown ids are ignored, missing ones keep their order at the end
   * @return {Boolean} whether the order changed
   */
  reorder(ids) {
    const current = Object.keys(this.data)
    const wanted = unique([...ids.filter(id => Object.hasOwn(this.data, id)), ...current])
    if (wanted.every((id, i) => id === current[i])) {
      return false
    }
    if (!isRepresentableOrder(wanted)) {
      console.warn(
        'formeo: pages whose ids look like array indexes ("1", "2") keep their order; use other ids to reorder them.'
      )
      return false
    }
    const entries = wanted.map(id => [id, this.data[id]])
    for (const id of current) {
      delete this.data[id]
    }
    for (const [id, stage] of entries) {
      this.data[id] = stage
    }
    this.events?.formeoUpdated({
      entity: this,
      dataPath: 'stages',
      changePath: 'stages',
      value: wanted,
      previousValue: current,
      changeType: 'reordered',
    })
    return true
  }
}

const stages = new Stages()

export default stages
