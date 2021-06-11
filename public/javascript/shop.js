$(document).ready (function () {
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 100,
        values: [0, 100],
        slide: function (event, ui) {
            $("#price").val(ui.values[0] + "€ - " + ui.values[1] + "€");
            $(".price").each(function (i) {
                var price = parseFloat($(this).children(".price_str").text());
                if (price < ui.values[0] || price > ui.values[1]) {
                    $(this).parents("#bouquet").hide();
                } else {
                    $(this).parents("#bouquet").show();
                }
            });
        }
    });
    $("#price").val($("#slider-range").slider("values", 0) +
        "€ - " + $("#slider-range").slider("values", 1) + "€");
});