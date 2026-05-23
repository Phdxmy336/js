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


// AnquanExam.js - 精确版
 
const RAW = JSON.parse($response.body);
const DATA = RAW.body || RAW;
let OUT = ["📋 正确答案\n"];
 
const TYPES = {
    "0": "判断",
    "1": "单选",
    "2": "多选"
};
 
// 从任意数组中提取答案
function extractFromArray(arr, type) {
    if (!Array.isArray(arr)) return;
    
    arr.forEach((q, i) => {
        let answers = [];
        let options = q.questionsOptions || [];
        
        options.forEach(opt => {
            if (opt.ifReply === "1") {
                answers.push(opt.optionContent);
            }
        });
        
        if (answers.length > 0) {
            let typeName = TYPES[q.questionsType] || "其他";
            let num = i + 1;
            let stem = (q.questionStem || "").substring(0, 40);
            OUT.push(`[${typeName}]${num}. ${stem}...`);
            OUT.push("  → " + answers.join(" / ") + "\n");
        }
    });
}
 
// 搜索所有可能的数组
Object.keys(DATA).forEach(key => {
    if (Array.isArray(DATA[key])) {
        extractFromArray(DATA[key]);
    }
});
 
const RESULT = OUT.join("\n") || "未找到答案";
$prefs.setValueForKey(RESULT, "EXAM_ANSWERS");
console.log(RESULT);
 
$done({ body: $response.body });