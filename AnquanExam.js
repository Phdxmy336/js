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


// 题目提取脚本 - 适用于Quantumult X
// 自动提取题目和答案，只显示题目前6字和答案
 
const 题目提取 = {
    doIt: async function () {
        const 原始数据 = $response.body;
        
        try {
            const 数据 = JSON.parse(原始数据);
            const 题目列表 = 数据.data.questionList || [];
            
            let 输出内容 = [];
            输出内容.push("═══════════════════════════════");
            输出内容.push("📝 题目提取结果");
            输出内容.push("═══════════════════════════════\n");
            
            题目列表.forEach((题目, 索引) => {
                const 类型 = 题目.questionsType;
                const 题干 = 题目.questionStem || "";
                const 题目简写 = 题干.substring(0, 6) + "…";
                
                let 类型名称 = "";
                let 答案 = "";
                
                // 判断题目类型
                if (类型 === "0") {
                    类型名称 = "判断题";
                } else if (类型 === "1") {
                    类型名称 = "单选题";
                } else if (类型 === "2") {
                    类型名称 = "多选题";
                }
                
                // 提取答案
                const 选项列表 = 题目.questionsOptions || [];
                const 正确答案列表 = 选项列表
                    .filter(选项 => 选项.ifReply === "1")
                    .map(选项 => 选项.optionItem);
                
                答案 = 正确答案列表.join("");
                
                // 输出格式：类型 + 题目简写 + 答案
                输出内容.push(`${类型名称}：${题目简写}`);
                输出内容.push(`答案：${答案}\n`);
            });
            
            输出内容.push("═══════════════════════════════");
            输出内容.push(`共提取 ${题目列表.length} 道题目`);
            输出内容.push("═══════════════════════════════");
            
            console.log(输出内容.join("\n"));
            $notify("✅ 题目提取完成", "", 输出内容.join("\n"));
            
        } catch (错误) {
            console.error("解析数据失败：" + 错误.message);
        }
    }
};
 
$taskMgr = $taskMgr || {};
题目提取.doIt();