import i18n from 'mi18n'
import Control from '../control'

class FileControl extends Control {
  constructor() {
    const fileInput = {
      tag: 'input',
      attrs: {
        type: 'file',
        required: false,
      },
      config: {
        disabledAttrs: ['type'],
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
