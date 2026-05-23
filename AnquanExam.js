const data = JSON.parse($response.body);
let result = "【正确答案】\n";

function extractAnswers(list) {
    list && list.forEach((q, i) => {
        let ans = [];
        q.questionsOptions && q.questionsOptions.forEach(o => {
            if (o.ifReply === "1") ans.push(o.optionContent);
        });
        if (ans.length) result += `${i+1}. ${ans.join("/")}\n`;
    });
}

const body = data.body || {};
body.pdexamQuestionsVos && extractAnswers(body.pdexamQuestionsVos);
body.dxexamQuestionsVos && extractAnswers(body.dxexamQuestionsVos);

$clipboard.write({ string: result });
$notification.post("✅ 已复制", "答案已保存", result);
$done({ body: $response.body });