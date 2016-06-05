import Sortable from 'sortablejs';
import { data, dataMap } from '../common/data';
import animate from '../common/animation';
import helpers from '../common/helpers';
import DOM from '../common/dom';
import Row from './row';
import Column from './column';
import Field from './field';
var dom = new DOM();

var stageOpts;

export default class Stage {
  constructor(formeoOptions) {
    let defaults = {};
    stageOpts = Object.assign({}, defaults, formeoOptions);

    this.stage = this.loadStage();

    return this.stage;
  }

  loadStage() {
    let stageWrap = this.dom,
      stage = stageWrap.firstChild;

    if (dataMap.stage.rows && dataMap.stage.rows.length) {
      this.loadRows(stage);
      stage.classList.remove('stage-empty');
    }

    return stageWrap;
  }

  loadRows(stage) {
    // if (dataMap.stage.rows.length) {
    let rows = dataMap.stage.rows;
    helpers.forEach(rows, (i) => {
      let row = new Row(rows[i]);
      this.loadColumns(row);
      stage.appendChild(row);
      dom.updateColumnPreset(row);
    });
    // }
  }

  loadColumns(row) {
    // if (dataMap.rows[row.id].columns.length) {
    let columns = dataMap.rows[row.id].columns;
    helpers.forEach(columns, (i) => {
      let column = new Column(columns[i]);
      dom.fieldOrder(column);
      this.loadFields(column);
      row.appendChild(column);
    });
    // }
  }

  loadFields(column) {
    // if (dataMap.columns[column.id].fields.length) {
    let fields = dataMap.columns[column.id].fields;
    helpers.forEach(fields, (i) => {
      let field = new Field(fields[i]);
      column.appendChild(field);
    });
    // }
  }

  stageElements() {
    let opts = stageOpts,
      stage = {
        tag: 'ul',
        attrs: {
          className: [
            'stage',
            'stage-empty'
          ],
          id: opts.formID + '-stage'
        },
        fType: 'stage'
      },
      formEdit = {
        tag: 'div',
        className: 'form-edit'
      };

    return stage;
  }

  createColumn(evt) {
    let field = evt.from.fType === 'column' ? evt.item : new Field(evt.item.id),
      column = new Column();

    dataMap.fields[field.id].parent = column.id;

    field.classList.add('first-field');
    column.appendChild(field);
    dataMap.columns[column.id].fields.push(field.id);
    return column;
  }

  addRow(evt) {
    let _this = this,
      column = evt.from.fType === 'row' ? evt.item : _this.createColumn(evt),
      row = new Row();

// Set parent IDs
    dataMap.columns[column.id].parent = row.id;
    dataMap.rows[row.id].parent = stageOpts.formID;

    row.appendChild(column);
    data.saveColumnOrder(row);

    return row;
  }

  onSort(evt) {
    data.saveRowOrder(evt.item);
  }

  onAdd(evt) {
    let stage = evt.target,
      newIndex = helpers.indexOfNode(evt.item, stage),
      row = this.addRow(evt);

    if (evt.item.fType === 'column') {
      dom.columnWidths(row);
    }

    stage.insertBefore(row, stage.children[newIndex]);
    data.saveRowOrder(row);
    data.save();

    if (evt.from.fType === 'controlGroup') {
      dom.remove(evt.item);
    }
  }

  /**
   * Does some cleanup after an element is removed from the stage
   * @return {[type]} [description]
   */
  onRemove(type) {

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
    let _this = this,
      stageElements = this.stageElements(); // stage items

    let stageWrap = dom.create({
      tag: 'div',
      attrs: {
        className: 'stage-wrap'
      },
      content: stageElements
    });

    Sortable.create(stageWrap.firstChild, {
      animation: 150,
      fallbackClass: 'row-moving',
      forceFallback: true,
      // group: { pull: false, put: ['controls', 'columns'] },
      group: { name: 'stage', pull: false, put: ['controls', 'rows', 'columns'] },
      // Element is dropped into the list from another list
      onAdd: _this.onAdd.bind(_this),
      // onDrop: _this.onAdd.bind(_this),
      sort: true,
      // onUpdate: (evt) => {
      //   console.log(dataMap, evt);
      // },
      onSort: _this.onSort.bind(_this),
      onDrop: (evt) => { console.log(evt); },
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
