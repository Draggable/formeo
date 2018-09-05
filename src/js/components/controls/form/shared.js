import i18n from 'mi18n'
import startCase from 'lodash/startCase'

export const generateOptionConfig = (type, count = 3) =>
  Array.from({ length: count }, (v, k) => k + 1).map(i => {
    const selectedKey = type === 'checkbox' ? 'checked' : 'selected'
    return {
      label: i18n.get('labelCount', {
        label: startCase(type),
        count: i,
      }),
      value: `${type}-${i}`,
      [selectedKey]: !i,
    }
  })
