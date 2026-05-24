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


// Quantumult X Rewrite Script: 提取题目与答案并通知 (带序号版)
(() => {
    'use strict';
    // 获取响应体
    const response = $response;
    let body = response.body;
 
    try {
        const dataObj = JSON.parse(body);
        const topicArray = dataObj.topicIdArr;
 
        if (!topicArray || !Array.isArray(topicArray)) {
            console.log("响应体中未找到有效的题目数组 (topicIdArr)。");
            $done({});
            return;
        }
 
        let notificationContent = "📚 题目与答案汇总\n\n";
        let questionCount = 0;
 
        topicArray.forEach((item, index) => {
            const trainTopic = item.trainTopic;
            if (trainTopic && trainTopic.topicName && trainTopic.ext1) {
                questionCount++; // 计数器递增，代表当前是第几题
                notificationContent += `第${questionCount}题\n题目：${trainTopic.topicName}\n答案：${trainTopic.ext1}\n`;
                if (index < topicArray.length - 1) {
                    notificationContent += "───\n";
                }
            } else {
                console.log(`跳过第 ${index + 1} 项，缺少必要字段 (topicName 或 ext1)。`);
            }
        });
 
        notificationContent += `\n✅ 共提取 ${questionCount} 道题目。`;
        $notify("抓包题目答案提取", `成功解析${questionCount}题`, notificationContent);
 
    } catch (error) {
        console.log("解析响应JSON时出错: " + error.message);
        $notify("脚本执行错误", "解析失败", "响应体可能不是有效的JSON格式。");
    }
 
    $done({});
})();