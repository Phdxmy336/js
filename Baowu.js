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
 
if (!$request.body) {
    $done({});
} else {
    let body = JSON.parse($request.body);
 
    // 递归处理函数（支持深层嵌套结构）
    (function deepModify(obj) {
        if (!obj || typeof obj !== 'object') return;
 
        // 修改逻辑：当同时存在 totalTime 和 creditHours 时进行同步
        if (obj.hasOwnProperty('totalTime') && obj.hasOwnProperty('creditHours')) {
            if (typeof obj.totalTime === 'number') {
                obj.creditHours = obj.totalTime;
                console.log(`同步字段: creditHours=${obj.creditHours}`);
            }
        }
 
        // 遍历所有属性（包括数组和嵌套对象）
        Object.keys(obj).forEach(key => {
            if (Array.isArray(obj[key])) {
                obj[key].forEach(item => deepModify(item));
            } else if (typeof obj[key] === 'object') {
                deepModify(obj[key]);
            }
        });
    })(body);
 
    $done({
        url: url,
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
}