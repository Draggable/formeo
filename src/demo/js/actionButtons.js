import startCase from 'lodash/startCase'

const editorActionButtonContainer = document.getElementById('editor-action-buttons')
const editorActions = (editor, renderer) => ({
  renderForm: () => renderer.render(editor.formData),
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

// fbPromise.then(function(fb) {
//   const apiBtns = {
//     ...builderActions,
//     ...renderActions,
//     ...demoActions,
//   }

//   Object.keys(apiBtns).forEach(function(action) {
//     document.getElementById(action).addEventListener('click', function(e) {
//       apiBtns[action]()
//     })
//   })

//   document.querySelectorAll('.editForm').forEach(element => element.addEventListener('click', toggleEdit), false)
//   const langSelect = document.getElementById('setLanguage')
//   const savedLocale = window.sessionStorage.getItem(localeSessionKey)

//   if (savedLocale && savedLocale !== defaultLocale) {
//     langSelect.value = savedLocale
//     fb.actions.setLang(savedLocale)
//   }

//   langSelect.addEventListener(
//     'change',
//     ({ target: { value: lang } }) => {
//       window.sessionStorage.setItem(localeSessionKey, lang)
//       fb.actions.setLang(lang)
//     },
//     false
//   )
// })
