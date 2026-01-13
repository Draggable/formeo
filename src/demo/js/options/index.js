import config from './config'
import controls from './controls'

const editorContainer = '.build-form'
const renderContainer = '.render-form'

export const editorOptions = {
  editorContainer,
  // i18n: {
  //   location: './assets/lang', // path to language files
  // },
  actions: {
    // save: formData => null, // do something on save action
  },
  // allowEdit: false,
  controls,
  config,
  events: {
    // onUpdate: console.log,
    onSave: console.log,
    onChange: console.log,
  },
  // svgSprite: 'https://draggable.github.io/formeo/assets/img/formeo-logo.svg',
  // style: 'https://draggable.github.io/formeo/assets/css/formeo.min.css',
  style: null,
  // debug: true,
  sessionStorage: true,
  editPanelOrder: ['attrs', 'options'],
  // controlOnLeft: true,
  onLoad: () => {
    console.log('demo loaded')
  },
}

// document.addEventListener('formeoLoaded', evt => {
//   // events.opts.formeoLoaded(evt.detail.formeo)
//   console.log('loaded')
//   // this.processUiState()
// })

export const renderOptions = {
  renderContainer,
  elements: {
    tinymce: {
      action: {
        onRender: elem => {
          if (elem.id) {
            const selector = `#${elem.id}`
            globalThis.tinymce.remove(selector)
            globalThis.tinymce.init({
              selector: selector,
            })
          }
        },
      },
    },
  },
}
