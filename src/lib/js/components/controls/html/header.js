import i18n from '@draggable/i18n'
import Control from '../control.js'

const headerTags = Array.from(Array(5).keys())
  .slice(1)
  .map(key => `h${key}`)

const headerKey = 'controls.html.header'

class HeaderControl extends Control {
  constructor() {
    const header = {
      tag: headerTags[0],
      attrs: {
        tag: headerTags.map((tag, index) => ({
          label: tag.toUpperCase(),
          value: tag,
          selected: !index,
        })),
        className: '',
      },
      config: {
        label: i18n.get(headerKey),
        hideLabel: true,
        editableContent: true,
      },
      meta: {
        group: 'html',
        icon: 'header',
        id: 'html.header',
      },
      content: i18n.get(headerKey),
      action: {
        // onRender: evt => {},
        // click: evt => {},
      },
    }
    super(header)
  }

  /**
   * class configuration
   */
  static get definition() {
    return {
      // i18n custom mappings (defaults to camelCase type)
      i18n: {
        'en-US': {
          header: 'Custom English Header',
        },
      },
    }
  }

  get content() {
    return super.i18n(headerKey)
  }
}

export default HeaderControl
