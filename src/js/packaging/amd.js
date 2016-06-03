//
// Minimal Modal AMD Export
//
if (typeof(module) !== 'undefined') {
  module.exports = window.formBuilder;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    'use strict';
    return window.formBuilder;
  });
}
