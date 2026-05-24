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


// ========== 主逻辑 ==========
const body = $response.body;
const result = [];
let totalCount = 0;
let successCount = 0;
 
try {
    const jsonData = JSON.parse(body);
    
    // 检查数据结构
    if (!jsonData || !jsonData.topicIdArr || !Array.isArray(jsonData.topicIdArr)) {
        console.log("⚠️ 未找到题目数组(topicIdArr)，请检查抓包数据是否正确。");
        console.log("响应数据前200字符: " + body.substring(0, 200));
        $notification.post(
            "题目提取失败", 
            "数据结构异常", 
            "未找到topicIdArr字段，请确认重写规则匹配的API是否正确"
        );
        $done({ body: body });
    }
    
    const questions = jsonData.topicIdArr;
    totalCount = questions.length;
    console.log(`📋 共检测到 ${totalCount} 道题目，开始提取...`);
    
    // 分批处理参数 
    const batchSize = 8;
    let processedCount = 0;
    
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const trainTopic = question?.trainTopic;
        
        if (trainTopic) {
            const topicName = trainTopic.topicName || "【题目缺失】";
            const correctAnswer = trainTopic.ext1 || "【答案缺失】";
            result.push(`题目：${topicName}\n答案：${correctAnswer}`);
            successCount++;
        } else {
            console.log(`⚠️ 第${i+1}题缺少trainTopic字段，已跳过`);
        }
        
        processedCount++;
        if (processedCount >= batchSize) {
            console.log(`⏳ 处理进度：${i + 1}/${totalCount}`);
            processedCount = 0;
        }
    }
    
    // ========== 输出结果到日志 ==========
    if (result.length > 0) {
        console.log("\n========== 🎯 提取结果（共" + result.length + "题） ==========\n");
        result.forEach((item, index) => {
            console.log(`【第${index + 1}题】`);
            console.log(item);
            console.log("----------------------------------------\n");
        });
        console.log(`✅ 提取完成！共成功提取 ${result.length}/${totalCount} 道题目。`);
        
        // ========== ✅ 发送成功通知 ==========
        $notification.post(
            "✅ 题目提取成功",                               // 标题
            `共提取 ${successCount}/${totalCount} 道题目`,    // 副标题
            "请打开Quantumult X日志查看完整题目与答案"         // 内容
        );
    } else {
        console.log("⚠️ 未能提取到任何有效题目，请检查数据结构。");
        $notification.post(
            "⚠ ️ 题目提取警告",
            "未提取到有效题目",
            "题目数据可能为空或结构不匹配，请检查日志"
        );
    }
    
} catch (error) {
    console.log(`❌ JSON解析失败：${error.message}`);
    console.log("原始数据前300字符: " + body.substring(0, 300));
    $notification.post(
        "❌ 题目提取异常",
        `JSON解析失败: ${error.message}`,
        "请检查API返回数据是否为有效JSON"
    );
}
 

// 返回原始响应，不修改
$done({});