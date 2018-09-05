import h from './helpers';
import events from './events';
import Row from '../components/row';
import Column from '../components/column';
import Field from '../components/field';
import animate from './animation';
import {data, formData} from './data';
import {uuid, clone, numToPercent, remove, closestFtype} from './utils';

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
    this.styleSheet = (() => {
      const style = document.createElement('style');
      style.setAttribute('media', 'screen');
      style.setAttribute('type', 'text/css');
      style.appendChild(document.createTextNode(''));
      document.head.appendChild(style);
      return style.sheet;
    })();
  }

  /**
   * Merges a user's configuration with default
   * @param  {Object} userConfig
   * @return {Object} config
   */
  set setConfig(userConfig) {
    const _this = this;
    const icon = _this.icon;
    let btnTemplate = {
        tag: 'button',
        content: [],
        attrs: {
          className: ['btn'],
          type: 'button'
        }
      };

    let handle = h.merge(Object.assign({}, btnTemplate), {
      content: [icon('move'), icon('handle')],
      attrs: {
        className: ['item-handle'],
      },
      meta: {
        id: 'handle'
      }
    });

    let edit = h.merge(Object.assign({}, btnTemplate), {
      content: icon('edit'),
      attrs: {
        className: ['item-edit-toggle'],
      },
      meta: {
        id: 'edit'
      },
      action: {
        click: evt => {
          const element = closestFtype(evt.target);
          let {fType} = element;
          fType = fType.replace(/s$/, '');
          let editClass = 'editing-' + fType;
          let editWindow = element.querySelector(`.${fType}-edit`);
          animate.slideToggle(editWindow, 333);
          if (fType === 'field') {
            animate.slideToggle(editWindow.nextSibling, 333);
            element.parentElement.classList.toggle('column-' + editClass);
          }
          element.classList.toggle(editClass);
        }
      }
    });

    let remove = h.merge(Object.assign({}, btnTemplate), {
      content: icon('remove'),
      attrs: {
        className: ['item-remove'],
      },
      meta: {
        id: 'remove'
      },
      action: {
        click: (evt, id) => {
          const element = closestFtype(evt.target);
          animate.slideUp(element, 250, elem => {
            _this.removeEmpty(elem);
          });
        }
      }
    });

    let cloneItem = h.merge(Object.assign({}, btnTemplate), {
      content: icon('copy'),
      attrs: {
        className: ['item-clone'],
      },
      meta: {
        id: 'clone'
      },
      action: {
        click: evt => {
          _this.clone(closestFtype(evt.target));
          data.save();
        }
      }
    });

    let defaultConfig = {
        rows: {
          actionButtons: {
            buttons: [
              clone(handle),
              edit,
              cloneItem,
              remove
            ],
            order: [],
            disabled: []
          }
        },
        columns: {
          actionButtons: {
            buttons: [
              clone(cloneItem),
              clone(handle),
              remove
            ],
            order: [],
            disabled: []
          }
        },
        fields: {
          actionButtons: {
            buttons: [
              handle,
              edit,
              cloneItem,
              remove
            ],
            order: [],
            disabled: []
          }
        }
      };

    defaultConfig.rows.actionButtons.buttons[0].content = [
      icon('move-vertical'),
      icon('handle')
    ];
    defaultConfig.columns.actionButtons.buttons[0].content = [
      icon('copy'),
      icon('handle'),
    ];

    let mergedConfig = h.merge(defaultConfig, userConfig);

    Object.keys(mergedConfig).forEach(key => {
      if (mergedConfig[key].actionButtons) {
        const aButtons = mergedConfig[key].actionButtons;
        const disabled = aButtons.disabled;
        let buttons = aButtons.buttons;

        // Order buttons
        aButtons.buttons = h.orderObjectsBy(buttons, aButtons.order, 'meta.id');
        // filter disabled buttons
        aButtons.buttons = aButtons.buttons.filter(button => {
          let metaId = h.get(button, 'meta.id');
          return !h.inArray(metaId, disabled);
        });
      }
    });

    // overrides language set dir
    if (mergedConfig.dir) {
      this.dir = mergedConfig.dir;
    }

    this.config = mergedConfig;

    return this.config;
  }

  /**
   * Ensure elements have proper tagName
   * @param  {Object|String} elem
   * @return {Object} valid element object
   */
  processTagName(elem) {
    let tagName;
    if (typeof elem === 'string') {
      tagName = elem;
      elem = {tag: tagName};
    }
    if (elem.attrs) {
      let tag = elem.attrs.tag;
      if (tag) {
        let selectedTag = tag.filter(t => (t.selected === true));
        if (selectedTag.length) {
          tagName = selectedTag[0].value;
        }
      }
    }

    elem.tag = tagName || elem.tag;

    return elem;
  }

  /**
   * Creates DOM elements
   * @param  {Object}  elem      element config object
   * @param  {Boolean} isPreview generating element for preview or render?
   * @return {Object}            DOM Object
   */
  create(elem, isPreview = false) {
    elem = this.processTagName(elem);
    let _this = this;
    let contentType;
    let {tag} = elem;
    let processed = [];
    let i;
    let wrap = {
      tag: 'div',
      attrs: {},
      className: [h.get(elem, 'config.inputWrap') || 'f-field-group'],
      content: [],
      config: {}
    };
    let requiredMark = {
      tag: 'span',
      className: 'text-error',
      content: '*'
    };
    let element = document.createElement(tag);
    let required = h.get(elem, 'attrs.required');

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
      undefined: () => null
    };

    processed.push('tag');


    // check for root className property
    if (elem.className) {
      let {className} = elem;
      elem.attrs = Object.assign({}, elem.attrs, {className});
      delete elem.className;
    }

    // Append Element Content
    if (elem.options) {
      let {options} = elem;
      options = this.processOptions(options, elem, isPreview);
      if (this.holdsContent(element) && tag !== 'button') {
        // mainly used for <select> tag
        appendContent.array.call(this, options);
        delete elem.content;
      } else {
        h.forEach(options, option => {
          wrap.content.push(_this.create(option, isPreview));
        });

        if (elem.attrs.className) {
          wrap.className = elem.attrs.className;
        }

        wrap.config = Object.assign({}, elem.config);
        wrap.className.push = h.get(elem, 'attrs.className');


        if (required) {
          wrap.attrs.required = required;
        }

        return this.create(wrap, isPreview);
      }

      processed.push('options');
    }

    // Set element attributes
    if (elem.attrs) {
      _this.processAttrs(elem, element, isPreview);
      processed.push('attrs');
    }

    if (elem.config) {
      let editablePreview = (elem.config.editable && isPreview);
      if (elem.config.label && tag !== 'button') {
        let label;

        if (isPreview) {
          label = _this.label(elem, 'config.label');
        } else {
          label = _this.label(elem);
        }

        if (!elem.config.hideLabel) {
          if (_this.labelAfter(elem)) {
            // add check for inline checkbox
            wrap.className = `f-${elem.attrs.type}`;

            label.insertBefore(element, label.firstChild);
            wrap.content.push(label);
            if (required) {
              wrap.content.push(requiredMark);
            }
          } else {
            wrap.content.push(label);
            if (required) {
              wrap.content.push(requiredMark);
            }
            wrap.content.push(element);
          }
        } else if (editablePreview) {
          element.contentEditable = true;
        }
      } else if (editablePreview) {
        element.contentEditable = true;
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
        let action = elem.action[event];
        if (typeof action === 'string') {
          action = eval(`(${elem.action[event]})`);
        }
        let useCaptureEvts = [
          'focus',
          'blur'
        ];

        // dirty hack to handle onRender callback
        if (event === 'onRender') {
          setTimeout(() => {
            action(element);
          }, 10);
        } else {
          let useCapture = h.inArray(event, useCaptureEvts);
          element.addEventListener(event, action, useCapture);
        }
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
    delete attrs.tag;

    if (!isPreview) {
      if (!attrs.name && this.isInput(elem.tag)) {
        element.setAttribute('name', uuid(elem));
      }
    }

    // Set element attributes
    Object.keys(attrs).forEach(attr => {
      let name = h.safeAttrName(attr);
      let value = attrs[attr] || '';

      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          let selected = value.filter(t => (t.selected === true));
          value = selected.length ? selected[0].value : value[0].value;
        } else {
          value = value.join(' ');
        }
      }

      if (value) {
        element.setAttribute(name, value);
      }
    });
  }

  /**
   * Generate a fancy checkbox or radio
   * @param  {Object}  elem
   * @param  {Boolean} isPreview
   * @return {Object} checkable
   */
  checkbox(elem, isPreview) {
    let label = h.get(elem, 'elem.config.label') || '';
    let checkable = {
      tag: 'span',
      className: 'checkable',
      content: label
    };
    let optionLabel = {
      tag: 'label',
      attrs: {},
      content: [elem, checkable]
    };

    // if (isPreview) {
    //   input.fMap = `options[${i}].selected`;
    //   optionLabel.attrs.contenteditable = true;
    //   optionLabel.fMap = `options[${i}].label`;
    //   checkable.content = undefined;
    //   let checkableLabel = {
    //     tag: 'label',
    //     content: [input, checkable]
    //   };
    //   inputWrap.content.unshift(checkableLabel);
    //   // inputWrap.content.unshift(input);
    // } else {
    //   input.attrs.name = elem.id;
    //   optionLabel.content = checkable;
    //   optionLabel = dom.create(optionLabel);
    //   input = dom.create(input);
    //   optionLabel.insertBefore(input, optionLabel.firstChild);
    //   inputWrap.content = optionLabel;
    // }

    return optionLabel;
  }

  /**
   * Extend Array of option config objects
   * @param  {Array} options
   * @param  {Object} elem element config object
   * @param  {Boolean} isPreview
   * @return {Array} option config objects
   */
  processOptions(options, elem, isPreview) {
    let {action, attrs} = elem;
    let fieldType = attrs.type || elem.tag;
    let id = attrs.id || elem.id;

    let optionMap = (option, i) => {
      const defaultInput = () => {
        let input = {
          tag: 'input',
          attrs: {
            id: id,
            type: fieldType,
            value: option.value || ''
          },
          action
        };
        let checkable = {
          tag: 'span',
          className: 'checkable',
          content: option.label
        };
        let optionLabel = {
          tag: 'label',
          attrs: {},
          config: {
            inputWrap: 'form-check'
          },
          content: [option.label]
        };
        let inputWrap = {
          tag: 'div',
          content: [optionLabel],
          className: [`f-${fieldType}`]
        };

        if (elem.attrs.className) {
          elem.config.inputWrap = elem.attrs.className;
        }

        if (elem.config.inline) {
          inputWrap.className.push('f-${fieldType}-inline');
        }

        if (option.selected) {
          input.attrs.checked = true;
        }

        if (isPreview) {
          input.fMap = `options[${i}].selected`;
          optionLabel.attrs.contenteditable = true;
          optionLabel.fMap = `options[${i}].label`;
          checkable.content = undefined;
          let checkableLabel = {
            tag: 'label',
            content: [input, checkable]
          };
          inputWrap.content.unshift(checkableLabel);
          // inputWrap.content.unshift(input);
        } else {
          input.attrs.name = id;
          optionLabel.content = checkable;
          optionLabel = dom.create(optionLabel);
          input = dom.create(input);
          optionLabel.insertBefore(input, optionLabel.firstChild);
          inputWrap.content = optionLabel;
        }

        return inputWrap;
      };

      let optionMarkup = {
        select: () => {
          return {
            tag: 'option',
            attrs: option,
            content: option.label
          };
        },
        button: option => {
          let {type, label, className, id} = option;
          return Object.assign({}, elem, {
            attrs: {
              type
            },
            className,
            id: id || uuid(),
            options: undefined,
            content: label,
            action: elem.action
          });
        },
        checkbox: defaultInput,
        radio: defaultInput
      };

      return optionMarkup[fieldType](option);
    };

    const mappedOptions = options.map(optionMap);

    return mappedOptions;
  }

  /**
   * Checks if there is a closing tag, if so it can hold content
   * @param  {Object} element DOM element
   * @return {Boolean} holdsContent
   */
  holdsContent(element) {
    return (element.outerHTML.indexOf('/') !== -1);
  }

  /**
   * Is this a textarea, select or other block input
   * also isContentEditable
   * @param  {Object}  element
   * @return {Boolean}
   */
  isBlockInput(element) {
    return (!this.isInput(element) && this.holdsContent(element));
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
   * Test if label should be display before or after an element
   * @param  {Object} elem config
   * @return {Boolean} labelAfter
   */
  labelAfter(elem) {
    let type = h.get(elem, 'attrs.type');
    let isCB = (type === 'checkbox' || type === 'radio');
    return isCB || h.get(elem, 'config.labelAfter');
  }

  /**
   * Generate a label
   * @param  {Object} elem config object
   * @param  {String} fMap map to label's value in formData
   * @return {Object}      config object
   */
  label(elem, fMap) {
    let fieldLabel;

    if (typeof elem.config.label === 'string') {
      fieldLabel = {
        tag: 'label',
        attrs: {},
        className: [],
        action: {},
        config: {},
        content: elem.config.label
      };
    } else {
      fieldLabel = elem.config.label;
    }

    if (this.labelAfter(elem)) {
      let checkable = {
        tag: 'span',
        className: 'checkable',
        content: elem.config.label
      };
      fieldLabel.content = checkable;
    }

    if (elem.id) {
      fieldLabel.attrs.for = elem.id;
    }

    if(typeof fieldLabel.config.editable !== 'undefined') {
      fieldLabel.attrs.contenteditable = fieldLabel.config.editable;
    }else if (fMap) {
      // for attribute will prevent label focus
      delete fieldLabel.attrs.for;
      fieldLabel.attrs.contenteditable = true;
      fieldLabel.fMap = fMap;
    }

    return dom.create(fieldLabel);
  }

  /**
   * Determine content type
   * @param  {Node | String | Array | Object} content
   * @return {String}
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
    let tag = (item === 'column' ? 'li' : 'div');
    let btnWrap = {
        tag: 'div',
        className: 'action-btn-wrap'
      };
    let actions = {
      tag,
      className: item + '-actions group-actions',
      action: {
        mouseenter: evt => {
          let element = document.getElementById(id);
          element.classList.add('hovering-' + item);
          evt.target.parentReference = element;
        },
        mouseleave: evt => {
          evt.target.parentReference.classList.remove('hovering-' + item);
        },
        onRender: elem => {
          const buttons = elem.getElementsByTagName('button');
          let btnWidth = parseInt(_this.getStyle(buttons[0], 'width')) + 1;
          const expandedWidth = (buttons.length * btnWidth) + 'px';
          const woh = item === 'row' ? 'height' : 'width';
          let rules = [
            [
              `.hovering-${item} .${item}-actions`,
              [woh, expandedWidth, true]
            ]
          ];

          _this.insertRule(rules);
        }
      }
    };

    btnWrap.content = this.config[`${item}s`].actionButtons.buttons;
    actions.content = btnWrap;

    return actions;
  }

  /**
   * Clones an element, it's data and
   * it's nested elements and data
   * @param {Object} elem element we are cloning
   * @param {Object} parent
   * @return {Object} cloned element
   */
  clone(elem, parent) {
    let _this = this;
    let {id, fType} = elem;
    let dataClone = clone(formData[fType].get(id));
    const newIndex = h.indexOfNode(elem) + 1;
    let noParent = false;
    dataClone.id = uuid();
    formData[fType].set(dataClone.id, dataClone);
    if (!parent) {
      parent = elem.parentElement;
      noParent = true;
    }
    const cloneType = {
      rows: () => {
        dataClone.columns = [];
        const stage = _this.activeStage;
        const newRow = _this.addRow(null, dataClone.id);
        const columns = elem.getElementsByClassName('stage-columns');

        stage.insertBefore(newRow, stage.childNodes[newIndex]);
        h.forEach(columns, column => _this.clone(column, newRow));
        data.saveRowOrder();
        return newRow;
      },
      columns: () => {
        dataClone.fields = [];
        const newColumn = _this.addColumn(parent.id, dataClone.id);
        parent.insertBefore(newColumn, parent.childNodes[newIndex]);
        let fields = elem.getElementsByClassName('stage-fields');

        if (noParent) {
          dom.columnWidths(parent);
        }
        h.forEach(fields, field => _this.clone(field, newColumn));
        return newColumn;
      },
      fields: () => {
        const newField = _this.addField(parent.id, dataClone.id);
        parent.insertBefore(newField, parent.childNodes[newIndex]);
        return newField;
      },
    };

    return cloneType[fType]();
  }

  /**
   * Remove elements without f children
   * @param  {Object} element DOM element
   * @return {Object} formData
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
        return _this.removeEmpty(parent);
      } else {
        this.emptyClass(parent);
      }
    }
    if (type === 'columns') {
      _this.columnWidths(parent);
    }
    return data.save();
  }

  /**
   * Removes element from DOM and data
   * @param  {Object} elem
   * @return  {Object} parent element
   */
  remove(elem) {
    let {fType, id} = elem;
    if (fType) {
      let parent = elem.parentElement;
      let pData = formData[parent.fType].get(parent.id);
      data.empty(fType, id);
      this[fType].delete(id);
      formData[fType].delete(id);
      remove(pData[fType], id);
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
    h.forEach(nodeList, removeClass[_this.contentType(className)]);
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
    h.forEach(nodeList, addClass[_this.contentType(className)]);
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
   */
  columnWidths(row) {
    let _this = this;
    let fields = [];
    let columns = row.getElementsByClassName('stage-columns');
    if (!columns.length) {
      return;
    }
      let width = parseFloat((100 / columns.length).toFixed(1))/1;
    let bsGridRegEx = /\bcol-\w+-\d+/g;

    _this.removeClasses(columns, bsGridRegEx);

    h.forEach(columns, column => {
      let columnData = formData.columns.get(column.id);
      fields.push(...columnData.fields);

      let colWidth = numToPercent(width);

      column.style.width = colWidth;
      column.style.float = 'left';
      columnData.config.width = colWidth;
      column.dataset.colWidth = colWidth;
      document.dispatchEvent(events.columnResized);
    });

    setTimeout(() => {
      fields.forEach(fieldID => {
        let field = dom.fields.get(fieldID);
        if (field.instance.panels) {
          field.instance.panels.nav.refresh();
        }
      });
    }, 250);

    dom.updateColumnPreset(row);
  }

  /**
   * Wrap content in a formGroup
   * @param  {Object|Array|String} content
   * @param  {String} className
   * @return {Object} formGroup config
   */
  formGroup(content, className = '') {
    return {
      tag: 'div',
      className: ['f-field-group', className],
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
    let rowData = formData.rows.get(rowID);
    let layoutPreset = {
        tag: 'select',
        attrs: {
          ariaLabel: 'Define a column layout',
          className: 'column-preset'
        },
        action: {
          change: e => {
            let dRow = this.rows.get(rowID);
            _this.setColumnWidths(dRow.row, e.target.value);
            data.save();
          }
        }
      };
    let pMap = new Map();
    let custom = {value: 'custom', label: 'Custom'};

    pMap.set(1, [{value: '100.0', label: '100%'}]);
    pMap.set(2, [
      {value: '50.0,50.0', label: '50 | 50'},
      {value: '33.3,66.6', label: '33 | 66'},
      {value: '66.6,33.3', label: '66 | 33'},
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
      if (pMapVal) {
        pMapVal.forEach((val, i) => {
          let options = layoutPreset.options;
          if (val.value === curVal) {
            options[i].selected = true;
          } else {
            delete options[i].selected;
            options[options.length-1].selected = true;
          }
        });
      }
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
    h.forEach(columns, (column, i) => {
      let percentWidth = widths[i] + '%';
      column.dataset.colWidth = percentWidth;
      column.style.width = percentWidth;
      formData.columns.get(column.id).config.width = percentWidth;
    });
  }

  /**
   * Updates the column preset <select>
   * @param  {String} row
   * @return {Object} columnPresetConfig
   */
  updateColumnPreset(row) {
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
   * [processColumnConfig description]
   * @param  {[type]} columnData [description]
   * @return {[type]}         [description]
   */
  processColumnConfig(columnData) {
    if (columnData.className) {
      columnData.className.push('f-render-column');
    }
    let colWidth = columnData.config.width || '100%';
    columnData.style = `width: ${colWidth}`;
    return columnData;
  }

  /**
   * Renders currently loaded formData to the renderTarget
   * @param {Object} renderTarget
   */
  renderForm(renderTarget) {
    this.empty(renderTarget);
    let renderData = data.prepData;
    let renderCount = document.getElementsByClassName('formeo-render').length;
    let content = Object.values(renderData.stages).map(stageData => {
      let {rows, ...stage} = stageData;
      rows = rows.map(rowID => {
        let {columns, ...row} = renderData.rows[rowID];
        let cols = columns.map(columnID => {
          let col = this.processColumnConfig(renderData.columns[columnID]);
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
              mouseover: e => {
                e.target.parentElement.classList.add('will-remove');
              },
              mouseleave: e => {
                e.target.parentElement.classList.remove('will-remove');
              },
              click: e => {
                let currentInputGroup = e.target.parentElement;
                let iGWrap = currentInputGroup.parentElement;
                let iG = iGWrap.getElementsByClassName('f-input-group');
                if (iG.length > 1) {
                  dom.remove(currentInputGroup);
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
            if (rowData.attrs.className) {
              if (typeof rowData.attrs.className === 'string') {
                rowData.attrs.className += ' f-input-group';
              } else {
                rowData.attrs.className.push('f-input-group');
              }
            }
          let addButton = {
            tag: 'button',
            attrs: {
              className: 'add-input-group btn pull-right',
              type: 'button'
            },
            content: 'Add +',
            action: {
              click: e => {
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
      stage.className = 'f-stage';
      return stage;
    });

    let config = {
      tag: 'div',
      id: `formeo-rendered-${renderCount}`,
      className: 'formeo-render formeo',
      content
    };

    renderTarget.appendChild(this.create(config));
  }

  /**
   * Clears the editor
   * @param  {Object} evt
   */
  clearForm(evt) {
    this.stages.forEach(dStage => this.clearStage(dStage.stage));
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
    let stage = stageID ? this.stages.get(stageID).stage : this.activeStage;
    stage.appendChild(row);
    data.saveRowOrder(stage);
    this.emptyClass(stage);
    events.formeoUpdated = new CustomEvent('formeoUpdated', {
      data: {
        updateType: 'added',
        changed: 'row',
        oldValue: undefined,
        newValue: formData.rows.get(row.id)
      }
    });
    document.dispatchEvent(events.formeoUpdated);
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
    let row = this.rows.get(rowID).row;
    row.appendChild(column);
    data.saveColumnOrder(row);
    this.emptyClass(row);
    events.formeoUpdated = new CustomEvent('formeoUpdated', {
      data: {
        updateType: 'added',
        changed: 'column',
        oldValue: undefined,
        newValue: formData.columns.get(column.id)
      }
    });
    document.dispatchEvent(events.formeoUpdated);
    return column;
  }

  /**
   * Toggles a sortables `disabled` option.
   * @param  {Object} elem DOM element
   * @param  {Boolean} state
   */
  toggleSortable(elem, state) {
    let {fType} = elem;
    if (!fType) {
      return;
    }
    let pFtype = elem.parentElement.fType;
    const sortable = dom[fType].get(elem.id).sortable;
    if (state === undefined) {
      state = !sortable.option('disabled');
    }
    sortable.option('disabled', state);
    if (pFtype && h.inArray(pFtype, ['rows', 'columns', 'stages'])) {
      this.toggleSortable(elem.parentElement, state);
    }
  }

  /**
   * Adds a field to a column
   * @param {String} columnID
   * @param {String} fieldID
   * @return {Object} field
   */
  addField(columnID, fieldID) {
    let field = new Field(fieldID);
    if (columnID) {
      let column = this.columns.get(columnID).column;
      column.appendChild(field);
      data.saveFieldOrder(column);
      this.emptyClass(column);
    }
    events.formeoUpdated = new CustomEvent('formeoUpdated', {
      data: {
        updateType: 'add',
        changed: 'field',
        oldValue: undefined,
        newValue: formData.fields.get(field.id)
      }
    });
    document.dispatchEvent(events.formeoUpdated);
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

  /**
   * Shorthand expander for dom.create
   * @param  {String} tag
   * @param  {Object} attrs
   * @param  {Object|Array|String} content
   * @return {Object} DOM node
   */
  h(tag, attrs, content) {
    return this.create({tag, attrs, content});
  }

  /**
   * Style Object
   * @param  {Object} rules
   * @return {Number} index of added rule
   */
  insertRule(rules) {
    const styleSheet = this.styleSheet;
    let rulesLength = styleSheet.cssRules.length;
    for (let i = 0, rl = rules.length; i < rl; i++) {
      let j = 1;
      let rule = rules[i];
      let selector = rules[i][0];
      let propStr = '';
      // If the second argument of a rule is an array
      // of arrays, correct our variables.
      if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
        rule = rule[1];
        j = 0;
      }

      for (let pl = rule.length; j < pl; j++) {
        let prop = rule[j];
        let important = (prop[2] ? ' !important' : '');
        propStr += `${prop[0]}:${prop[1]}${important};`;
      }

      // Insert CSS Rule
      return styleSheet.insertRule(`${selector} { ${propStr} }`, rulesLength);
    }
  }

}

const dom = new DOM();

export default dom;
