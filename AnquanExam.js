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
    var seen = {};
    var idx = 0;
    while (ans.length < 10) {
        idx = body.indexOf('"ifReply":"1"', idx);
        if (idx === -1) break;
        var sub = body.substring(Math.max(0, idx - 200), idx);
        var m = sub.match(/"optionItem":"([^"]+)"/);
        if (m && !seen[m[1]]) {
            seen[m[1]] = true;
            ans.push(m[1]);
        }
        idx++;
    }
    console.log((stem ? stem[1] : "") + "\n答案：" + ans.join(""));
}
main();