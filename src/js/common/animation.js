
/**
 * Throttle class provides and easy way for binding
 * and throttling events. Helpful for events like window
 * scroll that are fired often.
 */
export class Throttle {

  /**
   * Add an event and register callbacks
   * @param {String}   event
   * @param {Function} cb
   * @param {Object}   elem DOM element we are binging to
   * @return {Function} throttled cb
   */
  add(event, cb, elem = window) {
    let events = this;
    events[event] = events[event] || {callbacks: []};
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
   * @param  {Object} evt response from fired event
   */
  runCallbacks(event, evt) {
    event.callbacks.forEach(function(callback) {
      callback(evt);
    });

    event.running = false;
  }

  /**
   * Throttle an event
   * @param  {Object} event in queue
   * @param  {Object} evt response from fired event
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

const animate = {

  /**
   * Gets the computed style for an element
   * @param  {[type]}  elem     [description]
   * @param  {Boolean} property [description]
   * @return {[type]}           [description]
   */
  getStyle: (elem, property = false) => {
    let style;
    if (window.getComputedStyle) {
      style = window.getComputedStyle(elem, null);
    } else if (elem.currentStyle) {
      style = elem.currentStyle;
    }

    return property ? style[property] : style;
  },

  fadeOut: (elem, duration = 250) => {
    let increment = 1 / (duration / 60);
    elem.style.opacity = 1;
    (function fade() {
      let val = Number(elem.style.opacity) - increment;
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
    const style = animate.getStyle(elem);
    let overFlowBack = style.overflow;
    elem.style.overflow = 'hidden';
    let height = parseInt(style.height, 10);
    let increment = height / (duration / 60);
    elem.style.height = '0px';
    (function slideDown() {
      let curHeight = parseFloat(elem.style.height);
      let val = curHeight + increment;
      if (curHeight < height) {
        elem.style.height = (val + 'px');
        requestAnimationFrame(slideDown);
      } else {
        elem.style.overflow = overFlowBack;
        // reset height to be used by slideUp
        // elem.style.height = height + 'px';
        elem.style.height = 'auto';
        if (cb) {
          cb(elem);
        }
      }
    })();
  },

  slideUp: (elem, duration = 250, cb = false) => {
    let style = animate.getStyle(elem);
    let height = parseInt(style.height);
    let overFlowBack = style.overflow;
    elem.style.overflow = 'hidden';
    elem.style.height = height + 'px';
    let defMinHeight = style.minHeight;
    elem.style.minHeight = 'auto';
    let increment = parseFloat(height / (duration / 60)).toFixed(2);

    (function slideUp() {
      let curHeight = parseInt(elem.style.height, 10);
      let val = (curHeight - increment);
      if (val > 0) {
        elem.style.height = val + 'px';
        requestAnimationFrame(slideUp);
      } else {
        elem.style.overflow = overFlowBack;
        elem.style.display = 'none';
        elem.style.minHeight = defMinHeight;
        delete elem.style.height;
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
  },

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
