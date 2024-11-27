import startCase from 'lodash/startCase'

const editorActionButtonContainer = document.getElementById('editor-action-buttons')
const renderFormWrap = document.querySelector('.render-form')
const editorActions = (editor, renderer) => ({
  renderForm: () => {
    renderFormWrap.style.display = 'block'
    renderer.render(editor.formData)
  },
  logJSON: () => console.log(JSON.stringify(JSON.parse(editor.json), null, 2)),
  viewData: () => {
    for (const [key, val] of Object.entries(editor.formData)) {
      console.log(key, val)
    }
  },
  resetEditor: () => {
    window.sessionStorage.removeItem('formeo-formData')
    window.location.reload()
  },
  testData: () => {
    document.getElementById('submit-popover').addEventListener('click', () => {
      const textarea = document.querySelector('#formData-popover textarea')
      editor.formData = textarea.value
      textarea.value = ''
      textarea.closest('[popover]').hidePopover()
    })
  },
})

const buttonIdAttrsMap = {
  testData: { popovertarget: 'formData-popover' },
}
const getButtonAttrs = id => {
  const attrs = buttonIdAttrsMap[id] || {}
  return { id, type: 'button', ...attrs }
}

export const editorButtons = (editor, renderer) => {
  const buttonActions = editorActions(editor, renderer)
  const buttons = Object.entries(buttonActions).map(([id, cb]) => {
    const attrs = getButtonAttrs(id)
    const button = Object.assign(document.createElement('button'), attrs)
    for (const [key, value] of Object.entries(attrs)) {
      button.setAttribute(key, value)
    }
    const buttonText = document.createTextNode(startCase(id))
    button.appendChild(buttonText)
    button.addEventListener('click', cb, false)
    editorActionButtonContainer.appendChild(button)
    return button
  })

  return buttons
}
