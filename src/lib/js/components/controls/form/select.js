import i18n from 'mi18n'
import { generateOptionConfig } from './shared.js'
import Control from '../control.js'

class SelectControl extends Control {
  constructor() {
    const selectConfig = {
      tag: 'select',
      config: {
        label: i18n.get('controls.form.select'),
      },
      attrs: {
        required: false,
        className: '',
      },
      meta: {
        group: 'common',
        icon: 'select',
        id: 'select',
      },
      options: generateOptionConfig('option'),
    }
    super(selectConfig)
  }
}

export default SelectControl
