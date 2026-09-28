const controls = {
  sortable: false,
  groupOrder: ['common', 'html'],
  disable: {
    // elements: ['button'],
  },
  elements: [
    {
      meta: { group: 'common', id: 'address-set', icon: 'rows' },
      config: { label: 'Address' },
      controlSet: {
        row: { config: { fieldset: true, legend: 'Address' } },
        fields: [
          { control: 'text-input', attrs: { name: 'street' }, config: { label: 'Street' } },
          { control: 'text-input', attrs: { name: 'city' }, config: { label: 'City' } },
          { control: 'text-input', attrs: { name: 'postcode' }, config: { label: 'Postcode' } },
          {
            control: 'select',
            attrs: { name: 'country' },
            config: { label: 'Country' },
            options: [
              { label: 'Canada', value: 'ca', selected: false },
              { label: 'United Kingdom', value: 'uk', selected: false },
              { label: 'United States', value: 'us', selected: false },
            ],
          },
        ],
      },
    },
    {
      tag: 'input',
      config: {
        label: 'Email',
        disabledAttrs: ['type'],
        lockedAttrs: ['required', 'className'],
      },
      meta: {
        group: 'common',
        id: 'email',
        icon: '@',
      },
      attrs: {
        className: 'custom-email',
        type: 'email',
        required: true,
      },
    },
    //     {
    //   tag: 'input',
    //   attrs: {
    //     type: 'radio',
    //     required: false
    //   },
    //   config: {
    //     label: 'Radio Group',
    //     disabledAttrs: ['type']
    //   },
    //   meta: {
    //     group: 'common',
    //     icon: 'radio-group',
    //     id: 'radio'
    //   },
    //   options: (() => {
    //     let options = [1, 2, 3].map(i => {
    //       return {
    //         label: 'Radio ' + i,
    //         value: 'radio-' + i,
    //         selected: false
    //       };
    //     });
    //     let otherOption = {
    //         label: 'Other',
    //         value: 'other',
    //         selected: false
    //       };
    //     options.push(otherOption);
    //     return options;
    //   })(),
    //   action: {
    //     mouseover: evt => {
    //       console.log(evt);
    //       const {target} = evt;
    //       if (target.value === 'other') {
    //         const otherInput = target.cloneNode(true);
    //         otherInput.type = 'text';
    //         target.parentElement.appendChild(otherInput);
    //       }
    //     }
    //   }
    // },
  ],
  elementOrder: {
    common: [
      'button',
      'checkbox',
      'date-input',
      'hidden',
      'upload',
      'number',
      'radio',
      'select',
      'text-input',
      'textarea',
    ],
  },
}

export default controls
