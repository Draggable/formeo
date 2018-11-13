const isSite = window.location.href.indexOf('draggable.github.io') !== -1
const container = document.querySelector('.build-form')
const renderContainer = document.querySelector('.render-form')
const external = {
  user: {
    isAuthenticated: true,
    userName: 'Kevin',
  },
}
const formeoOpts = {
  editorContainer: container,
  i18n: {
    location: '../assets/lang',
  },
  actions: {
    save: console.log,
  },
  external,
  // allowEdit: false,
  controls: {
    sortable: false,
    groupOrder: ['common', 'html'],
    disable: {
      // elements: ['button'],
    },
    elements: [
      {
        tag: 'input',
        config: {
          label: 'Email',
          disabledAttrs: ['type'],
          lockedAttrs: ['required', 'className']
        },
        meta: {
          group: 'common',
          id:'email',
          icon: '@',
        },
        attrs: {
          className: 'custom-email',
          type: 'email',
          required: true,
        },
      },
      //     {
      //   tag: 'input',
      //   attrs: {
      //     type: 'radio',
      //     required: false
      //   },
      //   config: {
      //     label: 'Radio Group',
      //     disabledAttrs: ['type']
      //   },
      //   meta: {
      //     group: 'common',
      //     icon: 'radio-group',
      //     id: 'radio'
      //   },
      //   options: (() => {
      //     let options = [1, 2, 3].map(i => {
      //       return {
      //         label: 'Radio ' + i,
      //         value: 'radio-' + i,
      //         selected: false
      //       };
      //     });
      //     let otherOption = {
      //         label: 'Other',
      //         value: 'other',
      //         selected: false
      //       };
      //     options.push(otherOption);
      //     return options;
      //   })(),
      //   action: {
      //     mouseover: evt => {
      //       console.log(evt);
      //       const {target} = evt;
      //       if (target.value === 'other') {
      //         const otherInput = target.cloneNode(true);
      //         otherInput.type = 'text';
      //         target.parentElement.appendChild(otherInput);
      //       }
      //     }
      //   }
      // },
    ],
    elementOrder: {
      common: [
        'button',
        'checkbox',
        'date-input',
        'hidden',
        'upload',
        'number',
        'radio',
        'select',
        'text-input',
        'textarea',
      ],
    },
  },
  config: {
    fields: {
      checkbox: {
        actionButtons: {
          buttons: ['edit'],
        },
      },
      'a33bcc32-c54c-46ed-9609-7cdb5b3dc511': {
        events: {
          onRender: element => {
            setTimeout(() => {
              formeo.Components.fields.get(element.id).toggleEdit(true)
              element.querySelector('.next-group').click()
            }, 333)
          },
        },
        panels: {
          attrs: {
            hideDisabled: true,
          },
          disabled: [
            // 'conditions'
          ],
        },
      },
    },
  },
  // events: {
  // onUpdate: console.log,
  // onSave: console.log
  // },
  svgSprite: './assets/formeo-sprite.svg',
  // style: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css',
  // debug: true,
  sessionStorage: true,
  editPanelOrder: ['attrs', 'options'],
}

const formeo = new window.FormeoEditor(formeoOpts)
const renderOptions = {
  container: renderContainer,
  external,
}

const renderer = new window.FormeoRenderer(renderOptions)

document.addEventListener(
  'formeoUpdated',
  evt => {
    renderer.render(formeo.formData)
  },
  false
)
console.log(formeo)
let editing = true

const localeSelect = document.getElementById('locale')

const buttonActions = {
  logJSON: () => console.log(formeo.json),
  reloadBtn: () => {
    window.sessionStorage.removeItem('formeo-formData')
    window.location.reload()
  },
  renderForm: evt => {
    document.body.classList.toggle('form-rendered', editing)
    if (editing) {
      renderer.render(formeo.formData)
      evt.target.innerHTML = 'Edit Form'
    } else {
      evt.target.innerHTML = 'Render Form'
    }
    editing = !editing

    return editing
  },
  viewData: () => {
    const formData = formeo.formData
    Object.entries(formData).forEach(([key, val]) => console.log(key, val))
  },
}

Object.entries(buttonActions).forEach(([key, val]) => {
  const button = document.getElementById(key)
  button.addEventListener('click', val, false)
})

const formeoLocale = window.sessionStorage.getItem('formeo-locale')
if (formeoLocale) {
  localeSelect.value = formeoLocale
}

localeSelect.addEventListener('change', function() {
  window.sessionStorage.setItem('formeo-locale', localeSelect.value)
  formeo.i18n.setLang(localeSelect.value)
})

document.getElementById('control-filter').addEventListener('input', function(e) {
  formeo.controls.actions.filter(e.target.value)
})

if (isSite) {
  ;((window.gitter = {}).chat = {}).options = {
    room: 'draggable/formeo',
  }

  // Gitter
  ;(function(d) {
    const js = d.createElement('script')
    js.src = '//sidecar.gitter.im/dist/sidecar.v1.js'
    d.body.appendChild(js)
  })(document)

  // Facepoop
  ;(function(d, s, id) {
    let js,
      fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) {
      return
    }
    js = d.createElement(s)
    js.id = id
    js.src = '//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=940846562669162'
    fjs.parentNode.insertBefore(js, fjs)
  })(document, 'script', 'facebook-jssdk')

  // Twitter
  ;(function(d, s, id) {
    let js,
      fjs = d.getElementsByTagName(s)[0],
      p = /^http:/.test(d.location) ? 'http' : 'https'
    if (!d.getElementById(id)) {
      js = d.createElement(s)
      js.id = id
      js.src = p + '://platform.twitter.com/widgets.js'
      fjs.parentNode.insertBefore(js, fjs)
    }
  })(document, 'script', 'twitter-wjs')

  // Google analytics
  ;(function(i, s, o, g, r, a, m) {
    i.GoogleAnalyticsObject = r
    ;(i[r] =
      i[r] ||
      function() {
        ;(i[r].q = i[r].q || []).push(arguments)
      }),
      (i[r].l = 1 * new Date())
    ;(a = s.createElement(o)), (m = s.getElementsByTagName(o)[0])
    a.async = 1
    a.src = g
    m.parentNode.insertBefore(a, m)
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga')

  ga('create', 'UA-79014176-2', 'auto')
  ga('send', 'pageview')
}
