import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUIZ_PROJECT_CODE,
  QUIZ_SCHEMA_VERSION,
  buildQuizProjectFileName,
  createQuizProjectFile,
  parseQuizProjectFile,
  stringifyQuizProjectFile,
} from '../src/lib/quiz-project-file.mjs';
import { createQuestionBank, sampleQuestionBank } from '../src/lib/quiz-challenge.mjs';

const design = { title: '动物睡觉大挑战', topic: '动物奇葩睡觉姿势', intro: '看看谁最会睡。' };
const checks = [
  { id: 'start', checked: true },
  { id: 'amount', checked: false },
  { id: 'unique', checked: true },
  { id: 'explain', checked: false },
  { id: 'reset', checked: false },
];
const rounds = { firstIds: 'Q1、Q2、Q3、Q4、Q5', firstScore: '80', secondIds: 'Q6、Q7、Q8、Q9、Q10', secondScore: '100', bugs: '开始按钮没反应' };
const roadshow = { name: '动物睡觉大挑战', favorite: '解释弹窗', bug: '修好了按钮' };

test('new project file carries all ten questions and the game plan', () => {
  const sample = sampleQuestionBank();
  const file = createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow });
  assert.equal(file.schemaVersion, QUIZ_SCHEMA_VERSION);
  assert.equal(file.projectCode, QUIZ_PROJECT_CODE);
  assert.equal(file.questions.length, 10);
  assert.equal(file.checks.length, 5);
  assert.equal(file.design.title, design.title);
});

test('unfinished lesson-three bank is exported with its drafts, not a fake game file', () => {
  const file = createQuizProjectFile({ topic: { id: 'animals' }, questions: createQuestionBank(), design, checks, rounds, roadshow });
  assert.equal(file.questions.length, 10);
  assert.ok(file.questions.every((question) => question.verdict === ''));
});

test('lesson four refuses a file with any question not marked correct', () => {
  const sample = sampleQuestionBank();
  const file = createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow });
  file.questions[4].verdict = 'unsure';
  const parsed = parseQuizProjectFile(stringifyQuizProjectFile(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /正确 · 准予通过/);
});

test('round trip keeps design, checks, rounds and pitch', () => {
  const sample = sampleQuestionBank();
  const file = createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow });
  const parsed = parseQuizProjectFile(stringifyQuizProjectFile(file));
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.data.design, design);
  assert.deepEqual(parsed.data.checks, checks);
  assert.deepEqual(parsed.data.rounds, rounds);
  assert.deepEqual(parsed.data.roadshow, roadshow);
});

test('wrong project and missing questions are rejected', () => {
  assert.match(parseQuizProjectFile('{}').message, /工程文件/);
  const sample = sampleQuestionBank();
  const file = createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow });
  file.questions.pop();
  assert.match(parseQuizProjectFile(JSON.stringify(file)).message, /正好 10 道题/);
});

test('duplicate ids are rejected', () => {
  const sample = sampleQuestionBank();
  const file = createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow });
  file.questions[9].id = 5;
  assert.match(parseQuizProjectFile(JSON.stringify(file)).message, /连续且不重复/);
});

test('a hand-edited file cannot skip verification fields', () => {
  const sample = sampleQuestionBank();
  const fields = [
    ['keywords', /核验关键词/],
    ['source', /查证来源/],
    ['evidence', /支撑证据/],
  ];
  for (const [field, message] of fields) {
    const file = createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow });
    file.questions[2][field] = '';
    const parsed = parseQuizProjectFile(JSON.stringify(file));
    assert.equal(parsed.ok, false);
    assert.match(parsed.message, message);
  }
});

test('future schema version is rejected', () => {
  const sample = sampleQuestionBank();
  const file = createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow });
  file.schemaVersion = QUIZ_SCHEMA_VERSION + 1;
  assert.match(parseQuizProjectFile(JSON.stringify(file)).message, /版本过新/);
});

test('version appears in the file name', () => {
  assert.equal(buildQuizProjectFileName(1), 'quiz-project-v1.json');
  assert.equal(buildQuizProjectFileName(2), 'quiz-project-v2.json');
});

test('serialized file never contains identity fields', () => {
  const sample = sampleQuestionBank();
  const text = stringifyQuizProjectFile(createQuizProjectFile({ topic: sample.topic, questions: sample.questions, design, checks, rounds, roadshow }));
  assert.doesNotMatch(text, /"school"\s*:|"address"\s*:|"phone"\s*:|"email"\s*:/i);
});
