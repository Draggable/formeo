import i18n from '@draggable/i18n'
import Control from '../control.js'

class FileControl extends Control {
  constructor() {
    const fileInput = {
      tag: 'input',
      attrs: {
        type: 'file',
        required: false,
      },
      config: {
        label: i18n.get('fileUpload'),
      },
      meta: {
        group: 'common',
        icon: 'upload',
        id: 'upload',
      },
    }
    super(fileInput)
  }
}

export default FileControl
