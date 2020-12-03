import Control from '../control';

class ImageControl extends Control {
  constructor() {
    super({
      tag: 'img',
      attrs: {
        width: '',
        height: '',
        src: '',
        alt: '',
        className: '',
      },
      config: {
        label: 'Image',
        editableContent: false,
        hideLabel: true,
      },
      meta: {
        group: 'html',
        icon: 'image',
        id: 'html.img',
      },
    });
  }
}

export default ImageControl;
