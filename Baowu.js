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


let obj = JSON.parse($request.body);
obj.creditHours = obj.totalTime;
$done({body: JSON.stringify(obj)});