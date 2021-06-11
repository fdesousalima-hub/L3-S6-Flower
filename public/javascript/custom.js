$(document).ready (function () {
    function priceTotal() {
        var price = 0.0;
        $('.input_flower').each(function () {
            price = price + parseFloat($(this).val()) * parseFloat($(this).parent().children(".price_flower").text());
        });
        return price * $('input[name="amount"]').val();
    }
    $('input').change(function () {
        $(".price_total").val(priceTotal());
    });
    $(".price_total").val(priceTotal());
});