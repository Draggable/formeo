import i18n from 'mi18n'
import startCase from 'lodash/startCase'
import animate from '../common/animation'
import dom from '../common/dom'
import Components from '.'
import { ANIMATION_SPEED_FAST, ANIMATION_SPEED_SLOW } from '../constants'

const BASE_NAME = 'f-autocomplete'
const HIGHLIGHT_CLASS_NAME = 'highlight-component'

let lastCache = Date.now()
let optionsCache

/**
 * Counts the number of occurences of a string in an array of strings
 * @param {Array} arr labels
 * @param {String} label
 */
export const labelCount = (arr, label) => arr.reduce((n, x) => n + (x === label), 0)

/**
 * Find or generate a label for components and external data
 * @param {Object} Component
 * @return {String} component label
 */
const getComponentLabel = ({ name, id, ...component }) => {
  const labelPaths = ['config.label', 'attrs.id', 'meta.id']
  const label = labelPaths.reduce((acc, cur) => {
    if (!acc) {
      acc = component.get(cur)
    }
    return acc
  }, null)

  const externalLabel = (...externalAddress) =>
    i18n.get(externalAddress.join('.')) || startCase(externalAddress.join(' '))

  return label || (name === 'external' && externalLabel(name, id))
}

/**
 * Generate options for the autolinker component
 * @param {String} selected option value
 * @return {Array} option config objects
 */
export const componentOptions = selected => {
  const labels = []
  const flatList = Components.flatList()
  const options = Object.entries(flatList).map(([id, component]) => {
    const label = getComponentLabel(component)
    if (label) {
      const type = {
        tag: 'span',
        content: ` ${startCase(component.name)}`,
        className: 'component-type',
      }
      const labelKey = `${component.name}.${label}`
      labels.push(labelKey)
      const count = labelCount(labels, labelKey)
      const countConfig = {
        tag: 'span',
        content: count > 1 && `(${count})`,
        className: 'component-label-count',
      }
      return dom.makeOption([id, [`${label} `, countConfig, type]], selected)
    }
  })

  return options.filter(Boolean)
}

/**
 * Autocomplete class
 * Output an autocomplete form element
 */
export default class Autocomplete {
  constructor(key, value, i18nKey) {
    this.key = key
    this.className = key.replace(/\./g, '-')
    this.value = value
    this.events = []
    this.i18nKey = i18nKey

    this.build()
  }

  /**
   * build a text DOM element, supporting other jquery text form-control's
   * @return {Object} DOM Element to be injected into the form.
   */
  build() {
    const keyboardNav = e => {
      const list = this.list
      const activeOption = this.getActiveOption()
      const keyCodeMap = new Map([
        [
          38, // up arrow
          () => {
            const previous = this.getPreviousOption(activeOption)
            if (previous) {
              this.selectOption(previous)
            }
          },
        ],

        [
          40, // down arrow
          () => {
            const next = this.getNextOption(activeOption)
            if (next) {
              this.selectOption(next)
            }
          },
        ],

        [
          13, // enter
          () => {
            if (activeOption) {
              this.selectOption(activeOption)
              this.setValue(activeOption)
              if (list.style.display === 'none') {
                this.showList(activeOption)
              } else {
                this.hideList()
              }
            }
            e.preventDefault()
          },
        ],

        [
          27, // escape
          () => {
            this.hideList()
          },
        ],
      ])

      let direction = keyCodeMap.get(e.keyCode)
      if (!direction) {
        direction = () => false
      }

      return direction()
    }
    const autoCompleteInputActions = {
      focus: ({ target }) => {
        this.updateOptions()
        target.parentElement.classList.add(`${this.className}-focused`)
        const filteredOptions = dom.toggleElementsByStr(this.list.querySelectorAll('li'), target.value)
        target.addEventListener('keydown', keyboardNav)
        const selectedOption = this.list.querySelector('.active-option') || filteredOptions[0]
        this.showList(selectedOption)
      },
      blur: ({ target }) => {
        target.parentElement.classList.remove(`${this.className}-focused`)
        target.removeEventListener('keydown', keyboardNav)
        this.hideList()
      },
      input: evt => {
        const filteredOptions = dom.toggleElementsByStr(this.list.querySelectorAll('li'), evt.target.value)

        if (evt.target.value.length === 0) {
          this.clearValue()
        }

        if (filteredOptions.length === 0) {
          this.hideList()
        } else {
          const activeOption = this.getActiveOption() || filteredOptions[0]
          this.showList(activeOption)
        }

        this.hiddenField.value = evt.target.value
        this.value = evt.target.value
        this.runEvent('onChange', { target: this.hiddenField })
      },
    }

    this.displayField = dom.create({
      tag: 'input',
      autocomplete: 'off',
      action: autoCompleteInputActions,
      attrs: {
        type: 'text',
        className: `${BASE_NAME}-display-field`,
        value: this.label || this.value,
        placeholder: i18n.get(`${this.i18nKey}.${this.key}.placeholder`),
      },
    })
    this.hiddenField = dom.create({
      tag: 'input',
      attrs: { type: 'hidden', className: this.className, value: this.value },
    })

    this.list = dom.create({
      tag: 'ul',
      attrs: { className: `${BASE_NAME}-list` },
    })

    this.dom = dom.create({
      children: [this.displayField, this.hiddenField, this.list],
      className: this.className,
      action: {
        onRender: () => {
          const component = this.value && Components.getAddress(this.value)
          this.label = component && getComponentLabel(component)
          if (this.label) {
            this.displayField.value = this.label
          }
          this.updateOptions()
        },
      },
    })

    return this.dom
  }

  updateOptions() {
    const now = Date.now()
    if (now - lastCache > ANIMATION_SPEED_SLOW) {
      dom.empty(this.list)
      this.generateOptions()
      lastCache = now
    }
    const options = optionsCache || this.generateOptions()

    options.forEach(option => this.list.appendChild(option))
  }

  generateOptions() {
    const options = componentOptions()
    const realTarget = target => {
      const targetClass = `${BASE_NAME}-list-item`
      if (!target.classList.contains(targetClass)) {
        target = target.parentElement
      }
      return target
    }

    optionsCache = options.map(optionData => {
      const value = optionData.value
      let [label] = optionData.label
      label = label.trim()
      const optionConfig = {
        tag: 'li',
        children: optionData.label,
        dataset: {
          value,
          label,
        },
        className: `${BASE_NAME}-list-item`,
        action: {
          mousedown: ({ target }) => {
            target = realTarget(target)
            this.setValue(target)
            this.selectOption(target)
            this.hideList()
          },
          mouseover: ({ target }) => {
            target = realTarget(target)
            this.removeHighlight()
            this.highlightComponent(target)
          },
        },
      }
      return dom.create(optionConfig)
    })

    return optionsCache
  }

  /**
   * Hides autocomplete list and deselects all the options
   * @param {Object} list - list of autocomplete options
   */
  hideList(list = this.list) {
    animate.slideUp(list, ANIMATION_SPEED_FAST)
    this.removeHighlight()
  }

  /**
   * Shows autocomplete list. Automatically selects 'selectedOption'
   * @param {Object} list - list of autocomplete options
   * @param {Object} selectedOption - option to be selected
   */
  showList(selectedOption, list = this.list) {
    this.selectOption(selectedOption)
    animate.slideDown(list, ANIMATION_SPEED_FAST)
  }

  /**
   * Returns first option from autocomplete list with 'active-option' class
   * @param {Object} list - list of autocomplete options
   * @return {Object} first list option with 'active-option' class
   */
  getActiveOption(list = this.list) {
    const activeOption = list.getElementsByClassName('active-option')[0]
    if (activeOption && activeOption.style.display !== 'none') {
      return activeOption
    }
    return null
  }

  /**
   * Previous next option to the current option
   * @param {Object} current - currently selected option
   * @return {Object} previous option to the current option or null if previous doesn't exist
   */
  getPreviousOption(current) {
    let previous = current
    do {
      previous = previous ? previous.previousSibling : null
    } while (previous != null && previous.style.display === 'none')
    return previous
  }

  /**
   * Returns next option to the current option
   * @param {Object} current - currently selected option
   * @return {Object} next option to the current option or null if next doesn't exist
   */
  getNextOption(current) {
    let next = current
    do {
      next = next ? next.nextSibling : null
    } while (next != null && next.style.display === 'none')
    return next
  }

  /**
   * Selects option in autocomplete list. Removes class 'active-option' from all options
   * and then adds that class to 'selected' option. If 'selected' is null then no option is selected
   * @param {Object} list - list of autocomplete options
   * @param {Object} selectedOption - option - 'li' element - to be selected in autocomplete list
   */
  selectOption(selectedOption, list = this.list) {
    const options = list.querySelectorAll('li')
    for (let i = 0; i < options.length; i++) {
      const {
        dataset: { value },
      } = options[i]
      options[i].classList.remove('active-option')

      if (value) {
        const component = Components.getAddress(value)
        component.dom && component.dom.classList.remove(HIGHLIGHT_CLASS_NAME)
      }
    }
    if (selectedOption) {
      selectedOption.classList.add('active-option')
      this.highlightComponent(selectedOption)
    }
  }

  /**
   * removes the highlight from
   */
  removeHighlight() {
    const highlightedComponents = document.getElementsByClassName(HIGHLIGHT_CLASS_NAME)
    for (let i = 0; i < highlightedComponents.length; i++) {
      highlightedComponents[i].classList.remove(HIGHLIGHT_CLASS_NAME)
    }
  }

  /**
   * Highlight a component that maps to the option
   */
  highlightComponent(option) {
    const {
      dataset: { value },
    } = option

    if (value) {
      const component = Components.getAddress(value)
      component.dom && component.dom.classList.add(HIGHLIGHT_CLASS_NAME)
    }
  }

  /**
   * Clears the autocomplete values and fires onChange event
   */
  clearValue() {
    this.selectOption(null)

    this.displayField.value = ''
    this.hiddenField.value = ''
    this.value = ''

    this.runEvent('onChange', { target: this.hiddenField })
  }

  /**
   * Sets the hidden and display values
   * @param {String} label display text
   * @param {String} value display text
   */
  setValue(target) {
    const { label, value } = target.dataset

    this.displayField.value = label
    this.hiddenField.value = value
    this.value = value

    this.runEvent('onChange', { target: this.hiddenField })
  }

  addEvent(key, event) {
    this.events.push([key, event])
  }

  runEvent(eventName, evt) {
    this.events.forEach(([key, event]) => {
      if (key === eventName) {
        event(evt)
      }
    })
  }
}
