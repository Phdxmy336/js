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
    
    // 提取所有题目
    var stems = body.match(/"questionStem"\s*:\s*"([^"]{5,300})"/g) || [];
    
    // 提取所有答案
    var r = /"ifReply":"1"/g;
    var allAns = [];
    var m;
    while ((m = r.exec(body)) !== null) {
        var sub = body.substring(Math.max(0, m.index - 60), m.index);
        var k = sub.match(/"optionItem"\s*:\s*"([^"]+)"/);
        if (k) allAns.push(k[1]);
    }
    
    // 输出
    var out = "\n";
    for (var i = 0; i < stems.length; i++) {
        var stem = stems[i].match(/"questionStem"\s*:\s*"([^"]{5,300})"/);
        var ans = allAns.slice(i * 4, i * 4 + 4).join("");
        out += (stem ? stem[1] : "") + "\n答案：" + ans + "\n\n";
    }
    console.log(out);
}
main();