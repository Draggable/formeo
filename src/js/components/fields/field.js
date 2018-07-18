import i18n from 'mi18n'
import { data, formData } from '../../common/data'
import animate from '../../common/animation'
import h from '../../common/helpers'
import actions from '../../common/actions'
import dom from '../../common/dom'
import Panels from '../panels'
import { uuid, clone, cleanObj } from '../../common/utils'
import fields from './index'
import EditPanel from './edit-panel'
import Component from '../component'

/**
 * Element/Field class.
 */
export default class Field extends Component {
  /**
   * Set defaults and load fieldData
   * @param  {Object} fieldData existing field ID
   * @return {Object} field object
   */
  constructor(fieldData) {
    super('field', fieldData)

    let field = {
      tag: 'li',
      attrs: {
        className: 'stage-fields',
      },
      id: this.id,
      children: [
        this.label,
        dom.actionButtons(this.id, 'field'), // fieldEdit window
        this.fieldEdit, // fieldEdit window
      ],
      panelNav: this.panelNav,
      dataset: {
        hoverTag: i18n.get('field'),
      },
      fType: 'fields',
      action: {
        mouseenter: evt => {
          const field = document.getElementById(this.id)
          field.classList.add('hovering-field')
        },
        mouseleave: evt => {
          const field = document.getElementById(this.id)
          field.classList.remove('hovering-field')
        },
      },
    }

    field = dom.create(field)

    this.preview = dom.create(this.fieldPreview())
    field.appendChild(this.preview)
    this.dom = field
    fields.add(this)
  }

  get label() {
    return {
      tag: 'label',
      attrs: {
        contenteditable: true,
        className: 'prev-label',
      },
      children: this.data.config.label,
      action: {
        input: ({ target: { innerHTML } }) => {
          this.set('config.label', innerHTML)
        },
      },
    }
  }

  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview() {
    const _this = this
    const fieldData = h.copyObj(this.data)
    const newPreview = dom.create(fieldData, true)
    dom.empty(_this.preview)
    _this.preview.appendChild(newPreview)

    return newPreview
  }

  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelName
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  editPanel(panelName) {
    // const _this = this
    // const fieldData = this.fieldData.get(panelType)
    const panelData = this.data.get(panelName)
    const panelWrap = {
      tag: 'div',
      className: 'f-panel-wrap',
      content: [],
    }
    // const propType = dom.contentType(panelData)
    const panel = {
      tag: 'ul',
      attrs: {
        className: ['field-edit-group', 'field-edit-' + panelName],
      },
      editGroup: panelName,
      isSortable: panelName === 'options',
      content: [],
    }

    panelWrap.content.push(panel)
    // console.log(panelName)

    // let panelArray
    // if (propType === 'array') {
    //   let props = Object.keys(fieldData[panelType][0])
    //   let panelLabels = {
    //     tag: 'div',
    //     className: 'input-group',
    //     content: props.map(elem => {
    //       let label = {
    //         tag: 'label',
    //         className: ['prop-label-' + elem],
    //         content: h.capitalize(elem),
    //       }

    //       if (typeof fieldData[panelType][0][elem] === 'boolean') {
    //         label.tag = 'span'
    //         label.className.push('input-group-addon')
    //       }

    //       return label
    //     }),
    //   }
    //   let labelWrap = {
    //     tag: 'header',
    //     content: panelLabels,
    //     className: 'prop-labels',
    //   }
    // removing labels until find a better way to handle them.
    //   panelWrap.content.unshift(labelWrap)
    //   panelArray = panelData
    // }
    // else {
    //   panelArray = Object.keys(fieldData[panelType])
    // }

    // const panelDataKeys = propType === 'array' ? panelData : Array.from(panelData)
    // console.log(panelData)
    panel.content = new EditPanel(panelData, panelName, this.id)
    // panel.content = Array.from(panelData).map((val, i) => {
    //   console.log(val)
    // return _this.panelContent({ i, val, propType })
    // return new EditPanel(val)
    // })

    // panel.content = panelData.map(([key, val]) => console.log(key, val))

    // h.forEach(panelDataKeys, (dataProp, i) => {
    //   console.log(dataProp)
    //   const args = {
    //     i,
    //     dataProp,
    //     panelType,
    //     propType,
    //   }
    //   panel.content.push(_this.panelContent(args))
    // })

    return panelWrap
  }

  /**
   * Field panel contents, `attrs`, `options`, `config`
   * @param  {Object} args
   * @return {Object} DOM element
   */
  panelContent(args) {
    // console.log(args)
    const _this = this
    const { panelType, dataProp } = args
    const propKey = typeof dataProp === 'string' ? dataProp : args.i
    const id = uuid()
    const propVal = args.val
    const inputs = {
      tag: 'div',
      className: ['prop-inputs', 'f-input-group'],
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
            const fieldData = formData.fields.get(_this.id)
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

    property.propData = propVal

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
   * @param  {String} id
   * @return {Array} element config array
   */
  editPanelInputs(prop, propVal, panelType, id) {
    const _this = this
    const inputs = []
    const fieldData = this.data
    const isOption = panelType === 'options'
    // console.log(prop, propVal, panelType, id)
    const processProperty = (key, val) => {
      const propType = dom.childType(val)
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
              if (_this.data.attrs) {
                const attrType = _this.data.attrs.type
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
            name: _this.id + '-selected',
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

    // console.log(prop, propVal)
    inputs.push(processProperty(prop, propVal))

    return inputs
  }

  /**
   * Checks if attribute is allowed to be edited
   * @param  {String}  attr
   * @return {Boolean}      [description]
   */
  isAllowedAttr(attr = 'type') {
    // @todo fix meta id
    const disabledAttrs = this.data.get('config').disabledAttrs
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
    const field = document.getElementById(_this.id)
    const editGroup = field.querySelector('.field-edit-attrs')
    const safeAttr = h.hyphenCase(attr)
    const fieldData = formData.fields.get(_this.id)
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
    const field = this.dom
    const fieldData = this.data
    const optionData = fieldData.options
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
    const newPreview = dom.create(this.data, true)
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
  get fieldEdit() {
    const _this = this
    const panels = []
    const editable = ['object', 'array']
    const noPanels = ['config', 'meta', 'action']
    const fieldData = this.data
    const allowedPanels = Object.keys(this.data).filter(elem => {
      return !h.inArray(elem, noPanels)
    })

    const fieldEdit = {
      className: ['field-edit', 'slide-toggle', 'panels-wrap'],
    }

    h.forEach(allowedPanels, (panelName, i) => {
      const panelData = fieldData[panelName]
      const propType = dom.childType(panelData)
      if (editable.includes(propType)) {
        const editPanel = new EditPanel(panelData, panelName, this)
        panels.push(editPanel)
      }
    })

    const panelsConfig = {
      panels,
      id: _this.id,
    }

    if (panels.length) {
      const editPanels = (_this.panels = new Panels(panelsConfig))
      fieldEdit.className.push('panel-count-' + panels.length)
      fieldEdit.content = editPanels.children
      _this.panelNav = editPanels.nav
      _this.resizePanelWrap = editPanels.actions.resize
    } else {
      setTimeout(() => {
        const field = this.dom
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
    const prevData = clone(this.data)
    prevData.id = `prev-${this.id}`
    const field = this.dom
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

    const fieldPreview = {
      tag: 'div',
      attrs: {
        className: 'field-preview',
      },
      content: dom.create(prevData, true),
      action: {
        focus: togglePreviewEdit,
        blur: togglePreviewEdit,
        mousedown: togglePreviewEdit,
        mouseup: togglePreviewEdit,
        change: evt => {
          const { target } = evt
          if (target.fMap) {
            const fieldData = this.data
            const { checked, type, fMap } = target
            if (h.inArray(type, ['checkbox', 'radio'])) {
              const options = fieldData.get('options')
              // uncheck options if radio
              if (type === 'radio') {
                options.forEach(({ selected }) => (selected = false))
              }
              // dom.fields.get(_this.id).field
              console.log(options)
              console.log(fMap)
              console.log(checked)
              console.dir(target)
              // console.log(target, h.indexOfNode(target))

              // h.set(fieldData, fMap, checked)

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
          const fieldData = this.data
          let prop = 'content'
          if (evt.target.fMap) {
            prop = evt.target.fMap
          }
          if (evt.target.contentEditable === 'true') {
            h.set(fieldData, prop, evt.target.innerHTML)
          } else {
            h.set(fieldData, prop, evt.target.value)
          }
          data.save('field', _this.id)
        },
      },
    }

    return fieldPreview
  }
}
