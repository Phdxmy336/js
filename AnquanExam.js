/*
 *
 *
脚本功能：安全e家答题
脚本作者：Phdxmy
更新时间：2026年
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿转载与贩卖！
*******************************
[rewrite_local]
# >安全E家答题
^https:\/\/mobile\.baowugroup\.com\/com\.baosight\.wisdomsecurity\/service\/bggfab-px\/mobileapi\/startExam url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/AnquanExam.js

[mitm]
hostname = mobile.baowugroup.com
*
*
*/


function main() {
    var b = $request.body || $response.body || "";
    var s = b.match(/"questionStem"\s*:\s*"([^"]{5,150})"/g) || [];
    var r = /"ifReply":"1"/g;
    var a = [];
    var m;
    while ((m = r.exec(b)) !== null && a.length < 10) {
        var sub = b.substring(Math.max(0, m.index - 50), m.index);
        var k = sub.match(/"optionItem"\s*:\s*"([^"]+)"/);
        if (k && a.indexOf(k[1]) < 0) a.push(k[1]);
    }
    var t = s.length > 1 ? "📝 共" + s.length + "题" : "📝 " + s[0].substring(0, 50);
    $notification.post(t, "答案：" + a.join(""), "点击查看完整题目");
}
main();