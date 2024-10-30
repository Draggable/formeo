import i18n from '@draggable/i18n'
import Control from '../control.js'

class HiddenControl extends Control {
  constructor() {
    const hiddenInput = {
      tag: 'input',
      attrs: {
        type: 'hidden',
        value: '',
      },
      config: {
        label: i18n.get('hidden'),
        hideLabel: true,
      },
      meta: {
        group: 'common',
        icon: 'hidden',
        id: 'hidden',
      },
    }
    super(hiddenInput)
  }
}

export default HiddenControl
