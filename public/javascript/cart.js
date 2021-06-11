$(document).ready (function () {
    function priceBouquet($amount, $price) {
        return parseFloat($amount.val()) * parseFloat($price.val());
    };

    function priceTotal() {
        var price = 0.0;
        $(".price_bouquet").each(function () {
            price = price + parseFloat($(this).text())
        });
        return price;
    };
    $('.amount_bouquet').change(function () {
        if ($(this).val() == 0) {
            if (confirm('You want delete it from your cart?')) {
                $(this).parents("#command").remove();
            } else {
                $(this).val(1);
            }
        }
        $(this).parent().children(".price_bouquet").text(priceBouquet($(this).parent().children(".amount_bouquet"), $(this).parent().children(".price_for_one")));
        if ($(".price_bouquet").length > 0 ) {
            $("#total").val(priceTotal());
        } else {
            $("#div_total").hide();
        }
    });
    $(".amount_bouquet").each(function () {
        if ($(this).val() == 0) {
            $(this).parent().remove();
        }
    });
    $(".price_bouquet").each(function () {
        $(this).parent().children(".price_bouquet").text(priceBouquet($(this).parent().children(".amount_bouquet"), $(this).parent().children(".price_for_one")));
    });
    if ($(".price_bouquet").length > 0) {
        $("#total").val(priceTotal());
    } else {
        $("#div_total").hide();
    }
});