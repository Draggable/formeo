import i18n from 'mi18n'
import { data, formData, registeredFields as rFields } from '../common/data'
import animate from '../common/animation'
import h from '../common/helpers'
import actions from '../common/actions'
import dom from '../common/dom'
import Panels from './panels'
import { uuid, clone, cleanObj } from '../common/utils'

/**
 * Element/Field class.
 */
export default class Field {
  /**
   * Set defaults and load fieldData
   * @param  {String} fieldId existing field ID
   * @return {Object} field object
   */
  constructor(fieldId) {
    const fieldData = h.getIn(formData, ['fields', fieldId]) || clone(rFields[fieldId])
    this.fieldId = fieldData.id || uuid()
    this.metaID = fieldData.meta.id
    fieldData.id = this.fieldId

    formData.get('fields').set(this.fieldId, fieldData)
    // this.fieldData = fieldData

    let field = {
      tag: 'li',
      attrs: {
        className: `stage-fields field-type-${fieldData.meta.id}`,
      },
      id: this.fieldId,
      content: [
        dom.actionButtons(this.fieldId, 'field'), // fieldEdit window
        this.fieldEdit(), // fieldEdit window
      ],
      panelNav: this.panelNav,
      dataset: {
        hoverTag: i18n.get('field'),
      },
      fType: 'fields',
      action: {
        mouseenter: evt => {
          const field = document.getElementById(this.fieldId)
          field.classList.add('hovering-field')
        },
        mouseleave: evt => {
          const field = document.getElementById(this.fieldId)
          field.classList.remove('hovering-field')
        },
      },
    }

    field = dom.create(field)

    dom.fields.set(this.fieldId, {
      field,
      instance: this,
    })

    this.preview = dom.create(this.fieldPreview())
    field.appendChild(this.preview)

    return field
  }

  get fieldData() {
    return h.getIn(formData, ['fields', this.fieldId])
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview() {
    const _this = this
    const fieldData = h.copyObj(this.fieldData)
    const newPreview = dom.create(fieldData, true)
    dom.empty(_this.preview)
    _this.preview.appendChild(newPreview)

    return newPreview
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelType
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  editPanel(panelType) {
    const _this = this
    const fieldData = this.fieldData
    const panelWrap = {
      tag: 'div',
      className: 'f-panel-wrap',
      content: [],
    }
    let propType
    let panel

    if (fieldData[panelType]) {
      panel = {
        tag: 'ul',
        attrs: {
          className: ['field-edit-group', 'field-edit-' + panelType],
        },
        editGroup: panelType,
        isSortable: panelType === 'options',
        content: [],
      }
      propType = dom.contentType(fieldData[panelType])

      panelWrap.content.push(panel)

      let panelArray
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
        panelArray = fieldData[panelType]
      } else {
        panelArray = Object.keys(fieldData[panelType])
      }

      h.forEach(panelArray, (dataProp, i) => {
        const args = {
          i,
          dataProp,
          fieldData,
          panelType,
          propType,
        }
        panel.content.push(_this.panelContent(args))
      })
    }

    return panelWrap
  }

  /**
   * Field panel contents, `attrs`, `options`, `config`
   * @param  {Object} args
   * @return {Object} DOM element
   */
  panelContent(args) {
    const _this = this
    const { panelType, dataProp } = args
    const fieldData = this.fieldData
    const propKey = typeof dataProp === 'string' ? dataProp : args.i
    const id = uuid()
    const propVal = fieldData[panelType][propKey]
    const inputs = {
      tag: 'div',
      className: ['prop-inputs'],
      content: _this.editPanelInputs(propKey, propVal, panelType, id),
    }
    const property = {
      tag: 'li',
      className: [`${panelType}-${propKey}-wrap`, 'prop-wrap'],
      id: id,
      content: [],
    }
    const order = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'prop-order prop-control',
      },
      content: dom.icon('move-vertical'),
    }
    const remove = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: 'prop-remove prop-control',
      },
      action: {
        click: evt => {
          animate.slideUp(document.getElementById(property.id), 250, elem => {
            const parent = elem.parentElement
            const fieldData = formData.fields.get(_this.fieldId)
            const fieldPanelData = fieldData[panelType]
            dom.remove(elem)
            if (Array.isArray(fieldPanelData)) {
              fieldPanelData.splice(propKey, 1)
            } else {
              fieldPanelData[propKey] = undefined
            }
            data.save(panelType, parent)
            dom.empty(_this.preview)
            const newPreview = dom.create(fieldData, true)
            _this.preview.appendChild(newPreview)
            _this.resizePanelWrap()
          })
        },
      },
      content: dom.icon('remove'),
    }
    const controls = {
      tag: 'div',
      className: 'prop-controls',
      content: [remove],
    }

    if (args.propType === 'array') {
      inputs.className.push('f-input-group')
      controls.content.unshift(order)
    }

    property.propData = fieldData[panelType][propKey]

    // Checks if the property is allowed
    if (this.isAllowedAttr(propKey)) {
      property.content.push(controls, inputs)
    }

    property.className.push('control-count-' + controls.content.length)

    return property
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
    const _this = this
    const inputs = []
    const fieldData = this.fieldData
    const isOption = panelType === 'options'
    const processProperty = (key, val) => {
      const propType = dom.contentType(val)
      const propIsNum = typeof prop === 'number'
      let fMap = panelType + '.' + key

      if (propIsNum) {
        fMap = `${panelType}[${prop}].${key}`
      }
      const typeAttrs = (key, val, type) => {
        const placeholder = i18n.get(`placeholder.${key}`) || h.capitalize(key)
        const attrs = {
          string: {
            type: 'text',
            value: val,
            placeholder,
          },
          boolean: {
            get type() {
              let boolType = 'checkbox'
              if (_this.fieldData.attrs) {
                const attrType = _this.fieldData.attrs.type
                if (attrType === 'radio' && key === 'selected') {
                  boolType = 'radio'
                }
              }
              return boolType
            },
            value: val,
          },
          number: {
            type: 'number',
            value: val,
          },
          array: {
            className: '',
          },
        }
        return attrs[type]
      }
      const inputLabel = key => {
        const labelKey = panelType + '.' + key
        return i18n.get(labelKey) || h.capitalize(key)
      }
      const propertyInputs = {
        array: (key, val) => {
          const select = {
            fMap,
            tag: 'select',
            id: `${prop}-${id}`,
            attrs: typeAttrs(key, val, 'array'),
            config: {
              label: inputLabel(key),
              hideLabel: isOption,
            },
            content: val.map(v => {
              return {
                tag: 'option',
                attrs: {
                  value: v.value,
                  selected: v.selected,
                },
                content: v.label,
              }
            }),
            action: {
              change: evt => {
                const values = []
                const propData = fieldData[panelType][prop]
                const optionData = isOption ? propData[key] : propData
                const newValue = optionData.map(value => {
                  const { selected, ...option } = value
                  values.push(option.value)
                  return option
                })

                const index = values.indexOf(evt.target.value)
                newValue[index].selected = true
                h.set(fieldData, fMap, newValue)
                data.save()
                _this.updatePreview()
              },
            },
          }
          return select
        },
        string: (key, val) => {
          const input = {
            fMap,
            tag: 'input',
            id: `${prop}-${id}`,
            attrs: typeAttrs(key, val, 'string'),
            action: {
              change: evt => {
                h.set(fieldData, fMap, evt.target.value)
                _this.updatePreview()
                data.save()
              },
            },
          }

          if (!propIsNum) {
            input.config = {
              label: inputLabel(key),
            }
          }

          return input
        },
        boolean: (key, val) => {
          let input = {
            tag: 'input',
            attrs: typeAttrs(key, val, 'boolean'),
            fMap,
            id: prop + '-' + id,
            name: _this.fieldId + '-selected',
            action: {
              change: evt => {
                h.set(fieldData, fMap, evt.target.checked)
                _this.updatePreview()
              },
            },
          }

          if (val) {
            input.attrs.checked = val
          }

          if (propIsNum) {
            const addon = {
              tag: 'span',
              className: 'f-addon',
              content: dom.checkbox(input),
            }
            input = addon
          } else {
            input.config = {
              label: inputLabel(key),
            }
          }

          return input
        },
        object: (objKey, objVal) => {
          const inputs = []

          for (const objProp in objVal) {
            if (objVal.hasOwnProperty(objProp)) {
              inputs.push(processProperty(objProp, objVal[objProp]))
            }
          }

          return inputs
        },
      }

      propertyInputs.number = propertyInputs.string

      return propertyInputs[propType](key, val)
    }

    inputs.push(processProperty(prop, propVal))

    return inputs
  }

  /**
   * Checks if attribute is allowed to be edited
   * @param  {String}  attr
   * @return {Boolean}      [description]
   */
  isAllowedAttr(attr = 'type') {
    const _this = this
    const disabledAttrs = rFields[_this.metaID].config.disabledAttrs
    let allowed = true
    if (disabledAttrs) {
      allowed = !h.inArray(attr, disabledAttrs)
    }

    return allowed
  }

  /**
   * Add a new attribute to the attrs panels
   * @param {String} attr
   * @param {String|Array} val
   */
  addAttribute(attr, val) {
    if (!this.isAllowedAttr(attr)) {
      window.alert(`Attribute "${attr}": not permitted`)
    }

    const _this = this
    const field = document.getElementById(_this.fieldId)
    const editGroup = field.querySelector('.field-edit-attrs')
    const safeAttr = h.hyphenCase(attr)
    const fieldData = formData.fields.get(_this.fieldId)
    const labelKey = `attrs.${safeAttr}`

    if (!i18n.current[labelKey]) {
      i18n.put(labelKey, h.capitalize(attr))
    }

    if (typeof val === 'string' && h.inArray(val, ['true', 'false'])) {
      val = JSON.parse(val)
    }

    fieldData.attrs[safeAttr] = val

    const args = {
      dataObj: fieldData,
      dataProp: safeAttr,
      i: Object.keys(fieldData.attrs).length,
      panelType: 'attrs',
    }

    const existingAttr = editGroup.querySelector(`.attrs-${safeAttr}-wrap`)
    const newAttr = dom.create(_this.panelContent(args))
    if (existingAttr) {
      editGroup.replaceChild(newAttr, existingAttr)
    } else {
      editGroup.appendChild(newAttr)
    }

    data.save(args.panelType, editGroup)
    _this.updatePreview()
    _this.resizePanelWrap()
  }

  /**
   * Add option to options panel
   */
  addOption() {
    const _this = this
    const field = dom.fields.get(_this.fieldId).field
    const fieldData = formData.fields.get(_this.fieldId)
    const optionData = fieldData['options']
    const editGroup = field.querySelector('.field-edit-options')
    const propData = cleanObj(optionData[optionData.length - 1])
    fieldData.options.push(propData)

    const args = {
      i: editGroup.childNodes.length,
      dataProp: propData,
      dataObj: fieldData,
      panelType: 'options',
      propType: 'array',
    }

    editGroup.appendChild(dom.create(_this.panelContent(args)))
    _this.resizePanelWrap()

    // Save Fields Attrs
    data.save()
    dom.empty(_this.preview)
    const newPreview = dom.create(formData.fields.get(_this.fieldId), true)
    _this.preview.appendChild(newPreview)
  }

  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @param  {String} type
   * @return {Object} panel edit buttons config
   */
  panelEditButtons(type) {
    const _this = this
    const addBtn = {
      tag: 'button',
      attrs: {
        type: 'button',
        className: `add-${type}`,
      },
      content: i18n.get(`panelEditButtons.${type}`),
      action: {
        click: evt => {
          const addEvt = {
            btnCoords: dom.coords(evt.target),
          }

          if (type === 'attrs') {
            addEvt.addAction = _this.addAttribute.bind(_this)
            addEvt.message = {
              attr: i18n.get('action.add.attrs.attr'),
              value: i18n.get('action.add.attrs.value'),
            }
          } else if (type === 'options') {
            addEvt.addAction = _this.addOption.bind(_this)
          }

          const eventType = h.capitalize(type)
          const customEvt = new window.CustomEvent(`onAdd${eventType}`, {
            detail: addEvt,
          })

          // Run Action Hook
          actions.add[type](addEvt)

          // Fire Event
          document.dispatchEvent(customEvt)
        },
      },
    }
    const panelEditButtons = {
      tag: 'div',
      attrs: {
        className: 'panel-action-buttons',
      },
      content: [addBtn],
    }

    return panelEditButtons
  }

  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  fieldEdit() {
    const _this = this
    const panels = []
    const editable = ['object', 'array']
    const noPanels = ['config', 'meta', 'action']
    const fieldData = h.getIn(formData, ['fields', _this.fieldId])
    const allowedPanels = Object.keys(fieldData).filter(elem => {
      return !h.inArray(elem, noPanels)
    })

    const fieldEdit = {
      tag: 'div',
      className: ['field-edit', 'slide-toggle', 'panels-wrap'],
    }

    h.forEach(allowedPanels, (panelType, i) => {
      const propType = dom.contentType(fieldData[panelType])
      if (h.inArray(propType, editable)) {
        const panel = {
          tag: 'div',
          attrs: {
            className: `f-panel ${panelType}-panel`,
          },
          config: {
            label: i18n.get(`panelLabels.${panelType}`) || '',
          },
          content: [_this.editPanel(panelType), _this.panelEditButtons(panelType)],
          action: {
            // change: evt => {
            // let fieldData = formData.fields.get(_this.fieldId);
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
            //     data.save(panelType, _this.fieldId);
            //     // throttle this for sure
            //     _this.updatePreview();
            //   }
            // }
          },
        }

        panels.push(panel)
      }
    })

    const panelsConfig = {
      panels,
      id: _this.fieldId,
    }

    if (panels.length) {
      const editPanels = (_this.panels = new Panels(panelsConfig))
      fieldEdit.className.push('panel-count-' + panels.length)
      fieldEdit.content = editPanels.content
      _this.panelNav = editPanels.nav
      _this.resizePanelWrap = editPanels.actions.resize
    } else {
      setTimeout(() => {
        const field = dom.fields.get(_this.fieldId).field
        const editToggle = field.querySelector('.item-edit-toggle')
        const fieldActions = field.querySelector('.field-actions')
        const actionButtons = fieldActions.getElementsByTagName('button')
        fieldActions.style.maxWidth = `${actionButtons.length * 24}px`
        dom.remove(editToggle)
      }, 0)
    }

    return fieldEdit
  }

  /**
   * Generate field preview config
   * @return {Object} fieldPreview
   */
  fieldPreview() {
    const _this = this
    const fieldData = clone(this.fieldData)
    const field = dom.fields.get(_this.fieldId).field
    const togglePreviewEdit = evt => {
      const column = field.parentElement
      if (evt.target.contentEditable === 'true') {
        if (h.inArray(evt.type, ['focus', 'blur'])) {
          const isActive = document.activeElement === evt.target
          column.classList.toggle('editing-field-preview', isActive)
          dom.toggleSortable(field.parentElement, evt.type === 'focus')
        } else if (h.inArray(evt.type, ['mousedown', 'mouseup'])) {
          dom.toggleSortable(field.parentElement, evt.type === 'mousedown')
        }
      }
    }

    fieldData.id = 'prev-' + _this.fieldId

    const fieldPreview = {
      tag: 'div',
      attrs: {
        className: 'field-preview',
      },
      content: dom.create(fieldData, true),
      action: {
        focus: togglePreviewEdit,
        blur: togglePreviewEdit,
        mousedown: togglePreviewEdit,
        mouseup: togglePreviewEdit,
        change: evt => {
          const { target } = evt
          if (target.fMap) {
            const fieldData = formData.fields.get(_this.fieldId)
            const { checked, type, fMap } = target
            if (h.inArray(type, ['checkbox', 'radio'])) {
              // uncheck options if radio
              if (type === 'radio') {
                fieldData.options.forEach(option => (option.selected = false))
              }
              h.set(fieldData, fMap, checked)

              data.save()
            }
          }
        },
        click: evt => {
          if (evt.target.contentEditable === 'true') {
            evt.preventDefault()
          }
        },
        input: evt => {
          const fieldData = formData.fields.get(_this.fieldId)
          let prop = 'content'
          if (evt.target.fMap) {
            prop = evt.target.fMap
          }
          if (evt.target.contentEditable === 'true') {
            h.set(fieldData, prop, evt.target.innerHTML)
          } else {
            h.set(fieldData, prop, evt.target.value)
          }
          data.save('field', _this.fieldId)
        },
      },
    }

    return fieldPreview
  }
}
