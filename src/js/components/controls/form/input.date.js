import i18n from 'mi18n'
import Control from '../control'

class DateControl extends Control {
  constructor() {
    const dateInput = {
      tag: 'input',
      attrs: {
        type: 'date',
        required: false,
        className: '',
      },
      config: {
        label: i18n.get('controls.form.input.date'),
      },
      meta: {
        group: 'common',
        icon: 'calendar',
        id: 'date-input',
      },
    }
    super(dateInput)
  }
}

export default DateControl
