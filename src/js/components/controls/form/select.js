import { generateOptionConfig } from './shared'
import i18n from 'mi18n'
import Control from '../control'

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
