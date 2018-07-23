export const textInput = {
  tag: 'input',
  attrs: {
    type: 'text',
    required: false,
    className: '',
  },
  config: {
    disabledAttrs: ['type'],
    label: 'controls.input.text',
  },
  meta: {
    group: 'common',
    icon: 'text-input',
    id: 'text-input',
  },
  fMap: 'attrs.value',
}

export default textInput
