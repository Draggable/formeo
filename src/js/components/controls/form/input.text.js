import i18n from 'mi18n'
import Control from '../control'
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
