import { BANK_SIZE, OPTION_KEYS, VERDICT_ORDER, clean, createQuestionBank, normalizeTopic } from './quiz-challenge.mjs';
import { parseBankFile } from './quiz-game.mjs';

export const QUIZ_SCHEMA_VERSION = 2;
export const QUIZ_PROJECT_CODE = '003-quiz-game';

function cleanQuestion(question, index) {
  const source = question || {};
  return {
    id: index + 1,
    question: clean(source.question),
    options: OPTION_KEYS.map((_, optionIndex) => clean(source.options?.[optionIndex])),
    answer: clean(source.answer).toUpperCase(),
    explanation: clean(source.explanation),
    keywords: clean(source.keywords),
    source: clean(source.source),
    evidence: clean(source.evidence),
    verification: clean(source.verification) === 'verified' ? 'verified' : '',
    verdict: VERDICT_ORDER.includes(clean(source.verdict)) ? clean(source.verdict) : '',
    revision: clean(source.revision),
  };
}

function cleanChecks(checks) {
  const ids = ['start', 'amount', 'unique', 'explain', 'reset'];
  const source = Array.isArray(checks) ? checks : [];
  return ids.map((id) => ({
    id,
    checked: Boolean(source.find((item) => item?.id === id)?.checked),
  }));
}

function cleanRounds(rounds = {}) {
  return {
    firstIds: clean(rounds.firstIds),
    firstScore: clean(rounds.firstScore),
    secondIds: clean(rounds.secondIds),
    secondScore: clean(rounds.secondScore),
    bugs: clean(rounds.bugs),
  };
}

function cleanRoadshow(roadshow = {}) {
  return {
    name: clean(roadshow.name),
    favorite: clean(roadshow.favorite),
    bug: clean(roadshow.bug),
  };
}

function cleanDesign(design = {}) {
  return {
    title: clean(design.title),
    topic: clean(design.topic),
    intro: clean(design.intro),
  };
}

export function createQuizProjectFile({ topic, questions, design, checks, rounds, roadshow, version = 1 }) {
  const list = Array.isArray(questions) ? questions : [];
  return {
    schemaVersion: QUIZ_SCHEMA_VERSION,
    projectCode: QUIZ_PROJECT_CODE,
    exportedAt: new Date().toISOString(),
    version,
    topic: normalizeTopic(topic),
    questions: Array.from({ length: BANK_SIZE }, (_, index) => cleanQuestion(list[index], index)),
    design: cleanDesign(design),
    checks: cleanChecks(checks),
    rounds: cleanRounds(rounds),
    roadshow: cleanRoadshow(roadshow),
  };
}

export function buildQuizProjectFileName(version) {
  return 'quiz-project-v' + version + '.json';
}

export function stringifyQuizProjectFile(file) {
  return JSON.stringify(file, null, 2) + String.fromCharCode(10);
}

export function parseQuizProjectFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: '这不是题库工程文件：内容无法被 JSON 解析。' };
  }

  if (!data || typeof data !== 'object' || data.projectCode !== QUIZ_PROJECT_CODE) {
    return { ok: false, message: '这不是「AI 趣味知识挑战赛」的工程文件。' };
  }

  if (!Number.isInteger(data.schemaVersion) || data.schemaVersion < 1 || data.schemaVersion > QUIZ_SCHEMA_VERSION) {
    return { ok: false, message: '工程文件版本过新：请用更新后的页面打开。' };
  }

  if (!Array.isArray(data.questions) || data.questions.length !== BANK_SIZE) {
    return { ok: false, message: '题库需要正好 10 道题，当前文件不是完整题库。' };
  }

  const ids = data.questions.map((question) => Number(question?.id));
  const unique = new Set(ids);
  if (unique.size !== BANK_SIZE || ids.some((id) => !Number.isInteger(id) || id < 1 || id > BANK_SIZE)) {
    return { ok: false, message: '题目编号必须连续且不重复。' };
  }

  const questions = Array.from({ length: BANK_SIZE }, (_, index) => cleanQuestion(data.questions[index], index));
  for (const question of questions) {
    if (!question.question) return { ok: false, message: '第 ' + question.id + ' 题缺少题干。' };
    if (!question.options.every(Boolean)) return { ok: false, message: '第 ' + question.id + ' 题没有写满 4 个选项。' };
    if (!OPTION_KEYS.includes(question.answer)) return { ok: false, message: '第 ' + question.id + ' 题的答案不是 A/B/C/D。' };
    if (!question.explanation) return { ok: false, message: '第 ' + question.id + ' 题缺少答案解释。' };
    if (!question.keywords) return { ok: false, message: '第 ' + question.id + ' 题缺少核验关键词。' };
    if (!question.source) return { ok: false, message: '第 ' + question.id + ' 题缺少查证来源。' };
    if (!question.evidence && question.verification !== 'verified') {
      return { ok: false, message: '第 ' + question.id + ' 题缺少支撑证据或核验通过标记。' };
    }
    if (question.verdict !== 'correct') {
      return { ok: false, message: '第 ' + question.id + ' 题还没有盖上「正确 · 准予通过」印章，不能进入游戏。' };
    }
  }

  return {
    ok: true,
    data: createQuizProjectFile({
      topic: data.topic,
      questions,
      design: data.design,
      checks: data.checks,
      rounds: data.rounds,
      roadshow: data.roadshow,
      version: Number(data.version) || 1,
    }),
  };
}

export function parseLessonOneFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: '这不是可读取的 JSON 文件：内容无法被解析。' };
  }

  if (data && typeof data === 'object' && data.projectCode === QUIZ_PROJECT_CODE) {
    return parseQuizProjectFile(text);
  }

  const parsed = parseBankFile(text);
  if (!parsed.ok) return parsed;

  const title = clean(parsed.data.title);
  const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
  const questions = parsed.data.questions.map((question, index) => ({
    id: index + 1,
    question: clean(question.question),
    options: rawQuestions[index].options.map((option) => clean(option?.text)),
    answer: clean(question.answer).toUpperCase(),
    explanation: clean(question.explanation),
    keywords: rawQuestions[index].keywords.map((keyword) => clean(keyword)).filter(Boolean).join('、'),
    source: rawQuestions[index].source.map((source) => clean(source)).filter(Boolean).join('、'),
    evidence: '',
    verification: 'verified',
    verdict: 'correct',
    revision: '',
  }));

  return {
    ok: true,
    data: createQuizProjectFile({
      topic: { id: 'custom', custom: title },
      questions,
      version: 1,
    }),
  };
}

export function createEmptyQuizProject() {
  return createQuizProjectFile({ topic: { id: '', label: '', custom: '' }, questions: createQuestionBank(), version: 1 });
}
