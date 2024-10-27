import startCase from 'lodash/startCase'

const editorActionButtonContainer = document.getElementById('editor-action-buttons')
const renderFormWrap = document.querySelector('.render-form')
const editorActions = (editor, renderer) => ({
  renderForm: () => {
    renderFormWrap.style.display = 'block'
    renderer.render(editor.formData)
  },
  logJSON: () => console.log(editor.json),
  viewData: () => {
    Object.entries(editor.formData).forEach(([key, val]) => console.log(key, val))
  },
  resetEditor: () => {
    window.sessionStorage.removeItem('formeo-formData')
    window.location.reload()
  },
})

export const editorButtons = (editor, renderer) => {
  const buttonActions = editorActions(editor, renderer)
  const buttons = Object.entries(buttonActions).map(([id, cb]) => {
    const attrs = { id, type: 'button' }
    const button = Object.assign(document.createElement('button'), attrs)
    const buttonText = document.createTextNode(startCase(id))
    button.appendChild(buttonText)
    button.addEventListener('click', cb, false)
    editorActionButtonContainer.appendChild(button)
    return button
  })

  return buttons
}
