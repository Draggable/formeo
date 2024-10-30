import i18n from '@draggable/i18n'
import Control from '../control.js'

class NumberControl extends Control {
  constructor() {
    const numberInput = {
      tag: 'input',
      attrs: {
        type: 'number',
        required: false,
        className: '',
      },
      config: {
        label: i18n.get('number'),
      },
      meta: {
        group: 'common',
        icon: 'hash',
        id: 'number',
      },
    }
    super(numberInput)
  }
}

export default NumberControl
