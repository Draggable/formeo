import external from './external'
import controls from './controls'
import config from './config'

const editorContainer = document.querySelector('.build-form')
const renderContainer = document.querySelector('.render-form')

export const editorOptions = {
  editorContainer,
  i18n: {
    location: '../assets/lang',
  },
  actions: {
    save: console.log,
  },
  external,
  // allowEdit: false,
  controls,
  config,
  // events: {
  // onUpdate: console.log,
  // onSave: console.log
  // },
  svgSprite: './assets/formeo-sprite.svg',
  // style: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css',
  // debug: true,
  sessionStorage: true,
  editPanelOrder: ['attrs', 'options'],
}

export const renderOptions = {
  renderContainer,
  external,
}
