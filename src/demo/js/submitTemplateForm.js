const FormData = require('form-data')
const axios = require('axios')
const { success, error } = require('@pnotify/core')

const loaderBg = document.getElementById('hider') || Object.assign(document.createElement('div'), { id: 'hider' })
const loaderIm =
  document.getElementById('loadermodaldiv') || Object.assign(document.createElement('div'), { id: 'loadermodaldiv' })

const submitTemplateForm = ftContent => {
  const formElement = document.forms[0]
  const formAction = formElement.attributes.action.value

  const form = new FormData(formElement)
  var formContent = JSON.stringify(ftContent)
  form.append('ft_content', formContent)

  loaderBg.style.display = 'block'
  loaderIm.style.display = 'block'
  axios
    .post(formAction, form)
    .then(function(response) {
      loaderBg.style.display = 'none'
      loaderIm.style.display = 'none'
      const result = response.data
      if (result.flag === 'success') {
        success('Changes saved successfully')

        if (typeof result.msg === 'number') document.location.href = formAction + result.msg
      } else {
        error({
          text: result.msg,
          textTrusted: true,
        })
      }
    })
    .catch(function(jqxhr) {
      loaderBg.style.display = 'none'
      loaderIm.style.display = 'none'
      error('Unknown error, try again later.')
    })
}

export default submitTemplateForm
