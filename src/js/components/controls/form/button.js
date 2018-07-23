export const button = {
  tag: 'button',
  attrs: {
    className: [{ label: 'grouped', value: 'f-btn-group' }, { label: 'ungrouped', value: 'f-field-group' }],
  },
  config: {
    label: 'button',
    hideLabel: true,
    disabledAttrs: ['type'],
  },
  meta: {
    group: 'common',
    icon: 'button',
    id: 'button',
  },
  options: [
    {
      label: 'button',
      type: ['button', 'submit', 'reset'].map((buttonType, index) => ({
        label: buttonType,
        type: buttonType,
      })),
      className: [
        {
          label: 'default',
          value: '',
          selected: true,
        },
        {
          label: 'primary',
          value: 'primary',
        },
        {
          label: 'danger',
          value: 'error',
        },
        {
          label: 'success',
          value: 'success',
        },
        {
          label: 'warning',
          value: 'warning',
        },
      ],
    },
  ],
}

export default button
