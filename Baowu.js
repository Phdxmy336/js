/*
 *
 *
脚本功能：宝武安全E家在线学习秒刷
脚本作者：Phdxmy
更新时间：2026年
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
# >安全E家秒刷
^https:\/\/mobile\.baowugroup\.com\/com\.baosight\.wisdomsecurity\/service\/bggfab-px\/mobileapi\/onLineStudy\/finshStudy url script-request-body https://raw.githubusercontent.com/Phdxmy336/js/main/request-body.js

[mitm]
hostname = mobile.baowugroup.com
*
*
*/


const url = $request.url; 
const method = $request.method;
const headers = $request.headers;
let body = JSON.parse($request.body);
 
// 修改逻辑示例：将 creditHours 同步为 totalTime 的值 
if (body.hasOwnProperty("totalTime")) {
    body.creditHours = body.totalTime; // 强制对齐学分时长 
    console.log(`已修改 creditHours=${body.creditHours}`);
}
 
 
// 重新序列化并返回 
$done({
    url: url,
    method: method,
    headers: headers,
    body: JSON.stringify(body)
});