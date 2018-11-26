import { editorActions } from './actionButtons'

// @todo add console
const logEvent = evt => {
  console.log(evt)
}

export const editorEvents = editor => {
  const controlFilter = document.getElementById('control-filter')
  const localeSelect = document.getElementById('locale')
  const formeoLocale = window.sessionStorage.getItem('formeo-locale')
  const onChangeFilterInput = ({ target: { value } }) => editor.controls.actions.filter(value)
  const onChangeLocale = ({ target: { value } }) => {
    window.sessionStorage.setItem('formeo-locale', value)
    editor.i18n.setLang(value)
  }
  controlFilter.addEventListener('input', onChangeFilterInput)
  if (formeoLocale) {
    localeSelect.value = formeoLocale
  }

  localeSelect.addEventListener('change', onChangeLocale, false)
}

document.addEventListener('formeoUpdated', logEvent, false)
