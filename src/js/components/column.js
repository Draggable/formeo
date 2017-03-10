import i18n from 'mi18n';
import Sortable from 'sortablejs';
import {data, formData} from '../common/data';
import {remove} from '../common/utils';
import helpers from '../common/helpers';
import dom from '../common/dom';
import Field from './field';

// let dom = new DOM();

/**
 * Setup Column elements
 */
export default class Column {
  /**
   * Set defaults and/or load existing columns
   * @param  {String} dataID columnId
   * @return {Object} Column config object
   */
  constructor(dataID) {
    let _this = this;
    let cData = formData.columns;
    let columnDefaults;


    let columnID = _this.columnID = dataID || helpers.uuid();

    columnDefaults = {
      fields: [],
      id: columnID,
      config: {},
      className: []
    };

    cData[columnID] = helpers.extend(columnDefaults, cData[columnID]);

    let resizeHandle = {
        tag: 'li',
        className: 'resize-x-handle',
        action: {
          mousedown: _this.resize
        }
      };
    let editWindow = {
        tag: 'li',
        className: 'column-edit group-config'
      };

    let column = {
      tag: 'ul',
      className: ['stage-column'],
      dataset: {
        hoverTag: i18n.get('column')
      },
      action: {
        mouseup: (evt) => {
          let column = evt.target.parentElement;
          if (column.resizing) {
            column.resizing = false;
            column.parentElement.classList.remove('resizing-columns');
          }
        }
      },
      id: _this.columnID,
      content: [dom.actionButtons(_this.columnID), editWindow, resizeHandle],
      fType: 'column'
    };

    column = dom.create(column);

    this.processConfig(column);

    Sortable.create(column, {
      animation: 150,
      fallbackClass: 'field-moving',
      forceFallback: true,
      group: {name: 'columns', pull: true, put: ['columns', 'controls']},
      sort: true,
      onEnd: _this.onEnd.bind(_this),
      onAdd: _this.onAdd.bind(_this),
      onSort: _this.onSort.bind(_this),
      onRemove: _this.onRemove,
      // Attempt to drag a filtered element
      onMove: (evt) => {
        if (evt.from !== evt.to) {
          evt.from.classList.remove('hovering-column');
        }
        // evt.target.classList.add('hovering-column');
        // evt.target.parentReference = element;

        if (evt.related.parentElement.fType === 'column') {
          // evt.to.classList.add('hovering-column');
          evt.related.parentElement.classList.add('hovering-column');
        }
      },
      draggable: '.stage-field',
      handle: '.field-handle'
    });

    return column;
  }

  /**
   * Column sorted event
   * @param  {Object} evt sort event data
   * @return {Object} Column order, array of column ids
   */
  onSort(evt) {
    return data.saveFieldOrder(evt.target);
    // data.save('column', evt.target.id);
    // document.dispatchEvent(events.formeoUpdated);
  }

  /**
   * Process column configuration data
   * @param  {Object} column
   */
  processConfig(column) {
    let _this = this;
    let columnData = formData.columns[_this.columnID];
    if (columnData.config.width) {
      let percentWidth = Math.round(columnData.config.width).toString() + '%';
      column.dataset.colWidth = percentWidth;
      column.style.width = percentWidth;
      column.style.float = 'left';
    }
  }

  /**
   * Event when column is added
   * @param  {Object} evt
   */
  onAdd(evt) {
    if (evt.from.fType === 'controlGroup') {
      let column = evt.target;
      let field = new Field(evt.item.id);

      column.insertBefore(field, column.childNodes[evt.newIndex]);
      formData.fields[field.id].parent = column.id;

      // calculates field position, subtracting indexes
      // for column-config and column-actions
      dom.fieldOrderClass(column);
      dom.remove(evt.item);
      data.saveFieldOrder(column);
      data.save('fields', column.id);
      // document.dispatchEvent(events.formeoUpdated);
    }

    evt.target.classList.remove('hovering-column');
  }

  /**
   * Event when field is removed from column
   * @param  {Object} evt
   */
  onRemove(evt) {
    let field = evt.item;
    let column = evt.target;
    let fields = column.querySelectorAll('.stage-field');
    let row = column.parentElement;

    if (!fields.length) {
      dom.remove(column);
      data.saveColumnOrder(row);
      let columns = row.querySelectorAll('.stage-column');
      if (!columns.length) {
        dom.remove(row);
        data.saveRowOrder();
      }
    }
    dom.fieldOrderClass(column);
    dom.columnWidths(row);
    data.save('columns', row.id);
    remove(formData.columns[column.id].fields, field.id);
  }

  /**
   * Callback for when dragging ends
   * @param  {Object} evt
   */
  onEnd(evt) {
    if (evt.target) {
      evt.target.classList.remove('hovering-column');
    }
  }

  /**
   * Handle column resizing
   * @param  {Object} evt resize event
   */
  resize(evt) {
    let resize = {};
    let column = evt.target.parentElement;
    let sibling = column.nextSibling || column.previousSibling;
    let row = column.parentElement;
    let rowStyle = dom.getStyle(row);
    let rowPadding = parseFloat(rowStyle.paddingLeft) +
    parseFloat(rowStyle.paddingRight);

    /**
     * Set the width before resizing so the column
     * does not resize near window edges
     * @param  {Object} evt
     */
    function setWidths(evt) {
      let newColWidth = (resize.colStartWidth + evt.clientX - resize.startX);
      let newSibWidth = (resize.sibStartWidth - evt.clientX + resize.startX);
      const numToPercent = num => num.toString() + '%';
      const percent = width => (width / resize.rowWidth * 100);
      let colWidthPercent = percent(newColWidth);
      let sibWidthPercent = percent(newSibWidth);

      column.dataset.colWidth = numToPercent(Math.round(colWidthPercent));
      sibling.dataset.colWidth = numToPercent(Math.round(sibWidthPercent));

      column.style.width = numToPercent(colWidthPercent);
      sibling.style.width = numToPercent(sibWidthPercent);
    }

    resize.move = function(evt) {
      setWidths(evt);
    };

    resize.stop = function() {
      // events.mousemove.callbacks = [];
      column.style.cursor = 'default';
      row.classList.remove('resizing-columns');
      window.removeEventListener('mousemove', resize.move);
    };

    resize.start = (function(evt) {
      resize.startX = evt.clientX;
      row.classList.add('resizing-columns');

      // setWidths(evt);

      // remove bootstrap column classes since we are custom sizing
      let reg = /\bcol-\w+-\d+/g;
      column.className.replace(reg, '');
      sibling.className.replace(reg, '');

      // eslint-disable-next-line
      resize.colStartWidth = column.offsetWidth || dom.getStyle(column, 'width');
      // eslint-disable-next-line
      resize.sibStartWidth = sibling.offsetWidth || dom.getStyle(sibling, 'width');
      resize.rowWidth = row.offsetWidth - rowPadding; // compensate for padding

      window.addEventListener('mousemove', resize.move, false);
      window.addEventListener('mouseup', resize.stop, false);
    })(evt);
  }

}
