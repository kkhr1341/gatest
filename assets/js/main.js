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
   * ロールオーバー
   *
   * @date 2012-10-01
   *
   * @example $('.rollover').rollover();
   * @example $('.rollover').rollover({ over: '-ov' });
   * @example $('.rollover').rollover({ current: '_cr', currentOver: '_cr_ov' });
   * @example $('.rollover').rollover({ down: '_click' });
   */
  $.fn.rollover = function (options) {
    var defaults = {
      over: '_ov',
      current: null,
      currentOver: null,
      down: null
    };
    var settings = $.extend({}, defaults, options);
    var over = settings.over;
    var current = settings.current;
    var currentOver = settings.currentOver;
    var down = settings.down;
    return this.each(function () {
      var src = this.src;
      var ext = /\.(gif|jpe?g|png)(\?.*)?/.exec(src)[0];
      var isCurrent = current && new RegExp(current + ext).test(src);
      if (isCurrent && !currentOver) return;
      var search = isCurrent && currentOver ? current + ext : ext;
      var replace = isCurrent && currentOver ? currentOver + ext : over + ext;
      var overSrc = src.replace(search, replace);
      new Image().src = overSrc;
      $(this).mouseout(function () {
        this.src = src;
      }).mouseover(function () {
        this.src = overSrc;
      });

      if (down) {
        var downSrc = src.replace(search, down + ext);
        new Image().src = downSrc;
        $(this).mousedown(function () {
          this.src = downSrc;
        });
      }
    });
  };

  /**
   * フェードロールオーバー
   *
   * @date 2012-11-21
   *
   * @example $('.faderollover').fadeRollover();
   * @example $('.faderollover').fadeRollover({ over: '-ov' });
   * @example $('.faderollover').fadeRollover({ current: '_cr', currentOver: '_cr_ov' });
   */
  $.fn.fadeRollover = function (options) {
    var defaults = {
      over: '_ov',
      current: null,
      currentOver: null
    };
    var settings = $.extend({}, defaults, options);
    var over = settings.over;
    var current = settings.current;
    var currentOver = settings.currentOver;
    return this.each(function () {
      var src = this.src;
      var ext = /\.(gif|jpe?g|png)(\?.*)?/.exec(src)[0];
      var isCurrent = current && new RegExp(current + ext).test(src);
      if (isCurrent && !currentOver) return;
      var search = isCurrent && currentOver ? current + ext : ext;
      var replace = isCurrent && currentOver ? currentOver + ext : over + ext;
      var overSrc = src.replace(search, replace);
      new Image().src = overSrc;

      $(this).parent().css('display', 'block').css('width', $(this).attr('width')).css('height', $(this).attr('height')).css('background', 'url("' + overSrc + '") no-repeat');

      $(this).parent().hover(function () {
        $(this).find('img').stop().animate({ opacity: 0 }, 200);
      }, function () {
        $(this).find('img').stop().animate({ opacity: 1 }, 200);
      });
    });
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
   * 文字列からオブジェクトに変換したクエリを取得
   *
   * @example $.getQuery();
   * @example $.getQuery('a=foo&b=bar&c=foobar');
   */
  $.getQuery = function (str) {
    if (!str) str = location.search;
    str = str.replace(/^.*?\?/, '');
    var query = {};
    var temp = str.split(/&/);
    for (var i = 0, l = temp.length; i < l; i++) {
      var param = temp[i].split(/=/);
      query[param[0]] = decodeURIComponent(param[1]);
    }
    return query;
  };

  /**
   * 画像をプリロード
   *
   * @date 2012-09-12
   *
   * @example $.preLoadImages('/img/01.jpg');
   */
  var cache = [];
  $.preLoadImages = function () {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      cache.push(cacheImage);
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
  var $document = $(document);
  var $html = $('html');
  var $body = $('body');
  var eirElement = document.querySelector('.eir');
  var windowHeight = $window.height();
  var mq = window.matchMedia('(min-width: 768px)');
  var pathname = location.pathname;
  var viewClass = {
    gnav: 'view-gnav',
    nav: 'view-nav',
    categoryTopAnimation: 'view-categoryTopAnimation'
  };
  var triggerHideHeaderOffsetTop = 500;
  var hammerTapEvent = $.ua.isTouchDevice ? 'tap' : 'click';

  var _init = function _init() {
    $(function () {
      if (!$.ua.isTouchDevice) {
        $('.rollover').rollover();
      }
      if (!$.ua.isMobile) {
        $('a[href^="tel:"]').on('click', function (e) {
          e.preventDefault();
        });
      }

      var promise = new Promise(function (resolve) {
        _wovn.init();
        _clientSideIncludes(resolve);
      });

      promise.then(function () {
        $(document).ready(function () {
          _headerUI.init();
          _megamenu();
          _sitemap.init();
          _drawer.init();
          _slidebanner();
          _microInteraction.panel().random();
          _microInteraction.slider().helper();
          _controlScroll.init();

          _onReadyAccess();

          $('[href="/company/#access"]').on('click', function (event) {
            _onClickAccess(event);
          });

          if (eirElement != null) {
            _onMutationEir();
          }
        });
      });

      $.enableTouchOver();
      $.scroller();
      _togglebutton();
      _filter();
      _googlemap.init();
      _mixedtext();
      _handleWindowChange(mq);
      mq.addListener(_handleWindowChange);
    });
  };

  var _onMutationEir = function _onMutationEir() {
    var eirObserver = new MutationObserver(function (mutation) {
      mutation.forEach(function () {
        _microInteraction.slider().helper();
      });
    });

    eirObserver.observe(eirElement, { childList: true });
  };

  var _onReadyAccess = function _onReadyAccess() {
    var hash = location.hash;

    if (hash === '#access') {
      var headerHeight = $('#header').height();
      var currentPosition = $(window).scrollTop();

      $(window).scrollTop(currentPosition - headerHeight);
    }
  };

  var _onClickAccess = function _onClickAccess(event) {
    var href = location.href;
    var isAccessElement = $('#access').length > 0;

    if (isAccessElement && href.includes('/company/')) {
      event.preventDefault();

      var headerHeight = $('#header').height();
      var targetOffset = $('#access').offset().top;

      $(window).scrollTop(targetOffset - headerHeight);

      _sitemap.close();
      _drawer.close();
    }
  };

  var _handleWindowChange = function _handleWindowChange(mq) {
    if (mq.matches) {
    } else {
      }
  };

  var _carousel = function _carousel() {
    var $carousel = $('.p-carousel');

    $carousel.each(function (index, el) {
      var $media = $(el).parents('.p-media.has-carousel');
      var $carouselSlide = $(el).find('.p-carousel_slide');
      var $carouselMask = $(el).find('.p-carousel_mask');
      var $carouselImg = $(el).find('.p-carousel_img');
      var $carouselImgImg = $carouselImg.find('img');
      var $carouselMedia = $media.find('.p-media_content');
      var $carouseBtn = $(el).find('.p-carousel_btn');
      var $carousePagination = $(el).find('.p-carousel_pagination');
      var slideLength = $carouselSlide.length;
      var slideIndex = 1;
      var carouselImgWidth = $carouselImgImg.width();
      var carouselImgHeight = $carouselImgImg.height();
      var throttleTimer = void 0;
      var slideAnimationed = true;

      var _init = function _init() {
        _bind();
        _changeCrouselImgBg(mq);
        _setPagination();

        $('main').addClass('has-carousel');
      };

      var _bind = function _bind() {
        mq.addListener(_changeCrouselImgBg);

        $window.on('load', function () {
          slideAnimationed = false;
        });

        $window.on('load resize', function () {
          carouselImgWidth = $carouselImgImg.width();

          clearTimeout(throttleTimer);
          throttleTimer = setTimeout(function () {
            carouselImgHeight = $carouselImgImg.height();
            $carouselImg.add($carouselMask).css({
              height: carouselImgHeight
            });

            $carouselImg.css({
              'backgroundSize': carouselImgWidth + 'px ' + carouselImgHeight + 'px'
            });
          }, 100);
        });

        $carouseBtn.on('click', function () {
          var _direction = $(this).find('svg').hasClass('-reverse') ? 'prev' : 'next';

          if (slideAnimationed) return false;

          if (_direction === 'next') {
            slideIndex++;

            if (slideIndex > slideLength) {
              slideIndex = 1;
            }
          } else {
            slideIndex--;

            if (slideIndex <= 0) {
              slideIndex = slideLength;
            }
          }

          _changeSlide(_direction, slideIndex);
          _changeMedia(slideIndex);
          _changePagination(slideIndex);
        });
      };

      var _changeCrouselImgBg = function _changeCrouselImgBg(mq) {
        if (mq.matches) {
          $carouselImg.each(function () {
            var _src = $(this).find('source').attr('srcset');
            $(this).css('background-image', 'url(' + _src + ')');
          });
        } else {
          $carouselImg.each(function () {
            var _src = $(this).find('img').attr('src');
            $(this).css('background-image', 'url(' + _src + ')');
          });
        }
      };

      var _setPagination = function _setPagination() {
        $carousePagination.find('small').text(('00' + slideLength).slice(-2));
      };

      var _changeSlide = function _changeSlide(direction, index) {
        var _index = index;
        var _direction = direction;
        var _$currentSlide = $carouselSlide.filter('.-currentslide');
        var _$currentMask = _$currentSlide.find($carouselMask);

        slideAnimationed = true;

        if (_direction === 'prev') {
          $carouselSlide.filter('.-nextslide').removeClass('-nextslide');
          $carouselSlide.eq(_index - 1).addClass('-nextslide');
        }

        if (_index >= slideLength) {
          _index = 0;
        }

        if (_direction === 'prev') {
          $carouselSlide.filter('.-nextslide').addClass('-activeslide');
          $carouselSlide.filter('.-nextslide').find('.p-carousel_mask').addClass('-activemask -reverse');
          setTimeout(function () {
            $carouselSlide.filter('.-nextslide').find('.p-carousel_mask').removeClass('-activemask -reverse');
          }, 10);
        } else {
          _$currentSlide.addClass('-activeslide').removeClass('-currentslide');
          _$currentMask.addClass('-activemask');
        }

        setTimeout(function () {
          _$currentSlide.removeClass('-currentslide');
          _$currentMask.removeClass('-activemask');
          $carouselSlide.filter('.-activeslide').removeClass('-activeslide');
          $carouselSlide.filter('.-nextslide').removeClass('-nextslide').addClass('-currentslide');
          $carouselSlide.eq(_index).addClass('-nextslide');
          slideAnimationed = false;
        }, 600);
      };

      var _changePagination = function _changePagination(index) {
        var _index = index;

        $carousePagination.find('em').text(('00' + _index).slice(-2));
      };

      var _changeMedia = function _changeMedia(index) {
        var _index = index - 1;

        $carouselMedia.removeClass('-current');
        $carouselMedia.eq(_index).addClass('-current');
      };

      _init();
    });
  };

  var _sticky = function _sticky() {
    var currentOffset = void 0;
    var currentPosition = void 0;
    var isFixed = false;
    var $stickyElement = $('.js-sticky');
    var target = $stickyElement.data('target');
    var targetOffset = {
      top: $(target).offset().top
    };
    var threshold = {
      begin: windowHeight + 100,
      end: targetOffset.top
    };

    var _fix = function _fix() {
      if (isFixed) {
        return;
      }
      $stickyElement.attr('aria-hidden', 'false');
      isFixed = true;
    };

    var _unfix = function _unfix() {
      if (!isFixed) {
        return;
      }
      $stickyElement.attr('aria-hidden', 'true');
      isFixed = false;
    };

    var _handle = function _handle() {
      $window.on('scroll', function () {
        currentOffset = {
          top: $stickyElement.offset().top
        };
        currentPosition = {
          top: $window.scrollTop(),
          bottom: $window.scrollTop() + windowHeight
        };

        if (currentOffset.top > threshold.end || currentPosition.bottom < threshold.begin) {
          _unfix();
        } else {
          _fix();
        }
      });
      $window.trigger('scroll');
    };

    _handle();
  };

  var _togglebutton = function _togglebutton() {
    var $togglebutton = $('.js-togglebutton');

    $togglebutton.on('click', function () {
      var isPressed = $(this).attr('aria-pressed');

      if (isPressed === undefined || isPressed === 'false') {
        $(this).attr('aria-pressed', true);
      } else if (isPressed === 'true') {
        $(this).attr('aria-pressed', false);
      }
    });
  };

  var _pagetransition = function () {
    var $trigger = $('.js-pagetransition');

    var _init = function _init() {
      $trigger.on('change', function () {
        var href = $(this).find(':selected').data('href');

        _navigateTo(href);
      });
    };

    var _navigateTo = function _navigateTo(url) {
      location = url;
    };

    return {
      init: _init
    };
  }();

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
            'marginTop': '-5%',
            'marginBottom': '-5%',
            'fontSize': '110%'
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

  var _slidebanner = function _slidebanner() {
    var $elements = $('.js-slidebanner');
    $elements.slick({
      mobileFirst: true,
      infinite: false,
      variableWidth: true,
      centerMode: true,
      centerPadding: '17%',
      responsive: [{
        breakpoint: 767,
        settings: {
          variableWidth: false,
          centerMode: false,
          slidesToShow: 4
        }
      }, {
        breakpoint: 1399,
        settings: {
          variableWidth: false,
          centerMode: false,
          slidesToShow: 5
        }
      }, {
        breakpoint: 1979,
        settings: {
          variableWidth: false,
          centerMode: false,
          slidesToShow: 6
        }
      }]
    });
  };

  var _clientSideIncludes = function _clientSideIncludes(callback) {
    var includeLength = $('[data-include]').length;
    var isIncluded = includeLength > 0;

    if (isIncluded) {
      $('[data-include]').each(function (index) {
        var $this = $(this);

        $this.load($this.attr('data-include'), function () {
          $this.contents().unwrap();
          if (index + 1 === includeLength) {
            callback();
          }
        });
      });
    } else {
      callback();
    }
  };

  var _headerUI = function () {
    var currentWindowWidth = window.innerWidth;
    var $header = void 0;
    var headerOffset = void 0;
    var scrollTop = 0;
    var isHidden = void 0;
    var isSticky = void 0;

    var _init = function _init() {
      $header = $('#header');
      isHidden = $header.attr('aria-hidden') === 'true' ? true : false;

      if ($('.no-header').length) {
        return;
      }

      _setHeaderOffset();
      _setHeaderHeight();

      $window.trigger('scroll');

      $window.on('scroll', function () {
        _scrollHandler();
      });

      $window.on('resize', function () {
        _setHeaderHeight();

        if (currentWindowWidth !== window.innerWidth) {
          _setHeaderOffset();
          currentWindowWidth = window.innerWidth;
        }
      });
    };

    var _setHeaderOffset = function _setHeaderOffset() {
      headerOffset = $header.offset().top;
    };

    var _setHeaderHeight = function _setHeaderHeight() {
      var height = $header.height();

      $header.parent().css({ height: height + 'px' });
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

  var _megamenu = function _megamenu() {
    var $header = $('#header');
    var $megamenuContainer = $('.megamenu_container');
    var $megamenuSection = $('.megamenu_section');
    var currentNavIndex = null;
    var heightArray = void 0;
    var currentNavHeight = 0;

    var _init = function _init() {
      heightArray = [];

      $megamenuSection.each(function () {
        var $heading = $(this).find('.megamenu_heading');
        var $megamenuList = $(this).find('.megamenu_list');

        TweenMax.set($heading, {
          y: 15,
          opacity: 0
        });
        TweenMax.set($megamenuList, {
          y: 15,
          opacity: 0
        });

        heightArray.push($(this).innerHeight() + 100);
      });
    };

    $('.header_item > a[aria-haspopup="true"]').each(function (i) {
      if (pathname.indexOf($(this).attr('data-categorypath')) === 0) {
        $(this).attr('aria-current', 'page');
      } else if (pathname.indexOf('event') > 0) {
        $('[data-categorypath="/news/"]').attr('aria-current', 'page');
      }

      $(this).on('mouseenter', function () {
        if (currentNavIndex === i || $html.hasClass(viewClass.categoryTopAnimation)) {
          return;
        }

        $header.find('[aria-expanded="true"]').attr('aria-expanded', 'false');
        $(this).attr('aria-expanded', 'true');

        if (currentNavIndex !== null) {
          hideItems(currentNavIndex);
        }

        currentNavIndex = i;
        $megamenuContainer.addClass('-collapsed');

        TweenMax.fromTo($megamenuContainer, 0.5, {
          height: currentNavHeight
        }, {
          height: heightArray[i],
          ease: Power4.easeOut,
          onComplete: function onComplete() {}
        });

        currentNavHeight = heightArray[i];
        showItems(i);
      });
    });

    $('.header_item > a[aria-haspopup="false"]').each(function () {
      $(this).on('mouseenter', function () {
        _close();
      });
    });

    $('.header_logo').on('mouseenter', function () {
      _close();
    });

    $header.on('mouseleave', function () {
      _close();
    });

    var _close = function _close() {
      if (currentNavIndex === null) {
        return;
      }

      $header.find('[aria-expanded="true"]').attr('aria-expanded', 'false');
      $megamenuContainer.removeClass('-collapsed');

      TweenMax.fromTo($megamenuContainer, 0.5, {
        height: heightArray[currentNavIndex]
      }, {
        height: 0,
        ease: Power4.easeOut
      });

      hideItems(currentNavIndex);
      currentNavIndex = null;
      currentNavHeight = 0;
    };

    var showItems = function showItems(i) {
      $html.addClass(viewClass.gnav);
      var $heading = $megamenuSection.eq(i).find('.megamenu_heading');
      var $megamenuList = $megamenuSection.eq(i).find('.megamenu_list');

      TweenMax.killTweensOf($megamenuSection.eq(i));
      $megamenuSection.eq(i).css({
        visibility: 'visible',
        opacity: 1
      });

      TweenMax.killTweensOf($heading);
      TweenMax.fromTo($heading, 0.75, {
        y: 25,
        opacity: 0
      }, {
        delay: 0.3,
        y: 0,
        opacity: 1,
        ease: Power4.easeOut
      });

      TweenMax.killTweensOf($megamenuList);
      TweenMax.fromTo($megamenuList, 0.75, {
        y: 25,
        opacity: 0
      }, {
        delay: 0.45,
        y: 0,
        opacity: 1,
        ease: Power4.easeOut
      });
    };

    var hideItems = function hideItems(i) {
      $html.removeClass(viewClass.gnav);

      TweenMax.fromTo($megamenuSection.eq(i), 0.35, {
        opacity: 1
      }, {
        opacity: 0,
        ease: Power4.easeOut,
        onComplete: function onComplete() {
          $megamenuSection.eq(i).css({
            visibility: 'hidden',
            opacity: 1
          });
        }
      });
    };

    $window.on('resize', function () {
      _init();
    });

    _init();
  };

  var _drawer = function () {
    var $toggle = void 0;
    var $directory_lv1 = void 0;
    var $directory_lv2 = void 0;
    var $directory_lv3 = void 0;
    var $directory_lv2_item = void 0;
    var $directory_lv3_item = void 0;
    var stateClass = {
      active: 'is-active'
    };
    var _easing = 'Power3.easeInOut';
    var _duration = 0.5;

    var _init = function _init() {
      $toggle = $('#header_toggleDrawer_btn');
      $directory_lv1 = $('.drawer_directory.-lv1');
      $directory_lv2 = $('.drawer_directory.-lv2');
      $directory_lv3 = $('.drawer_directory.-lv3');
      $directory_lv2_item = $directory_lv2.find('.drawer_section');
      $directory_lv3_item = $directory_lv3.find('.drawer_section');

      $toggle.hammer().on(hammerTapEvent, function () {
        _toggle();
      });

      $directory_lv1.find('.drawer_next').hammer().on(hammerTapEvent, function () {
        $directory_lv2_item.removeClass(stateClass.active);
        $('[data-directory="' + $(this).data('rel') + '"]').addClass(stateClass.active);

        TweenMax.to($directory_lv1, _duration, {
          ease: _easing,
          x: '-270px'
        });
        $directory_lv2.addClass(stateClass.active);
      });

      $directory_lv2.find('.drawer_next').hammer().on(hammerTapEvent, function () {
        $directory_lv3_item.removeClass(stateClass.active);
        $('[data-directory="' + $(this).data('rel') + '"]').addClass(stateClass.active);

        TweenMax.to($directory_lv2, _duration, {
          ease: _easing,
          x: '-265px'
        });
        $('.drawer_directory.-lv3').addClass(stateClass.active);
      });

      $directory_lv1.find('.drawer_back').hammer().on(hammerTapEvent, function () {
        _close();
      });

      $directory_lv2.find('.drawer_back').hammer().on(hammerTapEvent, function () {
        TweenMax.to($directory_lv1, _duration, {
          ease: _easing,
          x: '-10px',
          onComplete: function onComplete() {
            $directory_lv2_item.removeClass(stateClass.active);
          }
        });
        $directory_lv2.removeClass(stateClass.active);
      });

      $directory_lv3.find('.drawer_back').hammer().on(hammerTapEvent, function () {
        TweenMax.to($directory_lv2, _duration, {
          ease: _easing,
          x: '-5px',
          onComplete: function onComplete() {
            $directory_lv3_item.removeClass(stateClass.active);
          }
        });
        $directory_lv3.removeClass(stateClass.active);
      });

      $directory_lv1.hammer().on('swipe', function (event) {
        if (event.gesture.deltaX > 0) {
          _close();
        }
      });

      $directory_lv2.hammer().on('swipe', function (event) {
        if (event.gesture.deltaX > 0) {
          TweenMax.to($directory_lv1, _duration, {
            ease: _easing,
            x: '-10px',
            onComplete: function onComplete() {
              $directory_lv2_item.removeClass(stateClass.active);
            }
          });
          $directory_lv2.removeClass(stateClass.active);
        }
      });

      $directory_lv3.hammer().on('swipe', function (event) {
        if (event.gesture.deltaX > 0) {
          TweenMax.to($directory_lv2, _duration, {
            ease: _easing,
            x: '-5px',
            onComplete: function onComplete() {
              $directory_lv3_item.removeClass(stateClass.active);
            }
          });
          $directory_lv3.removeClass(stateClass.active);
        }
      });
    };

    var _toggle = function _toggle() {
      if ($html.hasClass(viewClass.nav)) {
        _close();
      } else {
        _open();
      }
    };

    var _open = function _open() {
      var $currentDirectory = $('.drawer_section').has('.drawer_list a.-current');

      $window.on('resize.drawerUI', function () {
        if (window.innerWidth >= 1032) {
          _close();
        }
      });

      $document.on('keydown.drawerUI', function (e) {
        if (e.keyCode === 27) {
          _close();
        }
      });

      $html.addClass(viewClass.nav);

      TweenMax.to('.container, .l-importantNotice', _duration, {
        ease: _easing,
        left: '-275px'
      });

      TweenMax.to('#header', _duration, {
        ease: _easing,
        left: '-275px',
        onStart: function onStart() {
          $(this.target).addClass('-sticky');
          $body.addClass('u-overflow-hidden');
        }
      });

      TweenMax.to('#drawer_container', _duration, {
        ease: _easing,
        x: '-275px'
      });

      if ($currentDirectory.length) {
        var _directory = $currentDirectory.data('directory');
        var _parentDirectory = $currentDirectory.data('parentDirectory');

        $('[data-directory="' + _directory + '"]').addClass(stateClass.active);

        TweenMax.to($directory_lv1, 0, {
          x: '-270px'
        });
        $directory_lv2.addClass(stateClass.active);

        if (_parentDirectory) {
          $('[data-directory="' + _parentDirectory + '"]').addClass(stateClass.active);

          TweenMax.to($directory_lv2, 0, {
            x: '-265px'
          });
          $directory_lv3.addClass(stateClass.active);
        }
      } else {
        TweenMax.to($directory_lv1, _duration, {
          ease: _easing,
          x: '-10px'
        });

        TweenMax.to($directory_lv2, _duration, {
          ease: _easing,
          x: '-5px'
        });
      }

      setTimeout(function () {
        $('#header, .container').on('touchmove.drawerUI', function () {
          return false;
        });
        $('#header, .container').on('click.drawerUI', _close);
      }, _duration * 1000);
    };

    var _close = function _close() {
      $window.off('.drawerUI');

      $html.removeClass(viewClass.nav);
      $('#header, .container').off('.drawerUI');

      $('.drawer_directory').removeClass(stateClass.active);
      $('.drawer_directory .drawer_section').removeClass(stateClass.active);

      TweenMax.to('.container, .l-importantNotice', _duration, {
        ease: _easing,
        left: '0'
      });

      TweenMax.to('#header', _duration, {
        ease: _easing,
        left: '0',
        onComplete: function onComplete() {
          $body.removeClass('u-overflow-hidden');
        }
      });

      TweenMax.to('#drawer_container', _duration, {
        ease: _easing,
        x: '0'
      });

      TweenMax.to('.drawer_directory', 0, {
        delay: _duration,
        x: '0px'
      });

      return false;
    };

    return {
      init: _init,
      close: _close
    };
  }();

  var _sitemap = function () {
    var $sitemap = void 0;
    var $drawer = void 0;
    var $openbutton = void 0;
    var $closebutton = void 0;
    var articleFolders = ['/news/', '/event/', '/careers/people/'];

    var _init = function _init() {
      $sitemap = $('.js-sitemap');
      $drawer = $('.drawer_container');
      $openbutton = $('.js-opensitemap');
      $closebutton = $sitemap.find('.sitemap_close');

      $openbutton.hammer().on(hammerTapEvent, function () {
        _open();
      });

      $closebutton.hammer().on(hammerTapEvent, function () {
        _close();
      });

      $window.on('resize', function () {
        _close();
      });

      _activeCurrentPageNav();
    };

    var _open = function _open() {
      setTimeout(function () {
        $closebutton.eq(0).find('button').focus();
      }, 100);

      $document.on('keydown.sitemapUI', function (e) {
        if (e.keyCode === 27) {
          _close();
        }
      });

      $body.addClass('view-sitemap');
    };

    var _close = function _close() {
      $document.off('.sitemapUI');
      $body.removeClass('view-sitemap');
    };

    var _activeCurrentPageNav = function _activeCurrentPageNav() {

      var _replacePath = function _replacePath(pathTxt) {
        return pathTxt.replace(/index.html|index.php/, '');
      };

      var _activeCrrent = function _activeCrrent(elm, targetPath) {
        var linkPath = _replacePath(elm.attr('href'));
        var replacePath = targetPath.replace(/\/[0-9]+\/$/, '/');
        var artcleGroup = articleFolders.indexOf(replacePath);

        if (artcleGroup !== -1 && linkPath === replacePath) {
          elm.attr('aria-current', 'page');
        } else if (linkPath === targetPath && elm.attr('target') !== '_blank' && !elm.data('nocurrent')) {
          elm.attr('aria-current', 'page');
        }
      };

      var locationPath = _replacePath(pathname);
      var directoryPath = locationPath.split('/').filter(function (s) {
        return s !== '';
      });
      var DirectoryPath2 = '/';

      $sitemap.find('a').each(function () {
        var $this = $(this);
        _activeCrrent($this, locationPath);
      });

      $.each(directoryPath, function (index, value) {
        var eachIndex = index + 1;
        DirectoryPath2 += value + '/';

        var targetClass = '.drawer_directory.-lv' + eachIndex + ' .drawer_next';
        $drawer.find(targetClass).each(function () {
          var $this = $(this);
          var linkPath = _replacePath($this.data('rel'));

          if (eachIndex == 1 && linkPath == '/news/' && DirectoryPath2 == '/event/') {
            $this.attr('aria-current', 'page');
          } else if (linkPath == DirectoryPath2) {
            $this.attr('aria-current', 'page');
          }
        });

        if (eachIndex == directoryPath.length) {
          $drawer.find('a').each(function () {
            var $this = $(this);
            _activeCrrent($this, DirectoryPath2);
          });
        }
      });
    };

    return {
      init: _init,
      close: _close
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

    var _slider = function _slider() {
      var _helper = function _helper() {
        var styleSheet = void 0;

        var _getMaxHeight = function _getMaxHeight() {
          var elements = document.querySelectorAll('.js-sliderHelper');
          var elementMaxHeight = 0;

          Array.from(elements, function (element) {
            var elementHeight = element.clientHeight;

            elementMaxHeight = Math.max(elementHeight, elementMaxHeight);
          });

          return elementMaxHeight;
        };

        var _addStyleSheet = function _addStyleSheet() {
          var style = document.createElement('style');
          var elementMaxHeight = _getMaxHeight();
          var styleRule = document.createTextNode('\n            .js-sliderHelper::before {\n              width: calc(100% + ' + elementMaxHeight + 'px) !important;\n            };\n            ');

          style.media = 'screen';
          style.type = 'text/css';

          style.appendChild(styleRule);
          document.getElementsByTagName('head')[0].appendChild(style);

          styleSheet = style;
        };

        var _removeStyleSheet = function _removeStyleSheet() {
          document.getElementsByTagName('head')[0].removeChild(styleSheet);
        };

        $(window).on('resize', function () {
          _removeStyleSheet();
          _addStyleSheet();
        });

        _addStyleSheet();
      };

      return {
        helper: _helper
      };
    };

    return {
      panel: _panel,
      slider: _slider
    };
  }();

  var _controlScroll = function () {
    var triggerElement = document.querySelector('.js-controlscroll');

    var _init = function _init() {
      if (triggerElement == null) return;

      var position = triggerElement.dataset.position;

      window.requestAnimationFrame(function () {
        $(triggerElement).animate({
          scrollLeft: position
        }, {
          duration: 600,
          easing: 'linear'
        });
      });
    };

    return {
      init: _init
    };
  }();

  var _wovn = function () {
    var isPronexus = $('.eir').length > 0 || $('#hqir').length > 0;
    var isStockweather = $('.js-insert-stockweather').length > 0;

    var _init = function _init() {
      window.addEventListener('wovnApiReady', function () {
        if (isPronexus) {
          _pronexus.init();
        }
        if (isStockweather) {
          _stockweather.init();
        }
      });

      window.addEventListener('wovnLangChanged', function () {
        if (isPronexus) {
          _pronexus.handleChangeLang();
        }
        if (isStockweather) {
          _stockweather.handleChangeLang();
        }
      });
    };

    var _getCurrentLang = function _getCurrentLang() {
      return WOVN.io.getCurrentLang().code === 'ja' ? 'japanese' : 'english';
    };

    return {
      init: _init,
      getCurrentLang: _getCurrentLang
    };
  }();

  var _pronexus = function () {
    var isPageHighlights = $('main').hasClass('page-highlights');
    var isInitialized = false;

    var _init = function _init() {
      var partsId = _getPartsId();
      var currentLang = _wovn.getCurrentLang();
      var src = currentLang === 'japanese' ? '/ir/eir/eir.js' : '/ir/eir/eire.js';

      $.getScript(src, function () {
        if (!isPageHighlights) {
          scriptLoader.setSrc(eirPassCore + 'eir_common.js');
          scriptLoader.load(function () {
            setParts(partsId);
          }, showMaintenanceMessage);
          _microInteraction.slider().helper();
        } else {
          var elmJunc = document.createElement('script');
          elmJunc.src = qirPass + 'js/' + 'junction.js';
          document.head.appendChild(elmJunc);
          elmJunc.onload = function () {
            setQIR(1);
          };
          elmJunc.onerror = function () {
            document.getElementById('hqir').innerHTML = message;
          };
        }
        isInitialized = true;
      });
    };

    var _destroy = function _destroy() {
      if (!isPageHighlights) {
        $('.eir').empty();
      } else {
        $('#hqir').empty();
        $('head').find('[src*="junction.js"]').remove();
      }
    };

    var _handleChangeLang = function _handleChangeLang() {
      if (isInitialized) {
        var partsId = _getPartsId();
        var currentLang = _wovn.getCurrentLang();
        var src = currentLang === 'japanese' ? '/ir/eir/eir.js' : '/ir/eir/eire.js';

        _destroy();
        $.getScript(src, function () {
          if (!isPageHighlights) {
            setParts(partsId);
            _microInteraction.slider().helper();
          } else {
            var elmJunc = document.createElement('script');
            elmJunc.src = qirPass + 'js/' + 'junction.js';
            document.head.appendChild(elmJunc);
            elmJunc.onload = function () {
              setQIR(1);
            };
            elmJunc.onerror = function () {
              document.getElementById('hqir').innerHTML = message;
            };
          }
        });
      }
    };

    var _getPartsId = function _getPartsId() {
      var partsId = $('main').data('parts-id');
      return partsId;
    };

    return {
      init: _init,
      handleChangeLang: _handleChangeLang
    };
  }();

  var _stockweather = function () {
    var _init = function _init() {
      var currentLang = _wovn.getCurrentLang();
      var $imgTarget = $('.js-insert-stockweather').filter('[data-html-tag="img"]');
      var $iframeTarget = $('.js-insert-stockweather').filter('[data-html-tag="iframe"]');
      var imgSrc = currentLang === 'japanese' ? 'https://www.stockweather.co.jp/customize_real/3491/img/3491j_01.png' : 'https://www.stockweather.co.jp/customize_real/3491/img/3491e_01.png';

      var iframeSrc = currentLang === 'japanese' ? 'https://parts.stockweather.co.jp/stocks/ir/contents/3491/chart.aspx' : 'https://parts.stockweather.co.jp/stocks/ir/contents/3491/chart.aspx?lang=en';

      $imgTarget.append('<img src="' + imgSrc + '" alt="">');
      $iframeTarget.append('<iframe src="' + iframeSrc + '"></iframe>');
    };

    var _handleChangeLang = function _handleChangeLang() {
      var newLang = _wovn.getCurrentLang();
      var $imgTarget = $('.js-insert-stockweather').filter('[data-html-tag="img"]').find('img');
      var $iframeTarget = $('.js-insert-stockweather').filter('[data-html-tag="iframe"]').find('iframe');
      var imgSrc = newLang === 'japanese' ? 'https://www.stockweather.co.jp/customize_real/3491/img/3491j_01.png' : 'https://www.stockweather.co.jp/customize_real/3491/img/3491e_01.png';

      var iframeSrc = newLang === 'japanese' ? 'https://parts.stockweather.co.jp/stocks/ir/contents/3491/chart.aspx' : 'https://parts.stockweather.co.jp/stocks/ir/contents/3491/chart.aspx?lang=en';

      $imgTarget.attr('src', imgSrc);
      $iframeTarget.attr('src', iframeSrc);
    };

    return {
      init: _init,
      handleChangeLang: _handleChangeLang
    };
  }();

  return {
    init: function init() {
      window.console = window.console || {
        log: function log() {}
      };
      _init();
    },
    sticky: _sticky,
    carousel: _carousel,
    pagetransition: _pagetransition,
    microInteraction: _microInteraction
  };
}(jQuery);

GA.init();