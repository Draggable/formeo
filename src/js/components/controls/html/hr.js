import i18n from 'mi18n'
import Control from '../control'

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
      }
    }
    super(hrConfig)
  }
}

export default HRControl
