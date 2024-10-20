import i18n from 'mi18n'
import { toTitleCase } from '../../../common/utils/string.mjs'

export const generateOptionConfig = (type, count = 3) =>
  Array.from({ length: count }, (v, k) => k + 1).map(i => {
    const selectedKey = type === 'checkbox' ? 'checked' : 'selected'
    return {
      label: i18n.get('labelCount', {
        label: toTitleCase(type),
        count: i,
      }),
      value: `${type}-${i}`,
      [selectedKey]: !i,
    }
  })
