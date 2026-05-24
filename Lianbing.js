/*
 *
 *
脚本功能：岗位练兵显示答案
脚本作者：Phdxmy
更新时间：2026年
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿转载与贩卖！
*******************************
[rewrite_local]
# >岗位练兵
^https:\/\/zhgh\.baocloud\.cn\/union\/handTrainingController\/tquestionsList url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/Lianbing.js

[mitm]
hostname = zhgh.baocloud.cn
*
*
*/


const data = $response.body;
const result = [];
 
try {
    // 解析JSON响应 
    const jsonData = JSON.parse(data);
    
    // 检查是否存在题目数组
    if (jsonData && jsonData.topicIdArr && Array.isArray(jsonData.topicIdArr)) {
        const questions = jsonData.topicIdArr;
        
        // 分批处理：每10题处理一次，避免超时 
        const batchSize = 10;
        let batchCount = 0;
        
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const trainTopic = question.trainTopic;
            
            if (trainTopic) {
                // 提取题目
                const topicName = trainTopic.topicName || "无题目";
                
                // 提取正确答案
                const correctAnswer = trainTopic.ext1 || "无答案";
                
                // 格式化答案
                let formattedAnswer = correctAnswer;
                
                // 如果答案包含多个选项（如"ABD"），保持原格式 
                // 如果答案是单个选项（如"A"），直接使用 
                // 对判断题的"对"、"错"也直接使用
                
                result.push(`题目：${topicName}\n答案：${formattedAnswer}`);
            }
            
            // 分批处理：每处理一批就记录一次
            batchCount++;
            if (batchCount >= batchSize) {
                console.log(`已处理 ${i+1} 道题目`);
                batchCount = 0;
            }
        }
        
        // 输出到Quantumult X日志
        if (result.length > 0) {
            console.log("========== 题目与答案提取结果 ==========");
            result.forEach(item => {
                console.log(item);
                console.log("----------------------------------------");
            });
            console.log(`总计提取了 ${result.length} 道题目`);
        } else {
            console.log("未找到有效的题目数据");
        }
    } else {
        console.log("JSON数据结构异常，未找到题目数组");
    }
} catch (error) {
    console.log(`JSON解析错误：${error.message}`);
    console.log("原始响应数据可能不是有效的JSON格式");
}
 
// 返回原始响应，不修改
$done({});