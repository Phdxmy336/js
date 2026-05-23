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

 
// AnquanExam.js - 修复版（兼容所有QX版本）
 
const $tool = {
    read: (key) => $prefs.valueForKey(key),
    write: (val, key) => $prefs.setValueForKey(val, key)
};
 
const KEY = "exam_answers_" + Date.now();
 
function extractAnswers(data) {
    let results = [];
    
    function processList(list, type) {
        if (!list || list.length === 0) return;
        
        results.push(`\n【${type}】\n`);
        
        list.forEach((q, i) => {
            let opts = [];
            (q.questionsOptions || []).forEach(o => {
                if (o.ifReply === "1") {
                    opts.push(o.optionContent);
                }
            });
            if (opts.length > 0) {
                results.push(`${i + 1}. ${opts.join(" / ")}\n`);
            }
        });
    }
    
    const body = data.body || data;
    
    // 处理各种题型
    processList(body.dxexamQuestionsVos, "选择题");
    processList(body.ddxexamQuestionsVos, "多选题");
    processList(body.pdexamQuestionsVos, "判断题");
    processList(body.examQuestionsVos, "简答题");
    
    return results.length > 0 ? results.join("") : "未找到答案";
}
 
// 主程序
try {
    const data = JSON.parse($response.body);
    const answers = extractAnswers(data);
    
    // 写入剪贴板
    $clipboard.write({
        string: answers
    });
    
    // 兼容的通知方式
    if (typeof $notify !== "undefined") {
        $notify("✅ 答案已复制", "", "正确答案已保存到剪贴板");
    } else if (typeof $notification !== "undefined") {
        $notification.post("✅ 答案已复制", "", "正确答案已保存到剪贴板");
    }
    
    console.log("答案内容:\n" + answers);
    
} catch (e) {
    console.error("脚本错误: " + e.message);
}
 
$done({ body: $response.body });