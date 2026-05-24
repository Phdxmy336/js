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


// 题目答案提取器 v2.0
// 适用于安全考试/答题类应用
 
const scriptName = "题目答案提取器";
const TYPE_MAP = { "0": "判断题", "1": "单选题", "2": "多选题" };
 
function extractQuestions(rawData) {
    if (!rawData) return { success: false, error: "无数据" };
    
    // 尝试多种数据结构
    let questions = [];
    const json = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    
    // 路径1: data[]
    if (json.data && Array.isArray(json.data)) questions = json.data;
    // 路径2: questions[]
    else if (json.questions && Array.isArray(json.questions)) questions = json.questions;
    // 路径3: result[]
    else if (json.result && Array.isArray(json.result)) questions = json.result;
    // 路径4: 直接是数组
    else if (Array.isArray(json)) questions = json;
    // 路径5: 嵌套在其他字段 
    else {
        for (let key in json) {
            if (Array.isArray(json[key]) && json[key].length > 0) {
                if (json[key][0].questionStem || json[key][0].title) {
                    questions = json[key];
                    break;
                }
            }
        }
    }
    
    if (questions.length === 0) {
        console.log("JSON结构预览:", JSON.stringify(json).响应体获取
    if ($task?.response?.body) rawData = $task.response.body;
    else if ($response?.body) rawData = $response.body;
    else if (typeof testData !== "undefined") rawData = testData;
    
    if (!rawData) {
        console.log("❌ 未获取到数据");
        return;
    }
    
    const result = extractQuestions(rawData);
    if (!result.success || result.data.length === 0) {
        console.log("❌ 解析失败:", result.error);
        return;
    }
    
    const questions = result.data;
    const stats = { total: 0, danxuan: 0, duoxuan: 0, panduan: 0 };
    
    console.log("═══════════════════════════════════");
    console.log(`📋 提取到 ${questions.length} 道题目`);
    console.log("═══════════════════════════════════\n");
    
    questions.forEach((q, i) => {
        const type = TYPE_MAP[q.questionsType] || TYPE_MAP[q.type] || "未知";
        const stem = q.questionStem || q.title || q.stem || "【无题目】";
        const options = q.optionItem || q.options || q.choices || [];
        
        // 提取答案
        let answers = [];
        if (Array.isArray(options)) {
            options.forEach(opt => {
                if (typeof opt === "object" && opt.ifReply === "1") {
                    answers.push(opt.optionKey);
                }
            });
        }
        
        // 统计
        stats.total++;
        if (q.questionsType === "0") stats.panduan++;
        else if (q.questionsType === "1") stats.danxuan++;
        else if (q.questionsType === "2") stats.duoxuan++;
        
        console.log(`【${i+1}】${type}`);
        console.log(`题目: ${stem}`);
        console.log(`答案: ${answers.join("") || "无标记"}\n`);
    });
    
    console.log("═══════════════════════════════════");
    console.log(`📊 单选:${stats.danxuan} 多选:${stats.duoxuan} 判断:${stats.panduan}`);
    console.log("═══════════════════════════════════");
}
 
main();