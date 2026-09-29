import i18n from '@draggable/i18n'
import Control from '../control.js'
import { generateOptionConfig } from './shared.js'

class RadioGroupControl extends Control {
  constructor() {
    const radioGroup = {
      tag: 'input',
      attrs: {
        type: 'radio',
        required: false,
      },
      config: {
        label: i18n.get('controls.form.radio-group'),
        disabledAttrs: ['type'],
        other: false,
      },
      meta: {
        group: 'common',
        icon: 'radio-group',
        id: 'radio',
      },
      options: generateOptionConfig({ type: 'radio' }),
      // Config panel keys: an Other choice with a text box, and its label (#other-choice in docs/renderer)
      configOptions: {
        other: { default: false },
        otherLabel: { default: '' },
      },
    }
    super(radioGroup)
  }
}

export default RadioGroupControl
