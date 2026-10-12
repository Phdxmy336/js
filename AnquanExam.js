
/*
脚本功能：安全e家答题
脚本作者：Phdxmy（687618）
版本：v3.0
修复：单选题重复显示
增加：版本标识、重复检测日志

[rewrite_local]
# >安全E家答题
^https:\/\/mobile\.baowugroup\.com\/com\.baosight\.wisdomsecurity\/service\/bggfab-px\/mobileapi\/startExam url script-response-body https://raw.githubusercontent.com/Phdxmy336/js/main/AnquanExam.js

[mitm]
hostname = mobile.baowugroup.com
*/

const VERSION = "v3.0";
console.log("✅ 安全考试脚本版本：" + VERSION);

try {
    const jsonData = JSON.parse($response.body);
    const visited = new Set();
    const allQuestions = [];
    const questionMap = new Map();

    function normalize(str) {
        return String(str == null ? "" : str)
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/[\s\u200B-\u200D\uFEFF]/g, "")
            .trim();
    }

    function extract(data) {
        if (!data || typeof data !== "object") return;
        if (visited.has(data)) return;

        visited.add(data);

        if (Array.isArray(data)) {
            data.forEach(extract);
            return;
        }

        const type = String(data.questionsType);

        if (
            data.questionStem != null &&
            ["0", "1", "2"].includes(type)
        ) {
            const stem = normalize(data.questionStem);

            if (stem) {
                const options = Array.isArray(data.questionsOptions)
                    ? data.questionsOptions
                    : [];

                const answers = options
                    .filter(opt =>
                        opt &&
                        String(opt.ifReply) === "1" &&
                        opt.optionItem != null
                    )
                    .map(opt => String(opt.optionItem).trim())
                    .filter(Boolean);

                allQuestions.push({
                    stem: stem,
                    type: type,
                    answers: answers,
                    no: data.questionsNo || ""
                });
            }
        }

        Object.keys(data).forEach(key => {
            if (data[key] && typeof data[key] === "object") {
                extract(data[key]);
            }
        });
    }

    extract(jsonData);

    let duplicateCount = 0;
    let fuzzyCount = 0;

    allQuestions.forEach(q => {
        const fullKey = q.type + "|" + q.stem;

        // 首先使用完整题干匹配
        let key = fullKey;

        if (!questionMap.has(key)) {
            // 对仍未匹配的题目，检查是否为疑似重复
            const candidates = Array.from(questionMap.entries());

            for (const [oldKey, oldQ] of candidates) {
                if (oldQ.type !== q.type) continue;

                const samePrefix =
                    q.stem.substring(0, 15) ===
                    oldQ.stem.substring(0, 15);

                const sameAnswer =
                    [...q.answers].sort().join(",") ===
                    [...oldQ.answers].sort().join(",");

                // 仅在题型、前15字、正确答案均相同
                // 时进行兜底去重
                if (samePrefix && sameAnswer) {
                    key = oldKey;

                    if (q.stem !== oldQ.stem) {
                        fuzzyCount++;

                        console.log(
                            "🔍 疑似重复题干差异：" +
                            "\n第一题：" + oldQ.stem +
                            "\n第二题：" + q.stem
                        );
                    }

                    break;
                }
            }
        }

        if (questionMap.has(key)) {
            duplicateCount++;

            const existing = questionMap.get(key);

            q.answers.forEach(answer => {
                existing.answers.add(answer);
            });
        } else {
            questionMap.set(key, {
                stem: q.stem,
                type: q.type,
                answers: new Set(q.answers)
            });
        }
    });

    const questions = Array.from(questionMap.values());

    console.log(
        "📊 原始题目数：" + allQuestions.length +
        "，去重后：" + questions.length +
        "，重复：" + duplicateCount +
        "，疑似重复：" + fuzzyCount
    );

    if (questions.length > 0) {
        let output = "📚 发现 " + questions.length + " 道题目\n";
        output += "====================\n";

        const typeNames = {
            "0": "❄️判断题",
            "1": "🔥单选题",
            "2": "⭐️多选题"
        };

        questions.forEach((q, index) => {
            let shortStem = q.stem;

            if (shortStem.length > 15) {
                shortStem = shortStem.substring(0, 15) + "…";
            }

            const answerStr = Array.from(q.answers)
                .sort()
                .join("") || "未找到答案";

            output += typeNames[q.type] + "：" + shortStem + "\n";
            output += "答案：" + answerStr + "\n";

            if (index < questions.length - 1) {
                output += "----\n";
            }
        });

        output += "====================\n";
        output += "问题反馈：687618";

        console.log(output);

        $notify(
            "📖 题目解析完成 " + VERSION,
            "共提取 " + questions.length + " 题",
            output
        );
    } else {
        console.log("⚠️ 未找到题目信息");
    }

} catch (e) {
    console.log("❌ 解析失败：" + e.message);
}

$done({});
