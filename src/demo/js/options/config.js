const config = {
  rows: {
    all: {
      events: {
        onAdd: evt => {
          console.log(`You just added a new row with the id "${evt.target.id}"`, evt.index)
          if (evt.index === 2) {
            const actionBtnWrap = evt.target.dom.querySelector('.action-btn-wrap')
            const addColumnBtn = document.createElement('button')
            addColumnBtn.type = 'button'
            addColumnBtn.className = 'btn btn-sm btn-secondary'
            addColumnBtn.textContent = 'Add Column'
            addColumnBtn.style.border = '1px solid #ccc'
            addColumnBtn.style.width = 'auto'
            addColumnBtn.addEventListener('click', () => {
              evt.target.addChild()
            })
            actionBtnWrap.appendChild(addColumnBtn)
          }
        },
      },
    },
  },
  fields: {
    all: {
      panels: {
        attrs: {
          // disabled: ['type'],
          // locked: ['type'],
        },
      },

      // multiple ways to disable/lock fields
      // disabled: ['attrs.type'],
      // locked: ['attrs.type'],

      events: {
        onRemove: evt => {
          console.log(`You just removed the field with the id "${evt.target.id}"`, evt)
        },
      },
    },
    'text-input': {
      attrs: {
        type: [
          { label: 'text', value: 'text' },
          { label: 'phone', value: 'phone' },
          { label: 'email', value: 'email' },
        ],
      },
      config: { helpText: 'This is a custom help text for text input fields.', hideLabel: false },
      // disabled: ['attrs.type'],
    },
    checkbox: {
      actionButtons: {
        // buttons: ['edit'], // array of allow action buttons
      },
      panels: {
        attrs: {
          hideDisabled: true,
        },
        // disabled: ['options'],
      },
    },
  },
}

export default config
