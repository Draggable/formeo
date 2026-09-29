import i18n from '@draggable/i18n'
import Control from '../control.js'
import { generateOptionConfig } from './shared.js'

class CheckboxGroupControl extends Control {
  constructor() {
    const checkboxGroup = {
      tag: 'input',
      attrs: {
        type: 'checkbox',
        required: false,
      },
      config: {
        label: i18n.get('controls.form.checkbox-group'),
        disabledAttrs: ['type'],
        other: false,
      },
      meta: {
        group: 'common',
        icon: 'checkbox',
        id: 'checkbox',
      },
      options: generateOptionConfig({ type: 'checkbox', count: 1 }),
      // Config panel keys: an Other choice with a text box, and its label (#other-choice in docs/renderer)
      configOptions: {
        other: { default: false },
        otherLabel: { default: '' },
      },
    }
    super(checkboxGroup)
  }
}

export default CheckboxGroupControl
