import i18n from '@draggable/i18n'
import Control from '../control.js'

class TextAreaControl extends Control {
  constructor() {
    const textAreaConfig = {
      tag: 'textarea',
      config: {
        label: i18n.get('controls.form.textarea'),
      },
      // actions here will be applied to the preview in the editor
      action: {
        input: function ({ target: { value } }) {
          this.setData?.('value', value)
        },
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
