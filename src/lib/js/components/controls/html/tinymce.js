import { merge } from '../../../common/utils/index.mjs'
import Control from '../control.js'

class TinyMCEControl extends Control {
  constructor(options) {
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
      dependencies: { js: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/tinymce.min.js' },
      // this action is passed to the rendered control/element
      // useful for actions and events on the control preview
      action: {
        onRender: elem => {
          const selector = `#${elem.id}`
          window.tinymce.remove(selector)
          window.tinymce.init({
            selector: selector,
          })
        },
      },
      controlAction: {
        // callback when control is clicked
        click: () => {},
        // callback for when control is rendered
        onRender: () => {},
      },
    }

    const mergedOptions = merge(textAreaConfig, options)
    super(mergedOptions)
  }
}

export default TinyMCEControl
