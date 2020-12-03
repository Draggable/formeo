import Control from '../control'

class EmailControl extends Control {
  constructor() {
    super({
      tag: 'input',
      attrs: {
        required: false,
        type: 'email',
        shouldSendEmail: false,
      },
      config: {
        label: 'Email',
        disabledAttrs: ['type'],
        lockedAttrs: ['required', 'className'],
      },
      meta: {
        group: 'common',
        id: 'email',
        icon: '@',
      },
    })
  }
}

export default EmailControl
