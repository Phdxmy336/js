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



// Quantumult X 考试答案提取脚本
 
const BODY = JSON.parse($response.body);
const DATA = BODY.body || BODY;
let OUTPUT = [];
 
const TYPES = [
    { key: "pdexamQuestionsVos", name: "判断题" },
    { key: "dxexamQuestionsVos", name: "选择题" },
    { key: "ddxexamQuestionsVos", name: "多选题" }
];
 
TYPES.forEach(t => {
    const list = DATA[t.key];
    if (!list || !Array.isArray(list)) return;
    
    OUTPUT.push("【" + t.name + "】");
    
    list.forEach((q, idx) => {
        let ans = [];
        (q.questionsOptions || []).forEach(o => {
            if (o.ifReply === "1") ans.push(o.optionContent);
        });
        if (ans.length) OUTPUT.push((idx + 1) + ". " + ans.join(" / "));
    });
});
 
const RESULT = OUTPUT.join("\n") || "无答案";
$clipboard.write({ string: RESULT });
console.log(RESULT);
$done({ body: $response.body });