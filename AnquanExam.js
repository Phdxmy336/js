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


// 完整调试版 - 查看 data 下的所有字段
 
const RAW = JSON.parse($response.body);
const DATA = RAW.data || RAW;
 
console.log("========== data 下所有keys ==========");
console.log(Object.keys(DATA).join("\n"));
 
// 检查每个字段是否是数组
Object.keys(DATA).forEach(key => {
    const val = DATA[key];
    if (Array.isArray(val)) {
        console.log("\n" + key + " 是数组，长度: " + val.length);
        if (val.length > 0) {
            console.log("  第一条数据的keys: " + Object.keys(val[0]).join(", "));
        }
    } else if (typeof val === "object" && val !== null) {
        console.log(key + " 是对象，有 " + Object.keys(val).length + " 个属性");
    }
});
 
console.log("\n========== 完整JSON(前2000字符) ==========");
console.log(JSON.stringify(RAW).substring(0, 2000));
 
$done({ body: $response.body });