import startCase from 'lodash/startCase'
import submitTemplateForm from './submitTemplateForm'

const editorActionButtonContainer = document.querySelectorAll('.editor-action-buttons')
const editorActions = (editor, renderer) => ({
  // renderForm: () => renderer.render(editor.formData),
  // logJSON: () => console.log(editor.json),
  publish: () => submitTemplateForm(editor.formData),
  /* viewData: () => {
		Object.entries(editor.formData).forEach(([key, val]) => console.log(key, val))
	},
	resetEditor: () => {
		window.sessionStorage.removeItem('formeo-formData')
		window.location.reload()
	}, */
})

export const editorButtons = (editor, renderer) => {
  const buttonActions = editorActions(editor, renderer)
  const buttons = Object.entries(buttonActions).map(([id, cb]) => {
    var button = []
    for (const container of editorActionButtonContainer) {
      const attrs = {
        // id,
        type: 'button',
        className: 'btn btn-info btn-sm btn-flat pull-right publish-form m-l-5',
      }
      const btn = Object.assign(document.createElement('button'), attrs)
      const buttonText = document.createTextNode(startCase(id))
      btn.appendChild(buttonText)
      btn.addEventListener('click', cb, false)

      container.appendChild(btn)
      button.push(btn)
    }

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
