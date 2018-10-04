import { generateOptionConfig } from './shared'
import i18n from 'mi18n'
import Control from '../control'

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
      },
      meta: {
        group: 'common',
        icon: 'checkbox',
        id: 'checkbox',
      },
      options: generateOptionConfig('checkbox', 1),
    }
    super(checkboxGroup)
  }
}

export default CheckboxGroupControl
