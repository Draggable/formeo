const editorActionButtonContainer = document.getElementById('editor-action-buttons')
const editorActions = editor => ({
  logJSON: () => console.log(editor.json),
  reloadBtn: () => {
    window.sessionStorage.removeItem('formeo-formData')
    window.location.reload()
  },
  renderForm: evt => {
    console.log(evt)
    // document.body.classList.toggle('form-rendered', editing)
    // if (editing) {
    //   renderer.render(editor.formData)
    //   evt.target.innerHTML = 'Edit Form'
    // } else {
    //   evt.target.innerHTML = 'Render Form'
    // }
    // editing = !editing

    // return editing
  },
  viewData: () => {
    Object.entries(editor.formData).forEach(([key, val]) => console.log(key, val))
  },
})

export const editorButtons = editor => {
  const buttonActions = editorActions(editor)
  const buttons = Object.entries(buttonActions).map(([id, cb]) => {
    const attrs = { id, type: 'button' }
    const button = Object.assign(document.createElement('button'), attrs)
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
