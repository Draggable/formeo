'use strict';

import helpers from './helpers';

export class Throttle {

  /**
   * Add an event and register callbacks
   * @param {String}   event [description]
   * @param {Function} cb    [description]
   */
  add(event, cb, elem = window) {
    let events = this;
    events[event] = events[event] || { callbacks: [] };
    events.addCallback(event, cb);
    let callback = function(evt) {
      events.throttle(events[event], evt);
    };
    // if (!events[event].callbacks.length) {
    elem.addEventListener(event, callback);
    // }
    return callback;
  }

  remove(event, cb, elem = window) {
    let events = this;
    events[event] = events[event] || { callbacks: [] };
    events.addCallback(event, cb);
    let callback = function(evt) {
      events.throttle(events[event], evt);
    };
    // if (!events[event].callbacks.length) {
    elem.addEventListener(event, callback);
    // }
    return callback;
  }

  /**
   * Adds a callback to an array of callbacks for an event
   * @param {String}   event
   * @param {Function} cb
   */
  addCallback(event, cb) {
    let events = this;
    if (cb) {
      events[event].callbacks.push(cb);
    }
  }

  /**
   * Run the callbacks for a specific event
   * @param  {Object} event
   */
  runCallbacks(event, evt) {
    event.callbacks.forEach(function(callback) {
      callback(evt);
    });

    event.running = false;
  }

  /**
   * Throttle an event
   * @param  {Object} event {running, callbacks}
   */
  throttle(event, evt) {
    let events = this;

    if (!event.running) {
      event.running = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(function() {
          events.runCallbacks(event, evt);
        });
      } else {
        setTimeout(events.runCallbacks.bind(event), 66);
      }
    }
  }

}

var animate = {

  /**
   * Gets the computed style for an element
   */
  getStyle: (elem, property = false) => {
    var style;
    if (window.getComputedStyle) {
      style = window.getComputedStyle(elem, null);

    } else if (elem.currentStyle) {
      style = elem.currentStyle;
    }

    return property ? style[property] : style;
  },

  fadeOut: (elem, duration = 250) => {
    var increment = 1 / (duration / 60);
    elem.style.opacity = 1;
    (function fade() {
      var val = Number(elem.style.opacity) - increment;
      if (val > 0) {
        elem.style.opacity = val;
        requestAnimationFrame(fade);
      } else {
        elem.remove();
      }
    })();
  },

  slideDown: (elem, duration = 250, cb = false) => {
    elem.style.display = 'block';
    elem.style.overflow = 'hidden';
    let height = parseInt(animate.getStyle(elem, 'height'), 10);
    var increment = height / (duration / 60);
    elem.style.height = '0px';
    (function slideDown() {
      var curHeight = parseFloat(elem.style.height),
        val = curHeight + increment;
      if (curHeight < height) {
        elem.style.height = (val + 'px');
        requestAnimationFrame(slideDown);
      } else {
        // reset height to be used by slideUp
        elem.style.height = height + 'px';
        if (cb) {
          cb(elem);
        }
      }
    })();
  },

  slideUp: (elem, duration = 250, cb = false) => {
    let height = parseInt(animate.getStyle(elem, 'height'), 10);
    elem.style.overflow = 'hidden';
    elem.style.height = height + 'px';
    var increment = parseFloat(height / (duration / 60)).toFixed(2);
    (function slideUp() {
      var curHeight = parseInt(elem.style.height, 10),
        val = (curHeight - increment);
      if (val > 0) {
        elem.style.height = (val + 'px');
        requestAnimationFrame(slideUp);
      } else {
        elem.style.display = 'none';
        // reset height to be used by slideDown
        // elem.style.height = height + 'px';
        elem.style.height = 'auto';
        if (cb) {
          cb(elem);
        }
      }
    })();
  },

  slideToggle: (elem, duration = 250) => {
    let isHidden = (animate.getStyle(elem, 'display') === 'none');

    if (isHidden) {
      animate.slideDown(elem, duration);
    } else {
      animate.slideUp(elem, duration);
    }
  }

  // animation.translateX = (distance, duration = 250) => {
  //   var increment = distance / (duration / 60);
  //   (function translate() {
  //     var val = Number(elem.style.opacity) - increment;
  //     if (val > 0) {
  //       elem.style.transform = `translate(${distance}px, 0)`;
  //       requestAnimationFrame(translate);
  //     }
  //   })();
  // }
};

export default animate;
