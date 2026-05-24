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


// 提取题目和答案的Quantumult X脚本 
const extractQuestions = () => {
    try {
        const response = JSON.parse($response.body);
        if (!response || !response.isSuccess) return;
 
        let output = "";
        
        if (response.replyDetailId && Array.isArray(response.questionsOptions)) {
            response.questionsOptions.forEach(question => {
                // 确定题型
                let questionType = "";
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
                
                // 提取题目 
                const stem = question.questionStem || "无题目内容";
                
                // 提取正确答案 
                let correctAnswers = [];
                if (question.questionsOptions && Array.isArray(question.questionsOptions)) {
                    question.questionsOptions.forEach(option => {
                        if (option.ifReply === "1") {
                            correctAnswers.push(option.optionItem);
                        }
                    });
                }
                
                // 构建输出 
                output += `${questionType}：${stem}\n`;
                output += `答案：${correctAnswers.join("")}\n\n`;
            });
            
            // 输出到Quantumult X日志
            console.log(output);
            $notify("题目提取完成", "", `已提取${response.questionsOptions.length}道题目`);
        }
    } catch (e) {
        console.log(`解析错误：${e}`);
        $notify("解析错误", "", e.message);
    }
};
 
// 执行提取 
extractQuestions();
$done();