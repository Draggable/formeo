import Control from '../control'

class ImageControl extends Control {
  constructor() {
    const imgConfig = {
      tag: 'img',
      attrs: {
        src: 'dist/demo/assets/img/formeo-logo.svg',
        style: 'width:100px;',
      },
      config: {
        label: 'Image',
        hideLabel: true,
      },
      meta: {
        group: 'html',
        icon: 'img',
        id: 'img',
      },
    }
    super(imgConfig)
  }
}

export default ImageControl
