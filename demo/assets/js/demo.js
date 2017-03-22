'use strict';
const isSite = (window.location.href.indexOf('draggable.github.io') !== -1);
let container = document.querySelector('.build-form');
let renderContainer = document.querySelector('.render-form');
let formeoOpts = {
  container: container,
  i18n: {
    preloaded: {
      'en-US': {'row.makeInputGroup': ' Repeatable Region'}
    }
  },
  // allowEdit: false,
  controls: {
    sortable: false,
    groupOrder: [
      'common',
      'html',
    ],
    elements: [
      {
        tag: 'input',
        attrs: {
          type: 'file',
          className: 'form-control'
        },
        config: {
          label: 'File Upload'
        },
        meta: {
          group: 'common',
          icon: 'upload',
          id: 'upload'
        },
        fMap: 'attrs.value'
      }, {
        tag: 'input',
        attrs: {
          type: 'number',
          className: 'form-control'
        },
        config: {
          label: 'Number',
          disabledAttrs: ['type']
        },
        meta: {
          group: 'common',
          icon: 'hash',
          id: 'number'
        },
        fMap: 'attrs.value'
      }, {
        tag: 'input',
        attrs: {
          type: 'hidden',
          value: 'my hidden value'
        },
        config: {
          label: 'Hidden',
          hideLabel: true,
        },
        meta: {
          group: 'common',
          icon: 'hidden',
          id: 'hidden'
        },
        fMap: 'attrs.value'
      }
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
      ]
    }
  },
  svgSprite: 'assets/img/formeo-sprite.svg',
  // debug: true,
  sessionStorage: true,
  editPanelOrder: ['attrs', 'options']
};
const formeo = new window.Formeo(formeoOpts);
let editing = true;

let debugWrap = document.getElementById('debug-wrap');
let debugBtn = document.getElementById('debug-demo');
let locale = document.getElementById('locale');
let toggleEdit = document.getElementById('renderForm');
let viewData = document.getElementById('viewData');
let reloadBtn = document.getElementById('reloadBtn');

debugBtn.onclick = function() {
  debugWrap.classList.toggle('open');
};

reloadBtn.onclick = function() {
  window.sessionStorage.removeItem('formData');
  location.reload();
};

toggleEdit.onclick = evt => {
  document.body.classList.toggle('form-rendered', editing);
  if (editing) {
    formeo.render(renderContainer);
    evt.target.innerHTML = 'Edit Form';
  } else {
    evt.target.innerHTML = 'Render Form';
  }

  return editing = !editing;
};

viewData.onclick = evt => {
  console.log(formeo.formData);
};

locale.addEventListener('change', function() {
  formeo.i18n.setLang(locale.value);
});

if (isSite) {
  ((window.gitter = {}).chat = {}).options = {
    room: 'draggable/formeo'
  };

  // Gitter
  (function(d) {
    let js;
    js = d.createElement('script');
    js.src = '//sidecar.gitter.im/dist/sidecar.v1.js';
    d.body.appendChild(js);
  }(document));

  // Facepoop
  (function(d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = '//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=940846562669162';
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Twitter
  (function(d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0],
      p = /^http:/.test(d.location) ? 'http' : 'https';
    if (!d.getElementById(id)) {
      js = d.createElement(s);
      js.id = id;
      js.src = p + '://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js, fjs);
    }
  })(document, 'script', 'twitter-wjs');

  // Google analytics
  (function(i, s, o, g, r, a, m) {
    i.GoogleAnalyticsObject = r;
    i[r] = i[r] || function() {
      (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

  ga('create', 'UA-79014176-2', 'auto');
  ga('send', 'pageview');
}
