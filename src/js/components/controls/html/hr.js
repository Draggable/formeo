import i18n from 'mi18n'
import Control from '../control'

const dividerKey = 'controls.html.divider'

class HRControl extends Control {
  constructor() {
    const innerHTML = i18n.get(dividerKey)

    const hrConfig = {
      tag: 'div',
      attrs: {
        className: 'formeo-divider',
      },
      innerHTML,
      config: {
        label: 'Divider',
        hideLabel: true,
      },
      meta: {
        group: 'html',
        icon: 'divider',
        id: 'divider',
      },
      options: [
        {
          innerHTML,
        },
      ],
    }

    super(hrConfig)
  }
}

export default HRControl
