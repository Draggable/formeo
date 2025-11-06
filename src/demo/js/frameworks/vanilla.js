import { FormeoEditor, FormeoRenderer } from '../../../lib/js/index.js'
import { editorButtons } from '../actionButtons.js'
import { editorEvents } from '../events.js'
import { editorOptions, renderOptions } from '../options/index.js'

export async function loadVanillaDemo(container) {
  // Create the vanilla demo structure
  container.innerHTML = `
    <form class="build-form"></form>
    <div class="render-form"></div>
  `

  const editor = new FormeoEditor(editorOptions)
  const renderer = new FormeoRenderer(renderOptions)

  // append action buttons
  editorButtons(editor, renderer)
  editorEvents(editor)

  return {
    editor,
    renderer,
    cleanup: () => {
      // Cleanup any resources if needed
      if (editor?.destroy) {
        editor.destroy()
      }
      if (renderer?.destroy) {
        renderer.destroy()
      }

      // Cleanup action buttons
      const actionButtonsContainer = document.getElementById('editor-action-buttons')
      if (actionButtonsContainer) {
        actionButtonsContainer.innerHTML = ''
      }
    },
  }
}
