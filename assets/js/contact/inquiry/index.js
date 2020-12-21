(function ($) {
  var GA = window.GA || {};

  GA.inquiry = (function () {
    $('.p-textform input[type="tel"],.p-textform input[type="email"],.inquiry-address input[type="text"]').change(function () {
      var textVal = $(this).val();

      var replaseText = textVal
        .replace(/[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
        })
        .replace(/[‐－―]/g, "-")
        .replace(/[～〜]/g, "~")
        .replace(/　/g, " ");

      $(this).val(replaseText);
    });

    return {
      init: _init,
    };
  })();

  GA.inquiry.init();
})(jQuery);
