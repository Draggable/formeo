const config = {
  fields: {
    checkbox: {
      actionButtons: {
        buttons: ['edit'],
      },
    },
    'a33bcc32-c54c-46ed-9609-7cdb5b3dc511': {
      events: {
        onRender: element => {
          console.log(element)
          setTimeout(() => {
            // formeo.Components.fields.get(element.id).toggleEdit(true)
            element.querySelector('.next-group').click()
          }, 333)
        },
      },
      panels: {
        attrs: {
          hideDisabled: true,
        },
        disabled: [
          // 'conditions'
        ],
      },
    },
  },
}

export default config
