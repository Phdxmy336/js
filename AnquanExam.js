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
^https:\/\/mobile\.baowugroup\.com\/com\.baosight\.wisdomsecurity\/service\/bggfab-px\/mobileapi\/startExam  url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/AnquanExam.js

[mitm]
hostname = mobile.baowugroup.com
*
*
*/


// 保存为: exam_answer.js
 
// 模拟的响应数据（实际使用时由QX传入）
const responseBody = $response.body;
const data = JSON.parse(responseBody);
 
// 用于存储所有正确答案
let answers = [];
 
// ==================== 处理单选题/多选题 ====================
function processQuestions(questions, typeName) {
    if (!questions || questions.length === 0) return;
    
    let section = `\n【${typeName}】\n`;
    let hasAnswer = false;
    
    questions.forEach((q, qIndex) => {
        const questionText = q.questionStem || `题目${qIndex + 1}`;
        let correctOptions = [];
        
        if (q.questionsOptions && q.questionsOptions.length > 0) {
            q.questionsOptions.forEach(opt => {
                if (opt.ifReply === "1") {
                    correctOptions.push(`${opt.optionItem}. ${opt.optionContent}`);
                }
            });
        }
        
        if (correctOptions.length > 0) {
            hasAnswer = true;
            section += `${qIndex + 1}. ${questionText}\n`;
            section += `   ✅ 正确答案: ${correctOptions.join(", ")}\n\n`;
        }
    });
    
    if (hasAnswer) {
        answers.push(section);
    }
}
 
// ==================== 处理判断题 ====================
function processJudgeQuestions(questions, typeName) {
    if (!questions || questions.length === 0) return;
    
    let section = `\n【${typeName}】\n`;
    let hasAnswer = false;
    
    questions.forEach((q, qIndex) => {
        const questionText = q.questionStem || `题目${qIndex + 1}`;
        let correctAnswer = "错误";
        
        if (q.questionsOptions && q.questionsOptions.length > 0) {
            q.questionsOptions.forEach(opt => {
                if (opt.ifReply === "1") {
                    correctAnswer = opt.optionContent;
                }
            });
        }
        
        hasAnswer = true;
        section += `${qIndex + 1}. ${questionText}\n`;
        section += `   ✅ ${correctAnswer}\n\n`;
    });
    
    if (hasAnswer) {
        answers.push(section);
    }
}
 
// ==================== 执行处理 ====================
try {
    // 处理各种类型的题目
    if (data.body) {
        const body = data.body;
        
        // 判断题 (pdexamQuestionsVos)
        if (body.pdexamQuestionsVos) {
            processJudgeQuestions(body.pdexamQuestionsVos, "判断题");
        }
        
        // 选择题 (dxexamQuestionsVos)
        if (body.dxexamQuestionsVos) {
            processQuestions(body.dxexamQuestionsVos, "选择题");
        }
        
        // 多选题 (ddxexamQuestionsVos) - 如果有的话
        if (body.ddxexamQuestionsVos) {
            processQuestions(body.ddxexamQuestionsVos, "多选题");
        }
    }
    
    // 格式化最终答案
    const finalAnswer = answers.length > 0 
        ? `📝 正确答案汇总\n${"─".repeat(30)}\n${answers.join("\n")}`
        : "未找到正确答案";
    
    // 写入剪贴板
    $clipboard.write({
        string: finalAnswer
    });
    
    // 显示通知
    $notification.post("✅ 答案已复制", "正确答案已自动复制到剪贴板", finalAnswer);
 
} catch (e) {
    $notification.post("❌ 脚本执行错误", "", e.message);
}
 
// 最终输出（用于QX日志）
$done({ body: responseBody });