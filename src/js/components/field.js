import i18n from 'mi18n';
import {data, formData, registeredFields as rFields} from '../common/data';
import animate from '../common/animation';
import h from '../common/helpers';
import actions from '../common/actions';
import dom from '../common/dom';
import Panels from './panels';

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

    let fieldData = formData.fields[dataID] || h.copyObj(rFields[dataID]);

    _this.fieldID = fieldData.id || h.uuid();
    fieldData.id = _this.fieldID;

    formData.fields[_this.fieldID] = fieldData;

    _this.preview = dom.create(_this.fieldPreview());

    let field = {
      tag: 'li',
      attrs: {
        className: 'stage-field'
      },
      id: _this.fieldID,
      content: [
        dom.actionButtons(_this.fieldID, 'field'), // fieldEdit window
        // _this.actionButtons(), // fieldEdit window
        _this.fieldEdit(), // fieldEdit window
        _this.preview // fieldPreview
      ],
      panelNav: _this.panelNav,
      dataID: dataID,
      dataset: {
        hoverTag: i18n.get('field')
      },
      fType: 'field'
    };

    _this.elem = field = dom.create(field);
    dom.fields[_this.fieldID] = field;

    return field;
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview() {
    let _this = this;
    let newPreview = dom.create(formData.fields[_this.fieldID], true);
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
  editPanel(panelType, dataObj) {
    let _this = this;
    let propType;
    let panel;
    let panelWrap = {
      tag: 'div',
      className: 'f-panel-wrap',
      content: []
    };

    if (dataObj[panelType]) {
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
      propType = dom.contentType(dataObj[panelType]);

      panelWrap.content.push(panel);

      let panelArray;
      if (propType === 'array') {
        // let props = Object.keys(dataObj[panelType][0]);
        // let panelLabels = {
        //   tag: 'div',
        //   className: 'input-group',
        //   content: props.map((elem) => {
        //     let label = {
        //       tag: 'label',
        //       className: ['prop-label-' + elem],
        //       content: h.capitalize(elem)
        //     };

        //     if (typeof dataObj[panelType][0][elem] === 'boolean') {
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
        panelArray = dataObj[panelType];
      } else {
        panelArray = Object.keys(dataObj[panelType]);
      }

      h.forEach(panelArray, (i) => {
        let args = {
          i,
          dataProp: panelArray[i],
          dataObj,
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
   * @param  {Object} args [description]
   * @return {Object} DOM element
   */
  panelContent(args) {
    let _this = this;
    let dataProp = (typeof args.dataProp === 'string') ? args.dataProp : args.i;
    let id = h.uuid();
    let propVal = args.dataObj[args.panelType][dataProp];
    let inputs = {
      tag: 'div',
      className: ['prop-inputs'],
      content: _this.editPanelInputs(dataProp, propVal, args.panelType, id)
    };
    let property = {
      tag: 'li',
      className: [`${args.panelType}-${dataProp}-wrap`, 'prop-wrap'],
      id: id,
      content: []
    };
    let order = {
      tag: 'span',
      className: 'btn btn-secondary prop-order prop-control',
      content: dom.icon('move-vertical')
    };
    let remove = {
      tag: 'span',
      className: 'btn btn-secondary prop-remove prop-control',
      action: {
        click: (evt) => {
          animate.slideUp(document.getElementById(property.id), 250, elem => {
            let fieldPanel = formData.fields[_this.fieldID][args.panelType];
            dom.remove(elem);
            if (Array.isArray(fieldPanel)) {
              fieldPanel.splice(dataProp, 1);
            } else {
              fieldPanel[dataProp] = undefined;
            }
            data.save(args.panelType, _this.fieldID);
            dom.empty(_this.preview);
            let newPreview = dom.create(formData.fields[_this.fieldID], true);
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
      inputs.className.push('input-group-sm', 'input-group');
      controls.content.unshift(order);
    }

    property.propData = args.dataObj[args.panelType][dataProp];
    property.content.push(controls, inputs);

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
    let processProperty = (key, val) => {
        let propType = dom.contentType(val);
        let propIsNum = (typeof prop === 'number');
        let fMap = panelType + '.' + key;

        if (propIsNum) {
          fMap = `${panelType}[${prop}].${key}`;
        }
        const typeAttrs = (key, val, type) => {
          let boolType = 'checkbox';
          let attrType = formData.fields[_this.fieldID].attrs.type;
          if (attrType === 'radio' && key === 'selected') {
            boolType = 'radio';
          }
          let placeholder = i18n.get(`placeholder.${key}`) || h.capitalize(key);
          let attrs = {
            string: {
              className: 'form-control form-control-sm',
              type: 'text',
              value: val,
              placeholder
            },
            'boolean': {
              type: boolType,
              value: val
            },
            number: {
              type: 'number',
              value: val
            }
          };
          return attrs[type];
        };
        const inputLabel = key => {
            let labelKey = panelType + '.' + key;
            return i18n.current[labelKey] || h.capitalize(key);
          };
        const propertyInputs = {
            string: (key, val) => {
              let input = {
                fMap,
                tag: 'input',
                id: `${prop}-${id}`,
                attrs: typeAttrs(key, val, 'string'),
                action: {
                  input: evt => {
                    // eslint-disable-next-line
                    formData.fields[_this.fieldID][panelType][prop][key] = evt.target.value;
                    // evt.target.propData
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
                fMap: fMap,
                id: prop + '-' + id,
                name: _this.fieldID + '-selected'
              };

              if (val) {
                input.attrs.checked = val;
              }

              if (!propIsNum) {
                input.config = {
                  label: inputLabel(key)
                };
              }

              if (propIsNum) {
                input = {
                  tag: 'span',
                  className: 'input-group-addon',
                  content: input
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

    console.log(inputs);

    return inputs;
  }

  /**
   * Add a new attribute to the attrs panels
   * @param {String} attr
   * @param {String|Array} val
   */
  addAttribute(attr, val) {
    let _this = this;
    let field = document.getElementById(_this.fieldID);
    let editGroup = field.querySelector('.field-edit-attrs');
    let safeAttr = h.hyphenCase(attr);

    i18n.put('attrs' + safeAttr, h.capitalize(attr));

    try {
      formData.fields[_this.fieldID].attrs[safeAttr] = window.JSON.parse(val);
    } catch (e) {
      formData.fields[_this.fieldID].attrs[safeAttr] = val;
    }

    let args = {
      dataObj: formData.fields[_this.fieldID],
      dataProp: safeAttr,
      i: Object.keys(formData.fields[_this.fieldID].attrs).length,
      panelType: 'attrs',
      propType: dom.contentType(val)
    };

    editGroup.appendChild(dom.create(_this.panelContent(args)));
    _this.resizePanelWrap();
  }

  /**
   * Add option to options panel
   */
  addOption() {
    let _this = this;
    let field = dom.fields[_this.fieldID];
    let dataObj = formData.fields[_this.fieldID];
    let editGroup = field.querySelector('.field-edit-options');
    let propData = {label: '', value: '', selected: false};
    dataObj.options.push(propData);

    let args = {
      i: editGroup.childNodes.length,
      dataProp: propData,
      dataObj,
      panelType: 'options',
      propType: 'array'
    };

    editGroup.appendChild(dom.create(_this.panelContent(args)));
    _this.resizePanelWrap();
    // Save Fields Attrs
    data.save('options', editGroup);
    dom.empty(_this.preview);
    let newPreview = dom.create(formData.fields[_this.fieldID], true);
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
          type: 'button'
        },
        content: i18n.get('panelEditButtons.' + type),
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
          className: 'add-remove-attrs'
        },
        content: addBtn
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
    let noPanels = ['config', 'meta'];
    let fieldData = formData.fields[_this.fieldID];
    let allowedPanels = Object.keys(fieldData).filter((elem) => {
        return !h.inArray(elem, noPanels);
      });

    let fieldEdit = {
      tag: 'div',
      className: ['field-edit', 'slide-toggle', 'panels-wrap']
    };

    h.forEach(allowedPanels, function(i, prop) {
      let propType = dom.contentType(fieldData[prop]);
      if (h.inArray(propType, editable)) {
        let panel = {
          tag: 'div',
          attrs: {
            className: `f-panel ${prop}-panel`
          },
          config: {
            label: i18n.get(`panelLabels.${prop}`) || ''
          },
          content: [
            _this.editPanel(prop, fieldData),
            _this.panelEditButtons(prop)
          ],
          action: {
            // change: evt => {
            //   if (evt.target.fMap) {
            //     let value = evt.target.value;
            //     let targetType = evt.target.type;
            //     if (targetType === 'checkbox' || targetType === 'radio') {
            //       let options = formData.fields[_this.fieldID].options;
            //       value = evt.target.checked;

            //       // uncheck options if radio
            //       if (evt.target.type === 'radio') {
            //         options.forEach(option => option.selected = false);
            //       }
            //     }

        //     h.set(formData.fields[_this.fieldID], evt.target.fMap, value);
            //     data.save(prop, _this.fieldID);
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
      panels: panels,
      id: _this.fieldID,
      updatePreview: _this.updatePreview.bind(_this)
    };

    if (panels.length) {
      let editPanels = new Panels(panelsConfig);
      fieldEdit.className.push('panel-count-' + panels.length);
      fieldEdit.content = editPanels.content;
      _this.panelNav = editPanels.nav;
      _this.resizePanelWrap = editPanels.actions.resize;
    }

    return fieldEdit;
  }

  /**
   * Generate field preview config
   * @return {Object} fieldPreview
   */
  fieldPreview() {
    let _this = this;
    let fieldData = h.clone(formData.fields[_this.fieldID]);

    fieldData.id = 'prev-' + _this.fieldID;

    let fieldPreview = {
      tag: 'div',
      attrs: {
        className: 'field-preview'
      },
      content: dom.create(fieldData, true),
      action: {
        input: evt => {
          let fieldData = formData.fields[_this.fieldID];
          if (evt.target.fMap) {
            if (evt.target.contentEditable === 'true') {
              h.set(fieldData, evt.target.fMap, evt.target.innerHTML);
            } else {
              h.set(fieldData, evt.target.fMap, evt.target.value);
            }
            data.save('field', _this.fieldID);
          }
        },
        change: (evt) => {
          if (evt.target.fMap) {
            console.log(evt.target.fMap);
          }
        }
      }
    };

    return fieldPreview;
  }

  /**
   * Actions to take when a field is removed
   * @param  {Object} field DOM element
   */
  onRemove(field) {
    let column = field.parentElement;
    dom.remove(field);
    let fields = column.querySelectorAll('.stage-field');

    if (!fields.length) {
      let row = column.parentElement;
      dom.remove(column);
      let columns = row.querySelectorAll('.stage-column');
      if (!columns.length) {
        dom.remove(row);
      } else {
        dom.columnWidths(row);
      }
    }

    dom.fieldOrderClass(column);
  }

}
