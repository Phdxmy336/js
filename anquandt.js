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
*/
 

// 1. 从持久化存储中读取已保存的题目列表 
let storedQuestions = $persistentStore.read("CapturedQuestions");
let questionList = storedQuestions ? JSON.parse(storedQuestions) : [];
 
// 2. 解析当前响应包内容 
const responseBody = $response.body;
try {
    const jsonData = JSON.parse(responseBody);
    
    // 根据实际抓包结构校验字段（示例为 jsonData.success && jsonData.data）
    if (jsonData && jsonData.success && jsonData.data) {
        const question = jsonData.data.topicTxt;
        const answer = jsonData.data.topicAnswer;
        
        if (question && answer) {
            // 3. 去重：基于题目文本判断，避免重复添加 
            const isDuplicate = questionList.some(item => item.question === question);
            if (!isDuplicate) {
                questionList.push({
                    question: question,
                    answer: answer 
                });
                
                // 4. 将更新后的列表写回持久化存储 
                $persistentStore.write(JSON.stringify(questionList), "CapturedQuestions");
                
                console.log(`已捕获第${questionList.length}题：${question}`);
            }
        }
    }
} catch (e) {
    console.log(`脚本处理响应出错：${e}`);
}
 
// 5. 判断是否已收集满指定数量的题目（这里假设总共20题）
const targetCount = 20;
if (questionList.length >= targetCount) {
    // 格式化输出文本 
    let outputText = `题目收集完成，共${questionList.length}题：\n\n`;
    questionList.forEach((item, index) => {
        outputText += `第${index + 1}题：${item.question}\n答案：${item.answer}\n\n`;
    });
    
    // 发送通知 
    $notification.post("题目收集完成", `总计${questionList.length}道题`, outputText);
    
    // 6. 可选：导出后清空存储，为下次收集做准备（取消注释即可启用）
    // $persistentStore.write("", "CapturedQuestions");
}
 
// 必须返回原始响应体，以保证应用功能正常 
$done({});