$(document).ready (function () {
    (function ($) {
        setInterval(function () {
            $(".slide ul li:first-child").animate({ "margin-left": -470 }, 800, function () {
                $(this).css("margin-left", 0).appendTo(".slide ul");
            });
        }, 3500);
    })(jQuery);
});