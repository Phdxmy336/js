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


// Quantumult X 安全考试题目提取脚本
// 兼容新版Quantumult X语法 
 
var typeMap = {
    "0": "判断题",
    "1": "单选题",
    "2": "多选题"
};
 
function extractQuestions(body) {
    // 提取题目类型
    var typeMatch = body.match(/"questionsType":\s*"?(\d)"?/);
    var questionsType = typeMatch ? typeMatch[1] : null;
    var typeName = typeMap[questionsType] || "未知类型";
    
    // 提取题干
    var stemMatch = body.match(/"questionStem":\s*"([^"]+)"/);
    var questionStem = stemMatch ? stemMatch[1] : "未找到题干";
    
    // 提取选项和答案
    var optionRegex = /"optionItem":\s*"([^"]+)"[^]*?"optionContent":\s*"([^"]+)"[^]*?"ifReply":\s*"(\d)"/g;
    var options = [];
    var answers = [];
    var match;
    
    while ((match = optionRegex.exec(body)) !== null) {
        var optionItem = match[1];
        var optionContent = match[2];
        var ifReply = match[3];
        
        options.push({
            item: optionItem,
            content: optionContent
        });
        
        if (ifReply === "1") {
            answers.push(optionItem);
        }
    }
    
    // 格式化输出
    var output = "\n";
    output += "══════════════════════════════════════\n";
    output += "📝 题目提取结果\n";
    output += "══════════════════════════════════════\n\n";
    output += "【题目类型】" + typeName + "\n\n";
    output += "【题干内容】\n" + questionStem + "\n\n";
    output += "【选项列表】\n";
    
    for (var i = 0; i < options.length; i++) {
        output += "   " + options[i].item + ". " + options[i].content + "\n";
    }
    
    output += "\n";
    output += "【正确答案】" + answers.join("") + "\n";
    output += "\n══════════════════════════════════════\n";
    
    console.log(output);
}
 
// 主函数入口
function main() {
    var url = $request.url;
    var method = $request.method;
    var headers = $request.headers;
    var body = $request.body || $response.body;
    
    if (!body) {
        console.log("❌ 未获取到数据");
        return;
    }
    
    extractQuestions(body);
}
 
// 执行
main();