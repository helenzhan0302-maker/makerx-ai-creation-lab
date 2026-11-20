export const DESIGN_CHECKLIST = [
  { id: 'home', title: '首页看门面', items: ['醒目的游戏大标题', '简短的主题背景介绍', '超大醒目的【开始挑战】按钮'] },
  { id: 'play', title: '答题页玩互动', items: ['第几题与当前得分栏', '居中放大的科学题目', '4 个大尺寸选项卡', '【下一题】跳转按钮'] },
  { id: 'result', title: '结果页领成就', items: ['通关大总分结算牌', '答对题数统计', '专属知识荣耀评价', '【重新挑战】清零重来按钮'] },
];

export const RESULT_COPY = [
  { min: 100, title: '知识王者', description: '五题全对，而且每一道都经得起核验。你已经能把好奇心变成一场真正好玩的挑战了。' },
  { min: 80, title: '知识侦探', description: '只差一点点满分。你已经能分辨清楚哪些题值得被相信，继续把错题查明白。' },
  { min: 60, title: '挑战新手', description: '你玩到了关键知识点。把答错的题再看一遍解释，下一轮会更有把握。' },
  { min: 0, title: '再试一次', description: '分数不是终点。先看看每道题的正确答案和解释，再来一轮。' },
];

export function resultCopy(score) {
  return RESULT_COPY.find((item) => score >= item.min) || RESULT_COPY[RESULT_COPY.length - 1];
}

export function splitGameQuestions(raw) {
  const questions = Array.isArray(raw) ? raw : [];
  return questions.map((question, index) => ({
    id: question.id || index + 1,
    question: String(question.question || ''),
    options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
    answer: String(question.answer || 'A').toUpperCase(),
    explanation: String(question.explanation || ''),
  }));
}

export function shuffledIds(ids, random = Math.random) {
  const copy = [...ids];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function roundSizeFor(total) {
  return Math.min(5, Math.max(0, Number(total) || 0));
}

export function computeScore(answers) {
  return (Array.isArray(answers) ? answers : []).filter(Boolean).length * 20;
}

export function parseBankFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: '这不是题库文件：内容无法被 JSON 解析。' };
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, message: '这不是题库文件：没有找到题库对象。' };
  }
  if (!Array.isArray(data.questions)) {
    return { ok: false, message: '这不是题库文件：缺少 questions 列表。' };
  }
  if (data.questions.length !== 10) {
    return { ok: false, message: '题库需要正好 10 道核验题，当前读到 ' + data.questions.length + ' 道。' };
  }
  for (let index = 0; index < data.questions.length; index += 1) {
    const question = data.questions[index];
    if (!question || typeof question.question !== 'string' || !question.question.trim()) {
      return { ok: false, message: '第 ' + (index + 1) + ' 题缺少题干。' };
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      return { ok: false, message: '第 ' + (index + 1) + ' 题不是 4 个选项。' };
    }
    if (!['A', 'B', 'C', 'D'].includes(String(question.answer || '').toUpperCase())) {
      return { ok: false, message: '第 ' + (index + 1) + ' 题的答案不是 A/B/C/D。' };
    }
  }
  return {
    ok: true,
    data: {
      title: String(data.title || '我的知识挑战赛'),
      bankId: String(data.bank_id || ''),
      questions: splitGameQuestions(data.questions),
    },
  };
}

export function buildProgrammerPrompt({ design, bank }) {
  const title = clean(design.title) || '我的知识挑战赛';
  const topic = clean(design.topic) || '待补充';
  const intro = clean(design.intro) || '待补充';
  const bankJson = JSON.stringify(bank, null, 2);
  return [
    '你是一名专业的儿童互动网页开发助手。',
    '',
    '请帮我制作一个可以直接双击打开的单文件 HTML 知识挑战赛。',
    '',
    '# 我的游戏信息',
    '游戏名字：' + title,
    '知识主题：' + topic,
    '首页介绍：' + intro,
    '',
    '# 必须实现的功能',
    '1. 首页：显示游戏名字、主题介绍和【开始挑战】按钮。',
    '2. 答题页：每轮从题库随机抽 5 题，同一轮不重复；显示第几题和当前得分。',
    '3. 每题 4 个选项，点击后立即判分；每题 20 分，满分 100。',
    '4. 答题后立即显示正确答案和答案解释，让玩家学到知识。',
    '5. 做完 5 题显示总分、答对题数和评价，并提供【再玩一次】按钮。',
    '6. 再玩一次时分数清零；下一轮优先抽上一轮没出现过的题。',
    '',
    '# 技术铁律',
    '生成完整 HTML，CSS 和 JavaScript 写在同一个文件里，所有按钮都必须有效。',
    '不要引用外部图片、字体或 CDN；不要使用框架和重型依赖。',
    '页面要适合 9–12 岁孩子，文字清楚、按钮够大、键盘也能操作。',
    '不要改变下面题库中的题目、选项、正确答案和解释，不得增删题目。',
    '',
    '# 题库 JSON（必须原样使用）',
    bankJson,
  ].join('\n');
}

export function buildBugPrompt({ phenomenon, expected, actual }) {
  return [
    '请帮我修复一个网页游戏 Bug。不要重做整个游戏，只修改出问题的部分。',
    '',
    '我看到的异常现象：' + (clean(phenomenon) || '待补充'),
    '我原本期望：' + (clean(expected) || '待补充'),
    '实际发生了什么：' + (clean(actual) || '待补充'),
    '',
    '请先告诉我最可能的原因，再给我修改后的完整代码，并列出我该重新测试哪几个按钮。',
  ].join('\n');
}

export function buildDesignMarkdown({ design, bank, checks, rounds, roadshow }) {
  const checked = checks.filter((item) => item.checked).length;
  return [
    '# ' + (clean(design.title) || '我的知识挑战赛'),
    '',
    '## 游戏设计单',
    '知识主题：' + (clean(design.topic) || '待补充'),
    '首页介绍：' + (clean(design.intro) || '待补充'),
    '题库：' + (bank?.title || '待补充') + '（' + (bank?.questions?.length || 0) + ' 道）',
    '',
    '## 三大页面',
    ...DESIGN_CHECKLIST.map((group) => '- ' + group.title + '：' + group.items.join('、')),
    '',
    '## 测试清单',
    '已完成 ' + checked + ' / 5 项。',
    ...checks.map((item) => '- [' + (item.checked ? 'x' : ' ') + '] ' + item.label),
    '',
    '## 两轮测试记录',
    '第 1 轮抽到的题号：' + (clean(rounds.firstIds) || '待补充'),
    '第 1 轮得分：' + (clean(rounds.firstScore) || '待补充'),
    '第 2 轮抽到的题号：' + (clean(rounds.secondIds) || '待补充'),
    '第 2 轮得分：' + (clean(rounds.secondScore) || '待补充'),
    '发现的 Bug：' + (clean(rounds.bugs) || '待补充'),
    '',
    '## 一分钟发布提纲',
    '游戏名字与知识主题：' + (clean(roadshow.name) || '待补充'),
    '我最喜欢的一个设计：' + (clean(roadshow.favorite) || '待补充'),
    '测试时揪出的 Bug：' + (clean(roadshow.bug) || '待补充'),
    '',
  ].join('\n');
}

export function splitRoundIds(value) {
  return String(value || '')
    .split(/[、,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}
