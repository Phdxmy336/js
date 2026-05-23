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
    try {
        let obj = JSON.parse(body);
 
        (function modify(node) {
            if (!node || typeof node !== 'object' || node === null) return;
            
            // 只修改直接子节点，不深入遍历数组元素
            if (!Array.isArray(node)) {
                if (node.hasOwnProperty('creditHours') && node.hasOwnProperty('totalTime')) {
                    if (typeof node.totalTime === 'number') {
                        node.creditHours = node.totalTime;
                    }
                }
                
                for (let key in node) {
                    if (node.hasOwnProperty(key)) {
                        modify(node[key]);
                    }
                }
            }
        })(obj);
 
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("错误: " + e.message);
        $done({ body: body }); // 返回原始请求体
    }
}