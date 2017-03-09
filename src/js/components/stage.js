import Sortable from 'sortablejs';
import i18n from 'mi18n';
import {data, formData} from '../common/data';
import h from '../common/helpers';
import dom from '../common/dom';

let stageOpts = {};

/**
 * Stage is where fields and elements are dragged to.
 */
export default class Stage {
  /**
   * Process options and load existing fields from data to the stage
   * @param  {Object} formeoOptions
   * @param  {String} stageID uuid
   * @return {Object} DOM element
   */
  constructor(formeoOptions, stageID) {
    // formData = data.get();
    this.stageID = stageID || h.uuid();
    let defaultOptions = {
      formSettings: [{
        tag: 'input',
        id: 'form-title',
        attrs: {
          className: 'form-title',
          placeholder: i18n.get('Untitled Form'),
          value: i18n.get('Untitled Form'),
          type: 'text'
        },
        config: {
          label: i18n.get('Form Title')
        }
      }, {
        tag: 'input',
        id: 'form-novalidate',
        attrs: {
          className: 'form-novalidate',
          value: false,
          type: 'checkbox'
        },
        config: {
          label: i18n.get('Form novalidate')
        }
      }, {
        tag: 'input',
        id: 'form-tags',
        attrs: {
          className: 'form-tags',
          type: 'text'
        },
        config: {
          label: i18n.get('Tags')
        }
      }]
    };

    stageOpts = Object.assign(stageOpts, defaultOptions, formeoOptions);

    if (!formData.stages[this.stageID]) {
      formData.stages[this.stageID] = {
        settings: {},
        rows: []
      };
    }

    const stageWrap = this.loadStage();

    dom.stages[this.stageID] = this.stage;

    return stageWrap;
  }

  /**
   * Prep stage to receive rows
   * @return {Object} DOM element
   */
  loadStage() {
    let stageWrap = this.dom;
    if (formData.stages[this.stageID].rows.length) {
      dom.loadRows(this.stage);
      this.stage.classList.remove('stage-empty');
    }

    return stageWrap;
  }


  /**
   * Generate the elements that make up the Stage
   * @return {Object} stage elements, settings, stage ul
   */
  elementConfigs() {
    let _this = this;
    let config = {
        stage: {
          tag: 'ul',
          attrs: {
            className: [
              'stage',
              'stage-empty'
            ],
            id: _this.stageID
          },
          fType: 'stage'
        },
        settings: {
          tag: 'div',
          attrs: {
            className: 'formeo-settings',
            id: `${_this.stageID}-settings`
          },
          fType: 'settings'
        }
      };

    config.settings.content = stageOpts.formSettings.slice();

    return config;
  }

  /**
   * Callback for when a row is sorted
   * @param  {Object} evt
   */
  onSort(evt) {
    data.saveRowOrder(evt);
    data.save();
  }

  /**
   * [onAdd description]
   * @param  {Object} evt
   * @return {Object} formData
   */
  onAdd(evt) {
    let stage = evt.target;
    let newIndex = h.indexOfNode(evt.item, stage);
    let row = dom.addRow(evt);

    if (evt.item.fType === 'column') {
      dom.columnWidths(row);
    }

    stage.insertBefore(row, stage.children[newIndex]);
    data.saveRowOrder(row);

    if (evt.from.fType === 'controlGroup') {
      dom.remove(evt.item);
    }

    return data.save();
  }

  /**
   * Does some cleanup after an element is removed from the stage
   * @param  {Object} evt
   * @return {Object} formData
   */
  onRemove(evt) {
    console.log('stage.js onRemove', evt);
    return data.save();
  }

  /**
   * Returns the markup for the stage
   *
   * @return {DOM}
   */
  get dom() {
    if (this.stage) {
      return this.stage;
    }
    let _this = this;
    let config = this.elementConfigs();

    let stageWrap = dom.create({
      tag: 'div',
      attrs: {
        className: 'stage-wrap'
      },
      content: [
        config.stage, // stage items
        config.settings
      ]
    });
    this.stage = stageWrap.firstChild;


    Sortable.create(stageWrap.firstChild, {
      animation: 150,
      fallbackClass: 'row-moving',
      forceFallback: true,
      fallbackTolerance: 0,
      // group: { pull: false, put: ['controls', 'columns'] },
      group: {name: 'stage', pull: false, put: ['controls', 'rows', 'columns']},
      // Element is dropped into the list from another list
      onAdd: _this.onAdd.bind(_this),
      onRemove: _this.onRemove.bind(_this),
      // onDrop: _this.onAdd.bind(_this),
      sort: true,
      onStart: evt => {
        dom.activeStage = _this.stage;
      },
      onUpdate: evt => {
        // saveRowOrder();
        console.log('Stage onUpdate');
        console.log(formData, evt);
      },
      onSort: _this.onSort.bind(_this),
      onDrop: evt => {
       console.log(evt);
      },
      onMove: evt => console.log('moving row'),
      draggable: '.stage-row',
      handle: '.row-handle',
      // onFilter: function(evt) {
      //   console.log(evt);
      // return false;
      // },
      // filter: '.stage-column'
    });

    return stageWrap;
  }
}
