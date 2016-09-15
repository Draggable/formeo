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
      className: 'formeo',
      container: '.formeo',
      prefix: 'formeo-',
      svgSprite: 'assets/img/formeo-sprite.svg',
      events: {},
      actions: {},
      controls: {},
      i18n: {
        langsDir: 'assets/lang/',
        langs: [
          'en-US'
        ]
      }
    };

    let _this = this;

    this.container = options.container || defaults.container;
    // Remove `container` property before extending because container may be Element
    delete options.container;

    opts = helpers.extend(defaults, options);

    if (opts.debug) {
      opts.actions.debug = opts.events.debug = true;
    }

    data.init(opts, formData);

    if (opts.style) {
      helpers.ajax(opts.style, helpers.insertStyle);
    }

    if (opts.svgSprite) {
      helpers.ajax(opts.svgSprite, helpers.insertIcons);
    }

    i18n.init(opts.i18n)
      .then(function() {
          formeo.formData = data.get();
          _this.formID = opts.formID = formeo.formData.id;
          _this.stage = new Stage(opts, _this.formID);
          formeo.controls = new Controls(opts.controls, _this.formID);
          events.init(opts.events);
          actions.init(opts.actions);
          _this.render();
        },
        err => {
          console.error('There was an error retrieving the language files', err);
        });

    return formeo;
  }

  render() {
    let controls = formeo.controls.dom,
      container = this.container;
    formeo.stage = this.stage;

    if (typeof container === 'string') {
      container = document.querySelector(opts.container);
    }

    let formeoElemConfig = {
        tag: 'div',
        attrs: {
          className: opts.className,
          id: opts.formID
        },
        content: [this.stage, controls]
      },
      formeoElem = dom.create(formeoElemConfig);

    container.appendChild(formeoElem);

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
