import { generateOptionConfig } from './shared'

export const radioGroup = {
  tag: 'input',
  attrs: {
    type: 'radio',
    required: false,
  },
  config: {
    label: 'radioGroup',
    disabledAttrs: ['type'],
  },
  meta: {
    group: 'common',
    icon: 'radio-group',
    id: 'radio',
  },
  options: generateOptionConfig('radio'),
}

export default radioGroup
