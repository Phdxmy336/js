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


// AnquanExam.js - 根据实际字段名修正
 
const RAW = JSON.parse($response.body);
const DATA = RAW.data || {};
const EXAM = DATA.exam || {};
 
let questions = [];
 
// 在 exam 下查找可能的题目数组
const possibleKeys = [
    "questions", "questionList", "questionVos", "questionsVos",
    "examQuestions", "examQuestionsVos", "pdexamQuestionsVos", 
    "dxexamQuestionsVos", "ddxexamQuestionsVos"
];
 
possibleKeys.forEach(key => {
    if (EXAM[key] && Array.isArray(EXAM[key])) {
        questions = questions.concat(EXAM[key]);
    }
});
 
// 提取答案
let RESULT = [];
questions.forEach((q, i) => {
    let correctOpts = [];
    
    (q.questionsOptions || []).forEach(o => {
        // ifReply 为 "1" 或 1 表示正确
        if (o.ifReply === "1" || o.ifReply === 1) {
            correctOpts.push(o.optionItem + ". " + o.optionContent);
        }
    });
    
    if (correctOpts.length > 0) {
        const qName = q.questionStem || ("题目" + (i + 1));
        RESULT.push((i + 1) + ". " + qName);
        RESULT.push("   答案: " + correctOpts.join(", "));
    }
});
 
const OUTPUT = RESULT.join("\n") || "未找到答案";
$prefs.setValueForKey(OUTPUT, "EXAM_ANSWERS");
console.log("✅ 答案:\n" + OUTPUT);
 
$done({ body: $response.body });