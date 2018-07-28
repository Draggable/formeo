import Control from '../control'

const headerTags = Array.from(Array(5).keys())
  .slice(1)
  .map(key => `h${key}`)

const headerKey = 'header'

export const header = {
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
    label: headerKey,
    hideLabel: true,
  },
  meta: {
    group: 'html',
    icon: headerKey,
    id: headerKey,
  },
  // content: i18n.get('headerKey'),
}

class headerControl extends Control {
  constructor() {
    super(header)
  }
  /**
   * class configuration
   */
  static get definition() {
    return {
      // i18n custom mappings (defaults to camelCase type)
      i18n: {
        header: 'Header222',
      },
    }
  }

  get content() {
    return super.i18n('header')
  }
}

export default headerControl
