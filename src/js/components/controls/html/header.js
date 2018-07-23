import i18n from 'mi18n'
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
  content: i18n.get('headerKey'),
}

class headerControl extends Control {
  constructor() {
    super('header', header)
    return header
  }
  get content(){
    return this.attrs.value
  }
}

export default headerControl
