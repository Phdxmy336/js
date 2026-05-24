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


// 考试数据解析器 - 提取题目与答案 
// 目标：解析JSON，提取题目前15字和正确答案，输出到日志 
 
let body = $response.body;
// 检查是否是有效的JSON响应，可根据实际URL或特征调整 
try {
    // 尝试解析JSON
    let jsonData = JSON.parse(body);
    
    // 核心解析函数，处理可能嵌套的数据结构 
    function parseExamData(data, resultArray = []) {
        // 检查数据是否为数组
        if (Array.isArray(data)) {
            for (let item of data) {
                parseExamData(item, resultArray);
            }
        } 
        // 检查数据是否为对象，并包含题目列表
        else if (typeof data === 'object' && data !== null) {
            // 查找题目数组：dxexamQuestionsVos 或其他可能的字段
            let questionArrays = ['dxexamQuestionsVos', 'questions', 'questionList', 'list'];
            for (let key of questionArrays) {
                if (data[key] && Array.isArray(data[key])) {
                    parseExamData(data[key], resultArray);
                }
            }
            
            // 如果当前对象包含题目信息（根据提供的JSON结构判断）
            if (data.questionStem && (data.questionsType === "0" || data.questionsType === "1" || data.questionsType === "2")) {
                let question = {
                    stem: data.questionStem,
                    type: data.questionsType,
                    options: data.questionsOptions || [],
                    no: data.questionsNo || '未知编号'
                };
                resultArray.push(question);
            }
            
            // 递归遍历对象的所有值，以应对深层嵌套
            for (let subKey in data) {
                if (data.hasOwnProperty(subKey) && typeof data[subKey] === 'object') {
                    parseExamData(data[subKey], resultArray);
                }
            }
        }
        return resultArray;
    }
    
    // 开始解析数据
    let questions = parseExamData(jsonData);
    
    if (questions.length > 0) {
        let output = `📚 发现 ${questions.length} 道题目\n`;
        output += `====================\n`;
        
        questions.forEach((q, index) => {
            // 确定题型
            let typeStr;
            switch(q.type) {
                case "0": typeStr = "判断题"; break;
                case "1": typeStr = "单选题"; break;
                case "2": typeStr = "多选题"; break;
                default: typeStr = "未知题型";
            }
            
            // 提取题目前15个字符（处理可能存在的换行和空格）
            let shortStem = q.stem.replace(/[\r\n\s]+/g, ' ').trim();
            shortStem = shortStem.length > 15 ? shortStem.substring(0, 15) + '…' : shortStem;
            
            // 提取正确答案（ifReply: "1"）
            let correctAnswers = [];
            if (Array.isArray(q.options)) {
                q.options.forEach(opt => {
                    if (opt.ifReply === "1" && opt.optionItem) {
                        correctAnswers.push(opt.optionItem);
                    }
                });
            }
            
            // 格式化答案字符串 
            let answerStr = correctAnswers.sort().join('');
            if (answerStr === '') answerStr = '未找到答案';
            
            // 构建输出行 
            output += `${typeStr}：${shortStem}\n`;
            output += `答案：${answerStr}\n`;
            if (index < questions.length - 1) output += `----\n`;
        });
        
        output += `====================\n解析完成`;
        
        // 输出到Quantumult X日志
        console.log(output);
        $notify("📖 题目解析完成", `共提取 ${questions.length} 题`, output);
        
    } else {
        console.log("⚠️ 未在响应数据中找到题目信息。");
    }
    
} catch (error) {
    // 如果不是JSON或解析失败，静默处理（可能是其他类型的响应）
    // console.log("解析失败或非目标数据: " + error.message);
}
 
// 无论成功与否，都返回原始body，不影响正常使用
$done({}); 
$done({});