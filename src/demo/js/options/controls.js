const controls = {
  sortable: false,
  groupOrder: ['common', 'html'],
  disable: {
    // elements: ['button'],
  },
  elements: [
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
