(function($) {
  window.jQuery.fn.formeo = function(options, formData) {
    return this.each(function() {
      var element = this,
        formeo;
      options.container = this;
      if (!$(element).data('formeo')) {
        formeo = new window.Formeo(options, formData);
        $(element).data('formeo', formeo);
      }
    });
  };
})();
