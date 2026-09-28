import Editor from './editor'
import Renderer from './renderer'

if (typeof window !== 'undefined') {
  window.FormeoEditor = Editor
  window.FormeoRenderer = Renderer
}

export const FormeoEditor = Editor
export const FormeoRenderer = Renderer
