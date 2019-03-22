import './scripts'
import '../sass/demo.scss'
import { editorOptions, renderOptions } from './options'
import { editorButtons } from './actionButtons'
import { editorEvents } from './events'
import FormeoEditor from '../../js/editor'
import FormeoRenderer from '../../js/renderer'

const editor = new FormeoEditor(editorOptions)
const renderer = new FormeoRenderer(renderOptions)

// append action buttons
editorButtons(editor, renderer)
editorEvents(editor, renderer)
