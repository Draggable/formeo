import Sortable from 'sortablejs';
import i18n from 'mi18n';
import {data, formData} from '../common/data';
import helpers from '../common/helpers';
import dom from '../common/dom';
import Row from './row';
import Column from './column';
import Field from './field';
// let dom = new DOM();

let stageOpts = {};
// let formData = {};

/**
 * Stage is where fields and elements are dragged to.
 */
export default class Stage {
  /**
   * Process options and load existing fields from data to the stage
   * @param  {Object} formeoOptions
   * @param  {String} formID
   * @return {Object} DOM element
   */
  constructor(formeoOptions, formID) {
    // formData = data.get();
    this.formID = formID;
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

    this.stage = this.loadStage();

    return this.stage;
  }

  /**
   * Prep stage to receive rows
   * @return {Object} DOM element
   */
  loadStage() {
    let stageWrap = this.dom;
    let stage = stageWrap.firstChild;

    console.log(formData);

    if (formData.stage.rows && formData.stage.rows.length) {
      this.loadRows(stage);
      stage.classList.remove('stage-empty');
    }

    return stageWrap;
  }

  /**
   * Loop through the formData and append it to the stage
   * @param  {Object} stage DOM element
   * @return {Array}  loaded rows
   */
  loadRows(stage) {
    // if (formData.stage.rows.length) {
    let rows = formData.stage.rows;
    return helpers.forEach(rows, (i) => {
      let row = new Row(rows[i]);
      this.loadColumns(row);
      stage.appendChild(row);
      // dom.updateColumnPreset(row);
    });
    // }
  }

  /**
   * Load columns to row
   * @param  {Object} row
   */
  loadColumns(row) {
    // if (formData.rows[row.id].columns.length) {
    let columns = formData.rows[row.id].columns;
    helpers.forEach(columns, (i) => {
      let column = new Column(columns[i]);
      dom.fieldOrderClass(column);
      this.loadFields(column);
      row.appendChild(column);
    });
    // }
  }

  /**
   * [loadFields description]
   * @param  {[type]} column [description]
   */
  loadFields(column) {
    // if (formData.columns[column.id].fields.length) {
    let fields = formData.columns[column.id].fields;
    helpers.forEach(fields, (i) => {
      let field = new Field(fields[i]);
      column.appendChild(field);
    });
    // }
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
            id: _this.formID + '-stage'
          },
          fType: 'stage'
        },
        settings: {
          tag: 'div',
          attrs: {
            className: 'formeo-settings',
            id: _this.formID + '-settings'
          },
          fType: 'settings'
        }
      };

    config.settings.content = stageOpts.formSettings.slice();

    return config;
  }

  /**
   * Create or add a field and column then return it.
   * @param  {Object} evt Drag event data
   * @return {Object}     column
   */
  createColumn(evt) {
    // console.log(evt);
    let field = evt.from.fType === 'column' ? evt.item : new Field(evt.item.id);
    let column = new Column();

    formData.fields[field.id].parent = column.id;

    field.classList.add('first-field');
    column.appendChild(field);
    formData.columns[column.id].fields.push(field.id);
    return column;
  }

  /**
   * [addRow description]
   * @param {[type]} evt [description]
   * @return {Object} row
   */
  addRow(evt) {
    let _this = this;
    let column = evt.from.fType === 'row' ? evt.item : _this.createColumn(evt);
    let row = new Row();

    // Set parent IDs
    formData.columns[column.id].parent = row.id;
    formData.rows[row.id].parent = _this.formID;

    row.appendChild(column);
    data.saveColumnOrder(row);

    return row;
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
    let newIndex = helpers.indexOfNode(evt.item, stage);
    let row = this.addRow(evt);

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
    console.log([stageWrap]);

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
      onUpdate: (evt) => {
        // saveRowOrder();
        console.log('Stage onUpdate');
        console.log(formData, evt);
      },
      onSort: _this.onSort.bind(_this),
      onDrop: (evt) => {
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
