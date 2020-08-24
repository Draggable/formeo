import './scripts'
import '../sass/demo.scss'
import '../sass/formeo-table.scss'
import { editorOptions, renderOptions } from './options'
import { editorButtons } from './actionButtons'
// import { editorEvents } from './events'
import FormeoEditor from '../../js/editor'
import FormeoRenderer from '../../js/renderer'
import onLoadRender from './onLoadRender'

const editor = new FormeoEditor(editorOptions)
const FormJson = window.sessionStorage.getItem('formeo-formData') || null
const renderer = new FormeoRenderer(renderOptions, FormJson)

// append action buttons
editorButtons(editor, renderer)
// editorEvents(editor, renderer)
onLoadRender(renderer, FormJson)
