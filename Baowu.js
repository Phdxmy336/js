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
    return;
}

try {
    let body = JSON.parse($request.body);

    // 递归处理函数
    function deepModify(obj) {
        if (!obj || typeof obj !== 'object') return;

        // 同步字段逻辑
        if (obj.hasOwnProperty('totalTime') && obj.hasOwnProperty('creditHours')) {
            if (typeof obj.totalTime === 'number' && obj.totalTime >= 0) {
                obj.creditHours = obj.totalTime;
            }
        }

        // 遍历所有属性
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (Array.isArray(value)) {
                value.forEach(item => deepModify(item));
            } else if (typeof value === 'object' && value !== null) {
                deepModify(value);
            }
        }
    }

    deepModify(body);

    $done({
        url: url,
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });

} catch (error) {
    console.error('JSON 解析错误:', error);
    $done({});
}