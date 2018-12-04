import './scripts'
import '../sass/demo.scss'
import { editorOptions } from './options'
import { editorButtons } from './actionButtons'
import { editorEvents } from './events'

const formeo = new window.FormeoEditor(editorOptions)
// const renderer = new window.FormeoRenderer(renderOptions)

// append action buttons
editorButtons(formeo)
editorEvents(formeo)
