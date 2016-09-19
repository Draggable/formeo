import i18n from 'mi18n';
import { data, dataMap, registeredFields } from '../common/data';
import animate from '../common/animation';
import helpers from '../common/helpers';
import actions from '../common/actions';
import DOM from '../common/dom';
import Panels from './panels';

var dom = new DOM();

export default class Field {

  constructor(dataID) {
    let _this = this,
      fieldData = dataMap.fields[dataID] || helpers.copyObj(registeredFields[dataID]);

    _this.fieldID = fieldData.id || helpers.uuid();
    fieldData.id = _this.fieldID;

    dataMap.fields[_this.fieldID] = fieldData;

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
      panel,
      panelWrap = {
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
        },
        propType = dom.contentType(dataObj[panelType]);

      panelWrap.content.push(panel);

      let panelArray;
      if (propType === 'array') {
        let props = Object.keys(dataObj[panelType][0]),
          panelLabels = {
            tag: 'div',
            className: 'input-group',
            content: props.map((elem) => {
              let label = {
                tag: 'label',
                className: ['prop-label-' + elem],
                content: helpers.capitalize(elem)
              };

              if (typeof dataObj[panelType][0][elem] === 'boolean') {
                label.tag = 'span';
                label.className.push('input-group-addon');
              }

              return label;
            })
          },
          labelWrap = {
            tag: 'header',
            content: panelLabels,
            className: 'prop-labels'
          };
        //removing labels until find a better way to handle them.
        // panelWrap.content.unshift(labelWrap);
        panelArray = dataObj[panelType];
      } else {
        panelArray = Object.keys(dataObj[panelType]);
      }

      helpers.forEach(panelArray, (i) => {
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
              if (Array.isArray(dataMap.fields[_this.fieldID][args.panelType])) {
                dataMap.fields[_this.fieldID][args.panelType].splice(dataProp, 1);
              } else {
                dataMap.fields[_this.fieldID][args.panelType][dataProp] = undefined;
              }
              data.save(args.panelType, _this.fieldID);
              panel.parentElement.style.height = dom.getStyle(panel, 'height');
              dom.empty(_this.preview);
              let newPreview = dom.create(dataMap.fields[_this.fieldID], true);
              _this.preview.appendChild(newPreview);
              _this.resizePanelWrap();
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

    property.propData = args.dataObj[args.panelType][dataProp];
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
            let boolType = 'checkbox';
            if (dataMap.fields[_this.fieldID].attrs.type === 'radio' && key === 'selected') {
              boolType = 'radio';
            }
            let attrs = {
              string: {
                className: 'form-control form-control-sm',
                type: 'text',
                value: val,
                placeholder: i18n.get('placeholder.' + key) || helpers.capitalize(key)
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
          },
          inputLabel = (key) => {
            let label,
              labelKey = panelType + '.' + key;
            if (i18n.langs[i18n.current][labelKey]) {
              label = i18n.get(labelKey);
            } else {
              label = helpers.capitalize(key);
            }
            return label;
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
                  label: inputLabel(key)
                };
              }

              return input;
            },
            'boolean': (key, val) => {
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

  addAttribute(attr, val) {
    let _this = this,
      field = document.getElementById(_this.fieldID),
      editGroup = field.querySelector('.field-edit-attrs'),
      safeAttr = helpers.hyphenCase(attr);

    i18n.put('attrs' + safeAttr, helpers.capitalize(attr));

    try {
      dataMap.fields[_this.fieldID].attrs[safeAttr] = window.JSON.parse(val);
    } catch (e) {
      dataMap.fields[_this.fieldID].attrs[safeAttr] = val;
    }

    let args = {
      dataObj: dataMap.fields[_this.fieldID],
      dataProp: safeAttr,
      i: Object.keys(dataMap.fields[_this.fieldID].attrs).length,
      panelType: 'attrs',
      propType: dom.contentType(val)
    };

    editGroup.appendChild(dom.create(_this.panelContent(args)));
    _this.resizePanelWrap();
  }

  addOption() {
    let _this = this,
      field = document.getElementById(_this.fieldID),
      dataObj = dataMap.fields[_this.fieldID],
      editGroup = field.querySelector('.field-edit-options'),
      propData = { label: '', value: '', selected: false };
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
  }

  panelEditButtons(type) {
    let _this = this,
      addBtn = {
        tag: 'button',
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

            let customEvt = new CustomEvent('onAdd' + helpers.capitalize(type), {
              detail: addEvt
            });

            // Run Action Hook
            actions.add[type](addEvt);

            // Fire Event
            document.dispatchEvent(customEvt);

            // Save Fields Attrs
            data.save(type, _this.fieldID);
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
      fieldData = dataMap.fields[_this.fieldID],
      allowedPanels = Object.keys(fieldData).filter((elem) => {
        return !helpers.inArray(elem, noPanels);
      });

    let fieldEdit = {
      tag: 'div',
      className: ['field-edit', 'slide-toggle', 'panels-wrap']
    };

    helpers.forEach(allowedPanels, function(i, prop) {
      let propType = dom.contentType(fieldData[prop]);
      if (helpers.inArray(propType, editable)) {
        let panel = {
          tag: 'div',
          attrs: {
            className: `f-panel ${prop}-panel`
          },
          config: {
            label: i18n.get('panelLabels.' + prop) || ''
          },
          content: [
            _this.editPanel(prop, fieldData),
            _this.panelEditButtons(prop)
          ],
          action: {
            change: (evt) => {
              if (evt.target.fMap) {
                let value = evt.target.value;
                if (evt.target.type === 'checkbox' || evt.target.type === 'radio') {
                  value = evt.target.checked;

                  // if this is radio we need to manually uncheck options in data model
                  if (evt.target.type === 'radio') {
                    helpers.forEach(dataMap.fields[_this.fieldID].options, (i, option) => {
                      option.selected = false;
                    });
                  }
                }

                helpers.set(dataMap.fields[_this.fieldID], evt.target.fMap, value);
                data.save(prop, _this.fieldID);
                // throttle this for sure
                _this.updatePreview();
              }
            }
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

  fieldPreview() {
    let _this = this,
      fieldData = helpers.clone(dataMap.fields[_this.fieldID]);

    fieldData.id = 'prev-' + _this.fieldID;

    let fieldPreview = {
      tag: 'div',
      attrs: {
        className: 'field-preview'
      },
      content: dom.create(fieldData, true), // get the config for this field's preview
      action: {
        input: (evt) => {
          if (evt.target.fMap) {
            if (evt.target.contentEditable === 'true') {
              helpers.set(dataMap.fields[_this.fieldID], evt.target.fMap, evt.target.innerHTML);
            } else {
              helpers.set(dataMap.fields[_this.fieldID], evt.target.fMap, evt.target.value);
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
