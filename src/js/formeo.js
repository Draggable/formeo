'use strict';
import '../sass/formeo.scss';
// import polyfills from './polyfills';
import helpers from './common/helpers';
import { data } from './common/data';
import events from './common/events';
import actions from './common/actions';
import DOM from './common/dom';
import { Controls } from './components/controls';
import Stage from './components/stage';

var dom = new DOM();

// Default options
var defaults = {
  dataType: 'json',
  debug: false,
  className: 'formeo',
  container: '.formeo',
  prefix: 'formeo-',
  svgSprite: 'assets/img/formeo-sprite.svg',
  events: {}
};

// Simple object config for the main part of formeo
var formeo = {};
var _formeo = {
  init: function(options, formData) {
    formeo.opts = Object.assign({}, defaults, options);
    data.init(formeo.opts, formData);
    formeo.formData = data.get();
    formeo.opts.formID = formeo.formData.id;
    _formeo.stage = new Stage(formeo.opts);
    formeo.controls = new Controls(formeo.opts);
    helpers.loadIcons(formeo.opts.svgSprite);
    events.init(formeo.opts.events);
    actions.init(formeo.opts.actions);
    this.render();
    return formeo;
  },
  render: function() {
    let controls = formeo.controls.dom,
      container = formeo.opts.container;
      // formeo.stage = _formeo.stage;

    if (typeof formeo.opts.container === 'string') {
      container = document.querySelector(formeo.opts.container);
    }

    let fbElem = {
        tag: 'div',
        attrs: {
          className: formeo.opts.className,
          id: formeo.opts.formID
        },
        content: [_formeo.stage, controls]
      },
      formeoElem = dom.create(fbElem);

    container.appendChild(formeoElem);

    events.formeoLoaded = new CustomEvent('formeoLoaded', {
      detail: {
        formeo: formeo
      }
    });

    document.dispatchEvent(events.formeoLoaded);
  }
};

// add Formeo to window so we can new it from anywhere;
window.Formeo = (options, formData) => {
  return _formeo.init(options, formData);
};
