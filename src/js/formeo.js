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
      i18n: {}
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

    if (opts.style) {
      helpers.ajax(opts.style, helpers.insertStyle);
    }

    // Ajax load svgSprite and inject into markup.
    if (opts.svgSprite) {
      helpers.ajax(opts.svgSprite, helpers.insertIcons);
    }

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
                  console.log(i18n.langs);
                  _this.render();
                },
                err => {
                  console.error('There was an error retrieving the language files', err);
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
