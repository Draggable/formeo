import i18n from 'mi18n'
import dom from '../common/dom'
import EditPanelItem from './edit-panel-item'

/**
 * Element/Field class.
 */
export default class EditPanel {
  /**
   * Set defaults and load panelData
   * @param  {Object} panelData existing field ID
   * @param  {String} panelName name of panel
   * @param  {String} fieldId
   * @return {Object} field object
   */
  constructor(panelData, panelName, fieldId) {
    this.type = dom.contentType(panelData)
    this.data = this.type === 'object' ? Object.entries(panelData) : panelData
    this.name = panelName
    this.fieldId = fieldId
    this.config = {
      label: i18n.get(`panelLabels.${panelName}`),
    }
    this.attrs = {
      className: `f-panel ${panelName}-panel`,
    }
    // const domConfig = {
    // ,
    // content: [this.editPanelContent],
    // action: {
    //   // change: evt => {
    // let fieldData = formData.fields.get(_this.id);
    //   if (evt.target.fMap) {
    //     let value = evt.target.value;
    //     let targetType = evt.target.type;
    //     if (targetType === 'checkbox' || targetType === 'radio') {
    //       let options = fieldData.options;
    //       value = evt.target.checked;
    //       // uncheck options if radio
    //       if (evt.target.type === 'radio') {
    //         options.forEach(option => option.selected = false);
    //       }
    //     }
    //     h.set(fieldData, evt.target.fMap, value);
    //     data.save(panelType, _this.id);
    //     // throttle this for sure
    //     _this.updatePreview();
    //   }
    // }
    //   },
    // }
    // this.dom = dom.create(domConfig)
    // console.log(this.dom)
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelName
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  content = () => {
    const panel = {
      tag: 'ul',
      attrs: {
        className: ['field-edit-group', 'field-edit-' + this.name],
      },
      editGroup: this.name,
      isSortable: this.name === 'options',
      content: Array.from(this.data).map((data, index) => {
        const itemKey = [this.name, data[0], this.type === 'array' && String(index)].filter(Boolean).join('.')
        const itemData = this.type === 'array' ? data : { [data[0]]: data[1] }
        return new EditPanelItem(itemKey, itemData, this.fieldId)
      }),
    }
    return panel
  }
}
