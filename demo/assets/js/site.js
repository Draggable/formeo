'use strict';
var isSite = (window.location.href.indexOf('draggable.github.io') !== -1),
  formeoScript = isSite ? '/assets/js/formeo.min.js' : '../dist/formeo.min.js';

function readyState() {
  var script = this;
  if (!script.readyState || script.readyState === 'loaded' || script.readyState === 'complete') {
    script.onload = script.onreadystatechange = null;
    new window.Formeo({
      container: document.querySelector('.build-form'),
      style: isSite ? '/assets/css/formeo.min.css' : '../dist/formeo.min.css'
    });
  }
}

function getScript(formeoScript) {
  var script = document.createElement('script');
  script.appendChild(document.createTextNode(''));
  script.setAttribute('src', formeoScript);
  script.setAttribute('type', 'text/javascript');
  script.async = true;
  // Attach handlers for all browsers
  script.onload = script.onreadystatechange = readyState;
  document.body.appendChild(script);
}

getScript(formeoScript);
