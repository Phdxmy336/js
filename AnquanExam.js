
/*
脚本功能：安全e家答题
脚本作者：Phdxmy（687618）
更新时间：2026年
修复：题目重复显示、重复递归、重复调用

[rewrite_local]
# >安全E家答题
^https:\/\/mobile\.baowugroup\.com\/com\.baosight\.wisdomsecurity\/service\/bggfab-px\/mobileapi\/startExam url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/AnquanExam.js

[mitm]
hostname = mobile.baowugroup.com
*/

const body = $response.body;

try {
    const jsonData = JSON.parse(body);
    const questionMap = new Map();
    const visited = new Set();

    // 统一题干格式，消除不影响题意的格式差异
    function normalizeStem(stem) {
        return String(stem || '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/\s+/g, '')
            .replace(/[　\u200B-\u200D\uFEFF]/g, '')
            .trim();
    }

    // 解析题目
    function parseExamData(data) {
        if (!data || typeof data !== 'object') return;
        if (visited.has(data)) return;

        visited.add(data);

        if (Array.isArray(data)) {
            data.forEach(parseExamData);
            return;
        }

        const type = String(data.questionsType);

        if (
            data.questionStem != null &&
            ['0', '1', '2'].includes(type)
        ) {
            const stem = normalizeStem(data.questionStem);

            if (stem) {
                // 核心修复：只根据题型和完整题干去重
                const key = JSON.stringify([type, stem]);

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

                if (!questionMap.has(key)) {
                    questionMap.set(key, {
                        stem: String(data.questionStem),
                        type: type,
                        no: data.questionsNo || '未知编号',
                        answers: new Set(answers)
                    });
                } else {
                    // 重复题目：合并正确答案
                    const existing = questionMap.get(key);

                    answers.forEach(answer => {
                        existing.answers.add(answer);
                    });
                }
            }
        }

        // 只递归一次，避免重复扫描
        Object.keys(data).forEach(key => {
            const value = data[key];

            if (value && typeof value === 'object') {
                parseExamData(value);
            }
        });
    }

    parseExamData(jsonData);

    const questions = Array.from(questionMap.values());

    if (questions.length > 0) {
        let output = `📚 发现 ${questions.length} 道题目\n`;
        output += `====================\n`;

        const typeNames = {
            '0': '❄️判断题',
            '1': '🔥单选题',
            '2': '⭐️多选题'
        };

        questions.forEach((q, index) => {
            const typeStr = typeNames[q.type] || '未知题型';

            let shortStem = q.stem
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (shortStem.length > 15) {
                shortStem = shortStem.substring(0, 15) + '…';
            }

            let answerStr = Array.from(q.answers)
                .sort()
                .join('');

            if (!answerStr) {
                answerStr = '未找到答案';
            }

            output += `${typeStr}：${shortStem}\n`;
            output += `答案：${answerStr}\n`;

            if (index < questions.length - 1) {
                output += `----\n`;
            }
        });

        output += `====================\n`;
        output += `问题反馈：687618`;

        console.log(output);

        $notify(
            '📖 题目解析完成',
            `共提取 ${questions.length} 题`,
            output
        );

    } else {
        console.log('⚠️ 未在响应数据中找到题目信息。');
    }

} catch (error) {
    console.log('⚠️ 题目解析失败：' + error.message);
} finally {
    $done({});
}
