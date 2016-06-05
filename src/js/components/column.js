import Sortable from 'sortablejs';
import { data, dataMap } from '../common/data';
import helpers from '../common/helpers';
import DOM from '../common/dom';
import Field from './field';


var dom = new DOM();

export default class Column {

  constructor(dataID) {
    let _this = this,
      columnDataDefault;

    _this.columnID = dataID || helpers.uuid();

    columnDataDefault = {
      fields: [],
      id: _this.columnID,
      config: {}
    };

    dataMap.columns[_this.columnID] = helpers.extend(columnDataDefault, dataMap.columns[_this.columnID]);

    let resizeHandle = {
        tag: 'li',
        className: 'resize-x-handle',
        action: {
          mousedown: _this.resize
        }
      },
      editWindow = {
        tag: 'li',
        className: 'column-edit group-config'
      };

    let column = {
      tag: 'ul',
      className: ['stage-column'],
      dataset: {
        hoverTag: 'Column'
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

    this.processConfig(column);

    column = dom.create(column);

    Sortable.create(column, {
      animation: 150,
      fallbackClass: 'field-moving',
      forceFallback: true,
      group: { name: 'columns', pull: true, put: ['columns', 'controls'] },
      sort: true,
      onEnd: _this.onEnd.bind(_this),
      onAdd: _this.onAdd.bind(_this),
      onRemove: (evt) => {
        _this.onRemove(evt.target);
      },
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

  processConfig(column) {
    let _this = this,
    columnData = dataMap.columns[_this.columnID];
    if (columnData.config.width) {
      let width = columnData.config.width,
        widthType = dom.contentType(width);

      if (widthType === 'string') {
        column.className.push(width);
      } else if (widthType === 'array') {
        column.className.push(...width);
      } else {
        column.style.width = width.toString() + '%';
      }
    }
  }

  onAdd(evt) {
    if (evt.from.fType === 'controlGroup') {
      let column = evt.target,
        field = new Field(evt.item.id);

      column.insertBefore(field, column.childNodes[evt.newIndex]);


      // calculate field position, subtracting indexes for column-config and column-actions
      dom.fieldOrder(column);
      dom.remove(evt.item);
      data.saveFieldOrder(field);
      data.save('fields', column.id);
    }

    evt.target.classList.remove('hovering-column');
  }

  onRemove(column) {
    let fields = column.querySelectorAll('.stage-field'),
      row = column.parentElement;

    if (!fields.length) {
      dom.remove(column);
      let columns = row.querySelectorAll('.stage-column');
      if (!columns.length) {
        dom.remove(row);
      }
    }
    dom.fieldOrder(column);
    dom.columnWidths(row);
  }

  onEnd(evt) {
    if (evt.target) {
      evt.target.classList.remove('hovering-column');
    }
  }

  resize(evt) {
    let resize = {},
      column = evt.target.parentElement,
      sibling = evt.target.parentElement.nextSibling || evt.target.parentElement.previousSibling,
      row = column.parentElement,
      rowStyle = dom.getStyle(row),
      rowPadding = parseFloat(rowStyle.paddingLeft) + parseFloat(rowStyle.paddingRight);

    function getOffset(resizeHandle, evt) {
      let halfWidth = resizeHandle.offsetWidth / 2;

      return (evt.clientX - resizeHandle.offsetLeft + halfWidth) - halfWidth;
    }

    /**
     * Set the width before resizing so the column
     * does not resize near window edges
     */
    function setWidths(evt) {
      let newColWidth = (resize.colStartWidth + evt.clientX - resize.startX),
        newSibWidth = (resize.sibStartWidth - evt.clientX + resize.startX),
        numToPercentString = (num) => {
          return num.toString() + '%';
        },
        percent = (width) => {
          return (width / resize.rowWidth * 100);
        },
        colWidthPercent = percent(newColWidth),
        sibWidthPercent = percent(newSibWidth);

      column.dataset.colWidth = numToPercentString(Math.round(colWidthPercent));
      sibling.dataset.colWidth = numToPercentString(Math.round(sibWidthPercent));

      column.style.width = numToPercentString(colWidthPercent);
      sibling.style.width = numToPercentString(sibWidthPercent);
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

      resize.colStartWidth = column.offsetWidth || dom.getStyle(column, 'width');
      resize.sibStartWidth = sibling.offsetWidth || dom.getStyle(sibling, 'width');
      resize.rowWidth = row.offsetWidth - rowPadding; //compensate for padding


      window.addEventListener('mousemove', resize.move, false);
      window.addEventListener('mouseup', resize.stop, false);
    })(evt);

  }

}
