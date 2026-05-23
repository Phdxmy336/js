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
    var stem = body.match(/"questionStem"\s*:\s*"([^"]{5,400})"/);
    var ans = [];
    var idx = body.indexOf('"ifReply":"1"');
    while (idx > 0 && ans.length < 10) {
        var sub = body.substring(0, idx);
        var last = sub.lastIndexOf('"optionItem":"');
        if (last > 0) {
            var key = body.substring(last + 14, last + 15);
            ans.push(key);
        }
        idx = body.indexOf('"ifReply":"1"', idx + 1);
    }
    console.log((stem ? stem[1] : "未找到") + "\n答案：" + ans.join(""));
}
main();