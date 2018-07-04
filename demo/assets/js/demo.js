const isSite = window.location.href.indexOf('draggable.github.io') !== -1
const container = document.querySelector('.build-form')
const renderContainer = document.querySelector('.render-form')
const formeoOpts = {
  container: container,
  i18n: {
    preloaded: {
      'en-US': { 'row.makeInputGroup': ' Repeatable Region' },
    },
  },
  // allowEdit: false,
  controls: {
    sortable: false,
    groupOrder: ['common', 'html'],
    elements: [
      {
        tag: 'input',
        config: {
          label: 'Email',
        },
        meta: {
          group: 'common',
          icon: 'email',
        },
        attrs: {
          className: 'custom-email',
          type: 'email',
        },
        conditions: {
          logical: ['AND', 'OR', 'NOT']
        }
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
  events: {
    // onUpdate: console.log,
    // onSave: console.log
  },
  svgSprite: 'https://draggable.github.io/formeo/assets/img/formeo-sprite.svg',
  // debug: true,
  sessionStorage: true,
  editPanelOrder: ['attrs', 'options'],
}

const formeo = new window.Formeo(formeoOpts)
console.log(formeo)
let editing = true

// let debugWrap = document.getElementById('debug-wrap');
// let debugBtn = document.getElementById('debug-demo');
const localeSelect = document.getElementById('locale')
const toggleEdit = document.getElementById('renderForm')
const viewDataBtn = document.getElementById('viewData')
const resetDemo = document.getElementById('reloadBtn')

// debugBtn.onclick = function() {
//   debugWrap.classList.toggle('open');
// };

resetDemo.onclick = function() {
  window.sessionStorage.removeItem('formData')
  window.location.reload()
}

toggleEdit.onclick = evt => {
  document.body.classList.toggle('form-rendered', editing)
  if (editing) {
    formeo.render(renderContainer)
    evt.target.innerHTML = 'Edit Form'
  } else {
    evt.target.innerHTML = 'Render Form'
  }
  editing = !editing

  return editing
}

viewDataBtn.onclick = evt => {
  console.log(formeo.formData)
}

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
    let js
    js = d.createElement('script')
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
