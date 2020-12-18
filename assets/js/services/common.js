(function () {
  var GA = window.GA || {};

  GA.services = function () {
    var _init = function _init() {
      GA.carousel();
    };

    return {
      init: _init
    };
  }();

  GA.services.init();
})();