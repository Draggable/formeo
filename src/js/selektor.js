import dom from './dom';
import helpers from './helpers';
// var dom = new DOM();

var defaults = {

};

export default class Selektor {
  constructor(options) {
    this.opts = Object.assign({}, defaults, options);
  }
}
