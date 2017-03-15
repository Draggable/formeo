import h from './helpers';
import Row from '../components/row';
import Column from '../components/column';
import Field from '../components/field';
import animate from './animation';
import {data, formData} from './data';
import {unique, uuid, clone, numToPercent} from './utils';

/**
 * General purpose markup utilities and generator.
 */
class DOM {
  /**
   * Set defaults, store references to key elements
   * like stages, rows, columns etc
   */
  constructor() {
    // Maintain references to DOM nodes
    // so we don't have to keep doing getElementById
    this.stages = new Map();
    this.rows = new Map();
    this.columns = new Map();
    this.fields = new Map();
  }

  /**
   * Creates DOM elements
   * @param  {Object}  elem      element config object
   * @param  {Boolean} isPreview generating element for preview or render?
   * @return {Object}            DOM Object
   */
  create(elem, isPreview = false) {
    let _this = this;
    let contentType;
    let tag = elem.tag || elem;
    let processed = [];
    let i;
    let wrap = {
      tag: 'div',
      className: [h.get(elem, 'config.inputWrap') || 'form-group'],
      content: []
    };
    let labelAfter = elem => {
      let type = h.get(elem, 'attrs.type');
      return (type === 'checkbox' || type === 'radio');
    };
    let element = document.createElement(tag);
    let holdsContent = (element.outerHTML.indexOf('/') !== -1);
    let isBlockElement = (!this.isInput && holdsContent);
    /**
     * Object for mapping contentType to its function
     * @type {Object}
     */
    let appendContent = {
      string: content => {
        element.innerHTML += content;
      },
      object: content => {
        return element.appendChild(_this.create(content));
      },
      node: content => {
        return element.appendChild(content);
      },
      array: content => {
        for (let i = 0; i < content.length; i++) {
          contentType = _this.contentType(content[i]);
          appendContent[contentType](content[i]);
        }
      },
      function: content => {
        content = content();
        contentType = _this.contentType(content);
        appendContent[contentType](content);
      },
      undefined: () => {
        console.error(elem);
      }
    };

    processed.push('tag');

    // Append Element Content
    if (elem.options) {
      let options = this.processOptions(elem);
      if (holdsContent && tag !== 'button') {
        // mainly used for <select> tag
        appendContent.array.call(this, options);
        delete elem.content;
      } else {
        h.forEach(options, (i) => {
          wrap.content.push(_this.create(options[i], isPreview));
        });

        return this.create(wrap, isPreview);
      }

      processed.push('options');
    }

    // check for root className property
    if (elem.className) {
      elem.attrs = Object.assign({}, elem.attrs, {className: elem.className});
      elem.attrs.className = elem.className;
      delete elem.className;
    }

    // Set element attributes
    if (elem.attrs) {
      _this.processAttrs(elem, element, isPreview);
      processed.push('attrs');
    }

    if (elem.config) {
      if (elem.config.label && tag !== 'button' && !isBlockElement) {
        let label;

        if (isPreview) {
          label = _this.label(elem, 'config.label');
        } else {
          label = _this.label(elem);
        }

        if (!elem.config.noWrap) {
          if (!elem.config.hideLabel) {
            if (labelAfter(elem)) {
              label.classList.add('form-check-label');
              wrap.className = elem.attrs.type;
              element.classList.add('form-check-input');
              label.insertBefore(element, label.firstChild);
              wrap.content.push(label);
            } else {
              wrap.content.push(label, element);
            }
          } else {
            // element = label;
          }
        }
      }

      processed.push('config');
    }

    // Append Element Content
    if (elem.content) {
      contentType = _this.contentType(elem.content);
      appendContent[contentType].call(this, elem.content);
      processed.push('content');
    }

    // Set the new element's dataset
    if (elem.dataset) {
      for (const data in elem.dataset) {
        if (elem.dataset.hasOwnProperty(data)) {
          element.dataset[data] = elem.dataset[data];
        }
      }
      processed.push('dataset');
    }

    // Add listeners for defined actions
    if (elem.action) {
      let actions = Object.keys(elem.action);
      for (i = actions.length - 1; i >= 0; i--) {
        let event = actions[i];
        element.addEventListener(event, elem.action[event]);
      }
      processed.push('action');
    }

    let fieldDataBindings = [
      'stage',
      'row',
      'column',
      'field'
    ];

    if (h.inArray(elem.fType, fieldDataBindings)) {
      let dataType = elem.fType + 'Data';
      element[dataType] = elem;
      if (dataType === 'fieldData') {
        element.panelNav = elem.panelNav;
      }
      processed.push(dataType);
    }

    // Subtract processed and ignored and attach the rest
    let remaining = h.subtract(processed, Object.keys(elem));
    for (i = remaining.length - 1; i >= 0; i--) {
      element[remaining[i]] = elem[remaining[i]];
    }

    if (wrap.content.length) {
      element = this.create(wrap);
    }

    return element;
  }

  /**
   * Create and SVG or font icon.
   * Simple string concatenation instead of DOM.create because:
   *  - we don't need the perks of having icons be DOM objects at this stage
   *  - it forces the icon to be appended using innerHTML which helps svg render
   * @param  {String} name - icon name
   * @return {String} icon markup
   */
  icon(name) {
    let iconLink = document.getElementById('icon-' + name);
    let icon;

    if (iconLink) {
      icon = `<svg class="svg-icon icon-${name}"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-${name}"></use></svg>`;
    } else {
      //eslint-disable-next-line
      icon = `<span class="glyphicon glyphicon-${name}" aria-hidden="true"></span>`;
    }
    return icon;
  }

  /**
   * JS Object to DOM attributes
   * @param  {Object} elem    element config object
   * @param  {Object} element DOM element we are building
   * @param  {Boolean} isPreview
   * @return {void}
   */
  processAttrs(elem, element, isPreview) {
    let {attrs = {}} = elem;
    if (!isPreview) {
      if (!attrs.name && this.isInput(elem.tag)) {
        attrs.name = uuid(elem);
      }
    }
    // Set element attributes
    for (let attr in elem.attrs) {
      if (elem.attrs.hasOwnProperty(attr)) {
        if (elem.attrs[attr]) {
          let name = h.safeAttrName(attr);
          let value = elem.attrs[attr] || '';

          if (Array.isArray(value)) {
            value = value.join(' ');
          }

          element.setAttribute(name, value);
        }
      }
    }
  }

  /**
   * Extend Array of option config objects
   * @param  {Object} elem element config object
   * @return {Array} option config objects
   */
  processOptions(elem) {
    let fieldType = h.get(elem, 'attrs.type') || 'select';

    let optionMap = (option, i) => {
      let defaultInput = {
        tag: 'input',
        attrs: {
          name: elem.id,
          id: null,
          type: fieldType,
          value: option.value || ''
        },
        config: {
          inputWrap: fieldType,
          label: option.label
        },
        fMap: `options[${i}].selected`
      };

      if (option.selected) {
        defaultInput.attrs.checked = true;
      }

      let optionMarkup = {
        select: {
          tag: 'option',
          attrs: option,
          content: option.label
        },
        button: Object.assign({}, elem, {options: undefined}),
        checkbox: defaultInput,
        radio: defaultInput
      };

      // delete optionMarkup[fieldType].attrs.label;

      return optionMarkup[fieldType];
    };

    return elem.options.map(optionMap);
  }

  /**
   * Determine if an element is an input field
   * @param  {String|Object} tag tagName or DOM element
   * @return {Boolean} isInput
   */
  isInput(tag) {
    if (typeof tag !== 'string') {
      tag = tag.tagName;
    }
    return (['input', 'textarea', 'select'].indexOf(tag) !== -1);
  }

  /**
   * Converts escaped HTML into usable HTML
   * @param  {String} html escaped HTML
   * @return {String}      parsed HTML
   */
  parsedHtml(html) {
    let escapeElement = document.createElement('textarea');
    escapeElement.innerHTML = html;
    return escapeElement.textContent;
  }

  /**
   * Generate a label
   * @param  {Object} elem config object
   * @param  {String} fMap map to label's value in formData
   * @return {Object}      config object
   */
  label(elem, fMap) {
    let fieldLabel = {
      tag: 'label',
      attrs: {},
      className: [],
      content: this.parsedHtml(elem.config.label),
      action: {}
    };

    if (elem.id) {
      fieldLabel.attrs.for = elem.id;
    }

    if (fMap) {
      fieldLabel.attrs.contenteditable = true;
      fieldLabel.action.click = function(e) {
        if (e.target.contentEditable === 'true') {
          e.preventDefault();
        }
      };
      fieldLabel.fMap = fMap;
    }

    return dom.create(fieldLabel);
  }

  /**
   * Determine content type
   * @param  {Node | String | Array | Object} content
   * @return {String}                         contentType for mapping
   */
  contentType(content) {
    let type = typeof content;
    if (content instanceof Node || content instanceof HTMLElement) {
      type = 'node';
    } else if (Array.isArray(content)) {
      type = 'array';
    }

    return type;
  }

  /**
   * Get the computed style for DOM element
   * @param  {Object}  elem     dom element
   * @param  {Boolean} property style eg. width, height, opacity
   * @return {String}           computed style
   */
  getStyle(elem, property = false) {
    let style;
    if (window.getComputedStyle) {
      style = window.getComputedStyle(elem, null);
    } else if (elem.currentStyle) {
      style = elem.currentStyle;
    }

    return property ? style[property] : style;
  }

  /**
   * Retrieves an element by config object, string id,
   * or existing reference
   * @param  {Object|String|Node} elem
   * @return {Object}             DOM element
   */
  getElement(elem) {
    let getElement = {
        node: () => elem,
        object: () => document.getElementById(elem.id),
        string: () => document.getElementById(elem)
      };
    let type = this.contentType(elem);
    let element = getElement[type]();

    return element;
  }

  /**
   * Util to remove contents of DOM Object
   * @param  {Object} elem
   * @return {Object} element with its children removed
   */
  empty(elem) {
    while (elem.firstChild) {
      this.remove(elem.firstChild);
    }
    return elem;
  }

  /**
   * Move, close, and edit buttons for row, column and field
   * @param  {String} id   element id
   * @param  {String} item type of element eg. row, column, field
   * @return {Object}      element config object
   */
  actionButtons(id, item = 'column') {
    let _this = this;
    let icon = _this.icon;
    let tag = (item === 'column' ? 'li' : 'div');
    let moveIcon = item === 'row' ? icon('move-vertical') : icon('move');
    let btnWrap = {
        tag: 'div',
        className: 'action-btn-wrap'
      };
      let menuHandle = {
        tag: 'button',
        content: [moveIcon, icon('handle')],
        attrs: {
          className: item + '-handle btn-secondary btn',
          'type': 'button'
        }
      };
      let editToggle = {
        tag: 'button',
        content: icon('edit'),
        attrs: {
          className: item + '-edit-toggle btn-secondary btn',
          'type': 'button'
        },
        action: {
          click: evt => {
            let element = document.getElementById(id);
            let editClass = 'editing-' + item;
            let editWindow = element.querySelector(`.${item}-edit`);
            animate.slideToggle(editWindow, 333);
            if (item === 'field') {
              animate.slideToggle(editWindow.nextSibling, 333);
              element.parentElement.classList.toggle('column-' + editClass);
            }
            element.classList.toggle(editClass);
          }
        }
      };
      let remove = {
        tag: 'button',
        content: icon('remove'),
        attrs: {
          className: item + '-remove btn-secondary btn',
          'type': 'button'
        },
        action: {
          click: () => {
            let element = document.getElementById(id);
            animate.slideUp(element, 250, elem => {
              _this.removeEmpty(elem);
            });
          }
        }
      };

    let actions = {
      tag: tag,
      className: item + '-actions group-actions',
      action: {
        mouseenter: (evt) => {
          let element = document.getElementById(id);
          element.classList.add('hovering-' + item);
          evt.target.parentReference = element;
        },
        mouseleave: (evt) => {
          // if (evt.toElement !== evt.target.parentReference) {
          evt.target.parentReference.classList.remove('hovering-' + item);
          // }
        }
      }
    };

    if (item === 'column') {
      btnWrap.content = [menuHandle, remove];
    } else {
      btnWrap.content = [menuHandle, editToggle, remove];
    }

    actions.content = btnWrap;

    return actions;
  }

  /**
   * [removeEmpty description]
   * @param  {[type]} element [description]
   */
  removeEmpty(element) {
    let _this = this;
    let parent = element.parentElement;
    let type = element.fType;
    let children;
    _this.remove(element);
    children = parent.getElementsByClassName('stage-' + type);
    if (!children.length) {
      if (parent.fType !== 'stages') {
        _this.removeEmpty(parent);
      } else {
        this.emptyClass(parent);
      }
    }
    data.save();
    // document.dispatchEvent(events.formeoUpdated);
  }

  /**
   * Removes element by reference or ID
   * @param  {String|Object} elem
   * @return  {Object} parent element
   */
  remove(elem) {
    let fType = elem.fType;
    if (fType) {
      data.empty(fType, elem.id);
      this[fType].delete(elem.id);
      formData[fType].delete(elem.id);
    }
    return elem.parentElement.removeChild(elem);
  }

  /**
   * Removes a class or classes from nodeList
   *
   * @param  {NodeList} nodeList
   * @param  {String | Array} className
   */
  removeClasses(nodeList, className) {
    let _this = this;
    let removeClass = {
      string: elem => {
        elem.className = elem.className.replace(className, '');
      },
      array: elem => {
        for (let i = className.length - 1; i >= 0; i--) {
          elem.classList.remove(className[i]);
        }
      }
    };
    removeClass.object = removeClass.string; // handles regex map
    h.forEach(nodeList, (i) => {
      removeClass[_this.contentType(className)](nodeList[i]);
    });
  }

  /**
   * Adds a class or classes from nodeList
   *
   * @param  {NodeList} nodeList
   * @param  {String | Array} className
   */
  addClasses(nodeList, className) {
    let _this = this;
    let addClass = {
      string: elem => {
        elem.classList.add(className);
      },
      array: elem => {
        for (let i = className.length - 1; i >= 0; i--) {
          elem.classList.add(className[i]);
        }
      }
    };
    h.forEach(nodeList, (i) => {
      addClass[_this.contentType(className)](nodeList[i]);
    });
  }

  /**
   * [fieldOrderClass description]
   * @param  {[type]} column [description]
   */
  fieldOrderClass(column) {
    let fields = column.querySelectorAll('.stage-fields');

    if (fields.length) {
      this.removeClasses(fields, ['first-field', 'last-field']);
      fields[0].classList.add('first-field');
      fields[fields.length - 1].classList.add('last-field');
    }
  }

  /**
   * Read columns and generate bootstrap cols
   * @param  {Object}  row    DOM element
   * @param  {Boolean} widths
   * @return {Object} colWidth
   */
  columnWidths(row, widths = false) {
    let _this = this;
    let columns = row.getElementsByClassName('stage-columns');
    if (!columns.length) {
      return false;
    }
    let colCount = parseFloat(12 / columns.length);
    let width = widths;
    if (!width) {
      width = parseFloat((100 / columns.length).toFixed(1))/1;
    }
    let bsGridRegEx = /\bcol-\w+-\d+/g;
    // compensate for padding;
    // let rowStyle = _this.getStyle(row);
    // let rowPadding = parseFloat(rowStyle.paddingLeft) +
    // parseFloat(rowStyle.paddingRight);
    // let rowWidth = row.offsetWidth - rowPadding;

    _this.removeClasses(columns, bsGridRegEx);

    h.forEach(columns, i => {
      let column = columns[i];
      let columnData = formData.columns.get(column.id);
      let cDataClassNames = columnData.className;
      if (h.isInt(colCount)) {
        let widthClass = 'col-md-' + colCount;
        column.removeAttribute('style');
        // removes bootstrap column classes
        column.className = column.className.replace(bsGridRegEx, '');
        column.classList.add(widthClass);
        columnData.config.width = width;
        columnData.className = cDataClassNames
        .map(className => className.replace(bsGridRegEx, ''));
        columnData.className.push(widthClass);
        unique(columnData.className);
      }

      let colWidth = numToPercent(width);

      column.style.width = colWidth;
      column.style.float = 'left';
      columnData.config.width = colWidth;
      column.dataset.colWidth = colWidth;
    });

    // Fix the editWindow for any fields that were being edited
    let editingFields = row.getElementsByClassName('editing-field');
    if (editingFields.length) {
      for (let i = editingFields.length - 1; i >= 0; i--) {
        editingFields[i].panelNav.refresh();
      }
    }

    return colCount;
  }

  /**
   * [formGroup description]
   * @param  {[type]} content   [description]
   * @param  {String} className [description]
   * @return {[type]}           [description]
   */
  formGroup(content, className = '') {
    return {
      tag: 'div',
      className: ['form-group', className],
      content: content
    };
  }

  /**
   * Generates the element config for column layout in row
   * @param  {String} rowID [description]
   * @return {Object}       [description]
   */
  columnPresetControl(rowID) {
    let _this = this;
    let row = this.rows.get(rowID);
    let rowData = formData.rows.get(rowID);
    let layoutPreset = {
        tag: 'select',
        attrs: {
          ariaLabel: 'Define a column layout',
          className: 'form-control column-preset'
        },
        action: {
          change: e => {
            _this.setColumnWidths(row, e.target.value);
            data.save();
          }
        }
      };
    let pMap = new Map();
    let custom = {value: 'custom', label: 'Custom'};

    pMap.set(1, [{value: '100.0', label: '100%'}]);
    pMap.set(2, [
      {value: '50.0,50.0', label: '50 | 50'},
      {value: '33.0,66.0', label: '33 | 66'},
      {value: '66.0,33.0', label: '66 | 33'},
      custom
    ]);
    pMap.set(3, [
      {value: '33.3,33.3,33.3', label: '33 | 33 | 33'},
      {value: '25.0,25.0,50.0', label: '25 | 25 | 50'},
      {value: '50.0,25.0,25.0', label: '50 | 25 | 25'},
      {value: '25.0,50.0,25.0', label: '25 | 50 | 25'},
      custom
    ]);
    pMap.set(4, [
      {value: '25.0,25.0,25.0,25.0', label: '25 | 25 | 25 | 25'},
      custom
      ]);
    pMap.set('custom', [custom]);

    if (rowData && rowData.columns.length) {
      let columns = rowData.columns;
      let pMapVal = pMap.get(columns.length);
      layoutPreset.options = pMapVal || pMap.get('custom');
      let curVal = columns.map((columnID, i) => {
        let colData = formData.columns.get(columnID);
        return colData.config.width.replace('%', '');
      }).join(',');
      pMapVal.forEach((val, i) => {
        let options = layoutPreset.options;
        if (val.value === curVal) {
          options[i].selected = true;
        } else {
          delete options[i].selected;
        }
      });
    } else {
      layoutPreset.options = pMap.get(1);
    }

    return layoutPreset;
  }

  /**
   * Set the widths of columns in a row
   * @param {Object} row DOM element
   * @param {String} widths
   */
  setColumnWidths(row, widths) {
    if (widths === 'custom') {
      return;
    }
    widths = widths.split(',');
    let columns = row.getElementsByClassName('stage-columns');
    h.forEach(columns, i => {
      let column = columns[i];
      let percentWidth = widths[i] + '%';
      column.dataset.colWidth = percentWidth;
      column.style.width = percentWidth;
      formData.columns.get(column.id).config.width = percentWidth;
    });
  }

  /**
   * Updates the column preset <select>
   * @param  {String} row [description]
   * @return {Object} columnPresetConfig
   */
  updateColumnPreset(row) {
    // console.log('updateColumnPreset');
    let _this = this;
    let oldColumnPreset = row.querySelector('.column-preset');
    let rowEdit = oldColumnPreset.parentElement;
    let columnPresetConfig = _this.columnPresetControl(row.id);
    let newColumnPreset = _this.create(columnPresetConfig);

    rowEdit.replaceChild(newColumnPreset, oldColumnPreset);
    return columnPresetConfig;
  }

  /**
   * Returns the {x, y} coordinates for the
   * center of a given element
   * @param  {DOM} element
   * @return {Object}      {x,y} coordinates
   */
  coords(element) {
    let elemPosition = element.getBoundingClientRect();
    let bodyRect = document.body.getBoundingClientRect();

    return {
      pageX: elemPosition.left + (elemPosition.width / 2),
      pageY: (elemPosition.top - bodyRect.top) - (elemPosition.height / 2)
    };
  }

  /**
   * Loop through the formData and append it to the stage
   * @param  {Object} stage DOM element
   * @return {Array}  loaded rows
   */
  loadRows(stage) {
    if (!stage) {
      stage = this.activeStage;
    }

    let rows = formData.stages.get(stage.id).rows;
    return rows.forEach(rowID => {
      let row = this.addRow(stage.id, rowID);
      this.loadColumns(row);
      dom.updateColumnPreset(row);
      stage.appendChild(row);
      // dom.columnWidths(row);
    });
  }

  /**
   * Load columns to row
   * @param  {Object} row
   */
  loadColumns(row) {
    let columns = formData.rows.get(row.id).columns;
    columns.forEach(columnID => {
      let column = this.addColumn(row.id, columnID);
      this.loadFields(column);
    });
  }

  /**
   * Load a columns fields
   * @param  {Object} column column config object
   */
  loadFields(column) {
    let fields = formData.columns.get(column.id).fields;
    fields.forEach(fieldID => this.addField(column.id, fieldID));
    this.fieldOrderClass(column);
  }

  /**
   * Create or add a field and column then return it.
   * @param  {Object} evt Drag event data
   * @return {Object}     column
   */
  createColumn(evt) {
    let fType = evt.from.fType;
    let field = fType === 'columns' ? evt.item : new Field(evt.item.id);
    let column = new Column();

    field.classList.add('first-field');
    column.appendChild(field);
    formData.columns.get(column.id).fields.push(field.id);
    return column;
  }

  /**
   * [addRow description]
   * @param {[type]} evt [description]
   * @return {Object} row
   */
// addRow(evt) {
//   let _this = this;
// let column = evt.from.fType === 'rows' ? evt.item : _this.createColumn(evt);
//   let row = new Row();

//   // Set parent IDs
//   formData.columns.get(column.id).parent = row.id;
//   formData.rows[row.id].parent = _this.activeStage.id;

//   row.appendChild(column);
//   data.saveColumnOrder(row);

//   return row;
// }

  /**
   * Renders currently loaded formData to the renderTarget
   * @param {Object} renderTarget
   */
  renderForm(renderTarget) {
    this.empty(renderTarget);
    let renderData = data.js;
    let renderCount = document.getElementsByClassName('formeo-rendered').length;
    let content = Object.values(renderData.stages).map(stageData => {
      let {rows, ...stage} = stageData;
      rows = rows.map(rowID => {
        let {columns, ...row} = renderData.rows[rowID];
        let cols = columns.map(columnID => {
          let col = renderData.columns[columnID];
          let fields = col.fields.map(fieldID => renderData.fields[fieldID]);
          col.tag = 'div';
          col.content = fields;
          return col;
        });
        row.tag = 'div';
        row.content = [cols];
        let rowData = clone(row);
        if (row.config.inputGroup) {
          let removeButton = {
            tag: 'button',
            className: 'remove-input-group',
            content: dom.icon('remove'),
            action: {
              click: e => {
                let cIGroup = e.target.parentElement;
                let iGWrap = cIGroup.parentElement;
                let iG = iGWrap.getElementsByClassName('f-input-group');
                if (iG.length > 1) {
                  dom.remove(cIGroup);
                } else {
                  console.log('Need at least 1 group');
                }
              }
            }
          };
          rowData.content.unshift(removeButton);
          let inputGroupWrap = {
            tag: 'div',
            id: uuid(),
            className: 'f-input-group-wrap'
          };
          // const inputGroupClass = (row => {
            if (rowData.attrs.className) {
              if (typeof rowData.attrs.className === 'string') {
                rowData.attrs.className += ' f-input-group';
              } else {
                rowData.attrs.className.push('f-input-group');
              }
            }
          // })(row);
          let addButton = {
            tag: 'button',
            className: 'add-input-group',
            content: 'Add +',
            action: {
              click: e => {
                // inputGroupClass
                // rowData.content.unshift(removeButton);
                let fInputGroup = e.target.parentElement;
                let newRow = dom.create(rowData);
                fInputGroup.insertBefore(newRow, fInputGroup.lastChild);
              }
            }
          };


          row.content.unshift(removeButton);
          inputGroupWrap.content = [rowData, addButton];
          row = inputGroupWrap;
        }
        return row;
      });
      stage.tag = 'div';
      stage.content = rows;
      stage.className = 'rendered-stage container';
      return stage;
    });

    let config = {
      tag: 'div',
      id: `formeo-rendered-${renderCount}`,
      className: 'formeo-rendered',
      content
    };

    renderTarget.appendChild(this.create(config));
  }

  /**
   * Clears the editor
   * @param  {Object} evt
   */
  clearForm(evt) {
    this.stages.forEach(this.clearStage);
  }

  /**
   * Removes all fields and resets a stage
   * @param  {[type]} stage DOM element
   */
  clearStage(stage) {
    stage.classList.add('removing-all-fields');

    const resetStage = () => {
      // Empty the data register for stage
      // and everything below it.
      dom.empty(stage);
      stage.classList.remove('removing-all-fields');
      data.save();
      dom.emptyClass(stage);
      animate.slideDown(stage, 300);
    };

    // var markEmptyArray = [];

    // if (opts.prepend) {
    //   markEmptyArray.push(true);
    // }

    // if (opts.append) {
    //   markEmptyArray.push(true);
    // }

    // if (!markEmptyArray.some(elem => elem === true)) {
    // stage.classList.add('empty-stages');
    // }

    animate.slideUp(stage, 600, resetStage);
    // animate.slideUp(stage, 2000);
  }

  /**
   * Adds a row to the stage
   * @param {String} stageID
   * @param {String} rowID
   * @return {Object} DOM element
   */
  addRow(stageID, rowID) {
    let row = new Row(rowID);
    let stage = stageID ? this.stages.get(stageID) : this.activeStage;
    stage.appendChild(row);
    data.saveRowOrder(stage);
    this.emptyClass(stage);
    return row;
  }

  /**
   * Adds a Column to a row
   * @param {String} rowID
   * @param {String} columnID
   * @return {Object} DOM element
   */
  addColumn(rowID, columnID) {
    let column = new Column(columnID);
    let row = this.rows.get(rowID);
    this.columns.set(column.id, column);
    row.appendChild(column);
    data.saveColumnOrder(row);
    this.emptyClass(row);
    return column;
  }

  /**
   * [addField description]
   * @param {String} columnID
   * @param {String} fieldID
   * @return {Object} field
   */
  addField(columnID, fieldID) {
    let field = new Field(fieldID);
    this.fields.set(field.id, field);
    if (columnID) {
      let column = this.columns.get(columnID);
      column.appendChild(field);
      data.saveFieldOrder(column);
      this.emptyClass(column);
    }
    return field;
  }

  /**
   * Aplly empty class to element if does not have children
   * @param  {Object} elem
   */
  emptyClass(elem) {
    let type = elem.fType;
    if (type) {
      let childMap = new Map();
      childMap.set('rows', 'columns');
      childMap.set('columns', 'fields');
      childMap.set('stages', 'rows');
      let children = elem.getElementsByClassName(`stage-${childMap.get(type)}`);
      elem.classList.toggle(`empty-${type}`, !children.length);
    }
  }

}

const dom = new DOM();

export default dom;
