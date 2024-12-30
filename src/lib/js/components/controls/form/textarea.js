import i18n from '@draggable/i18n'
import Control from '../control.js'

class TextAreaControl extends Control {
  constructor() {
    const textAreaConfig = {
      tag: 'textarea',
      config: {
        label: i18n.get('controls.form.textarea'),
      },
      meta: {
        group: 'common',
        icon: 'textarea',
        id: 'textarea',
      },
      attrs: {
        required: false,
      },
    }
    super(textAreaConfig)
  }
}

export default TextAreaControl
