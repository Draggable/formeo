'use strict';
var isSite = (window.location.href.indexOf('draggable.github.io') !== -1),
  formeo;

function readyState() {
  var script = this;
  if (!script.readyState || script.readyState === 'loaded' || script.readyState === 'complete') {
    script.onload = script.onreadystatechange = null;

    var container = document.querySelector('.build-form');
    var formeoOpts = {
      container: container,
      debug: true,
      editPanelOrder: ['attrs', 'options'],
      style: isSite ? '/formeo/assets/css/formeo.min.css' : '../dist/formeo.min.css',
      i18n: {
        preloaded: {
          'en-US': {
            'action.add.attrs.attr': 'What attribute would you like to add?',
            'action.add.attrs.value': 'Default Value',
            'addOption': 'Add Option',
            'allFieldsRemoved': 'All fields were removed.',
            'allowSelect': 'Allow Select',
            'attribute': 'Attribute',
            'attributes': 'Attributes',
            'attrs.className': 'Class',
            'attrs.type': 'Type',
            'autocomplete': 'Autocomplete',
            'button': 'Button',
            'cannotBeEmpty': 'This field cannot be empty',
            'checkbox': 'Checkbox',
            'checkboxGroup': 'Checkbox Group',
            'checkboxes': 'Checkboxes',
            'class': 'Class',
            'clear': 'Clear',
            'clearAll': 'Clear',
            'clearAllMessage': 'Are you sure you want to clear all fields?',
            'close': 'Close',
            'commonFields': 'Common Fields',
            'confirmClearAll': 'Are you sure you want to remove all fields?',
            'content': 'Content',
            'control': 'Control',
            'controlGroups.nextGroup': 'Next Group',
            'controlGroups.prevGroup': 'Previous Group',
            'copy': 'Copy To Clipboard',
            'dateField': 'Date Field',
            'description': 'Help Text',
            'descriptionField': 'Description',
            'devMode': 'Developer Mode',
            'divider': 'Divider',
            'editNames': 'Edit Names',
            'editXML': 'Edit XML',
            'editorTitle': 'Form Elements',
            'en - US': 'English',
            'field': 'Field',
            'fieldNonEditable': 'This field cannot be edited.',
            'fieldRemoveWarning': 'Are you sure you want to remove this field?',
            'fieldVars': 'Field Variables',
            'fileUpload': 'File Upload',
            'formUpdated': 'Form Updated',
            'getStarted': 'Drag a field from the right to this area',
            'group': 'Group',
            'header': 'Header',
            'hidden': 'Hidden Input',
            'hide': 'Edit',
            'htmlElements': 'HTML Elements',
            'input.date': 'Date',
            'input.text': 'Text',
            'label': 'Label',
            'labelCount': '{label} {count}',
            'labelEmpty': 'Field Label cannot be empty',
            'limitRole': 'Limit access to one or more of the following roles:',
            'mandatory': 'Mandatory',
            'maxlength': 'Max Length',
            'meta.group': 'Group',
            'meta.icon': 'Ico',
            'meta.label': 'Label',
            'minOptionMessage': 'This field requires a minimum of 2 options',
            'name': 'Name',
            'no': 'No',
            'off': 'Off',
            'on': 'On',
            'option': 'Option',
            'optionEmpty': 'Option value required',
            'optionLabel': 'Option {count}',
            'optional': 'optional',
            'options': 'Options',
            'panelEditButtons.attrs': '+ Attribute',
            'panelEditButtons.options': '+ Option',
            'panelLabels.attrs': 'Attrs',
            'panelLabels.config': 'Config',
            'panelLabels.meta': 'Meta',
            'panelLabels.options': 'Options',
            'paragraph': 'Paragraph',
            'placeholder': 'Placeholder',
            'placeholder.className': 'space separated classes',
            'placeholder.email': 'Enter you email',
            'placeholder.label': 'Label',
            'placeholder.password': 'Enter your password',
            'placeholder.placeholder': 'Placeholder',
            'placeholder.text': 'Enter some Text',
            'placeholder.textarea': 'Enter a lot of text',
            'placeholder.value': 'Value',
            'preview': 'Preview',
            'radio': 'Radio',
            'radioGroup': 'Radio Group',
            'remove': 'Remove',
            'removeMessage': 'Remove Element',
            'required': 'Required',
            'richText': 'Rich Text Editor',
            'roles': 'Access',
            'row': 'Row',
            'row.settings.fieldsetWrap': 'Wrap row in a &lt;fieldset&gt; tag',
            'row.settings.fieldsetWrap.aria': 'Wrap Row in Fieldset',
            'save': 'Save',
            'select': 'Select',
            'selectColor': 'Select Color',
            'selectOptions': 'Options',
            'selectionsMessage': 'Allow Multiple Selections',
            'settings': 'Settings',
            'size': 'Size',
            'sizes': 'Sizes',
            'sizes.lg': 'Large',
            'sizes.m': 'Default',
            'sizes.sm': 'Small',
            'sizes.xs': 'Extra Small',
            'style': 'Style',
            'styles': 'Styles',
            'styles.btn': 'Button Style',
            'styles.btn.danger': 'Danger',
            'styles.btn.default': 'Default',
            'styles.btn.info': 'Info',
            'styles.btn.primary': 'Primary',
            'styles.btn.success': 'Success',
            'styles.btn.warning': 'Warning',
            'subtype': 'Type',
            'text': 'Text Field',
            'textArea': 'Text Area',
            'textarea': 'Textarea',
            'toggle': 'Toggle',
            'viewXML': '</>',
            'warning': 'Warning!',
            'yes': 'Yes'
          }
        }
      }
    };
    formeo = new window.Formeo(formeoOpts);
    postInit(formeo);
  }
}

function postInit(formeo) {
  let debugWrap = document.getElementById('debug-wrap'),
    debugBtn = document.getElementById('debug-demo'),
    locale = document.getElementById('locale');
  debugBtn.onclick = function() {
    debugWrap.classList.toggle('open');
  };

  locale.addEventListener('change', function() {
    formeo.i18n.setLang(locale.value);
  });
}

(function getScript() {
  var formeoScript = isSite ? '/formeo/assets/js/formeo.min.js' : '../dist/formeo.min.js',
    script = document.createElement('script');
  script.appendChild(document.createTextNode(''));
  script.setAttribute('src', formeoScript);
  script.setAttribute('type', 'text/javascript');
  script.async = true;
  // Attach handlers for all browsers
  script.onload = script.onreadystatechange = readyState;
  document.body.appendChild(script);
})();

if (isSite) {

  ((window.gitter = {}).chat = {}).options = {
    room: 'draggable/formeo'
  };

  // Gitter
  (function(d) {
    var js;
    js = d.createElement('script');
    js.src = '//sidecar.gitter.im/dist/sidecar.v1.js';
    d.body.appendChild(js);
  }(document));

  // Facepoop
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
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
    var js, fjs = d.getElementsByTagName(s)[0],
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
