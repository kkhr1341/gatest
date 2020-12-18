var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * jQueryオブジェクトの拡張
 *
 * @date 2018-01-30
 */
(function ($) {
  /**
   * userAgent判定フラグ
   *
   * @date 2016-06-02
   */
  var ua = navigator.userAgent.toLowerCase();
  $.ua = {
    isWindows: /windows/.test(ua),
    isMac: /macintosh/.test(ua),
    isIE: /msie (\d+)|trident/.test(ua),
    isLtIE9: /msie (\d+)/.test(ua) && RegExp.$1 < 9,
    isLtIE10: /msie (\d+)/.test(ua) && RegExp.$1 < 10,
    isFirefox: /firefox/.test(ua),
    isWebKit: /applewebkit/.test(ua),
    isChrome: /chrome/.test(ua),
    isSafari: /safari/.test(ua) && !/chrome/.test(ua) && !/mobile/.test(ua),
    isIOS: /i(phone|pod|pad)/.test(ua),
    isIOSChrome: /crios/.test(ua),
    isIPhone: /i(phone|pod)/.test(ua),
    isIPad: /ipad/.test(ua),
    isAndroid: /android/.test(ua),
    isAndroidMobile: /android(.+)?mobile/.test(ua),
    isTouchDevice: 'ontouchstart' in window,
    isMobile: /i(phone|pod)/.test(ua) || /android(.+)?mobile/.test(ua),
    isTablet: /ipad/.test(ua) || /android/.test(ua) && !/mobile/.test(ua)
  };

  /**
   * スムーズスクロール
   *
   * @date 2018-01-30
   *
   * @example $.scroller();
   * @example $.scroller({ cancelByMousewheel: true });
   * @example $.scroller({ scopeSelector: '#container', noScrollSelector: '.no-scroll' });
   * @example $.scroller('#content');
   * @example $.scroller('#content', { marginTop: 200, callback: function() { console.log('callback')} });
   */
  $.scroller = function () {
    var self = $.scroller.prototype;
    if (!arguments[0] || _typeof(arguments[0]) === 'object') {
      self.init.apply(self, arguments);
    } else {
      self.scroll.apply(self, arguments);
    }
  };

  $.scroller.prototype = {
    defaults: {
      callback: function callback() {},
      cancelByMousewheel: false,
      duration: 500,
      easing: 'swing',
      hashMarkEnabled: false,
      marginTop: 0,
      noScrollSelector: '.noscroll',
      scopeSelector: 'body'
    },

    init: function init(options) {
      var self = this;
      var settings = this.settings = $.extend({}, this.defaults, options);
      $(settings.scopeSelector).find('a[href^="#"]').not(settings.noScrollSelector).each(function () {
        var hash = this.hash || '#';
        var eventName = 'click.scroller';

        if (hash !== '#' && !$(hash + ', a[name="' + hash.substr(1) + '"]').eq(0).length) {
          return;
        }

        $(this).off(eventName).on(eventName, function (e) {
          e.preventDefault();
          this.blur();
          self.scroll(hash, settings);
        });
      });
    },

    scroll: function scroll(id, options) {
      var settings = options ? $.extend({}, this.defaults, options) : this.settings ? this.settings : this.defaults;
      if (!settings.hashMarkEnabled && id === '#') return;

      var dfd = $.Deferred();
      var win = window;
      var doc = document;
      var $doc = $(doc);
      var $page = $('html, body');
      var scrollEnd = id === '#' ? 0 : $(id + ', a[name="' + id.substr(1) + '"]').eq(0).offset().top - settings.marginTop;
      var windowHeight = $.ua.isAndroidMobile ? Math.ceil(win.innerWidth / win.outerWidth * win.outerHeight) : win.innerHeight || doc.documentElement.clientHeight;
      var scrollableEnd = $doc.height() - windowHeight;
      if (scrollableEnd < 0) scrollableEnd = 0;
      if (scrollEnd > scrollableEnd) scrollEnd = scrollableEnd;
      if (scrollEnd < 0) scrollEnd = 0;
      scrollEnd = Math.floor(scrollEnd);

      $page.stop().animate({ scrollTop: scrollEnd }, {
        duration: settings.duration,
        easing: settings.easing,
        complete: function complete() {
          dfd.resolve();
        }
      });

      dfd.done(function () {
        settings.callback();
        $doc.off('.scrollerMousewheel');
      });

      if (settings.cancelByMousewheel) {
        var mousewheelEvent = 'onwheel' in document ? 'wheel.scrollerMousewheel' : 'mousewheel.scrollerMousewheel';
        $doc.one(mousewheelEvent, function () {
          dfd.reject();
          $page.stop();
        });
      }
    }
  };

  /**
   * タッチデバイスにタッチイベント追加
   *
   * @date 2018-10-03
   *
   * @example $.enableTouchOver();
   * @example $.enableTouchOver('.touchhover');
   */
  $.enableTouchOver = function (target) {
    if (target === undefined) {
      target = 'a, .js-touchhover, .anime-panel, .p-btn, .p-togglebtn';
    }
    if (!$.ua.isTouchDevice) {
      $('html').addClass('no-touchevents');
    } else {
      $('html').addClass('touchevents');
    }

    $(document).on('touchstart mouseenter', target, function () {
      $(this).addClass('-touched');
    });

    $(document).on('touchend mouseleave', target, function () {
      $(this).removeClass('-touched');
    });
  };
})(jQuery);

var GA = function ($) {
  var $window = $(window);
  var $html = $('html');
  var viewClass = {
    gnav: 'view-gnav',
    nav: 'view-nav',
    categoryTopAnimation: 'view-categoryTopAnimation'
  };
  var triggerHideHeaderOffsetTop = 500;

  var _init = function _init() {
    $(function () {
      if (!$.ua.isMobile) {
        $('a[href^="tel:"]').on('click', function (e) {
          e.preventDefault();
        });
      }

      _microInteraction.panel().random();
      $.enableTouchOver();
      $.scroller();
      _filter();
      _googlemap.init();
      _mixedtext();
      _headerUI.init();
      _menuUI.init();
    });
  };

  var _filter = function _filter() {
    var $filterbtn = $('.js-filter').filter('button');
    var $filterSelectMenu = $('.js-filter').filter('select');
    var $maincategory = $('.js-maincategory');
    var $subcategory = $('.js-subcategory');

    $maincategory.find($filterSelectMenu).on('change', function () {
      var $selectedOption = $(this).find('option:selected');
      var haspopup = $selectedOption.attr('aria-haspopup');

      $subcategory.hide();

      if (haspopup) {
        var target = $selectedOption.data('target');

        $(target).css('display', 'flex');
      }
    });

    $maincategory.find($filterbtn).on('click', function () {
      var haspopup = $(this).attr('aria-haspopup');

      $maincategory.find('[aria-pressed="true"]').attr('aria-pressed', false);
      $subcategory.hide();
      $(this).attr('aria-pressed', true);

      if (haspopup) {
        var target = $(this).data('target');

        $(this).attr('aria-expanded', true);
        $(target).css('display', 'flex');
      } else {
        $filterbtn.filter('[aria-expanded]').attr('aria-expanded', false);
      }
    });

    $subcategory.find($filterbtn).on('click', function () {
      $(this).closest($subcategory).find('[aria-pressed="true"]').attr('aria-pressed', false);
      $(this).attr('aria-pressed', true);
      $filterbtn.filter('[aria-expanded]').attr('aria-expanded', false);
    });
  };

  var _googlemap = function () {
    var $googlemapElment = $('.js-googlemap');

    var _init = function _init() {
      if (!$googlemapElment.length) return;

      $googlemapElment.each(function (index, val) {
        var $this = $(this);

        var posData = {
          lat: $this.data('lat'),
          long: $this.data('long')
        };

        var pin_url = $this.data('pin');

        careateMap(val, posData, pin_url);
      });
    };

    var careateMap = function careateMap(_element, _loction, _pinUrl) {
      if (typeof google === 'undefined') {
        return;
      }

      var markerImg = {
        url: _pinUrl,
        size: new google.maps.Size(60, 70),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 60),
        scaledSize: new google.maps.Size(60, 70)
      };

      var latlng = new google.maps.LatLng(_loction.lat, _loction.long);

      var opts = {
        zoom: 17,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        streetViewControl: false
      };

      var mapCanvas = _element;
      var gMap = new google.maps.Map(mapCanvas, opts);

      if (_pinUrl !== false) {
        new google.maps.Marker({
          position: new google.maps.LatLng(_loction.lat, _loction.long),
          map: gMap,
          zIndex: 1,
          icon: markerImg
        });
      } else {
        new google.maps.Marker({
          position: new google.maps.LatLng(_loction.lat, _loction.long),
          map: gMap,
          zIndex: 1
        });
      }

      google.maps.event.addDomListener(window, 'resize', function () {
        var center = gMap.getCenter();
        google.maps.event.trigger(gMap, 'resize');
        gMap.setCenter(center);
      });
    };

    return {
      init: _init
    };
  }();

  var _mixedtext = function _mixedtext() {
    var regexs = {
      alphanumeric: /[a-zA-Z0-9]/
    };
    var elements = document.querySelectorAll('.js-mixedtext');

    [].forEach.call(elements, function (element) {
      var text = element.textContent;
      var chars = text.split('');
      element.innerHTML = '';

      chars.map(function (char) {
        var isAlphanumeric = regexs['alphanumeric'].test(char);
        if (isAlphanumeric) {
          var span = document.createElement('span');
          span.textContent = char;
          $(span).css({
            'display': 'inline-block',
            'margin-top': '-5%',
            'margin-bottom': '-5%',
            'font-size': '110%'
          });
          element.appendChild(span);
        } else {
          var _span = document.createElement('span');
          _span.textContent = char;
          element.appendChild(_span);
        }
      });
    });
  };

  var _headerUI = function () {
    var currentWindowWidth = window.innerWidth;
    var $header = void 0;
    var headerOffset = void 0;
    var scrollTop = 0;
    var isHidden = void 0;
    var isSticky = void 0;

    var _init = function _init() {
      $header = $('.js-sticky');
      isHidden = $header.attr('aria-hidden') === 'true' ? true : false;

      _setHeaderOffset();

      $window.trigger('scroll');

      $window.on('scroll', function () {
        _scrollHandler();
      });

      $window.on('resize', function () {
        if (currentWindowWidth !== window.innerWidth) {
          _setHeaderOffset();
          currentWindowWidth = window.innerWidth;
        }
      });
    };

    var _setHeaderOffset = function _setHeaderOffset() {
      headerOffset = $header.offset().top;
    };

    var _scrollHandler = function _scrollHandler() {
      var _scrollTop = $window.scrollTop();

      _toggle(_scrollTop);
    };

    var _toggle = function _toggle(_scrollTop) {
      if ($html.hasClass(viewClass.nav)) {
        return;
      }

      if (_scrollTop <= headerOffset) {
        $header.removeClass('-sticky');
        isSticky = false;
      } else if (!isSticky && _scrollTop > headerOffset) {
        $header.addClass('-sticky');
        isSticky = true;
      }

      if (_scrollTop > scrollTop && !$html.hasClass(viewClass.gnav) && !$html.hasClass(viewClass.categoryTopAnimation)) {
        if (scrollTop > triggerHideHeaderOffsetTop && !isHidden) {
          _hide();
        }
      } else {
        if (isHidden) {
          _show();
        }
      }

      scrollTop = _scrollTop;
    };

    var _show = function _show() {
      $header.attr('aria-hidden', 'false');
      isHidden = false;
    };

    var _hide = function _hide() {
      $header.attr('aria-hidden', 'true');
      isHidden = true;
    };

    return {
      init: _init,
      show: _show,
      hide: _hide
    };
  }();

  var _menuUI = function () {
    var triggerToggleElementAll = document.querySelectorAll('.js-toggle-menu');
    var triggerHideElementAll = document.querySelectorAll('.js-hide-menu');
    var isExpanded = false;
    var isHidden = true;
    var currentScrollY = 0;

    var _init = function _init() {
      _handle();
    };

    var _handle = function _handle() {
      triggerToggleElementAll.forEach(function (element) {
        var controlElement = document.getElementById(element.getAttribute('aria-controls'));

        element.addEventListener('click', function () {
          _toggle(controlElement);
        });
      });

      triggerHideElementAll.forEach(function (element) {
        element.addEventListener('click', function () {
          var controlElement = document.getElementById(element.getAttribute('aria-controls'));

          _hide(controlElement);
        });
      });
    };

    var _toggle = function _toggle(controlElement) {
      isExpanded = !isExpanded;
      isHidden = !isHidden;

      if (isExpanded) {
        _activateScrollLock();
      } else {
        _deactivateScrollLock();
      }

      $.scroller();

      triggerToggleElementAll.forEach(function (element) {
        element.setAttribute('aria-expanded', isExpanded);
      });

      controlElement.setAttribute('aria-hidden', isHidden);
    };

    var _hide = function _hide(controlElement) {
      isExpanded = false;
      isHidden = true;

      triggerToggleElementAll.forEach(function (element) {
        element.setAttribute('aria-expanded', isExpanded);
      });

      controlElement.setAttribute('aria-hidden', isHidden);
      _deactivateScrollLock();
    };

    var _activateScrollLock = function _activateScrollLock() {
      var scrollbarWidth = window.innerWidth - document.body.clientWidth;
      currentScrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = '-' + currentScrollY + 'px';
      document.body.style.right = '0';
      document.body.style.left = '0';
      document.body.style.paddingRight = scrollbarWidth + 'px';
    };

    var _deactivateScrollLock = function _deactivateScrollLock() {
      document.body.setAttribute('style', '');
      window.scrollTo(0, currentScrollY);
    };

    return {
      init: _init
    };
  }();

  var _microInteraction = function () {
    var _panel = function _panel() {
      var _random = function _random() {
        var $panel = $('.anime-panel');

        var _getRandomNumber = function _getRandomNumber(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        };

        $panel.each(function () {
          var randomNumber = _getRandomNumber(1, 7);
          $(this).addClass('-corporateColor-0' + randomNumber);
        });
      };

      return {
        random: _random
      };
    };

    return {
      panel: _panel
    };
  }();

  return {
    init: function init() {
      window.console = window.console || {
        log: function log() {}
      };
      _init();
    },
    microInteraction: _microInteraction
  };
}(jQuery);

GA.init();