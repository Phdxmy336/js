/*
 *
 *
脚本功能：自动收集20题答案
脚本作者：Phdxmy
更新时间：2026年
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿转载与贩卖！
*******************************
[rewrite_local]
# >安全知识
^https:\/\/zhgh\.baocloud\.cn\/union\/tZhunionDtTopic url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/anquandt.js

[mitm]
hostname = zhgh.baocloud.cn
*
*
 
const KEY = 'auto_exam_answers';  // 持久化存储的键名 
const TOTAL = 20;                // 总题数 
 
// 检查是否禁用脚本（可通过重写规则排除不需要的状态码等，此处默认启用）
if ($response.status !== 200) {
    $done({});
}
 
let body = null;
try {
    body = JSON.parse($response.body);
} catch (e) {
    console.log('响应体非JSON，跳过');
    $done({});
}
 
// 提取题目和答案（字段名请根据实际JSON结构调整）
const question = body.topicTxt || body.topicTxt || '';
const answer = body.topicAnswer || body.topicAnswer || '';
 
if (!question || !answer) {
    console.log('未找到题目或答案字段，跳过');
    $done({});
}
 
// 从持久化存储读取已收集的题目数组 
let stored = $prefs.valueForKey(KEY);
let list = [];
if (stored) {
    try {
        list = JSON.parse(stored);
    } catch (e) {
        list = [];
    }
}
 
// 避免重复收集同一题（根据题目文本去重，若文本可能完全一致可改为检查对象包含关系）
const exists = list.some(item => item.question === question);
if (!exists) {
    list.push({ question: question, answer: answer });
    $prefs.setValueForKey(JSON.stringify(list), KEY);
}
 
// 当收集满指定题数时，生成通知并清空存储 
if (list.length >= TOTAL) {
    // 生成通知内容：按照收集顺序编号 
    let notifyText = '';
    list.slice(0, TOTAL).forEach((item, index) => {
        notifyText += `第${index + 1}题：${item.question}\n答案：${item.answer}\n\n`;
    });
 
    $notify('✅ 答案收集完毕', `共${TOTAL}道题`, notifyText.trim());
    
    // 清空存储，为下次收集做准备 
    $prefs.setValueForKey(null, KEY);
}
 
$done({});