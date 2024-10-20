import Control from '../control.js'

class TinyMCEControl extends Control {
  constructor() {
    const textAreaConfig = {
      tag: 'textarea',
      config: {
        label: 'WYSIWYG',
        editableContent: true,
      },
      meta: {
        group: 'html',
        icon: 'rich-text',
        id: 'tinymce',
      },
      attrs: {
        required: false,
      },
      action: {
        onRender: evt => {
          if (evt.id) {
            this.textareaID = evt.id
            window.tinymce.remove('textarea#' + evt.id)
            window.tinymce.init({
              selector: 'textarea#' + evt.id,
            })
          }
        },
      },
    }
    super(textAreaConfig)
  }
}

export default TinyMCEControl
