'use strict';
import helpers from './helpers';

// Default options
var defaultActions = {
  add: {
    attr: (evt) => {
      let attr = window.prompt(evt.addAttributeMessage),
        val = String(window.prompt('Value', ''));
      if (attr) {
        evt.addAttributeAction(attr, val);
      }
    }
  }
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
    }
  }
};

export default actions;
