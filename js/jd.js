function getRamdomNumber() {
    var num = "";
    for (var i = 0; i < 6; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

function queryPrice(uid) {
    var price;
    var priceMax = $('#max_price').val();
    var time = new Date().getTime();
    var queryIt = "http://paimai.jd.com/json/current/englishquery?paimaiId=" + uid + "&skuId=0&t=" + time + "&start=0&end=9";
    $.get(queryIt, function(data) {
        price = data.currentPrice * 1 + 1;
        if (price <= priceMax) {
            $(".quantity-text:last").val(price);
        } else {
            show_msg("超过心愿价了，放弃吧孩子...");
        }
    });
}


function singlePai(uid) {
    var price;
    var priceMax = $('#max_price').val();
    var queryIt = "http://paimai.jd.com/json/current/englishquery?paimaiId=" + uid + "&skuId=0&t=" + getRamdomNumber() + "&start=0&end=9";
    $.get(queryIt, function(data) {
        price = data.currentPrice * 1 + 1;
        jQuery('#auction3dangqianjia').val(data.currentPrice);
        if (price <= priceMax) {
            var buyIt = "http://paimai.jd.com/services/bid.action?t=" + getRamdomNumber() + "&paimaiId=" + uid + "&price=" + price + "&proxyFlag=0&bidSource=0";
            $.get(buyIt, function(data) {
                if (data !== undefined) {
                    handle_response(data);
                }
            }, 'json');
        } else {
            show_msg("超过心愿价了，放弃吧孩子...");
        }
    });
}

function crazyPai(uid) {
    var obj = self.setInterval(function() {
        singlePai(uid);
    }, 5000);
    return obj;
}

function handle_response(response) {
    if (response.result == "200") {
        show_msg("成功抢拍一次...");
    } else {
        show_msg("失败了..." + response.message);
    }
}

function show_msg(msg) {
    $(".ftx").append("<p class='p_msg'>" + msg + "</p>");
    setTimeout(function() {
        $('.p_msg').remove();
    }, 1000);
}

var priceLimit = parseInt(parseInt(/\d+/.exec($("del").html()), 10) * 0.1, 10);
console.log($("del").html());

var code = "<div id='control_bar'>" +
    "两折价：<input type='text' id='discount_price' readonly />" +
    "心愿价：<input type='text' id='max_price' />" +
    "<input type='button' value='刷新价格' id='btn_refresh' class='qp_btn' />" +
    "<input type='button' value='单击抢拍' id='btn_single_pai' class='qp_btn'/>" +
    "<input type='button' value='疯狂自动抢拍' id='btn_crazy_pai' class='qp_btn'/>" +
    "</div>";

$('body').prepend(code);
// $('.auction_btn').prepend(code);

var addr = document.location.href;
var uid = /[\d]{4,8}/.exec(addr)[0];
var switcher;
var my_win;

$('#discount_price').val(priceLimit);
$('#max_price').val(priceLimit);

$('#btn_refresh').on('click', function() {
    queryPrice(uid);
});
$('#btn_single_pai').on('click', function() {
    singlePai(uid);
});
$('#btn_crazy_pai').on('click', function() {
    if (this.value == '疯狂自动抢拍') {
        switcher = crazyPai(uid);
        show_msg("已打开疯狂抢购...");
        this.value = '关闭自动抢拍';
    } else {
        window.clearInterval(switcher);
        show_msg("已关闭自动抢购...");
        this.value = '疯狂自动抢拍';
    }
});