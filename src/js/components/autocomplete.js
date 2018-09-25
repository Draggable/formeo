import { dom } from '../common/dom'
import startCase from 'lodash/startCase'
// import Data from './data'
import Components from '.'

const labelCount = (arr, elem) => arr.reduce((n, x) => n + (x === elem), 0)

const componentOptions = selected => {
  const labels = []
  const options = Object.entries(Components.flatList()).map(([id, component]) => {
    const label = component.get('config.label') || component.get('attrs.id') || component.get('meta.id')
    if (label) {
      const type = {
        tag: 'span',
        content: ` ${startCase(component.name)}`,
        className: 'component-type',
      }
      const labelKey = `${component.name}.${label}`
      labels.push(labelKey)
      let count = labelCount(labels, labelKey)
      count = {
        tag: 'span',
        content: count > 1 && `(${count})`,
        className: 'component-label-count',
      }
      return dom.makeOption([id, [`${label} `, count, type]], selected)
    }
  })

  return options.filter(Boolean)
}

/**
 * Autocomplete class
 * Output an autocomplete form element
 */
export default class Autocomplete {
  constructor(key, value) {
    this.key = key
    this.value = value
    this.build()
  }

  /**
   * build a text DOM element, supporting other jquery text form-control's
   * @return {Object} DOM Element to be injected into the form.
   */
  build() {
    // console.log(this.options)
    // const { values, type, ...data } = this.config
    const keyboardNav = e => {
      const list = e.target.nextSibling.nextSibling
      const hiddenField = e.target.nextSibling
      const activeOption = this.getActiveOption(list)
      const keyCodeMap = new Map([
        // up
        [
          38,
          () => {
            const previous = this.getPreviousOption(activeOption)
            if (previous) {
              this.selectOption(list, previous)
            }
          },
        ],
        // down
        [
          40,
          () => {
            const next = this.getNextOption(activeOption)
            if (next) {
              this.selectOption(list, next)
            }
          },
        ],
        // enter
        [
          13,
          () => {
            if (activeOption) {
              e.target.value = activeOption.dataset.label
              hiddenField.value = activeOption.dataset.value
              if (list.style.display === 'none') {
                this.showList(list, activeOption)
              } else {
                this.hideList(list)
              }
            } else {
              // Don't allow a value not in the list
              // if (!this.isOptionValid(list, activeOption.dataset.l)) {
              //   e.target.value = ''
              //   e.target.nextSibling.value = ''
              // }
            }
            e.preventDefault()
          },
        ],
        // escape
        [
          27,
          () => {
            this.hideList(list)
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
      focus: evt => {
        console.dir(evt.target)
        const list = evt.target.nextSibling.nextSibling
        const filteredOptions = dom.toggleElementsByStr(list.querySelectorAll('li'), evt.target.value)
        evt.target.addEventListener('keydown', keyboardNav)
        if (evt.target.value.length > 0) {
          const selectedOption = filteredOptions.length > 0 ? filteredOptions[filteredOptions.length - 1] : null
          this.showList(list, selectedOption)
        }
      },
      blur: evt => {
        evt.target.removeEventListener('keydown', keyboardNav)
        setTimeout(() => {
          evt.target.nextSibling.nextSibling.style.display = 'none'
        }, 200)
        // Validate the option entered exists
        // const list = evt.target.nextSibling.nextSibling
        // if (!this.isOptionValid(list, evt.target.dataset.value)) {
        //   evt.target.value = ''
        //   evt.target.nextSibling.value = ''
        // }
      },
      input: evt => {
        const list = evt.target.nextSibling.nextSibling
        const hiddenField = evt.target.nextSibling
        hiddenField.value = evt.target.value
        const filteredOptions = dom.toggleElementsByStr(list.querySelectorAll('li'), evt.target.value)

        if (filteredOptions.length === 0) {
          this.hideList(list)
        } else {
          let activeOption = this.getActiveOption(list)
          if (!activeOption) {
            activeOption = filteredOptions[filteredOptions.length - 1]
          }
          this.showList(list, activeOption)
        }
      },
    }
    const autoCompleteInputConfig = {
      tag: 'input',
      autocomplete: 'off',
      action: autoCompleteInputActions,
      attrs: { type: 'text' },
    }
    // const autoCompleteInput = dom.create({
    //   tag: 'input',
    //   ...autoCompleteInputConfig,
    // })
    const hiddenInput = dom.create({
      tag: 'input',
      attrs: { type: 'hidden' },
    })

    const fields = [autoCompleteInputConfig, hiddenInput]

    const listConfig = {
      tag: 'ul',
      attrs: { className: 'fb-autocomplete-list' },
    }

    fields.push(dom.create(listConfig))

    this.dom = dom.create({
      children: fields,
      className: this.key.replace(/\./g, '-'),
      action: {
        onRender: elem => {
          const list = elem.querySelector('.fb-autocomplete-list')
          const options = this.generateOptions()
          options.forEach(option => list.appendChild(option))

          console.log(elem, list)
        },
      },
    })

    return this.dom
  }

  generateOptions() {
    const options = componentOptions()

    return options.map(optionData => {
      console.log(optionData)
      const optionConfig = {
        tag: 'li',
        children: optionData.label,
        dataset: {
          value: optionData.value,
          label: optionData.label[0].trim(),
        },
        action: {
          click: evt => {
            const list = evt.target.parentElement
            const field = list.previousSibling.previousSibling
            field.value = optionData.label
            field.nextSibling.value = optionData.value
            this.hideList(list)
          },
        },
      }
      return dom.create(optionConfig)
    })
  }

  // setOptions(options, selected)

  /**
   * Hides autocomplete list and deselects all the options
   * @param {Object} list - list of autocomplete options
   */
  hideList(list) {
    this.selectOption(list, null)
    list.style.display = 'none'
  }

  /**
   * Shows autocomplete list. Automatically selects 'selectedOption'
   * @param {Object} list - list of autocomplete options
   * @param {Object} selectedOption - option to be selected
   */
  showList(list, selectedOption) {
    this.selectOption(list, selectedOption)
    list.style.display = 'block'
    list.style.width = list.parentElement.offsetWidth + 'px'
  }

  /**
   * Returns first option from autocomplete list with 'active-option' class
   * @param {Object} list - list of autocomplete options
   * @return {Object} first list option with 'active-option' class
   */
  getActiveOption(list) {
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
  selectOption(list, selectedOption) {
    const options = list.querySelectorAll('li')
    // --Fix for IE11
    for (let i = 0; i < options.length; i++) {
      options[i].classList.remove('active-option')
    }
    if (selectedOption) {
      selectedOption.classList.add('active-option')
    }
  }

  /**
   * Is the value in the autocomplete field in the pre-defined Options list?
   * @param {Object} list - list of autocomplete options
   * @param {Object} value -value trying to be set
   * @return {Object} - is the option in the pre defined list
   */
  isOptionValid(list, value) {
    console.log(value)
    const options = list.querySelectorAll('li')
    let validValue = false
    for (let i = 0; i < options.length; i++) {
      if (options[i].dataset.value === value) {
        validValue = true
        break
      }
    }
    return validValue
  }
}
