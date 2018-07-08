import dom from '../common/dom'

/**
 * Edit Panel Item
 */
export default class EditPanelItem {
  /**
   * Set defaults and load panelData
   * @param  {Object} panelItemData existing field ID
   * @param  {string} panelItemName name of panel
   * @return {Object} field object
   */
  constructor(panelItemData, panelItemName) {
    const itemConfig = {
      tag: 'li',
      // className: [`${panelType}-${propKey}-wrap`, 'prop-wrap'],
      // id: id,
      content: [],
    }
    this.dom = dom.create(itemConfig)
    this.name = panelItemName
  }
}
