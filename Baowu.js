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



var body = $request.body;
if (!body) {
    $done({});
} else {
    let obj = JSON.parse(body);
 
    // 递归修改函数
    (function modify(node) {
        if (!node || typeof node !== 'object') return;
        
        // 找到包含 creditHours 和 totalTime 的对象
        if (node.hasOwnProperty('creditHours') && node.hasOwnProperty('totalTime')) {
            if (typeof node.totalTime === 'number' && node.totalTime >= 0) {
                node.creditHours = node.totalTime;
            }
        }
        
        // 递归遍历所有属性
        for (let key in node) {
            modify(node[key]);
        }
    })(obj);
 
    $done({ body: JSON.stringify(obj) });
}