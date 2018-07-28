import { generateOptionConfig } from './shared'

export const checkboxGroup = {
  tag: 'input',
  attrs: {
    type: 'checkbox',
    required: false,
  },
  config: {
    label: 'controls.checkbox-group',
    disabledAttrs: ['type'],
  },
  meta: {
    group: 'common',
    icon: 'checkbox',
    id: 'checkbox',
  },
  options: generateOptionConfig('checkbox', 1),
}

export default checkboxGroup
