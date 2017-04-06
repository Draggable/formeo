import i18n from 'mi18n';
import {data, formData, registeredFields as rFields} from '../common/data';
import animate from '../common/animation';
import h from '../common/helpers';
import actions from '../common/actions';
import dom from '../common/dom';
import Panels from './panels';
import {uuid, clone, cleanObj} from '../common/utils';

/**
 * Element/Field class.
 */
export default class Field {

  /**
   * Set defaults and load fieldData
   * @param  {String} dataID existing field ID
   * @return {Object} field object
   */
  constructor(dataID) {
    let _this = this;

    let fieldData = formData.fields.get(dataID) || clone(rFields[dataID]);
    _this.fieldID = fieldData.id || uuid();
    _this.metaID = fieldData.meta.id;
    fieldData.id = _this.fieldID;

    formData.fields.set(_this.fieldID, fieldData);
    this.fieldData = fieldData;

    let field = {
      tag: 'li',
      attrs: {
        className: `stage-fields field-type-${fieldData.meta.id}`
      },
      id: _this.fieldID,
      content: [
        dom.actionButtons(_this.fieldID, 'field'), // fieldEdit window
        _this.fieldEdit(), // fieldEdit window
      ],
      panelNav: _this.panelNav,
      dataset: {
        hoverTag: i18n.get('field')
      },
      fType: 'fields',
      action: {
        mouseenter: evt => {
          let field = document.getElementById(_this.fieldID);
          field.classList.add('hovering-field');
        },
        mouseleave: evt => {
          let field = document.getElementById(_this.fieldID);
          field.classList.remove('hovering-field');
        }
      }
    };

    field = dom.create(field);

    dom.fields.set(_this.fieldID, {
      field,
      instance: _this
    });

    _this.preview = dom.create(_this.fieldPreview());
    field.appendChild(_this.preview);

    return field;
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview() {
    let _this = this;
    let fieldData = h.copyObj(formData.fields.get(_this.fieldID));
    let newPreview = dom.create(fieldData, true);
    dom.empty(_this.preview);
    _this.preview.appendChild(newPreview);

    return newPreview;
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelType
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  editPanel(panelType) {
    let _this = this;
    let fieldData = formData.fields.get(_this.fieldID);
    let propType;
    let panel;
    let panelWrap = {
      tag: 'div',
      className: 'f-panel-wrap',
      content: []
    };

    if (fieldData[panelType]) {
      panel = {
        tag: 'ul',
        attrs: {
          className: [
            'field-edit-group',
            'field-edit-' + panelType
          ]
        },
        editGroup: panelType,
        isSortable: (panelType === 'options'),
        content: []
      };
      propType = dom.contentType(fieldData[panelType]);

      panelWrap.content.push(panel);

      let panelArray;
      if (propType === 'array') {
        // let props = Object.keys(fieldData[panelType][0]);
        // let panelLabels = {
        //   tag: 'div',
        //   className: 'input-group',
        //   content: props.map((elem) => {
        //     let label = {
        //       tag: 'label',
        //       className: ['prop-label-' + elem],
        //       content: h.capitalize(elem)
        //     };

        //     if (typeof fieldData[panelType][0][elem] === 'boolean') {
        //       label.tag = 'span';
        //       label.className.push('input-group-addon');
        //     }

        //     return label;
        //   })
        // };
        // let labelWrap = {
        //   tag: 'header',
        //   content: panelLabels,
        //   className: 'prop-labels'
        // };
        // removing labels until find a better way to handle them.
        // panelWrap.content.unshift(labelWrap);
        panelArray = fieldData[panelType];
      } else {
        panelArray = Object.keys(fieldData[panelType]);
      }

      h.forEach(panelArray, (dataProp, i) => {
        let args = {
          i,
          dataProp,
          fieldData,
          panelType,
          propType
        };
        panel.content.push(_this.panelContent(args));
      });
    }

    return panelWrap;
  }

  /**
   * Field panel contents, `attrs`, `options`, `config`
   * @param  {Object} args
   * @return {Object} DOM element
   */
  panelContent(args) {
    let _this = this;
    let {panelType, dataProp} = args;
    let fieldData = formData.fields.get(_this.fieldID);
    dataProp = (typeof dataProp === 'string') ? dataProp : args.i;
    let id = uuid();
    let propVal = fieldData[panelType][dataProp];
    let inputs = {
      tag: 'div',
      className: ['prop-inputs'],
      content: _this.editPanelInputs(dataProp, propVal, panelType, id)
    };
    let property = {
      tag: 'li',
      className: [`${panelType}-${dataProp}-wrap`, 'prop-wrap'],
      id: id,
      content: []
    };
    let order = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'prop-order prop-control',
      },
      content: dom.icon('move-vertical')
    };
    let remove = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'prop-remove prop-control',
      },
      action: {
        click: (evt) => {
          animate.slideUp(document.getElementById(property.id), 250, elem => {
            let parent = elem.parentElement;
            let fieldData = formData.fields.get(_this.fieldID);
            let fieldPanelData = fieldData[panelType];
            dom.remove(elem);
            if (Array.isArray(fieldPanelData)) {
              fieldPanelData.splice(dataProp, 1);
            } else {
              fieldPanelData[dataProp] = undefined;
            }
            data.save(panelType, parent);
            dom.empty(_this.preview);
            let newPreview = dom.create(fieldData, true);
            _this.preview.appendChild(newPreview);
            _this.resizePanelWrap();
          });
        }
      },
      content: dom.icon('remove')
    };
    let controls = {
      tag: 'div',
      className: 'prop-controls',
      content: [remove]
    };

    if (args.propType === 'array') {
      inputs.className.push('f-input-group');
      controls.content.unshift(order);
    }

    property.propData = fieldData[panelType][dataProp];

    // Checks if the property is allowed
    if (this.isAllowedAttr(dataProp)) {
      property.content.push(controls, inputs);
    }

    property.className.push('control-count-' + controls.content.length);

    return property;
  }

  /**
   * Generate the inputs for an edit panel
   * @param  {String} prop      property name
   * @param  {String|Array} propVal   property value
   * @param  {String} panelType attrs, options, config
   * @param  {String} id        [description]
   * @return {Array} element config array
   */
  editPanelInputs(prop, propVal, panelType, id) {
    let _this = this;
    let inputs = [];
    let fieldData = formData.fields.get(_this.fieldID);
    const isOption = (panelType === 'options');
    let processProperty = (key, val) => {
        let propType = dom.contentType(val);
        let propIsNum = (typeof prop === 'number');
        let fMap = panelType + '.' + key;

        if (propIsNum) {
          fMap = `${panelType}[${prop}].${key}`;
        }
        const typeAttrs = (key, val, type) => {
          let placeholder = i18n.get(`placeholder.${key}`) || h.capitalize(key);
          let attrs = {
            string: {
              type: 'text',
              value: val,
              placeholder
            },
            boolean: {
              get type() {
                let boolType = 'checkbox';
                if (_this.fieldData.attrs) {
                  let attrType = _this.fieldData.attrs.type;
                  if (attrType === 'radio' && key === 'selected') {
                    boolType = 'radio';
                  }
                }
                return boolType;
              },
              value: val
            },
            number: {
              type: 'number',
              value: val
            },
            array: {
              className: '',
            }
          };
          return attrs[type];
        };
        const inputLabel = key => {
            let labelKey = panelType + '.' + key;
            return i18n.get(labelKey) || h.capitalize(key);
          };
        const propertyInputs = {
          array: (key, val) => {
            let select = {
              fMap,
              tag: 'select',
              id: `${prop}-${id}`,
              attrs: typeAttrs(key, val, 'array'),
              config: {
                label: inputLabel(key),
                hideLabel: isOption
              },
              content: val.map(v => {
                return {
                  tag: 'option',
                  attrs: {
                    value: v.value,
                    selected: v.selected
                  },
                  content: v.label
                };
              }),
              action: {
                change: evt => {
                  let values = [];
                  let propData = fieldData[panelType][prop];
                  let optionData = isOption ? propData[key] : propData;
                  let newValue = optionData.map(value => {
                    //eslint-disable-next-line
                    let {selected, ...option} = value;
                    values.push(option.value);
                    return option;
                  });

                  let index = values.indexOf(evt.target.value);
                  newValue[index].selected = true;
                  h.set(fieldData, fMap, newValue);
                  data.save();
                  _this.updatePreview();
                }
              },
            };
            return select;
          },
          string: (key, val) => {
            let input = {
              fMap,
              tag: 'input',
              id: `${prop}-${id}`,
              attrs: typeAttrs(key, val, 'string'),
              action: {
                change: evt => {
                  h.set(fieldData, fMap, evt.target.value);
                  _this.updatePreview();
                  data.save();
                }
              },
            };

            if (!propIsNum) {
              input.config = {
                label: inputLabel(key)
              };
            }

            return input;
          },
          boolean: (key, val) => {
            let input = {
              tag: 'input',
              attrs: typeAttrs(key, val, 'boolean'),
              fMap,
              id: prop + '-' + id,
              name: _this.fieldID + '-selected',
              action: {
                change: evt => {
                  h.set(fieldData, fMap, evt.target.checked);
                  _this.updatePreview();
                }
              }
            };

            if (val) {
              input.attrs.checked = val;
            }

            if (propIsNum) {
              let addon = {
                tag: 'span',
                className: 'f-addon',
                content: dom.checkbox(input)
              };
              input = addon;
            } else {
              input.config = {
                label: inputLabel(key)
              };
            }


            return input;
          },
          object: (objKey, objVal) => {
            let inputs = [];

            for (let objProp in objVal) {
              if (objVal.hasOwnProperty(objProp)) {
                inputs.push(processProperty(objProp, objVal[objProp]));
              }
            }

            return inputs;
          }
        };

        propertyInputs.number = propertyInputs.string;

        return propertyInputs[propType](key, val);
      };

    inputs.push(processProperty(prop, propVal));

    return inputs;
  }


  /**
   * Checks if attribute is allowed to be edited
   * @param  {String}  attr
   * @return {Boolean}      [description]
   */
  isAllowedAttr(attr = 'type') {
    let _this = this;
    let allowed = true;
    let disabledAttrs = rFields[_this.metaID].config.disabledAttrs;
    if (disabledAttrs) {
      allowed = !h.inArray(attr, disabledAttrs);
    }

    return allowed;
  }

  /**
   * Add a new attribute to the attrs panels
   * @param {String} attr
   * @param {String|Array} val
   */
  addAttribute(attr, val) {
    if (!this.isAllowedAttr(attr)) {
      window.alert(`Attribute "${attr}": not permitted`);
    }

    let _this = this;
    let field = document.getElementById(_this.fieldID);
    let editGroup = field.querySelector('.field-edit-attrs');
    let safeAttr = h.hyphenCase(attr);
    let fieldData = formData.fields.get(_this.fieldID);
    const labelKey = `attrs.${safeAttr}`;

    if (!i18n.current[labelKey]) {
      i18n.put(labelKey, h.capitalize(attr));
    }

    if (typeof val === 'string' && h.inArray(val, ['true', 'false'])) {
      val = JSON.parse(val);
    }

    fieldData.attrs[safeAttr] = val;

    let args = {
      dataObj: fieldData,
      dataProp: safeAttr,
      i: Object.keys(fieldData.attrs).length,
      panelType: 'attrs'
    };

    let existingAttr = editGroup.querySelector(`.attrs-${safeAttr}-wrap`);
    let newAttr = dom.create(_this.panelContent(args));
    if (existingAttr) {
      editGroup.replaceChild(newAttr, existingAttr);
    } else {
      editGroup.appendChild(newAttr);
    }

    data.save(args.panelType, editGroup);
    _this.updatePreview();
    _this.resizePanelWrap();
  }

  /**
   * Add option to options panel
   */
  addOption() {
    let _this = this;
    let field = dom.fields.get(_this.fieldID).field;
    let fieldData = formData.fields.get(_this.fieldID);
    let optionData = fieldData['options'];
    let editGroup = field.querySelector('.field-edit-options');
    let propData = cleanObj(optionData[optionData.length-1]);
    fieldData.options.push(propData);

    let args = {
      i: editGroup.childNodes.length,
      dataProp: propData,
      dataObj: fieldData,
      panelType: 'options',
      propType: 'array'
    };

    editGroup.appendChild(dom.create(_this.panelContent(args)));
    _this.resizePanelWrap();

    // Save Fields Attrs
    data.save();
    dom.empty(_this.preview);
    let newPreview = dom.create(formData.fields.get(_this.fieldID), true);
    _this.preview.appendChild(newPreview);
  }

  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @param  {String} type
   * @return {Object} panel edit buttons config
   */
  panelEditButtons(type) {
    let _this = this;
    let addBtn = {
        tag: 'button',
        attrs: {
          type: 'button',
          className: `add-${type}`
        },
        content: i18n.get(`panelEditButtons.${type}`),
        action: {
          click: (evt) => {
            let addEvt = {
              btnCoords: dom.coords(evt.target)
            };

            if (type === 'attrs') {
              addEvt.addAction = _this.addAttribute.bind(_this);
              addEvt.message = {
                attr: i18n.get('action.add.attrs.attr'),
                value: i18n.get('action.add.attrs.value')
              };
            } else if (type === 'options') {
              addEvt.addAction = _this.addOption.bind(_this);
            }

            let eventType = h.capitalize(type);
            let customEvt = new CustomEvent(`onAdd${eventType}`, {
              detail: addEvt
            });

            // Run Action Hook
            actions.add[type](addEvt);

            // Fire Event
            document.dispatchEvent(customEvt);
          }
        }
      };
    let panelEditButtons = {
        tag: 'div',
        attrs: {
          className: 'panel-action-buttons'
        },
        content: [addBtn]
      };

    return panelEditButtons;
  }

  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  fieldEdit() {
    let _this = this;
    let panels = [];
    let editable = ['object', 'array'];
    let noPanels = ['config', 'meta', 'action'];
    let fieldData = formData.fields.get(_this.fieldID);
    let allowedPanels = Object.keys(fieldData).filter(elem => {
        return !h.inArray(elem, noPanels);
      });

    let fieldEdit = {
      tag: 'div',
      className: ['field-edit', 'slide-toggle', 'panels-wrap']
    };

    h.forEach(allowedPanels, (panelType, i) => {
      let propType = dom.contentType(fieldData[panelType]);
      if (h.inArray(propType, editable)) {
        let panel = {
          tag: 'div',
          attrs: {
            className: `f-panel ${panelType}-panel`
          },
          config: {
            label: i18n.get(`panelLabels.${panelType}`) || ''
          },
          content: [
            _this.editPanel(panelType),
            _this.panelEditButtons(panelType)
          ],
          action: {
            // change: evt => {
            // let fieldData = formData.fields.get(_this.fieldID);
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
            //     data.save(panelType, _this.fieldID);
            //     // throttle this for sure
            //     _this.updatePreview();
            //   }
            // }
          }
        };

        panels.push(panel);
      }
    });

    let panelsConfig = {
      panels,
      id: _this.fieldID
    };

    if (panels.length) {
      let editPanels = _this.panels = new Panels(panelsConfig);
      fieldEdit.className.push('panel-count-' + panels.length);
      fieldEdit.content = editPanels.content;
      _this.panelNav = editPanels.nav;
      _this.resizePanelWrap = editPanels.actions.resize;
    } else {
      setTimeout(() => {
        let field = dom.fields.get(_this.fieldID).field;
        let editToggle = field.querySelector('.item-edit-toggle');
        let fieldActions = field.querySelector('.field-actions');
        let actionButtons = fieldActions.getElementsByTagName('button');
        fieldActions.style.maxWidth = `${actionButtons.length * 24}px`;
        dom.remove(editToggle);
      }, 0);
    }

    return fieldEdit;
  }

  /**
   * Generate field preview config
   * @return {Object} fieldPreview
   */
  fieldPreview() {
    let _this = this;
    let fieldData = clone(formData.fields.get(_this.fieldID));
    const field = dom.fields.get(_this.fieldID).field;
    const togglePreviewEdit = evt => {
      const column = field.parentElement;
      if (evt.target.contentEditable === 'true') {
        if (h.inArray(evt.type, ['focus', 'blur'])) {
          let isActive = document.activeElement === evt.target;
          column.classList.toggle('editing-field-preview', isActive);
          dom.toggleSortable(field.parentElement, (evt.type === 'focus'));
        } else if(h.inArray(evt.type, ['mousedown', 'mouseup'])) {
          dom.toggleSortable(field.parentElement, (evt.type === 'mousedown'));
        }
      }
    };

    fieldData.id = 'prev-' + _this.fieldID;

    let fieldPreview = {
      tag: 'div',
      attrs: {
        className: 'field-preview'
      },
      content: dom.create(fieldData, true),
      action: {
        focus: togglePreviewEdit,
        blur: togglePreviewEdit,
        mousedown: togglePreviewEdit,
        mouseup: togglePreviewEdit,
        change: evt => {
          let {target} = evt;
          if (target.fMap) {
            let fieldData = formData.fields.get(_this.fieldID);
            let {checked, type, fMap} = target;
            if (h.inArray(type, ['checkbox', 'radio'])) {
              let options = fieldData.options;

              // uncheck options if radio
              if (type === 'radio') {
                options.forEach(option => option.selected = false);
              }
              h.set(fieldData, fMap, checked);

              data.save();
            }
          }
        },
        click: evt => {
          if (evt.target.contentEditable === 'true') {
            evt.preventDefault();
          }
        },
        input: evt => {
          let fieldData = formData.fields.get(_this.fieldID);
          let prop = 'content';
          if (evt.target.fMap) {
            prop = evt.target.fMap;
          }
          if (evt.target.contentEditable === 'true') {
            h.set(fieldData, prop, evt.target.innerHTML);
          } else {
            h.set(fieldData, prop, evt.target.value);
          }
          data.save('field', _this.fieldID);
        }
      }
    };

    return fieldPreview;
  }

}
