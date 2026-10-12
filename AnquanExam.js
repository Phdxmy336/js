
/*
脚本功能：安全e家答题
脚本作者：Phdxmy（687618）
版本：v3.2

[rewrite_local]
# >安全E家答题
^https:\/\/mobile\.baowugroup\.com\/com\.baosight\.wisdomsecurity\/service\/bggfab-px\/mobileapi\/startExam url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/AnquanExam.js

[mitm]
hostname = mobile.baowugroup.com
*/

const VERSION = 'v3.2';

console.log('✅ 安全考试脚本版本：' + VERSION);

try {
    const jsonData = JSON.parse($response.body);
    const visited = new Set();
    const questionMap = new Map();
    let rawCount = 0;

    // 统一题干格式
    function normalize(value) {
        return String(value == null ? '' : value)
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
            .trim();
    }

    // 递归提取题目
    function extract(data) {
        if (!data || typeof data !== 'object' || visited.has(data)) return;

        visited.add(data);

        if (Array.isArray(data)) {
            data.forEach(extract);
            return;
        }

        const type = String(data.questionsType);

        if (
            data.questionStem != null &&
            ['0', '1', '2'].includes(type)
        ) {
            const stem = normalize(data.questionStem);

            if (stem) {
                rawCount++;

                const options = Array.isArray(data.questionsOptions)
                    ? data.questionsOptions
                    : [];

                const answers = options
                    .filter(opt =>
                        opt &&
                        String(opt.ifReply) === '1' &&
                        opt.optionItem != null
                    )
                    .map(opt => String(opt.optionItem).trim())
                    .filter(Boolean);

                const key = type + '|' + stem;

                // 根据题型和完整题干去重
                if (!questionMap.has(key)) {
                    questionMap.set(key, {
                        type: type,
                        stem: stem,
                        answers: new Set(answers)
                    });
                } else {
                    const existing = questionMap.get(key);

                    answers.forEach(answer => {
                        existing.answers.add(answer);
                    });
                }
            }
        }

        // 遍历嵌套数据
        Object.keys(data).forEach(key => {
            if (data[key] && typeof data[key] === 'object') {
                extract(data[key]);
            }
        });
    }

    extract(jsonData);

    // 排序：单选 → 多选 → 判断
    const typeOrder = {
        '1': 0,
        '2': 1,
        '0': 2
    };

    const questions = Array.from(questionMap.values())
        .sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

    console.log(
        '📊 原始题目：' + rawCount +
        '，去重后：' + questions.length
    );

    if (questions.length > 0) {
        const typeNames = {
            '1': '单选题',
            '2': '多选题',
            '0': '判断题'
        };

        // 每种题型独立编号
        const counters = {
            '1': 0,
            '2': 0,
            '0': 0
        };

        let output = '📚 发现 ' + questions.length + ' 道题目\n';
        output += '====================\n';

        questions.forEach((q, index) => {
            // 当前题型编号增加1
            counters[q.type]++;

            // 截取题目前15字
            const shortStem = q.stem.length > 15
                ? q.stem.slice(0, 15) + '…'
                : q.stem;

            // 正确答案
            const answer = Array.from(q.answers)
                .sort()
                .join('') || '未找到答案';

            // 输出题型和序号
            output += typeNames[q.type] +
                counters[q.type] + '：' +
                shortStem + '\n';

            output += '答案：' + answer + '\n';

            if (index !== questions.length - 1) {
                output += '----\n';
            }
        });

        output += '====================\n';
        output += '问题反馈：687618';

        console.log(output);

        $notify(
            '📖 题目解析完成 ' + VERSION,
            '共提取 ' + questions.length + ' 题',
            output
        );

    } else {
        console.log('⚠️ 未找到题目信息');
    }

} catch (e) {
    console.log('❌ 题目解析失败：' + e.message);

} finally {
    // 只执行一次
    $done({});
}
