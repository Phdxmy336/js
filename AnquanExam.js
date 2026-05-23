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


// 脚本配置
const REGEX = /"questionsType":\s*"?([^",}]+)"?[\s\S]*?"questionStem":\s*"([^"]+)"/;
const OPTIONS_REGEX = /"optionItem":\s*"([^"]+)"[^}]*"optionContent":\s*"([^"]+)"[^}]*"ifReply":\s*"([^"]+)"/g;
 
// 主函数入口
$task.fetch/task = async (task) => {
    const { body } = task;
    
    try {
        // 提取题目类型和题干
        const mainMatch = body.match(REGEX);
        if (!mainMatch) {
            console.log("❌ 未找到题目数据");
            return;
        }
        
        const questionsType = mainMatch[1].replace(/"/g, '').trim();
        const questionStem = mainMatch[2].replace(/"/g, '').trim();
        
        // 题目类型映射
        const typeMap = {
            "0": "判断题",
            "1": "单选题", 
            "2": "多选题"
        };
        const typeName = typeMap[questionsType] || "未知类型";
        
        // 提取选项和答案
        let options = [];
        let answers = [];
        let match;
        
        while ((match = OPTIONS_REGEX.exec(body)) !== null) {
            const optionItem = match[1];
            const optionContent = match[2];
            const ifReply = match[3];
            
            options.push({ item: optionItem, content: optionContent });
            
            if (ifReply === "1") {
                answers.push(optionItem);
            }
        }
        
        // 格式化输出
        let output = `\n`;
        output += `═══════════════════════════════\n`;
        output += `         📝 题目提取结果\n`;
        output += `═══════════════════════════════\n`;
        output += `\n`;
        output += `【题目类型】${typeName}\n`;
        output += `\n`;
        output += `【题干内容】\n${questionStem}\n`;
        output += `\n`;
        output += `【选项列表】\n`;
        options.forEach(opt => {
            output += `   ${opt.item}. ${opt.content}\n`;
        });
        output += `\n`;
        output += `【正确答案】${answers.join('')}\n`;
        output += `\n`;
        output += `═══════════════════════════════\n`;
        
        console.log(output);
        
    } catch (error) {
        console.log(`❌ 解析失败: ${error.message}`);
    }
}
 
// 定时任务
const config = {
    name: "题目提取器",
    cron: "*/5 * * * *",
    url: "你的数据源URL",
    headers: {
        "User-Agent": "Mozilla/5.0"
    }
};
 
// 执行入口
$task.fetch(config).then(task).catch(err => {
    console.log(`❌ 请求失败: ${err}`);
});