(function($) {
    const GA = window.GA || {};

    GA.top = (function() {
        const $window = $(window);
        const $body = $("body");
        const mq = window.matchMedia("(min-width: 768px)");

        const _init = function _init() {
            _carousel.init();
        };

        const _carousel = (function() {
            const $loader = $(".sitetop-loader");
            const $caslide = $("#sitetop-caslide");
            const $maskImg = $caslide.find(".js-carouselmaskimg");
            const $nextBtn = $caslide.find(".sitetop-caslide_navbtn");
            const $nextBtnImg = $caslide.find(".sitetop-next");
            const $nextImg = $caslide.find(".sitetop-next_thumbmask");
            const $nextThumb = $caslide.find(".sitetop-next_thumb");
            const $nextBg = $caslide.find(".sitetop-next_bg");
            const $txt = $caslide.find(".sitetop-caslide_txt");
            const $readmore = $caslide.find(".sitetop-caslide_btn");
            const $nav = $("#sitetop-caslide_nav");
            const $progressbar = $("#sitetop-caslide_progressbar");
            const $pagination = $("#sitetop-caslide_pagination");
            let throttleTimer = void 0;
            let slideLength = $txt.length;
            let slideIndex = 0;
            let slideAnimationed = void 0;
            let slideTimer = void 0;
            let timerInterval = 5500;

            let pixiObj = void 0;

            const _init = function _init() {
                pixiObj = _pixiInit();

                mq.addListener(_setMaskValue);
                _bind();
            };

            const _bind = function _bind() {
                window.addEventListener("PIXI_LOADED", function() {
                    $body.addClass("-loaded");
                    setTimeout(function() {
                        pixiObj.next(0);
                        _setMaskValue(mq);
                        _setPagination();
                        $caslide.addClass("-loaded");

                        setTimeout(function() {
                            $nav.addClass("-active");
                        }, 200);

                        setTimeout(function() {
                            $nav.addClass("-show").removeClass("-active");
                            $progressbar.addClass("-active");
                            _changeTxt(slideLength);
                            _autoPlay();
                            $loader.remove();
                        }, 600);
                    }, 500);
                });

                if ($.ua.isTablet) {
                    $window.on("orientationchange", _restart);
                } else {
                    $window.on("resize", _restart);
                }

                $nextBtnImg.on({
                    mouseenter: function mouseenter() {
                        $nextBtn.addClass("-touched");
                    },
                    mouseleave: function mouseleave() {
                        $nextBtn.removeClass("-touched");
                    },
                });

                $nextBtn.add($nextBtnImg).on("click", function() {
                    if (!slideAnimationed) {
                        slideAnimationed = true;
                        _autoPlay();
                        _changeNavBtnImg();
                        _changeTxt();
                        _updateSlideIndex();
                        _changePagination();
                        pixiObj.next(slideIndex);
                    }
                });

                $readmore.on({
                    mouseenter: function mouseenter() {
                        _pauseAutoPlay();
                    },
                    mouseleave: function mouseleave() {
                        _autoPlay();
                    },
                });
            };

            const _restart = function _restart() {
                _pauseAutoPlay();
                _resetMaskValue();
                clearTimeout(throttleTimer);
                throttleTimer = setTimeout(function() {
                    _setMaskValue();
                    _autoPlay();
                }, 1000);
            };

            const _changeTxt = function _changeTxt(index) {
                let _slideIndex = index ? index : slideIndex;
                const _$txt = $caslide.find(".sitetop-caslide_txt");
                const _$currentTxt = _$txt.eq(_slideIndex);
                const _$currentTxtMask = _$currentTxt.find(".sitetop-caslide_txtmask");
                const _$currentTxtMaskImg = _$currentTxt.find(".sitetop-caslide_txtmaskimg");
                const _width = _$currentTxtMask.css("width");
                const _left = _$currentTxtMask.css("left");
                const _adjustLeftValue = -parseFloat(_left, 10) + parseFloat(_width, 10);
                let _nextWidth = void 0;
                let _delay = index ? 20 : 600;

                if (_slideIndex >= slideLength - 1) {
                    _slideIndex = -1;
                }

                _nextWidth = _$txt
                    .eq(_slideIndex + 1)
                    .find(".sitetop-caslide_txtmask")
                    .css("width");

                _$currentTxt.addClass("-hide");
                _$txt.eq(_slideIndex + 1).addClass("-next");
                _$txt
                    .eq(_slideIndex + 1)
                    .find(".sitetop-caslide_txtmask")
                    .css({ width: 0 });

                _$currentTxtMask.css({
                    width: 0,
                    left: _adjustLeftValue,
                });

                _$currentTxtMaskImg.css({
                    left: -_adjustLeftValue,
                });

                setTimeout(function() {
                    _$currentTxt.removeClass("-active -hide");
                    _$currentTxtMask.css({ width: _width });
                    _$txt
                        .eq(_slideIndex + 1)
                        .removeClass("-next")
                        .addClass("-active");
                    _$txt
                        .eq(_slideIndex + 1)
                        .find(".sitetop-caslide_txtmask")
                        .css({ width: _nextWidth, left: _left });
                    _$txt
                        .eq(_slideIndex + 1)
                        .find(".sitetop-caslide_txtmaskimg")
                        .css({ left: -parseFloat(_left, 10) });

                    setTimeout(function() {
                        slideAnimationed = false;
                    }, 500);
                }, _delay);
            };

            const _changeNavBtnImg = function _changeNavBtnImg() {
                $nextImg.removeAttr("style").css({ width: 0 });

                setTimeout(function() {
                    $nextBg.removeAttr("style").addClass("-active");
                    $nextThumb.removeClass("-active");
                    $nextThumb.eq(slideIndex).addClass("-active");
                    $nextImg.css({ width: "100%", transition: "0s" });

                    $nextBg.css({
                        width: 0,
                    });

                    setTimeout(function() {
                        $nextBg.removeClass("-active").css({
                            width: "100%",
                            transition: "0s",
                        });
                    }, 500);
                }, 600);
            };

            const _setMaskValue = function _setMaskValue() {
                _resetMaskValue();

                $maskImg.each(function() {
                    const _width = $(this).width();
                    const _height = $(this).height();
                    const _$parentMaskElement = $(this).parents(".js-carouselmask");
                    const _skewAdjustValue1 = $(this).css("left");
                    const _skewAdjustValue2 = _$parentMaskElement.css("left");
                    const _titleWidth = $(this).find(".sitetop-caslide_title span").width();
                    const _leadWidth = $(this).find(".sitetop-caslide_lead span").width();
                    const _maxTxtWidth = Math.max(_titleWidth, _leadWidth);

                    $(this).css({
                        width: _width,
                        height: _height,
                        left: _skewAdjustValue1,
                    });

                    if (_maxTxtWidth) {
                        _$parentMaskElement.css({
                            left: _skewAdjustValue2,
                            width: _maxTxtWidth + parseFloat(_skewAdjustValue1),
                        });
                    } else {
                        _$parentMaskElement.css({
                            left: _skewAdjustValue2,
                        });
                    }
                });
            };

            const _resetMaskValue = function _resetMaskValue() {
                $maskImg.each(function() {
                    const _$parentMaskElement = $(this).parents(".js-carouselmask");
                    $(this).add(_$parentMaskElement).removeAttr("style");
                });
            };

            const _setPagination = function _setPagination() {
                const _slideIndex = slideIndex;
                $pagination.find("em").text(("00" + (_slideIndex + 1)).slice(-2));
                $pagination.find("small").text(("00" + slideLength).slice(-2));
            };

            const _changePagination = function _changePagination() {
                const _slideIndex = slideIndex;
                $pagination.find("em").text(("00" + (_slideIndex + 1)).slice(-2));
            };

            const _updateSlideIndex = function _updateSlideIndex() {
                if (slideIndex < slideLength - 1) {
                    slideIndex++;
                } else {
                    slideIndex = 0;
                }
            };

            const _setProgressbar = function _setProgressbar() {
                $progressbar.removeClass("-active");
                setTimeout(function() {
                    $progressbar.addClass("-active");
                }, 20);
            };

            const _autoPlay = function _autoPlay() {
                clearTimeout(slideTimer);
                _setProgressbar();

                slideTimer = setTimeout(function() {
                    $nextBtn.trigger("click");
                    _autoPlay();
                }, timerInterval);
            };

            const _pauseAutoPlay = function _pauseAutoPlay() {
                clearTimeout(slideTimer);
                $progressbar.removeClass("-active");
            };

            const _pixiInit = function _pixiInit() {
                const _$images = $(".sitetop-caslide_img");
                const _$thumbnail = $("#sitetop-caslide_nav").find(".sitetop-next_thumbinner");
                const _$canvas = $("#sitetop-caslide_canvas");
                let _baseWidth = 990 * 2;
                let _baseHeight = 594 * 2;
                let _cvWidth = _$canvas.width();
                let _cvHeight = _$canvas.height();
                let _cvRatio = _cvWidth / _cvHeight;
                let _current = 0;
                const _imageArray = [];
                const _lineArray = [];
                const _app = new PIXI.Application({
                    width: _cvWidth,
                    height: _cvHeight,
                    antialias: true,
                    transparent: true,
                    autoResize: true,
                    resolution: window.devicePixelRatio || 1,
                });

                const _container = new PIXI.Container();
                const _imegesCt = new PIXI.Container();
                const _lineMsk = new PIXI.Container();
                const _stageMsk = new PIXI.Graphics();

                const method = {
                    start: function start() {
                        return _start();
                    },
                    next: function next(num) {
                        return _next(num);
                    },
                };

                _$canvas.append(_app.view);

                _app.stage.addChild(_container);
                _container.addChild(_imegesCt);
                _container.addChild(_lineMsk);

                window.onresize = function() {
                    _resize();
                };
                mq.addListener(_responsiveImage);
                _load();

                function _load() {
                    const loader = PIXI.Loader.shared;

                    for (let i = 0; i < _$images.length; i++) {
                        const sp = $(_$images[i]).find("img").attr("src");
                        const pc = $(_$images[i]).find("source").attr("srcset");
                        const srcBase = "img_" + (i + 1);
                        loader.add(srcBase + "_sp", sp);
                        loader.add(srcBase + "_pc", pc);
                    }

                    for (let i2 = 0; i2 < _$thumbnail.length; i2++) {
                        const thumb = $(_$thumbnail[i2]).find("img").attr("src");
                        loader.add(thumb);
                    }

                    loader.load(function(loader, resources) {
                        const sprites = {};
                        for (const _i in resources) {
                            sprites[_i] = new PIXI.TilingSprite(resources[_i].texture);
                            const width = resources[_i].texture.orig.width;
                            const height = resources[_i].texture.orig.height;
                            sprites[_i].width = width;
                            sprites[_i].height = height;
                            sprites[_i].anchor.set(0.5);
                        }

                        for (let i = 0; i < _$images.length; i++) {
                            const images = new PIXI.Container();
                            const _srcBase = "img_" + (i + 1);
                            const _sp = sprites[_srcBase + "_sp"];
                            const _pc = sprites[_srcBase + "_pc"];
                            images.alpha = 0;
                            images.addChild(_sp);
                            images.addChild(_pc);
                            _imegesCt.addChild(images);
                            _imageArray.push({ images: images, sp: _sp, pc: _pc });
                        }
                        _loadComplete();
                    });
                }

                function _loadComplete() {
                    _createMask();
                    _responsiveImage(mq);
                    _resize();
                    _eventDispatch();
                }

                function _reDrawStageMask() {
                    const _deg = 17.3;
                    const _rad = _deg * (Math.PI / 180);
                    const _offset = _baseHeight - Math.cos(_rad) * _baseHeight;
                    const _offHeight = _baseHeight + _offset;
                    _stageMsk.beginFill(0x6600);
                    _stageMsk.moveTo(0, 0);
                    _stageMsk.lineTo(_baseWidth, 0);
                    _stageMsk.lineTo(_baseWidth, _offHeight);
                    _stageMsk.lineTo(0, _offHeight);
                    _stageMsk.endFill();

                    _stageMsk.x = -_baseWidth / 2 + Math.tan(_rad) * _baseHeight;
                    _stageMsk.y = -_baseHeight / 2;
                    _stageMsk.skew.x = -_rad;
                }

                function _setLineMask(msks, num) {
                    const _lineMsk = new PIXI.Graphics();
                    msks[num].sprite = _lineMsk;
                    _reDrawLineMask(_lineMsk, num, msks);
                    return _lineMsk;
                }

                function _reDrawLineMask(target, num, msks, isCurrent) {
                    const _deg = 17.3;
                    const _rad = _deg * (Math.PI / 180);
                    const _lineHeight = (_baseHeight + 10) / 5;
                    const _offset = _lineHeight - Math.cos(_rad) * _lineHeight;
                    const _offHeight = _lineHeight + _offset;
                    const _lineX = mq.matches ? [146, 109, 71, 34, -3] : [168, 125, 82, 39, -4];

                    const tx = -_baseWidth / 2 + Math.tan(_rad) * _lineHeight + _lineX[num];
                    const fx = _baseWidth / 2 + Math.tan(_rad) * _lineHeight + 10;
                    const fy = -_baseHeight / 2 + Math.floor(_lineHeight) * num;

                    target.beginFill(0xff6600);
                    target.moveTo(0, 0);
                    target.lineTo(_baseWidth, 0);
                    target.lineTo(_baseWidth, _offHeight);
                    target.lineTo(0, _offHeight);
                    target.endFill();

                    if (isCurrent) {
                        target.x = tx;
                    } else {
                        target.x = fx;
                    }
                    target.y = fy;

                    target.skew.x = -_rad;

                    msks[num].tx = tx;
                    msks[num].fx = fx;
                    msks[num].fy = fy;
                }

                function _createMask() {
                    _reDrawStageMask();
                    _container.mask = _stageMsk;
                    _container.addChild(_stageMsk);
                    for (let k = 0; k < _$images.length; k++) {
                        const msksCt = new PIXI.Container();
                        const msks = [];
                        for (let i = 0; i < 5; i++) {
                            msks.push({ sprite: null, fx: null, tx: null, fy: null });
                            msksCt.addChild(_setLineMask(msks, i));
                        }
                        _lineArray.push({ sprite: msksCt, msks: msks });
                        _lineMsk.addChild(msksCt);
                    }
                }

                function _start() {
                    TweenMax.fromTo(_imageArray[0].images, 2, { pixi: { autoAlpha: 0 } }, { pixi: { autoAlpha: 1 }, ease: Power2.easeOut });
                    TweenMax.fromTo(_imageArray[0].images, 8, { pixi: { scaleX: 1.5, scaleY: 1.5 } }, { pixi: { scaleX: 1, scaleY: 1 }, ease: Power2.easeOut });
                }

                function _next(num) {
                    _current = num;
                    const _target = _imageArray[num].images;

                    _target.mask = _lineArray[num].sprite;
                    _imegesCt.addChild(_target);

                    TweenMax.fromTo(_target, 9, { pixi: { autoAlpha: 1, scaleX: 1.5, scaleY: 1.5 } }, { pixi: { autoAlpha: 1, scaleX: 1, scaleY: 1 }, ease: Power2.easeOut });
                    const delay = 0.05;
                    const delays = [1, 3, 0, 3.5, 2];
                    for (let i = 0; i < 5; i++) {
                        TweenMax.fromTo(_lineArray[num].msks[i].sprite, 1.0, { x: _lineArray[num].msks[i].fx }, { delay: delay * delays[i], x: _lineArray[num].msks[i].tx, ease: Expo.easeOut });
                    }
                }

                function _resize() {
                    let _scale = 0;
                    _cvWidth = _$canvas.width();
                    _cvHeight = _$canvas.height();
                    _cvRatio = _cvWidth / _cvHeight;

                    if (_cvRatio > 1) {
                        _scale = _cvWidth / _baseWidth;
                    } else {
                        _scale = _cvHeight / _baseHeight;
                    }
                    _container.position.set(_cvWidth / 2, _cvHeight / 2);
                    _container.scale.set(_scale, _scale);
                    _app.renderer.resize(_cvWidth, _cvHeight);
                }

                function _responsiveImage(e) {
                    if (e.matches) {
                        _baseWidth = 990 * 2;
                        _baseHeight = 594 * 2;
                    } else {
                        _baseWidth = 492 * 1.5;
                        _baseHeight = 684 * 1.5;
                    }
                    _reDrawStageMask();
                    for (let k = 0; k < _$images.length; k++) {
                        for (let i = 0; i < 5; i++) {
                            if (_current === k) {
                                _reDrawLineMask(_lineArray[k].msks[i].sprite, i, _lineArray[k].msks, true);
                            } else {
                                _reDrawLineMask(_lineArray[k].msks[i].sprite, i, _lineArray[k].msks, false);
                            }
                        }
                    }

                    for (let _i2 = 0; _i2 < _imageArray.length; _i2++) {
                        if (e.matches) {
                            _imageArray[_i2].sp.visible = false;
                            _imageArray[_i2].pc.visible = true;
                        } else {
                            _imageArray[_i2].sp.visible = true;
                            _imageArray[_i2].pc.visible = false;
                        }
                    }
                }

                function _eventDispatch() {
                    const detail = {};
                    let event;
                    try {
                        event = new CustomEvent("PIXI_LOADED", { detail: detail });
                    } catch (e) {
                        event = document.createEvent("CustomEvent");
                        event.initCustomEvent("PIXI_LOADED", false, false, detail);
                    }
                    window.dispatchEvent(event);
                }
                return method;
            };

            return {
                init: _init,
            };
        })();

        return {
            init: _init,
        };
    })();

    GA.top.init();
})(jQuery);