import { data, dataMap, registeredFields } from '../common/data';
import animate from '../common/animation';
import helpers from '../common/helpers';
import events from '../common/events';
import actions from '../common/actions';
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
  action: {
    add: {
      attrs: 'What attribute would you like to add?'
    }
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
    dataMap.fields[_this.fieldID] = _this.fieldData;
    _this.fieldData.id = _this.fieldID;
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
      dataID: dataID,
      dataset: {
        hoverTag: i18n.field
      },
      fType: 'field',
      action: {
        // capture changes to the preview
        input: (evt) => {
          console.log(evt);
          if (evt.target.fMap) {
            if (evt.target.contentEditable === 'true') {
              helpers.set(dataMap.fields[_this.fieldID], evt.target.fMap, evt.target.innerHTML);
            } else {
              helpers.set(dataMap.fields[_this.fieldID], evt.target.fMap, evt.target.value);
            }
            data.save('attrs', _this.fieldID);
            // throttle this for sure
            _this.updatePreview();
          }
        },
        change: (evt) => {
          console.log(evt);
          if (evt.target.fMap) {
            console.log('change');
          }
        }
      }
    };

    _this.elem = field = dom.create(field);

    return field;
  }

  updatePreview() {
    let _this = this,
      newPreview = dom.create(dataMap.fields[_this.fieldID], true);
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
    let _this = this,
      propType,
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
          // action: {
          //   input: (evt) => {
          //     if (evt.target.fMap) {
          //       helpers.set(_this.fieldData, evt.target.fMap, evt.target.value);
          //       console.log(_this.fieldData);
          //     }
          //   }
          // },
          editGroup: panelType,
          isSortable: (panelType === 'options'),
          content: []
        },
        propType = dom.contentType(dataObj[panelType]);

      let panelArray;
      if (propType === 'array') {
        panelArray = dataObj[panelType];
      } else {
        panelArray = Object.keys(dataObj[panelType]);
      }

      panel.content = helpers.map(panelArray, (i) => {
        let args = {
          i,
          dataProp: panelArray[i],
          dataObj,
          panelType,
          propType
        };
        return _this.panelContent(args);
      });

    }
    return panel;
  }

  panelContent(args) {
    let _this = this,
      dataProp = (typeof args.dataProp === 'string') ? args.dataProp : args.i,
      id = helpers.uuid(),
      inputs = {
        tag: 'div',
        className: ['prop-inputs'],
        content: _this.editPanelInputs(dataProp, args.dataObj[args.panelType][dataProp], args.panelType, id)
      },
      property = {
        tag: 'li',
        className: [`${args.panelType}-${dataProp}-wrap`, 'prop-wrap'],
        id: id,
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
              let field = document.getElementById(_this.fieldID),
                editGroup = field.querySelector('.field-edit-group'),
                panel = editGroup.parentElement;
              dom.remove(elem);
              panel.parentElement.style.height = dom.getStyle(panel, 'height');
              delete dataMap.fields[_this.fieldID][args.panelType][dataProp];
              data.save('attrs', _this.fieldID);
              dom.empty(_this.preview);
              let newPreview = dom.create(dataMap.fields[_this.fieldID], true);
              _this.preview.appendChild(newPreview);
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

    if (args.propType === 'array') {
      inputs.className.push('input-group-sm', 'input-group');
      controls.content.unshift(order);
    }

    property.content.push(controls, inputs);

    property.className.push('control-count-' + controls.content.length);

    return property;
  }

  editPanelInputs(prop, propVal, panelType, id) {
    let _this = this,
      inputs = [],
      processProperty = (key, val) => {
        let propType = dom.contentType(val),
          propIsNum = (typeof prop === 'number'),
          fMap = propIsNum ? `${panelType}[${prop}].${key}` : panelType + '.' + key,
          typeAttrs = (key, val, type) => {
            let attrs = {
              string: {
                className: 'form-control form-control-sm',
                type: 'text',
                value: val,
                placeholder: i18n.placeholders[key] || helpers.capitalize(key)
              },
              'boolean': {
                type: 'checkbox',
                value: val.toString()
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

              let input = {
                tag: 'input',
                attrs: typeAttrs(key, val, 'string'),
                fMap: fMap,
                id: prop + '-' + id
              };

              if (!propIsNum) {
                input.config = {
                  label: i18n[panelType][key] || helpers.capitalize(key)
                };
              }

              return input;
            },
            'boolean': (key, val) => {
              let input = {
                tag: 'input',
                attrs: typeAttrs(key, val, 'boolean'),
                fMap: fMap,
                id: prop + '-' + id
              };

              if (val) {
                input.attrs.checked = val;
              }

              if (!propIsNum) {
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

              return inputs;
            }
          };

        propertyInputs.number = propertyInputs.string;


        return propertyInputs[propType](key, val);
      };

    inputs.push(processProperty(prop, propVal));

    return inputs;
  }

  panelEditButtons(type) {
    let _this = this,
      addBtn = {
        tag: 'button',
        content: i18n.panelEditButtons[type],
        action: {
          click: (evt) => {
            let buttonPosition = evt.target.getBoundingClientRect(),
              bodyRect = document.body.getBoundingClientRect(),
              coords = {
                pageX: buttonPosition.left + (buttonPosition.width / 2),
                pageY: (buttonPosition.top - bodyRect.top) - 12
              };

            let addAttrEvt = {
              addAttributeMessage: i18n.action.add[type],
              addAttributeValMessage: i18n.action.add[type],
              addAttributeAction: (attr, val) => {
                let field = document.getElementById(_this.fieldID),
                  editGroup = field.querySelector('.field-edit-group'),
                  panel = editGroup.parentElement,
                  safeAttr = helpers.hyphenCase(attr);

                i18n[type][safeAttr] = helpers.capitalize(attr);

                try {
                  dataMap.fields[_this.fieldID][type][safeAttr] = window.JSON.parse(val);
                } catch (e) {
                  dataMap.fields[_this.fieldID][type][safeAttr] = val;
                }

                let args = {
                  dataObj: dataMap.fields[_this.fieldID],
                  dataProp: safeAttr,
                  i: Object.keys(dataMap.fields[_this.fieldID][type]).length,
                  panelType: type,
                  propType: dom.contentType(val)
                };

                editGroup.appendChild(dom.create(_this.panelContent(args)));
                panel.parentElement.style.height = dom.getStyle(panel, 'height');

              },
              btnCoords: coords
            };

            let customEvt = new CustomEvent('onAdd' + helpers.capitalize(type), {
              detail: addAttrEvt
            });

            // Run Action Hook
            actions.add[type](addAttrEvt);

            // Fire Event
            document.dispatchEvent(customEvt);

            // Save Fields Attrs
            data.save('attrs', _this.fieldID);
            dom.empty(_this.preview);
            let newPreview = dom.create(dataMap.fields[_this.fieldID], true);
            _this.preview.appendChild(newPreview);
          }
        }
      },
      panelEditButtons = {
        tag: 'div',
        attrs: {
          className: 'add-remove-attrs'
        },
        content: addBtn
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
      fieldData = helpers.extend({}, dataMap.fields[_this.fieldID]);
    // fieldData = helpers.extend({}, _this.fieldData);

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
