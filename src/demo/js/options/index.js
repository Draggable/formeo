import external from './external'
import controls from './controls'
import config from './config'

const editorContainer = document.querySelector('.build-form')
const renderContainer = '.render-form'

export const editorOptions = {
  editorContainer,
  i18n: {
    location: './assets/lang',
  },
  actions: {
    // save: formData => null, // do something on save action
  },
  external,
  // allowEdit: false,
  controls,
  config,
  events: {
    // onUpdate: console.log,
    onSave: console.log,
  },
  // svgSprite: `./${devPrefix}assets/img/formeo-sprite.svg`,
  // style: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css',
  // debug: true,
  sessionStorage: true,
  editPanelOrder: ['attrs', 'options'],
  // controlOnLeft: true,
  // onLoad: () => {},
}

export const renderOptions = {
  renderContainer,
  external,
  elements: {
    tinymce: {
      action: {
        onRender: elem => {
          if (elem.id) {
            const selector = `#${elem.id}`
            window.tinymce.remove(selector)
            window.tinymce.init({
              selector: selector,
            })
          }
        },
      },
    },
  },
}
