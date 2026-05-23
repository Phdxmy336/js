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


// 调试版 - 查看完整返回数据
 
const DATA = JSON.parse($response.body);
 
console.log("========== 数据结构 ==========");
console.log("顶层keys: " + Object.keys(DATA).join(", "));
 
// 检查 body 字段
if (DATA.body) {
    console.log("\nbody.keys: " + Object.keys(DATA.body).join(", "));
    
    // 检查各题型数据
    ["pdexamQuestionsVos", "dxexamQuestionsVos", "ddxexamQuestionsVos"].forEach(key => {
        const val = DATA.body[key];
        console.log(key + ": " + (val ? val.length + "条" : "无数据"));
    });
} else {
    console.log("\n无body字段，直接解析顶层");
    ["pdexamQuestionsVos", "dxexamQuestionsVos", "ddxexamQuestionsVos"].forEach(key => {
        const val = DATA[key];
        console.log(key + ": " + (val ? val.length + "条" : "无数据"));
    });
}
 
console.log("\n========== 前1000字符 ==========");
console.log($response.body.substring(0, 1000));
 
$done({ body: $response.body });