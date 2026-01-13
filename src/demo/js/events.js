export const editorEvents = editor => {
  const controlFilter = document.getElementById('control-filter')
  const localeSelect = document.getElementById('locale')
  const formeoLocale = globalThis.sessionStorage.getItem('formeo-locale')
  const onChangeFilterInput = ({ target: { value } }) => editor.controls.actions.filter(value)
  const onChangeLocale = ({ target: { value } }) => {
    globalThis.sessionStorage.setItem('formeo-locale', value)
    editor.i18n.setLang(value)
  }
  controlFilter.addEventListener('input', onChangeFilterInput)
  localeSelect.value = formeoLocale || 'en-US'

  localeSelect.addEventListener('change', onChangeLocale, false)
}
