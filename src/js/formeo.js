'use strict';
import '../sass/formeo.scss';
import h from './common/helpers';
import {data, formData} from './common/data';
import events from './common/events';
import actions from './common/actions';
import dom from './common/dom';
import i18n from 'mi18n';
import {Controls} from './components/controls';
import Stage from './components/stage';

// Simple object config for the main part of formeo
const formeo = {
  get formData() {
    return data.json;
  }
};
let opts = {};

/**
 * Main class
 */
class Formeo {
  /**
   * [constructor description]
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData [description]
   * @return {Object}          formeo references and actions
   */
  constructor(options, userFormData) {
    // Default options
    const defaults = {
      allowEdit: true,
      dataType: 'json',
      debug: false,
      sessionStorage: false,
      container: '.formeo-wrap',
      prefix: 'formeo-',
      // svgSprite: null, // change to null
      iconFontFallback: null, // 'glyphicons' || 'font-awesome' || 'fontello'
      events: {},
      actions: {},
      controls: {},
      config: {
        rows: {},
        columns: {},
        fields: {}
      },
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
            'column': 'Column',
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
            'layout': 'Layout',
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
            'row.makeInputGroup': 'Make this row an input group.',
            //eslint-disable-next-line
            'row.makeInputGroupDesc': 'Input Groups enable users to add sets of inputs at a time.',
            'save': 'Save',
            'select': 'Select',
            'selectColor': 'Select Color',
            'selectOptions': 'Options',
            'selectionsMessage': 'Allow Multiple Selections',
            'settings': 'Settings',
            'separator': 'Separator',
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

    // Remove `container` property before extending because container
    // may be Element
    delete options.container;

    opts = h.extend(defaults, options);
    dom.setConfig = opts.config;

    data.init(opts, userFormData);
    events.init(opts.events);
    actions.init(opts.actions);
    formeo.render = renderTarget => dom.renderForm.call(dom, renderTarget);

    // Load remote resources such as css and svg sprite
    _this.loadResources().then(() => {
      if (opts.allowEdit) {
        formeo.edit = _this.init.bind(_this);
        _this.init.call(_this);
      }
    });

    return formeo;
  }

  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  loadResources() {
    let promises = [];

    if (opts.style) {
      promises.push(h.ajax(opts.style, h.insertStyle));
    }

    // Ajax load svgSprite and inject into markup.
    if (opts.svgSprite) {
      promises.push(h.ajax(opts.svgSprite, h.insertIcons));
    }

    return window.Promise.all(promises);
  }

  /**
   * Formeo initializer
   * @return {Object} References to formeo instance,
   * dom elements, actions events and more.
   */
  async init() {
    let _this = this;
    await i18n.init(opts.i18n);
    _this.formID = formData.id;
    formeo.controls = new Controls(opts.controls, _this.formID);
    _this.stages = _this.buildStages();
    formeo.i18n = {
      setLang: locale => {
        let loadLang = i18n.setCurrent.call(i18n, locale);
        loadLang.then(function() {
            _this.stages = _this.buildStages();
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

    return formeo;
  }

  /**
   * Generate the stages we will drag out elements to
   * @return {Object} stages map
   */
  buildStages() {
    let stages = [];
    const createStage = stageID => new Stage(opts, stageID);
    if (formData.stages.size) {
      formData.stages.forEach((stageConf, stageID) => {
        stages.push(createStage(stageID));
      });
    } else {
      stages.push(createStage());
    }

    return stages;
  }

  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    let _this = this;
    let controls = formeo.controls.element;

    let elemConfig = {
        tag: 'div',
        attrs: {
          className: 'formeo formeo-editor',
          id: _this.formID
        },
        content: [_this.stages, controls]
      };
    let formeoElem = dom.create(elemConfig);

    _this.container.innerHTML = '';
    _this.container.appendChild(formeoElem);

    _this.stages.forEach(stageWrap => {
      let stage = stageWrap.childNodes[0];
      stage.style.minHeight = dom.getStyle(controls, 'height');
    });

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
