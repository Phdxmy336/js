
/*
脚本功能：安全e家答题
脚本作者：Phdxmy（687618）
版本：v4.0

[rewrite_local]
^https:\/\/mobile\.baowugroup\.com\/com\.baosight\.wisdomsecurity\/service\/bggfab-px\/mobileapi\/startExam url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/AnquanExam.js

[mitm]
hostname = mobile.baowugroup.com
*/

var VERSION = 'v4.0';
console.log('安全考试脚本版本：' + VERSION);

function cleanStem(v) {
    return String(v == null ? '' : v)
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
        .trim();
}

function getAnswers(item) {
    var ret = [];
    var opts = item.questionsOptions;

    if (!Array.isArray(opts)) return ret;

    for (var i = 0; i < opts.length; i++) {
        var o = opts[i];

        if (o && String(o.ifReply) === '1' &&
            o.optionItem != null) {
            var a = String(o.optionItem).trim();

            if (a && ret.indexOf(a) === -1) {
                ret.push(a);
            }
        }
    }

    return ret;
}

try {
    var root = JSON.parse($response.body);
    var list = [];
    var seenObjects = [];
    var keys = Object.create(null);
    var rawCount = 0;

    function walk(node) {
        if (!node || typeof node !== 'object') return;

        if (seenObjects.indexOf(node) !== -1) return;
        seenObjects.push(node);

        if (Array.isArray(node)) {
            for (var i = 0; i < node.length; i++) {
                walk(node[i]);
            }
            return;
        }

        var type = String(node.questionsType);

        if (node.questionStem != null &&
            (type === '0' || type === '1' || type === '2')) {

            var stem = cleanStem(node.questionStem);

            if (stem) {
                rawCount++;

                var key = JSON.stringify([type, stem]);
                var answers = getAnswers(node);
                var existing = keys[key];

                if (!existing) {
                    existing = {
                        type: type,
                        stem: stem,
                        answers: []
                    };

                    keys[key] = existing;
                    list.push(existing);
                }

                for (var j = 0; j < answers.length; j++) {
                    if (existing.answers.indexOf(answers[j]) === -1) {
                        existing.answers.push(answers[j]);
                    }
                }
            }
        }

        var props = Object.keys(node);

        for (var p = 0; p < props.length; p++) {
            var child = node[props[p]];

            if (child && typeof child === 'object') {
                walk(child);
            }
        }
    }

    walk(root);

    // 单选 → 多选 → 判断
    var order = {
        '1': 0,
        '2': 1,
        '0': 2
    };

    list.sort(function(a, b) {
        return order[a.type] - order[b.type];
    });

    // 各题型独立编号
    var counters = {
        '1': 0,
        '2': 0,
        '0': 0
    };

    var names = {
        '1': '🔥单选题',
        '2': '⭐️多选题',
        '0': '❄️判断题'
    };

    console.log(
        '原始题目：' + rawCount +
        '；去重后：' + list.length
    );

    if (list.length > 0) {
        var output = '📚 发现 ' + list.length +
            ' 道题目\n====================\n';

        for (var n = 0; n < list.length; n++) {
            var q = list[n];
            counters[q.type]++;

            var shortStem = q.stem.length > 15
                ? q.stem.slice(0, 15) + '…'
                : q.stem;

            var answer = q.answers.slice()
                .sort()
                .join('') || '未找到答案';

            output += names[q.type] +
                counters[q.type] + '：' +
                shortStem + '\n';

            output += '答案：' + answer + '\n';

            if (n !== list.length - 1) {
                output += '----\n';
            }
        }

        output += '====================\n';
        output += '问题反馈：687618';

        console.log(output);

        $notify(
            '📖 题目解析完成 ' + VERSION,
            '共提取 ' + list.length + ' 题',
            output
        );

    } else {
        console.log('未在响应中找到题目');
    }

} catch (e) {
    console.log('题目解析失败：' + e.message);
}

$done({});
