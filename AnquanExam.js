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


// 题目答案提取器 - 适配安全考试系统
// 用于提取多选题、判断题、单选题的题目和答案
 
const scriptName = "题目答案提取器";
const TYPE_MAP = { "0": "判断题", "1": "单选题", "2": "多选题" };
 
function extractQuestions(data) {
    let questions = [];
    
    // 适配你的数据结构
    // 多选题
    if (data.oxexamQuestionsVos && Array.isArray(data.oxexamQuestionsVos)) {
        data.oxexamQuestionsVos.forEach(q => {
            q.questionsType = "2";
            questions.push(q);
        });
    }
    
    // 判断题
    if (data.dxexamQuestionsVos && Array.isArray(data.dxexamQuestionsVos)) {
        data.dxexamQuestionsVos.forEach(q => {
            q.questionsType = "0";
            questions.push(q);
        });
    }
    
    // 单选题
    if (data.sxexamQuestionsVos && Array.isArray(data.sxexamQuestionsVos)) {
        data.sxexamQuestionsVos.forEach(q => {
            q.questionsType = "1";
            questions.push(q);
        });
    }
    
    return questions;
}
 
function main() {
    let rawData = null;
    
    // 获取数据
    if ($task?.response?.body) rawData = $task.response.body;
    else if ($response?.body) rawData = $response.body;
    
    if (!rawData) {
        console.log("❌ 未获取到数据");
        return;
    }
    
    let data;
    try {
        data = JSON.parse(rawData);
    } catch (e) {
        console.log("❌ JSON解析失败: " + e.message);
        return;
    }
    
    const questions = extractQuestions(data);
    
    if (questions.length === 0) {
        console.log("⚠️ 未找到题目");
        return;
    }
    
    const stats = { total: 0, danxuan: 0, duoxuan: 0, panduan: 0 };
    
    console.log("═══════════════════════════════════");
    console.log("📋 题目答案提取结果");
    console.log("═══════════════════════════════════\n");
    
    questions.forEach((q, i) => {
        const type = TYPE_MAP[q.questionsType] || "未知";
        const stem = q.questionStem || "【无题目】";
        const options = q.optionItem || [];
        
        // 提取答案
        let answers = [];
        options.forEach(opt => {
            if (opt.ifReply === "1") {
                answers.push(opt.optionKey);
            }
        });
        
        // 统计
        stats.total++;
        if (q.questionsType === "0") stats.panduan++;
        else if (q.questionsType === "1") stats.danxuan++;
        else if (q.questionsType === "2") stats.duoxuan++;
        
        // 输出
        console.log(`【${i + 1}】${type}`);
        console.log(`题目: ${stem}`);
        console.log(`答案: ${answers.join("")}\n`);
    });
    
    console.log("═══════════════════════════════════");
    console.log(`📊 总计:${stats.total}题`);
    console.log(`   单选:${stats.danxuan} 多选:${stats.duoxuan} 判断:${stats.panduan}`);
    console.log("═══════════════════════════════════");
}
 
main();