'use strict';
import '../sass/formeo.scss';
import helpers from './common/helpers';
import { data } from './common/data';
import events from './common/events';
import actions from './common/actions';
import DOM from './common/dom';
import i18n from 'mi18n';
import { Controls } from './components/controls';
import Stage from './components/stage';

var dom = new DOM();

// Simple object config for the main part of formeo
var formeo = {};
var opts = {};
class Formeo {
  constructor(options, formData) {
    // Default options
    const defaults = {
      dataType: 'json',
      debug: false,
      sessionStorage: false,
      className: 'formeo',
      container: '.formeo-wrap',
      prefix: 'formeo-',
      // svgSprite: null, // change to null
      iconFontFallback: null, // accepts 'glyphicons' || 'font-awesome' || 'fontello'
      events: {},
      actions: {},
      controls: {},
      i18n: {
        langs: [
          'en-US'
        ],
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

    let _this = this;

    _this.container = options.container || defaults.container;
    if (typeof _this.container === 'string') {
      _this.container = document.querySelector(_this.container);
    }

    // Remove `container` property before extending because container may be Element
    delete options.container;

    opts = helpers.extend(defaults, options);

    if (opts.debug) {
      opts.actions.debug = opts.events.debug = true;
    }

    data.init(opts, formData);
    events.init(opts.events);
    actions.init(opts.actions);

    // Load remote resources such as css and svg sprite
    _this.loadResources().then(() => {
      _this.init.call(_this);
    });

    return formeo;
  }

  loadResources() {
    let promises = [];

    if (opts.style) {
      promises.push(helpers.ajax(opts.style, helpers.insertStyle));
    }

    // Ajax load svgSprite and inject into markup.
    if (opts.svgSprite) {
      promises.push(helpers.ajax(opts.svgSprite, helpers.insertIcons));
    }

    return window.Promise.all(promises);
  }

  init() {
    let _this = this;
    i18n.init(opts.i18n)
      .then(function() {
          formeo.formData = data.get();
          _this.formID = opts.formID = formeo.formData.id;
          _this.stage = new Stage(opts, _this.formID);
          formeo.controls = new Controls(opts.controls, _this.formID);
          formeo.i18n = {
            setLang: locale => {
              let loadLang = i18n.setCurrent.call(i18n, locale);
              loadLang.then(function() {
                  _this.stage = new Stage(opts, _this.formID);
                  formeo.controls = new Controls(opts.controls, _this.formID);
                  _this.render();
                },
                err => {
                  err.message = 'There was an error retrieving the language files';
                  console.error(err);
                });
            }
          };
          _this.render();
        },
        err => {
          console.error('There was an error retrieving the language files', err);
        });

    return formeo;
  }

  render() {
    let _this = this,
      controls = formeo.controls.dom;
    formeo.stage = _this.stage;

    let formeoElemConfig = {
        tag: 'div',
        attrs: {
          className: opts.className,
          id: opts.formID
        },
        content: [_this.stage, controls]
      },
      formeoElem = dom.create(formeoElemConfig);

    _this.container.innerHTML = '';
    _this.container.appendChild(formeoElem);

    events.formeoLoaded = new CustomEvent('formeoLoaded', {
      detail: {
        formeo: formeo
      }
    });

    document.dispatchEvent(events.formeoLoaded);
  }
}

if (window !== undefined) {
  window.Formeo = Formeo;
}

export default Formeo;
