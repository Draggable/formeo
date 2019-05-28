import i18n from 'mi18n'
import Control from '../control'

class TextAreaControl extends Control {
  constructor() {
    const textAreaConfig = {
      tag: 'textarea',
      config: {
        label: i18n.get('controls.form.textarea'),
      },
      // This is the beginning of actions being supported for render
      // editor field actions should be in config.action
      // action: {
      //   mousedown: function(evt) {
      //     let {target} = evt;
      //     let startHeight = target.style.height;
      //     const onMouseup = evt => {
      //       let {target} = evt;
      //       let endHeight = target.style.height;
      //       if (startHeight !== endHeight) {
      //         //eslint-disable-next-line
      //         let fieldId = closest(target, '.stage-field').id;
      //         const field = d.fields.get(fieldId).instance;
      //         field.addAttribute('style', `height: ${endHeight}`);
      //       }
      //       target.removeEventListener('mouseup', onMouseup);
      //     };
      //     target.addEventListener('mouseup', onMouseup);
      //   }
      // },
      meta: {
        group: 'common',
        icon: 'textarea',
        id: 'textarea',
      },
      attrs: {
        required: false,
      },
    }
    super(textAreaConfig)
  }
}

export default TextAreaControl
