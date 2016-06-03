import { data, dataMap, registeredFields } from '../common/data';
import animate from '../common/animation';
import helpers from '../common/helpers';
import DOM from '../common/dom';
import Panels from './panels';

var dom = new DOM();

var i18n = {
  attributes: 'Attributes',
  attribute: 'Attribute',
  panelLabels: {
    attrs: 'Attrs',
    meta: 'Meta',
    config: 'Config',
    options: 'Options',
  },
  panelEditButtons: {
    attrs: '+ Attribute',
    options: '+ Option'
  },
  attrs: {
    type: 'Type',
    className: 'Class'
  },
  meta: {
    label: 'Label',
    group: 'Group',
    icon: 'Icon'
  },
  field: 'Field',
  options: 'Options',
  placeholders: {}
};

export default class Field {

  constructor(dataID) {
    let _this = this;

    _this.fieldData = dataMap.fields[dataID] || Object.assign({}, registeredFields[dataID]);
    _this.fieldID = _this.fieldData.id || helpers.uuid();
    _this.fieldData.id = _this.fieldID;

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
        _this.fieldPreview() // fieldPreview
      ],
      dataID: dataID,
      dataset: {
        hoverTag: i18n.field
      },
      fType: 'field',
      action: {
        // capture changes to the preview
        input: (evt) => {
          if (evt.target.fMap) {
            if (evt.target.contentEditable === 'true') {
              helpers.set(_this.fieldData, evt.target.fMap, evt.target.innerHTML);
            } else {
              helpers.set(_this.fieldData, evt.target.fMap, evt.target.value);
            }
          }
        }
      }
    };

    _this.elem = field = dom.create(field);

    dataMap.fields[field.id] = _this.fieldData;

    return field;
  }

  actionButtons() {
    let _this = this,
      fieldEditToggle = {
        tag: 'button',
        content: dom.icon('menu'),
        attrs: {
          className: 'field-edit-toggle btn btn-secondary'
        },
        action: {
          click: (evt) => {
            let field = document.getElementById(_this.fieldID),
              editWindow = field.querySelector('.field-edit');
            animate.slideToggle(editWindow, 333);
            animate.slideToggle(editWindow.nextSibling, 333);
            field.classList.toggle('editing');
          }
        }
      },
      fieldRemove = {
        tag: 'button',
        content: dom.icon('remove'),
        attrs: {
          className: 'field-remove btn btn-secondary'
        },
        action: {
          click: () => {
            let element = document.getElementById(this.fieldID);
            animate.slideUp(element, 333, (elem) => {
              _this.onRemove(elem);
            });
          }
        }
      },
      fieldActions = {
        tag: 'div',
        attrs: {
          className: 'group-actions field-actions'
        },
        content: [fieldEditToggle, fieldRemove]
      };

    return fieldActions;
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelType
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  editPanel(panelType, dataObj) {
    let _this = this,
      propType,
      makePanel,
      panel;

    if (dataObj[panelType]) {
      panel = {
          tag: 'ul',
          attrs: {
            className: [
              'field-edit-group',
              'field-edit-' + panelType
            ]
          },
          action: {
            input: (evt) => {
              if (evt.target.fMap) {
                helpers.set(_this.fieldData, evt.target.fMap, evt.target.value);
                console.log(_this.fieldData);
              }
            }
          },
          editGroup: panelType,
          isSortable: (panelType === 'options'),
          content: []
        },
        propType = dom.contentType(dataObj[panelType]),
        makePanel = (i, dataProp) => {
          dataProp = (typeof dataProp === 'string') ? dataProp : i;
          let inputs = {
              tag: 'div',
              className: ['prop-inputs'],
              content: _this.editPanelInputs(dataProp, dataObj[panelType][dataProp], panelType)
            },
            property = {
              tag: 'li',
              className: [`${panelType}-${dataProp}-wrap`, 'prop-wrap'],
              id: helpers.uuid(),
              content: []
            },
            order = {
              tag: 'span',
              className: 'btn btn-secondary prop-order prop-control',
              content: dom.icon('move-vertical')
            },
            remove = {
              tag: 'span',
              className: 'btn btn-secondary prop-remove prop-control',
              action: {
                click: (evt) => {
                  animate.slideUp(document.getElementById(property.id), 250, (elem) => {
                    dom.remove(elem);
                  });
                }
              },
              content: dom.icon('remove')
            },
            controls = {
              tag: 'div',
              className: 'prop-controls',
              content: [remove]
            };

          if (propType === 'array') {
            inputs.className.push('input-group-sm', 'input-group');
            controls.content.unshift(order);
          }

          property.content.push(controls, inputs);

          property.className.push('control-count-' + controls.content.length);

          panel.content.push(property);
        };

      let panelArray;
      if (propType === 'array') {
        panelArray = dataObj[panelType];
      } else {
        panelArray = Object.keys(dataObj[panelType]);
      }

      helpers.forEach(panelArray, makePanel);

    }
    return panel;
  }

  editPanelInputs(prop, propVal, panelType) {
    let _this = this,
      inputs = [],
      processProperty = (key, val) => {
        let propType = dom.contentType(val),
          propIsNum = (typeof prop === 'number'),
          typeAttrs = (key, val, type) => {
            let attrs = {
              string: {
                className: 'form-control form-control-sm',
                type: 'text',
                value: val,
                placeholder: i18n.placeholders[key] || helpers.capitalize(key)
              },
              boolean: {
                type: 'checkbox',
                value: val
              },
              number: {
                type: 'number',
                value: val
              }
            };
            return attrs[type];
          },
          propertyInputs = {
            string: (key, val) => {
              let fMap = panelType + '.' + key;

              let input = {
                tag: 'input',
                attrs: typeAttrs(key, val, 'string'),
                fMap: propIsNum ? `${panelType}[${prop}].${key}` : fMap
              };

              if (i18n[panelType] && !propIsNum) {
                input.config = {
                  label: i18n[panelType][key] || helpers.capitalize(key)
                };
              }

              return input;
            },
            boolean: (key, val) => {
              let input = {
                tag: 'input',
                attrs: typeAttrs(key, val, 'boolean')
              };

              if (i18n[panelType] && !propIsNum) {
                input.config = {
                  label: i18n[panelType][key] || helpers.capitalize(key)
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
              let labels = Object.keys(objVal); // todo make table with thead labels

              for (var objProp in objVal) {
                if (objVal.hasOwnProperty(objProp)) {
                  inputs.push(processProperty(objProp, objVal[objProp]));
                }
              }

              // console.log(inputs);

              return inputs;
            }
          };

        propertyInputs.number = propertyInputs.string;

        // console.log(propType, key, val);

        return propertyInputs[propType](key, val);
      };

    inputs.push(processProperty(prop, propVal));

    return inputs;
  }

  panelEditButtons(type) {
    let addAttr = {
        tag: 'button',
        content: i18n.panelEditButtons[type],
        actions: {
          click: () => {

          }
        }
      },
      panelEditButtons = {
        tag: 'div',
        attrs: {
          className: 'add-remove-attrs'
        },
        content: addAttr
      };

    return panelEditButtons;
  }

  fieldEdit() {
    let _this = this,
      panels = [],
      editable = ['object', 'array'],
      noPanels = ['config', 'meta'],
      allowedPanels = Object.keys(_this.fieldData).filter((elem) => {
        return !helpers.inArray(elem, noPanels);
      });

    let fieldEdit = {
      tag: 'div',
      className: ['field-edit', 'slide-toggle', 'panels-wrap']
    };

    helpers.forEach(allowedPanels, function(i, prop) {
      let propType = dom.contentType(_this.fieldData[prop]);
      if (helpers.inArray(propType, editable)) {
        let panel = {
          tag: 'div',
          attrs: {
            className: `panel ${prop}-panel`
          },
          config: {
            label: i18n.panelLabels[prop] || ''
          },
          content: [
            _this.editPanel(prop, _this.fieldData),
            _this.panelEditButtons(prop)
          ]
        };

        panels.push(panel);
      }
    });

    let panelsConfig = {
      panels: panels,
      id: _this.fieldID
    };

    if (panels.length) {
      fieldEdit.className.push('panel-count-' + panels.length);
      fieldEdit.content = new Panels(panelsConfig);
    }

    return fieldEdit;
  }

  fieldPreview() {
    let _this = this,
      fieldData = helpers.extend({}, _this.fieldData);

    fieldData.id = 'prev-' + _this.fieldID;

    return {
      tag: 'div',
      attrs: {
        className: 'field-preview'
      },
      content: dom.create(fieldData, true) // get the config for this field's preview
    };
  }

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

    dom.fieldOrder(column);
  }

}
