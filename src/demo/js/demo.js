import './scripts'
import '../sass/demo.scss'
import { editorOptions } from './options'
import { editorButtons } from './actionButtons'
import { editorEvents } from './events'
import FormeoEditor from '../../js/editor'

const formeo = new FormeoEditor(editorOptions)
// const renderer = new window.FormeoRenderer(renderOptions)

// append action buttons
editorButtons(formeo)
editorEvents(formeo)
