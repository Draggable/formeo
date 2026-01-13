import i18n from '@draggable/i18n'
import Control from '../control.js'

// import Components from '../..'

class TextControl extends Control {
  constructor() {
    const textInput = {
      tag: 'input',
      attrs: {
        required: false,
        type: 'text',
        className: '',
      },
      config: {
        label: i18n.get('controls.form.input.text'),
        hideLabel: false,
      },
      meta: {
        group: 'common',
        icon: 'text-input',
        id: 'text-input',
      },
    }
    super(textInput)
  }
}

export default TextControl
