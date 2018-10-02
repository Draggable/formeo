import { generateOptionConfig } from './shared'
import i18n from 'mi18n'
import Control from '../control'

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
      },
      meta: {
        group: 'common',
        icon: 'radio-group',
        id: 'radio',
      },
      options: generateOptionConfig('radio'),
    }
    super(radioGroup)
  }
}

export default RadioGroupControl
