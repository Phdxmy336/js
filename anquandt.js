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
 
// 脚本名称：question_capture.js 
// 功能：自动捕获并整合题目与答案，通过通知导出。
 
// 1. 初始化存储数组（利用持久化存储，防止刷新丢失）
// 尝试从持久化存储$persistentStore中读取已存题目 
let storedQuestions = $persistentStore.read(“CapturedQuestions“);
let questionList = storedQuestions ? JSON.parse(storedQuestions) : [];
 
// 2. 提取当前响应包中的题目和答案 
const responseBody = $response.body;
try {
    const jsonData = JSON.parse(responseBody);
    
    // 检查响应结构是否包含所需数据 
    if (jsonData && jsonData.success && jsonData.data) {
        const question = jsonData.data.topicTxt;
        const answer = jsonData.data.topicAnswer;
        
        // 基础校验，确保提取到有效内容 
        if (question && answer) {
            // 3. 检查当前题目是否已存在，避免重复添加（基于题目文本判断）
            const isDuplicate = questionList.some(item => item.question === question);
            if (!isDuplicate) {
                // 将新题目加入数组 
                questionList.push({
                    question: question,
                    answer: answer 
                });
                
                // 4. 更新持久化存储 
                $persistentStore.write(JSON.stringify(questionList), “CapturedQuestions“);
                
                // （可选）单题捕获提示，实际使用时可以注释掉以避免频繁通知 
                // $notification.post(‘题目捕获‘, `已添加第${questionList.length}题`, question);
            }
        }
    }
} catch (e) {
    // JSON解析或数据处理错误 
    console.log(`脚本处理响应时出错：${e}`);
}
 
// 5. 判断是否已收集完所有题目（例如收集满20道）并触发最终通知 
// 此处以20道题为例，您可以根据实际总数修改 `targetCount`
const targetCount = 20;
if (questionList.length >= targetCount) {
    // 格式化输出文本 
    let outputText = `已收集完成，共${questionList.length}题：\n\n`;
    questionList.forEach((item, index) => {
        // 按照您要求的格式：“第N题：题目\n答案：X”
        outputText += `第${index + 1}题：${item.question}\n答案：${item.answer}\n\n`;
    });
    
    // 发送整合通知 
    $notification.post(‘题目收集完成‘, `共${questionList.length}道题`, outputText);
    
    // 6. （可选）导出后清空存储，为下次收集做准备 
    // $persistentStore.write(‘‘, “CapturedQuestions“);
}
 
// 必须返回原始的响应体，不影响正常应用功能 
$done({});