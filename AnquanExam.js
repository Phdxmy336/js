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
    var body = $request.body || $response.body || "";
    var stem = body.match(/"questionStem"\s*:\s*"([^"]{10,500})"/);
    var ans = body.match(/"ifReply"\s*:\s*"1"[^]{0,200}?"optionItem"\s*:\s*"([A-Z])"/g) || [];
    var keys = [];
    for (var i = 0; i < ans.length; i++) {
        var m = ans[i].match(/optionItem"\s*:\s*"([A-Z])"/);
        if (m) keys.push(m[1]);
    }
    console.log((stem ? stem[1] : "") + "\n答案：" + keys.join(""));
}
main();