import { generateOptionConfig } from './shared'

export const select = {
  tag: 'select',
  config: {
    label: 'controls.select',
  },
  attrs: {
    required: false,
    className: '',
  },
  meta: {
    group: 'common',
    icon: 'select',
    id: 'select',
  },
  options: generateOptionConfig('option'),
}

export default select
