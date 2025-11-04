import i18n from '@draggable/i18n'
import { merge } from '../../../common/utils/index.mjs'
import Control from '../control.js'
import { generateOptionConfig } from './shared.js'

class SelectControl extends Control {
  constructor(controlConfig = {}) {
    const selectConfig = {
      tag: 'select',
      config: {
        label: i18n.get('controls.form.select'),
      },
      attrs: {
        required: false,
        className: '',
        multiple: false,
      },
      meta: {
        group: 'common',
        icon: 'select',
        id: 'select',
      },
      options: generateOptionConfig({ type: 'option', isMultiple: controlConfig.attrs?.multiple }),
    }

    const mergedConfig = merge(selectConfig, controlConfig)

    super(mergedConfig)
  }
}

export default SelectControl
