import './scripts.js'
import '../sass/demo.scss'
import { editorOptions, renderOptions } from './options/index.js'
import { editorButtons } from './actionButtons.js'
import { editorEvents } from './events.js'

import { FormeoEditor, FormeoRenderer } from 'formeo'

const editor = new FormeoEditor(editorOptions)
const renderer = new FormeoRenderer(renderOptions)

// append action buttons
editorButtons(editor, renderer)
editorEvents(editor, renderer)
