const config = {
  rows: {
    all: {
      events: {
        onRender: element => {
          console.log(`You just added a new row with the id "${element.id}"`)
        },
      },
    },
  },
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
          const onRenderTimeout = setTimeout(() => {
            // formeo.Components.fields.get(element.id).toggleEdit(true)
            element.querySelector('.next-group').click()
            clearTimeout(onRenderTimeout)
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
