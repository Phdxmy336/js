// 拦截请求体，修改 creditHours 为 totalTime 的值
(function() {
    var bodyString = $request.body;
    if (!bodyString) return;
    
    var body = JSON.parse(bodyString);
    
    if (body.totalTime != null && body.creditHours != null) {
        body.creditHours = body.totalTime;
    }
    
    $done({ body: JSON.stringify(body) });
})();