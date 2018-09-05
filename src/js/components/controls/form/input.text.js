import i18n from 'mi18n'
import Control from '../control'

class TextControl extends Control {
  constructor() {
    const textInput = {
      tag: 'input',
      attrs: {
        type: 'text',
        required: false,
        className: '',
      },
      config: {
        disabledAttrs: ['type'],
        label: i18n.get('controls.form.input.text'),
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
