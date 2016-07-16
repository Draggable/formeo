'use strict';
import helpers from './helpers';

// Default options
var defaultActions = {
  add: {
    attr: (evt) => {
      let attr = window.prompt(evt.message.attr),
        val;
      if (attr) {
        val = String(window.prompt(evt.message.value, ''));
      }
      if (attr) {
        evt.addAction(attr, val);
      }
    },
    option: (evt) => {
      evt.addAction();
    }
  },
  click: {
    btn: (evt) => {
      evt.action();
    }
  },
  save: (evt) => {}
};

/**
 * Events class is used to register actions and throttle their callbacks
 */
var actions = {
  init: function(options) {
    this.opts = Object.assign({}, defaultActions, options);
    return this;
  },
  add: {
    attrs: (evt) => {
      actions.opts.add.attr(evt);
    },
    options: (evt) => {
      actions.opts.add.option(evt);
    }
  },
  click: {
    btn: (evt) => {
      actions.opts.click.btn(evt);
    }
  },
  save: () => {}
};

export default actions;
