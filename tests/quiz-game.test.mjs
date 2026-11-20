import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBugPrompt,
  buildDesignMarkdown,
  buildProgrammerPrompt,
  computeScore,
  parseBankFile,
  resultCopy,
  roundSizeFor,
  shuffledIds,
  splitGameQuestions,
  splitRoundIds,
} from '../src/lib/quiz-game.mjs';
import { buildBankJson, sampleQuestionBank } from '../src/lib/quiz-challenge.mjs';

test('bank import requires ten questions with four options and A-D answers', () => {
  const sample = sampleQuestionBank();
  const json = buildBankJson({ topic: sample.topic, questions: sample.questions });
  const parsed = parseBankFile(JSON.stringify(json));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.questions.length, 10);

  const short = { ...json, questions: json.questions.slice(0, 9) };
  assert.match(parseBankFile(JSON.stringify(short)).message, /正好 10 道/);

  const broken = structuredClone(json);
  broken.questions[0].options.pop();
  assert.match(parseBankFile(JSON.stringify(broken)).message, /4 个选项/);

  const badAnswer = structuredClone(json);
  badAnswer.questions[0].answer = 'E';
  assert.match(parseBankFile(JSON.stringify(badAnswer)).message, /A\/B\/C\/D/);
});

test('invalid JSON is rejected with a readable message', () => {
  assert.match(parseBankFile('{oops').message, /无法被 JSON 解析/);
});

test('shuffle keeps every id exactly once', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const shuffled = shuffledIds(ids, () => 0.42);
  assert.deepEqual([...shuffled].sort(), [...ids].sort());
});

test('round size never exceeds five', () => {
  assert.equal(roundSizeFor(10), 5);
  assert.equal(roundSizeFor(3), 3);
  assert.equal(roundSizeFor(0), 0);
});

test('score counts correct answers at twenty points each', () => {
  assert.equal(computeScore([true, false, true, true, false]), 60);
  assert.equal(computeScore([]), 0);
});

test('result copy covers full, high, medium and low scores', () => {
  assert.equal(resultCopy(100).title, '知识王者');
  assert.equal(resultCopy(80).title, '知识侦探');
  assert.equal(resultCopy(60).title, '挑战新手');
  assert.equal(resultCopy(20).title, '再试一次');
});

test('programmer prompt contains the four PPT building blocks and the full bank', () => {
  const sample = sampleQuestionBank();
  const bank = buildBankJson({ topic: sample.topic, questions: sample.questions });
  const prompt = buildProgrammerPrompt({
    design: { title: '动物睡觉大挑战', topic: '动物奇葩睡觉姿势', intro: '看看谁最会睡。' },
    bank,
  });

  assert.match(prompt, /你是一名专业的儿童互动网页开发助手。/);
  assert.match(prompt, /随机抽 5 题/);
  assert.match(prompt, /每题 20 分，满分 100/);
  assert.match(prompt, /所有按钮都必须有效/);
  assert.match(prompt, /不得增删题目/);
  assert.match(prompt, /"questions"/);
  assert.equal((prompt.match(/"type": "single_choice"/g) || []).length, 10);
});

test('game questions keep option text and answers intact', () => {
  const sample = sampleQuestionBank();
  const bank = buildBankJson({ topic: sample.topic, questions: sample.questions });
  const game = splitGameQuestions(bank.questions);
  assert.equal(game.length, 10);
  assert.deepEqual(game[0].options.map((option) => option.key), ['A', 'B', 'C', 'D']);
  assert.equal(game[0].answer, 'A');
});

test('design markdown records checks, two rounds and the pitch', () => {
  const markdown = buildDesignMarkdown({
    design: { title: '动物睡觉大挑战', topic: '动物奇葩睡觉姿势', intro: '看看谁最会睡。' },
    bank: { title: '动物奇葩睡觉姿势', questions: new Array(10).fill({}) },
    checks: [
      { label: '启动测试', checked: true },
      { label: '题量测试', checked: false },
    ],
    rounds: { firstIds: 'Q1、Q2', firstScore: '80', secondIds: 'Q6、Q7', secondScore: '100', bugs: '按钮没反应' },
    roadshow: { name: '动物睡觉大挑战', favorite: '解释弹窗', bug: '修好了按钮' },
  });
  assert.match(markdown, /已完成 1 \/ 5 项/);
  assert.match(markdown, /第 2 轮得分：100/);
  assert.match(markdown, /修好了按钮/);
});

test('bug prompt asks for a targeted fix instead of a rebuild', () => {
  const prompt = buildBugPrompt({ phenomenon: '点开始没反应', expected: '进入答题页', actual: '仍停在首页' });
  assert.match(prompt, /不要重做整个游戏/);
  assert.match(prompt, /点开始没反应/);
  assert.match(prompt, /重新测试/);
});

test('round ids accept Chinese commas and spaces', () => {
  assert.deepEqual(splitRoundIds('Q1、Q2，Q3 Q4'), ['Q1', 'Q2', 'Q3', 'Q4']);
});
