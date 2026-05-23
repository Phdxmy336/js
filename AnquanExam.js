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
    
    // 提取题目
    var stem = body.match(/"questionStem"\s*:\s*"([^"]{5,400})"/);
    
    // 用更短更精确的范围提取答案
    var ans = [];
    var seen = {};
    var pos = 0;
    
    while (ans.length < 10) {
        // 在更小的范围内查找
        pos = body.indexOf('"ifReply":"1"', pos);
        if (pos === -1) break;
        
        // 只在 ifReply 之前50个字符内查找 optionItem
        var sub = body.substring(Math.max(0, pos - 50), pos);
        var m = sub.match(/"optionItem":"([^"]+)"[^"]*"optionContent"/);
        
        if (m && !seen[m[1]]) {
            seen[m[1]] = true;
            ans.push(m[1]);
        }
        pos = pos + 10;
    }
    
    console.log((stem ? stem[1] : "") + "\n答案：" + ans.join(""));
}
main();