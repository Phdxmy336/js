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


// 抓包重写 - 题目答案提取器
// 使用说明：添加到Quantumult X的Rewrite或Task模块，匹配相关请求URL 
 
let body = $response.body;
let logResults = []; // 存储提取结果的数组 
 
try {
    // 尝试解析JSON响应 
    let data = JSON.parse(body);
    
    // 检查是否有题目数据（根据您的数据结构，题目通常在数组里）
    if (data && data.data && Array.isArray(data.data)) {
        let questions = data.data;
        
        questions.forEach((question, index) => {
            // 只处理包含有效信息的题目 
            if (question.questionStem && question.questionsType !== undefined) {
                let result = processQuestion(question);
                if (result) {
                    logResults.push(result);
                }
            }
        });
        
        // 如果有提取到题目，输出到日志 
        if (logResults.length > 0) {
            outputToLog(logResults);
        }
    }
} catch (e) {
    // 如果JSON解析失败或数据格式不同，尝试其他处理方式
    handleLargeData(body);
}
 
function processQuestion(question) {
    let questionType = "";
    let answer = "";
    
    // 判断题目类型 
    switch(question.questionsType) {
        case "0":
            questionType = "判断题";
            break;
        case "1":
            questionType = "单选题";
            break;
        case "2":
            questionType = "多选题";
            break;
        default:
            questionType = "未知题型";
    }
    
    // 提取题目前6个字
    let questionPreview = question.questionStem;
    if (questionPreview && questionPreview.length > 6) {
        questionPreview = questionPreview.substring(0, 6) + "…";
    }
    
    // 提取正确答案
    if (question.questionsOptions && Array.isArray(question.questionsOptions)) {
        let correctOptions = [];
        question.questionsOptions.forEach(option => {
            if (option.ifReply === "1") {
                correctOptions.push(option.optionItem);
            }
        });
        answer = correctOptions.join("");
    }
    
    // 如果找到答案，返回格式化结果
    if (answer) {
        return `${questionType}：${questionPreview}\n答案：${answer}`;
    }
    
    return null;
}
 
function handleLargeData(body) {
    // 处理大数据的备选方案：使用正则表达式直接提取
    let pattern = /"questionsType":"(\d)","questionStem":"([^"]+?)".*?"questionsOptions":\[(.*?)\]/g;
    let match;
    let chunkSize = 50000; // 每次处理50KB，防止内存溢出 
    let processed = 0;
    
    while (processed < body.length) {
        let chunk = body.substring(processed, processed + chunkSize);
        processed += chunkSize;
        
        // 重置正则表达式 
        pattern.lastIndex = 0;
        
        while ((match = pattern.exec(chunk)) !== null) {
            let questionType = match[1];
            let questionStem = match[2];
            let optionsStr = match[3];
            
            // 提取正确答案 
            let answerPattern = /"optionItem":"([A-Z])","optionContent".*?"ifReply":"1"/g;
            let answerMatch;
            let answers = [];
            
            while ((answerMatch = answerPattern.exec(optionsStr)) !== null) {
                answers.push(answerMatch[1]);
            }
            
            if (answers.length > 0) {
                let typeName = getTypeName(questionType);
                let preview = questionStem.length > 6 ? questionStem.substring(0, 6) + "…" : questionStem;
                logResults.push(`${typeName}：${preview}\n答案：${answers.join("")}`);
            }
        }
    }
    
    if (logResults.length > 0) {
        outputToLog(logResults);
    }
}
 
function getTypeName(typeCode) {
    switch(typeCode) {
        case "0": return "判断题";
        case "1": return "单选题";
        case "2": return "多选题";
        default: return "未知题型";
    }
}
 
function outputToLog(results) {
    let timestamp = new Date().toLocaleString();
    let output = `\n=== 题目答案提取结果 (${timestamp}) ===\n`;
    output += `共提取 ${results.length} 道题目\n\n`;
    
    results.forEach((result, index) => {
        output += `${index + 1}. ${result}\n\n`;
    });
    
    output += "=== 提取完成 ===\n";
    
    // 输出到Quantumult X日志 
    console.log(output);
    
    // 同时保存到持久化存储（如果需要）
    $persistentStore.write(output, "exam_answers");
}
 
// 任务调度版本（处理超时问题）
if (typeof $task !== 'undefined') {
    // 如果作为定时任务运行，添加超时保护 
    setTimeout(() => {
        if (logResults.length === 0) {
            console.log("⚠ ️ 数据处理超时，尝试分块处理...");
            // 可以在这里添加分块处理的逻辑
        }
    }, 5000); // 5秒超时 
}
 
$done({});