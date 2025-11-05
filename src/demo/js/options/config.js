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
