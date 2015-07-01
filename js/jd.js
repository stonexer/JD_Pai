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
        remainTime = parseInt(data.remainTime/1000,10);
        $("#auction3Timer").append("<b> "+remainTime+"秒 </b>");
        if (price <= priceMax) {
            $(".quantity-text:last").val(price);
        } else {
            $(".quantity-text:last").val(price);
            show_msg("超过心愿价了，放弃吧孩子...");
        }
    });
}


function singlePai(uid) {
    var price;
    var priceMax = $('#max_price').val();
    var queryIt = "http://paimai.jd.com/json/current/englishquery?paimaiId=" + uid + "&skuId=0&t=" + getRamdomNumber() + "&start=0&end=9";
    $.get(queryIt, function(data) {
        if (my_price < data.currentPrice) {
            price = data.currentPrice * 1 + 1;
            jQuery('#auction3dangqianjia').val(data.currentPrice);
            if (price <= priceMax) {
                var buyIt = "http://paimai.jd.com/services/bid.action?t=" + getRamdomNumber() + "&paimaiId=" + uid + "&price=" + price + "&proxyFlag=0&bidSource=0";
                $.get(buyIt, function(data) {
                    if (data !== undefined) {
                        if (data.result == "200") {
                            my_price = price;
                        }
                        handle_response(data);
                    }
                }, 'json');
            } else {
                show_msg("超过心愿价了，放弃吧孩子...");
            }
        } else {
            show_msg("该商品正在你的手中...");
        }
    });
}


function crazyPai(uid) {
    var obj = self.setInterval(function() {
        singlePai(uid);
    }, 1000);
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
    }, 500);
}

var priceLimit = parseInt(parseInt(/\d+/.exec($("del").html()), 10), 10);
console.log($("del").html());

var code = "<div id='control_bar'>" +
    "<select id='discount'><option value='2'>两折</option><option value='4'>四折</option><option value='6'>六折</option></select>" +
    "价：<input type='text' id='discount_price' readonly />" +
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
var my_price = 0;

$('#discount_price').val(parseInt(priceLimit * 0.2, 10));
$('#max_price').val(parseInt(priceLimit * 0.2, 10));

$('#btn_refresh').on('click', function() {
    queryPrice(uid);
});
$('#btn_single_pai').on('click', function() {
    singlePai(uid);
});
$('#discount').on('change', function() {
    var dis = $('#discount').val();
    $('#discount_price').val(parseInt(priceLimit * dis / 10, 10));
    $('#max_price').val(parseInt(priceLimit * dis / 10, 10));
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