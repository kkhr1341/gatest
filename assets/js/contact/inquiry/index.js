(function ($) {
  var GA = window.GA || {};

  GA.inquiry = function () {
    var _init = function _init() {
      $('.inquiry-check').change(function () {
        var isChecked = $(this).prop('checked');
        var $target = $('.js-toggleActive');

        if (isChecked) {
          $target.prop('disabled', false);
        } else {
          $target.prop('disabled', true);
        }
      });
    };

    $('.p-textform input[type="tel"],.p-textform input[type="email"],.inquiry-address input[type="text"]').change(function () {
      var textVal = $(this).val();

      var replaseText = textVal.replace(/[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      }).replace(/[‐－―]/g, '-') 
      .replace(/[～〜]/g, '~') 
      .replace(/　/g, ' '); 

      $(this).val(replaseText);
    });

    return {
      init: _init
    };
  }();

  GA.inquiry.init();
})(jQuery);