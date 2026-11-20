export const QUIZ_PROJECT_CODE = '003-quiz-game';
export const BANK_SIZE = 10;
export const ROUND_SIZE = 5;
export const POINTS_PER_QUESTION = 20;
export const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export const TOPIC_OPTIONS = [
  { id: 'space', label: '宇宙太空', hint: '黑洞、行星、宇航员生活' },
  { id: 'animals', label: '动物王国', hint: '奇葩生存技能、冷血怪兽' },
  { id: 'body', label: '人体奥秘', hint: '神奇大脑、骨骼、超感知觉' },
  { id: 'science', label: '科学魔法', hint: '物理视错觉、神奇化学反应' },
  { id: 'history', label: '历史趣闻', hint: '古文明冷知识、古代发明' },
  { id: 'tech', label: '现代科技', hint: '机器人、人工智能、新能源' },
  { id: 'custom', label: '我自己想一个', hint: '越聚焦越出彩' },
];

export const TOPIC_EXAMPLES = {
  space: '黑洞不“黑”的地方',
  animals: '动物奇葩睡觉姿势',
  body: '打喷嚏时身体发生了什么',
  science: '生活中的视错觉',
  history: '古代人怎么降温',
  tech: '扫地机器人怎么认路',
  custom: '',
};

export const VERDICTS = [
  { id: 'correct', label: '正确 · 准予通过', tone: 'green', description: '有充分可靠证据支持，可以收入正式题库。' },
  { id: 'partial', label: '部分正确 · 需优化', tone: 'yellow', description: '大方向对，但表述不严谨，需要修改后重新核验。' },
  { id: 'wrong', label: '错误 · 直接淘汰', tone: 'red', description: '与权威资料相悖，淘汰或全部重写。' },
  { id: 'unsure', label: '存疑 · 暂时搁置', tone: 'purple', description: '找不到足够权威的证据，暂不放入游戏。' },
];

export const VERDICT_ORDER = ['correct', 'partial', 'wrong', 'unsure'];

export const GAME_RULES = [
  { id: 'bank', label: '题库底座', value: '至少 10 道核验题', detail: '每次挑战都有新鲜好题可抽。' },
  { id: 'draw', label: '抽题机制', value: '每轮随机抽 5 题', detail: '同一轮不重复，兼顾挑战与成就感。' },
  { id: 'score', label: '分数计算', value: '每题 20 分，满分 100', detail: '答对即时加分。' },
  { id: 'explain', label: '答案揭晓', value: '答错立刻弹出科普', detail: '不是只判对错，还要讲清楚为什么。' },
  { id: 'replay', label: '重新挑战', value: '可以无限次再玩', detail: '下一轮优先抽上一轮没出现过的题。' },
];

export const THINKING_STEPS = [
  { id: 'lock', title: '锁定关键事实', prompt: '这道题里，最核心、最需要确认的数据或事实是什么？' },
  { id: 'source', title: '搜寻权威铁证', prompt: '去哪里查可靠资料？打开权威网页看原文，不要只看搜索摘要。' },
  { id: 'verdict', title: '科学下达裁决', prompt: '权威资料支持 AI 的答案吗？如果冲突，以真实资料为准。' },
];

export const SOURCE_GUIDES = [
  {
    name: '科普中国',
    host: 'kepu.gov.cn',
    href: 'https://www.kepu.gov.cn/',
    description: '中国科协主办的国家级科普平台。2026-11-20 本机 HTTPS 证书校验未通过，链接状态未验证；课堂请由老师先打开确认。',
    verified: false,
  },
  {
    name: '中国数字科技馆',
    host: 'cdstm.cn',
    href: 'https://www.cdstm.cn/',
    description: '国家级数字科普场馆。2026-11-20 本机实测首页可访问（HTTP 200）。',
    verified: true,
  },
  {
    name: '权威自然科学知识库',
    host: '科学大百科 / 博物期刊',
    href: '',
    description: '只从知名科学机构、专业自然博物馆的官方知识专栏取证。具体入口由老师当堂指定。',
    verified: false,
  },
  {
    name: '实体科普图书与百科',
    host: '新华书店 / 权威大百科',
    href: '',
    description: '正规出版社出版的科普书、博物馆图册。记录书名与页码，比只记网址更容易复查。',
    verified: false,
  },
];

export { BANK_ORGANIZER_PROMPT } from './quiz-prompts.mjs';

const OUTLINE_LINES = [
  '设定身份：你是一位专业的知识挑战赛出题专家。',
  '核心任务：请围绕【我的主题】，设计 10 道趣味单选题。',
  '严格规则：',
  '① 4 个选项，只有一个真正正确答案；',
  '② 题目有趣、有挑战性，错误选项有迷惑性；',
  '③ 附带通俗易懂的答案解释与核验关键词；',
  '④ 不确定的信息明确标记，绝对不要凭空捏造！',
  '输出格式：题号 ｜ 题目 ｜ 选项 ｜ 正确答案 ｜ 解释 ｜ 关键词',
];

export const OUTLINE_TEMPLATE = OUTLINE_LINES.join(String.fromCharCode(10));

export const TEST_CHECKLIST = [
  { id: 'start', title: '启动测试', prompt: '点击开始按钮，能秒进答题页吗？' },
  { id: 'amount', title: '题量测试', prompt: '每轮真的只抽 5 道题吗？不多也不少？' },
  { id: 'unique', title: '去重测试', prompt: '同一轮挑战里，有没有出现一模一样的题目？' },
  { id: 'explain', title: '科普测试', prompt: '点完选项后，有没有立刻显示正确答案与解释？' },
  { id: 'reset', title: '清零测试', prompt: '点击再玩一次，分数是否从 0 分重新算起？' },
];

export const BUG_STEPS = [
  { id: 'find', title: '发现 Bug', detail: '定位哪里出错了。' },
  { id: 'describe', title: '描述现象', detail: '向 AI 清楚说明情况。' },
  { id: 'fix', title: '协作修改', detail: '让 AI 更新网页代码。' },
  { id: 'retest', title: '再次测试', detail: '打开新文件重新跑。' },
];

export function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function createQuestion(index = 1) {
  return {
    id: index,
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: '',
    keywords: '',
    source: '',
    evidence: '',
    verdict: '',
    revision: '',
  };
}

export function createQuestionBank() {
  return Array.from({ length: BANK_SIZE }, (_, index) => createQuestion(index + 1));
}

export function topicLabel(topicId) {
  const topic = TOPIC_OPTIONS.find((item) => item.id === topicId);
  return topic ? topic.label : '';
}

export function normalizeTopic(topic) {
  const id = clean(topic?.id);
  if (!TOPIC_OPTIONS.some((item) => item.id === id)) return { id: '', label: '', custom: '' };
  return {
    id,
    label: id === 'custom' ? clean(topic?.custom) : topicLabel(id),
    custom: id === 'custom' ? clean(topic?.custom) : '',
  };
}

export function buildOutlinePrompt(topic) {
  const normalized = normalizeTopic(topic);
  const theme = normalized.label || '待补充';
  return OUTLINE_TEMPLATE.replace('【我的主题】', '【' + theme + '】');
}

export function questionCompletion(question) {
  const optionsFilled = OPTION_KEYS.every((_, index) => clean(question?.options?.[index]));
  return [
    clean(question?.question),
    optionsFilled,
    OPTION_KEYS.includes(clean(question?.answer)),
    clean(question?.explanation),
  ].filter(Boolean).length;
}

export function isQuestionDraftComplete(question) {
  return questionCompletion(question) === 4;
}

export function isQuestionVerified(question) {
  return Boolean(
    isQuestionDraftComplete(question)
    && clean(question?.keywords)
    && clean(question?.source)
    && clean(question?.evidence)
    && clean(question?.verdict) === 'correct',
  );
}

export function verificationProgress(questions) {
  const list = Array.isArray(questions) ? questions : [];
  return {
    drafted: list.filter(isQuestionDraftComplete).length,
    verified: list.filter(isQuestionVerified).length,
    total: BANK_SIZE,
  };
}

export function verdictLabel(verdictId) {
  return VERDICTS.find((verdict) => verdict.id === verdictId)?.label || '';
}

export function finalQuestions(questions) {
  return (Array.isArray(questions) ? questions : []).filter(isQuestionVerified);
}

export function readyForGame(questions) {
  return finalQuestions(questions).length === BANK_SIZE;
}

export function buildBankMarkdown({ topic, questions, date = new Date() }) {
  const normalized = normalizeTopic(topic);
  const approved = finalQuestions(questions);
  const bankName = normalized.label || '待补充';
  const created = formatDate(date);
  const blocks = approved.map((question) => {
    const number = String(question.id).padStart(2, '0');
    return [
      '## 第' + number + '题',
      '',
      '题目ID：' + bankIdFor(topic) + '-Q' + String(question.id).padStart(3, '0'),
      '题目：' + clean(question.question),
      '选项：',
      ...OPTION_KEYS.map((key, optionIndex) => key + '. ' + clean(question.options[optionIndex])),
      '正确答案：' + clean(question.answer),
      '答案解释：' + clean(question.explanation),
      '核验关键词：' + (clean(question.keywords) || '待补充'),
      '资料来源：' + (clean(question.source) || '待补充'),
      '核验状态：' + (clean(question.verdict) === 'correct' ? 'verified' : 'pending'),
    ].join('\n');
  });

  return [
    '# ' + bankName,
    '',
    '## 题库基本信息',
    '',
    '题库名称：' + bankName,
    '题库ID：' + bankIdFor(topic),
    '知识分类：' + bankName,
    '适合年龄：9–12 岁',
    '题目数量：' + approved.length,
    '创建日期：' + created,
    '版本号：1.0',
    '',
    '## 题目列表',
    '',
    blocks.join('\n\n'),
    '',
  ].join('\n');
}

export function buildBankJson({ topic, questions }) {
  const normalized = normalizeTopic(topic);
  const approved = finalQuestions(questions);
  const bankId = bankIdFor(topic);
  return {
    bank_id: bankId,
    title: normalized.label || '待补充',
    category: normalized.label || '待补充',
    age_range: [9, 12],
    version: '1.0',
    question_count: approved.length,
    questions: approved.map((question) => ({
      id: bankId + '-Q' + String(question.id).padStart(3, '0'),
      type: 'single_choice',
      question: clean(question.question),
      options: OPTION_KEYS.map((key, index) => ({ key, text: clean(question.options[index]) })),
      answer: clean(question.answer),
      explanation: clean(question.explanation),
      keywords: splitKeywords(question.keywords),
      source: clean(question.source) ? [clean(question.source)] : [],
      verification: clean(question.verdict) === 'correct' ? 'verified' : 'pending',
    })),
  };
}

export function splitKeywords(value) {
  return clean(value)
    .split(/[、,，;；\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function bankFileName(topic) {
  const normalized = normalizeTopic(topic);
  return (normalized.label || '我的知识挑战赛').replace(/[\/:*?"<>|]/g, '').trim() || '我的知识挑战赛';
}

export function bankIdFor(topic) {
  const normalized = normalizeTopic(topic);
  return (normalized.id === 'custom' ? 'CUSTOM' : (normalized.id ? normalized.id.toUpperCase() : 'QUIZ')) + '-001';
}

export function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export function checkQuestionBank(questions) {
  const list = Array.isArray(questions) ? questions : [];
  const markedCorrect = list.filter((question) => clean(question?.verdict) === 'correct');
  const approved = finalQuestions(list);
  const issues = [];
  if (approved.length !== BANK_SIZE) issues.push('核验通过的题目有 ' + approved.length + ' 道，还差 ' + (BANK_SIZE - approved.length) + ' 道。');
  const seen = new Set();
  markedCorrect.forEach((question) => {
    if (!OPTION_KEYS.every((_, index) => clean(question.options?.[index]))) {
      issues.push('第 ' + question.id + ' 题没有写满 4 个选项。');
    }
    if (!OPTION_KEYS.includes(clean(question.answer))) {
      issues.push('第 ' + question.id + ' 题的正确答案不是 A/B/C/D。');
    }
    if (!clean(question.source)) issues.push('第 ' + question.id + ' 题还没有写查证来源。');
    if (!clean(question.evidence)) issues.push('第 ' + question.id + ' 题还没有摘录支撑证据。');
    if (!clean(question.keywords)) issues.push('第 ' + question.id + ' 题还没有写核验关键词。');
    const signature = clean(question.question);
    if (seen.has(signature)) issues.push('第 ' + question.id + ' 题与前面的题目重复。');
    seen.add(signature);
  });
  return { ok: issues.length === 0, issues, approvedCount: approved.length };
}

export const PUBLISH_QUESTIONS = [
  '我的挑战赛主题是什么？为什么选这个领域？',
  '我最自豪的一道题是哪题？它藏着什么冷知识？',
  '生成过程中，我抓到了 AI 的什么小糊涂？',
  '我是用什么关键词、在哪个网站找到终极证据的？',
];

export function buildRoadshow({ topic, favorite, aiMistake, evidence }) {
  const normalized = normalizeTopic(topic);
  return [
    '主题：' + (normalized.label || '待补充'),
    '最爱的一题：' + (clean(favorite) || '待补充'),
    '抓到 AI 犯错：' + (clean(aiMistake) || '待补充'),
    '查证大铁证：' + (clean(evidence) || '待补充'),
  ].join('\n');
}

export function sampleQuestionBank(topic = '动物奇葩睡觉姿势') {
  return {
    topic: { id: 'custom', label: topic, custom: topic },
    questions: Array.from({ length: BANK_SIZE }, (_, index) => ({
      ...createQuestion(index + 1),
      question: '示例题 ' + (index + 1) + '：这里放你已经核验过的正式题目',
      options: ['选项 A', '选项 B', '选项 C', '选项 D'],
      answer: 'A',
      explanation: '这里放核验资料支持的答案解释。',
      keywords: '示例、核验',
      source: '老师当堂指定的权威资料',
      evidence: '这里放支持答案的权威原文摘录。',
      verdict: 'correct',
    })),
  };
}
