import i18n from 'mi18n';
import Sortable from 'sortablejs';
import {data, formData, registeredFields as rFields} from '../common/data';
import h from '../common/helpers';
import dom from '../common/dom';
import {uuid, numToPercent} from '../common/utils';

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
    let columnDefaults;

    let columnID = _this.columnID = dataID || uuid();
    _this.columnData = formData.columns.get(columnID);

    columnDefaults = {
      fields: [],
      id: columnID,
      config: {},
      className: []
    };

    formData.columns.set(columnID, h.extend(columnDefaults, _this.columnData));

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
      className: ['stage-columns', 'empty-columns'],
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
      fType: 'columns'
    };

    column = dom.create(column);

    this.processConfig(column);
    dom.columns.set(columnID, column);

    Sortable.create(column, {
      animation: 150,
      fallbackClass: 'field-moving',
      forceFallback: true,
      group: {name: 'columns', pull: true, put: ['columns', 'controls']},
      sort: true,
      onEnd: _this.onEnd.bind(_this),
      onAdd: _this.onAdd,
      onSort: _this.onSort.bind(_this),
      onRemove: _this.onRemove,
      // Attempt to drag a filtered element
      onMove: (evt) => {
        if (evt.from !== evt.to) {
          evt.from.classList.remove('hovering-column');
        }
        // evt.target.classList.add('hovering-column');
        // evt.target.parentReference = element;

        if (evt.related.parentElement.fType === 'columns') {
          // evt.to.classList.add('hovering-column');
          evt.related.parentElement.classList.add('hovering-column');
        }
      },
      draggable: '.stage-fields',
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
    let columnData = formData.columns.get(_this.columnID);
    if (columnData.config.width) {
      column.dataset.colWidth = columnData.config.width;
      column.style.width = columnData.config.width;
      column.style.float = 'left';
    }
  }

  /**
   * Event when column is added
   * @param  {Object} evt
   */
  onAdd(evt) {
    let {from, item, to} = evt;
    let fromColumn = from.fType === 'columns';
    let fromControl = from.fType === 'controlGroup';

    if (fromControl) {
      let meta = h.get(rFields[item.id], 'meta');
      if (meta.group !== 'layout') {
        let field = dom.addField(to.id, item.id);
        to.insertBefore(field, to.childNodes[evt.newIndex]);
        data.saveFieldOrder(to);
        data.save('fields', to.id);
      } else {
        if (meta.id === 'layout-column') {
          let row = to.parentElement;
          dom.addColumn(row.id);
          dom.columnWidths(row);
        }
      }

      dom.remove(evt.item);
      // document.dispatchEvent(events.formeoUpdated);
    }

    dom.fieldOrderClass(to);

    if (fromColumn) {
      dom.fieldOrderClass(from);
    }

    dom.emptyClass(evt.to);

    data.save();

    to.classList.remove('hovering-column');
  }

  /**
   * Event when field is removed from column
   * @param  {Object} evt
   */
  onRemove(evt) {
    if (evt.from.parent) {
      dom.columnWidths(evt.from.parentElement);
      data.saveColumnOrder(evt.from.parentElement);
    }
    dom.emptyClass(evt.from);
  }

  /**
   * Callback for when dragging ends
   * @param  {Object} evt
   */
  onEnd(evt) {
    let {to, from} = evt;

    // dom.removeEmpty(from);
    dom.fieldOrderClass(to);
    dom.fieldOrderClass(from);

    if (from.parent) {
      dom.columnWidths(from.parentElement);
    }

    data.save();

    if (to) {
      to.classList.remove('hovering-column');
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
    let colWidthPercent;
    let sibWidthPercent;


    /**
     * Set the width before resizing so the column
     * does not resize near window edges
     * @param  {Object} evt
     */
    function setWidths(evt) {
      let newColWidth = (resize.colStartWidth + evt.clientX - resize.startX);
      let newSibWidth = (resize.sibStartWidth - evt.clientX + resize.startX);

      const percent = width => (width / resize.rowWidth * 100);
      colWidthPercent = parseFloat(percent(newColWidth));
      sibWidthPercent = parseFloat(percent(newSibWidth));

      column.dataset.colWidth = numToPercent(colWidthPercent.toFixed(1));
      sibling.dataset.colWidth = numToPercent(sibWidthPercent.toFixed(1));

      column.style.width = numToPercent(colWidthPercent);
      sibling.style.width = numToPercent(sibWidthPercent);
    }

    resize.move = evt => {
      setWidths(evt);
      resize.resized = true;
    };

    resize.stop = function() {
      window.removeEventListener('mousemove', resize.move);
      window.removeEventListener('mouseup', resize.stop);
      if (!resize.resized) {
        return;
      }
      let columnData = formData.columns.get(column.id);
      let sibColumnData = formData.columns.get(sibling.id);
      let totalUsed = colWidthPercent + sibWidthPercent;
        console.log(totalUsed);
      let row = column.parentElement;
      row.classList.remove('resizing-columns');
      let columns = row.getElementsByClassName('stage-columns');
      if (columns.length > 2) {
        let remaining = (100 - totalUsed);
        let remainWidth = parseFloat(remaining / columns.length - 2).toFixed(1);
        console.log(remaining, remainWidth);
  // let remaining = parseFloat((totalUsed / columns.length - 1).toFixed(1));
        console.log(remainWidth);
        h.forEach(columns, i => {
          console.log();
          if (!h.inArray(columns[i].id, [column.id, sibling.id])) {
            let percentWidth = numToPercent(remainWidth);
            columns[i].dataset.colWidth = percentWidth;
            columns[i].style.width = percentWidth;
            formData.columns.get(columns[i].id).config.width = percentWidth;
          }
        });
      }
      columnData.config.width = column.dataset.colWidth;
      sibColumnData.config.width = sibling.dataset.colWidth;
      // column.style.cursor = 'default';
      resize.resized = false;
      data.save();
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

      window.addEventListener('mouseup', resize.stop, false);
      window.addEventListener('mousemove', resize.move, false);
    })(evt);
  }

}
