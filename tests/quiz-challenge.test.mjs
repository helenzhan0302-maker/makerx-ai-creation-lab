import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BANK_SIZE,
  OPTION_KEYS,
  OUTLINE_TEMPLATE,
  QUIZ_PROJECT_CODE,
  ROUND_SIZE,
  buildBankJson,
  buildBankMarkdown,
  buildOutlinePrompt,
  checkQuestionBank,
  createQuestionBank,
  finalQuestions,
  formatDate,
  isQuestionVerified,
  normalizeTopic,
  readyForGame,
  sampleQuestionBank,
  splitKeywords,
  verificationProgress,
} from '../src/lib/quiz-challenge.mjs';

test('question bank starts with exactly ten numbered drafts', () => {
  const questions = createQuestionBank();
  assert.equal(questions.length, BANK_SIZE);
  assert.deepEqual(questions.map((question) => question.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(questions.every((question) => question.options.length === OPTION_KEYS.length));
  assert.ok(questions.every((question) => question.verdict === ''));
});

test('only a complete draft marked correct counts as verified', () => {
  const questions = createQuestionBank();
  questions[0].question = '章鱼有几颗心脏？';
  questions[0].options = ['1 颗', '2 颗', '3 颗', '4 颗'];
  questions[0].answer = 'C';
  questions[0].explanation = '一颗主心脏供全身，两颗鳃心脏供鳃部呼吸。';

  assert.equal(isQuestionVerified(questions[0]), false);
  questions[0].verdict = 'partial';
  assert.equal(isQuestionVerified(questions[0]), false);
  questions[0].keywords = '章鱼、心脏';
  questions[0].source = '中国数字科技馆';
  questions[0].evidence = '章鱼有 3 颗心脏。';
  questions[0].verdict = 'correct';
  assert.equal(isQuestionVerified(questions[0]), true);
  assert.equal(verificationProgress(questions).verified, 1);
});

test('the game cannot start until all ten questions pass verification', () => {
  const sample = sampleQuestionBank();
  assert.equal(readyForGame(sample.questions), true);
  sample.questions[9].verdict = 'unsure';
  assert.equal(readyForGame(sample.questions), false);
  assert.equal(finalQuestions(sample.questions).length, 9);
});

test('duplicate and incomplete approved questions are reported', () => {
  const sample = sampleQuestionBank();
  sample.questions[1].question = sample.questions[0].question;
  sample.questions[2].options[3] = '';
  sample.questions[2].verdict = 'correct';
  const result = checkQuestionBank(sample.questions);
  assert.equal(result.ok, false);
  const issues = result.issues.join(' ');
  assert.match(issues, /重复/);
  assert.match(issues, /4 个选项/);
});

test('outline prompt only uses the chosen focused topic', () => {
  const prompt = buildOutlinePrompt({ id: 'animals' });
  assert.match(prompt, /【动物王国】/);
  assert.doesNotMatch(prompt, /【我的主题】/);
  assert.match(prompt, /10 道趣味单选题/);
  assert.match(prompt, /4 个选项/);
  assert.match(prompt, /不要凭空捏造/);
});

test('outline template is the PPT template, not a rewritten one', () => {
  assert.match(OUTLINE_TEMPLATE, /^设定身份：你是一位专业的知识挑战赛出题专家。/);
  assert.match(OUTLINE_TEMPLATE, /输出格式：题号 ｜ 题目 ｜ 选项 ｜ 正确答案 ｜ 解释 ｜ 关键词$/);
});

test('custom topic requires a written theme', () => {
  assert.deepEqual(normalizeTopic({ id: 'custom', custom: '  ' }), { id: 'custom', label: '', custom: '' });
  assert.equal(normalizeTopic({ id: 'custom', custom: ' 会发光的深海鱼 ' }).label, '会发光的深海鱼');
});

test('markdown and JSON agree on count, order, answers and explanations', () => {
  const sample = sampleQuestionBank();
  const markdown = buildBankMarkdown({ topic: sample.topic, questions: sample.questions, date: new Date(2026, 10, 20) });
  const json = buildBankJson({ topic: sample.topic, questions: sample.questions });

  assert.equal(json.question_count, BANK_SIZE);
  assert.equal(json.questions.length, BANK_SIZE);
  assert.equal((markdown.match(/^## 第[0-9][0-9]题$/gm) || []).length, BANK_SIZE);
  assert.match(markdown, /创建日期：2026-11-20/);
  assert.match(markdown, /题库ID：CUSTOM-001/);
  assert.match(json.questions[0].id, /^CUSTOM-001-Q001$/);

  json.questions.forEach((question, index) => {
    assert.ok(markdown.includes('题目：' + question.question));
    assert.ok(markdown.includes('正确答案：' + question.answer));
    assert.ok(markdown.includes('答案解释：' + question.explanation));
    assert.equal(question.options.length, 4);
    assert.equal(question.options[index % 4].key, OPTION_KEYS[index % 4]);
  });
});

test('JSON has the exact field contract from the supplied prompt', () => {
  const sample = sampleQuestionBank();
  const json = buildBankJson({ topic: sample.topic, questions: sample.questions });
  assert.deepEqual(Object.keys(json), [
    'bank_id', 'title', 'category', 'age_range', 'version', 'question_count', 'questions',
  ]);
  assert.deepEqual(Object.keys(json.questions[0]), [
    'id', 'type', 'question', 'options', 'answer', 'explanation', 'keywords', 'source', 'verification',
  ]);
  assert.deepEqual(json.age_range, [9, 12]);
  assert.equal(json.questions[0].type, 'single_choice');
  assert.ok(['pending', 'verified', 'disputed', 'deprecated'].includes(json.questions[0].verification));
});

test('JSON serializes without comments and round-trips through JSON.parse', () => {
  const sample = sampleQuestionBank();
  const text = JSON.stringify(buildBankJson({ topic: sample.topic, questions: sample.questions }));
  assert.ok(!text.includes('//'));
  const parsed = JSON.parse(text);
  assert.equal(parsed.questions.length, BANK_SIZE);
});

test('rejected questions never leak into either export', () => {
  const sample = sampleQuestionBank();
  sample.questions[0].verdict = 'wrong';
  sample.questions[0].question = '这道题应当被淘汰';
  const markdown = buildBankMarkdown({ topic: sample.topic, questions: sample.questions });
  const json = buildBankJson({ topic: sample.topic, questions: sample.questions });
  assert.ok(!markdown.includes('这道题应当被淘汰'));
  assert.equal(json.questions.length, BANK_SIZE - 1);
});

test('keywords split on Chinese and ASCII separators', () => {
  assert.deepEqual(splitKeywords('章鱼、心脏，鳃；呼吸'), ['章鱼', '心脏', '鳃', '呼吸']);
});

test('date formatting is local and deterministic', () => {
  assert.equal(formatDate(new Date(2026, 0, 3)), '2026-01-03');
});

test('project code and round rules match the course', () => {
  assert.equal(QUIZ_PROJECT_CODE, '003-quiz-game');
  assert.equal(ROUND_SIZE, 5);
});
