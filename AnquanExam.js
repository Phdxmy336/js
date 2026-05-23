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


// AnquanExam.js - QX专用版 
 
const KEY = "EXAM_ANSWERS";
 
function extractAnswers(data) {
    let results = [];
    
    function processList(list, type) {
        if (!list || list.length === 0) return;
        
        results.push("\n【" + type + "】");
        
        list.forEach((q, i) => {
            let opts = [];
            (q.questionsOptions || []).forEach(o => {
                if (o.ifReply === "1") {
                    opts.push(o.optionContent);
                }
            });
            if (opts.length > 0) {
                results.push((i + 1) + ". " + opts.join(" / "));
            }
        });
    }
    
    const body = data.body || data;
    
    processList(body.pdexamQuestionsVos, "判断题");
    processList(body.dxexamQuestionsVos, "选择题");
    processList(body.ddxexamQuestionsVos, "多选题");
    
    return results.length > 0 ? results.join("\n") : "未找到答案";
}
 
// 主程序 
try {
    const data = JSON.parse($response.body);
    const answers = extractAnswers(data);
    
    // 使用 $prefs 保存到本地 
    $prefs.setValueForKey(answers, KEY);
    
    console.log("✅ 答案已保存: \n" + answers);
    
    // 可选：弹出提示 
    let synceyBody = JSON.parse($response.body || "{}");
    if (synceyBody.tpxksReply) {
        console.log("答题人: " + synceyBody.tpxksReply.empName);
    }
    
} catch (e) {
    console.log("❌ 脚本错误: " + e.message);
}
 
$done({ body: $response.body });