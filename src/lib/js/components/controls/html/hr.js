import i18n from '@draggable/i18n'
import Control from '../control.js'

class HRControl extends Control {
  constructor() {
    const hrConfig = {
      tag: 'hr',
      config: {
        label: i18n.get('controls.html.divider'),
        hideLabel: true,
      },
      meta: {
        group: 'html',
        icon: 'divider',
        id: 'divider',
      },
    }
    super(hrConfig)
  }
}

export default HRControl
