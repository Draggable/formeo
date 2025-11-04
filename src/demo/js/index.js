import './scripts.js'
import '../sass/demo.scss'

import { FormeoEditor, FormeoRenderer } from '../../lib/js/index.js'
import { editorButtons } from './actionButtons.js'
import { editorEvents } from './events.js'
import { editorOptions, renderOptions } from './options/index.js'

const editor = new FormeoEditor(editorOptions)
const renderer = new FormeoRenderer(renderOptions)

// append action buttons
editorButtons(editor, renderer)
editorEvents(editor, renderer)
