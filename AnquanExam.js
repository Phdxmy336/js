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


// 题目答案提取器 - Quantumult X 专用 
// 用于自动提取多选题、单选题、判断题的题目和答案并导出到日志 
 
const scriptName = "题目答案提取器";
 
function main() {
    // 获取原始数据（支持多种数据来源）
    let rawData = null;
    
    // 方式1：从HTTP响应体获取 
    if ($task && $task.response && $task.response.body) {
        rawData = $task.response.body;
    }
    // 方式2：从Surge/QuanX响应体获取 
    else if ($response && $response.body) {
        rawData = $response.body;
    }
    // 方式3：从环境变量获取测试数据 
    else if (typeof $env !== "undefined" && $env.testData) {
        rawData = $env.testData;
    }
    
    if (!rawData) {
        console.log("❌ [错误] 未获取到有效数据");
        return;
    }
    
    // 解析JSON数据 
    let jsonData;
    try {
        jsonData = JSON.parse(rawData);
    } catch (e) {
        console.log(`❌ [JSON解析错误] ${e.message}`);
        return;
    }
    
    // 提取题目列表（兼容多种数据结构）
    let questions = [];
    
    if (Array.isArray(jsonData)) {
        questions = jsonData;
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
        questions = jsonData.data;
    } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
        questions = jsonData.questions;
    } else if (jsonData.result && Array.isArray(jsonData.result)) {
        questions = jsonData.result;
    }
    
    if (questions.length === 0) {
        console.log("⚠ ️  [警告] 未找到题目数据");
        return;
    }
    
    // 题型映射 
    const typeMap = {
        "0": "判断题",
        "1": "单选题",
        "2": "多选题"
    };
    
    // 存储提取结果 
    let output = "";
    let count = { total: 0, danxuan: 0, duoxuan: 0, panduan: 0 };
    
    console.log("═══════════════════════════════════════");
    console.log(`📋 ${scriptName} - 开始提取`);
    console.log(`📊 共发现 ${questions.length} 道题目`);
    console.log("═══════════════════════════════════════\n");
    
    // 遍历处理每道题目 
    questions.forEach((question, index) => {
        const typeCode = question.questionsType || question.type || "1";
        const typeName = typeMap[typeCode] || "未知题型";
        const stem = question.questionStem || question.title || question.stem || "【无题目】";
        
        // 更新计数 
        count.total++;
        if (typeCode === "0") count.panduan++;
        else if (typeCode === "1") count.danxuan++;
        else if (typeCode === "2") count.duoxuan++;
        
        // 提取选项 
        let options = question.optionItem || question.options || question.choices || [];
        
        // 提取正确答案 
        let answerKeys = [];
        
        if (Array.isArray(options)) {
            options.forEach((opt, optIndex) => {
                // 兼容不同的选项格式 
                let isCorrect = false;
                
                if (typeof opt === "object") {
                    // 对象格式：{ optionKey: "A", optionValue: "...", ifReply: "1" }
                    isCorrect = opt.ifReply === "1" || opt.isCorrect === true || opt.correct === true;
                    if (isCorrect && opt.optionKey) {
                        answerKeys.push(opt.optionKey);
                    }
                } else if (typeof opt === "string") {
                    // 字符串格式，需要根据上下文判断 
                    // 这里可以添加自定义逻辑 
                }
            });
        }
        
        // 格式化答案 
        const answerStr = answerKeys.length > 0 ? answerKeys.join("") : "无正确答案标记";
        
        // 构建输出行 
        const separator = "─".repeat(50);
        output += `${separator}\n`;
        output += `【${index + 1}】${typeName}\n`;
        output += `题目：${stem}\n`;
        output += `答案：${answerStr}\n`;
        
        // 输出到控制台 
        console.log(`【${index + 1}】${typeName}`);
        console.log(`   题目：${stem}`);
        console.log(`   答案：${answerStr}\n`);
    });
    
    // 输出统计信息 
    console.log("═══════════════════════════════════════");
    console.log("📈 统计汇总");
    console.log(`   总计：${count.total} 题`);
    console.log(`   单选题：${count.danxuan} 题`);
    console.log(`   多选题：${count.duoxuan} 题`);
    console.log(`   判断题：${count.panduan} 题`);
    console.log("═══════════════════════════════════════");
    
    // 保存完整结果到环境变量（方便后续使用）
    if (typeof $env !== "undefined") {
        $env.extractedData = output;
    }
}
 
// 执行主函数 
main();