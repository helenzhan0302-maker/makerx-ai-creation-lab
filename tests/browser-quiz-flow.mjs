import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const base = process.env.QZ_BASE || 'http://127.0.0.1:4321';
const chromePath = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe'),
].find((candidate) => fs.existsSync(candidate));

if (!chromePath) throw new Error('找不到 Chrome 可执行文件');

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(String(error)));

await page.goto(`${base}/lab/003-quiz-game/lesson-1/`, { waitUntil: 'networkidle' });
await page.locator('[data-topic-radio][value="animals"]').check();
await page.locator('[data-topic-custom]').fill('动物奇葩睡觉姿势');

const optionSets = [
  ['1 颗', '2 颗', '3 颗', '4 颗'],
  ['鳃', '肺', '皮肤', '胃'],
  ['树上', '水里', '洞穴', '沙里'],
  ['海豚', '蝙蝠', '大象', '企鹅'],
  ['站着睡', '倒挂着睡', '边飞边睡', '埋在沙里睡'],
  ['长颈鹿', '考拉', '狮子', '河马'],
  ['火烈鸟', '猫头鹰', '鸭子', '鹤'],
  ['北极熊', '海豹', '鲸鱼', '海龟'],
  ['猫', '狗', '兔子', '仓鼠'],
  ['树懒', '猴子', '袋鼠', '松鼠'],
];

for (let index = 0; index < 10; index += 1) {
  const id = index + 1;
  await page.locator(`[data-question-card="${id}"] summary`).click();
  await page.locator(`[data-question="${id}"][data-field="question"]`).fill(`第 ${id} 题：动物睡觉冷知识`);
  for (let option = 0; option < 4; option += 1) {
    await page.locator(`[data-question="${id}"][data-option="${option}"]`).fill(optionSets[index][option]);
  }
  await page.locator(`[data-question="${id}"][data-field="answer"]`).selectOption('A');
  await page.locator(`[data-question="${id}"][data-field="explanation"]`).fill(`第 ${id} 题的答案解释，来自核验资料。`);
  await page.locator(`[data-question="${id}"][data-field="keywords"]`).fill('动物、睡觉');
  await page.locator(`[data-question="${id}"][data-field="source"]`).fill('中国数字科技馆');
  await page.locator(`[data-question="${id}"][data-field="evidence"]`).fill(`第 ${id} 题对应的权威原文摘录。`);
  await page.locator(`[data-question="${id}"][data-field="verdict"]`).selectOption('correct');
}

check('all ten questions verified', (await page.locator('[data-verified-count]').innerText()).includes('10 / 10'));
check('downloads unlock after full verification', !(await page.locator('[data-download-md]').isDisabled()));
await page.locator('[data-check-bank]').click();
check('bank check reports all clear', (await page.locator('[data-bank-check-text]').innerText()).includes('10 道题全部通过'));

const mdDownloadPromise = page.waitForEvent('download');
await page.locator('[data-download-md]').click();
const mdDownload = await mdDownloadPromise;
const mdPath = path.join(os.tmpdir(), 'quiz-flow-bank.md');
await mdDownload.saveAs(mdPath);
const markdown = fs.readFileSync(mdPath, 'utf8');
check('markdown has ten question blocks', (markdown.match(/^## 第[0-9][0-9]题$/gm) || []).length === 10);
check('markdown follows the supplied field contract', markdown.includes('核验关键词：') && markdown.includes('资料来源：') && markdown.includes('核验状态：'));

const jsonDownloadPromise = page.waitForEvent('download');
await page.locator('[data-download-json]').click();
const jsonDownload = await jsonDownloadPromise;
const jsonPath = path.join(os.tmpdir(), 'quiz-flow-bank.json');
await jsonDownload.saveAs(jsonPath);
const bankJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
check('json bank parses and has ten questions', bankJson.questions.length === 10);
check('json answers are A-D', bankJson.questions.every((question) => ['A', 'B', 'C', 'D'].includes(question.answer)));

const projectDownloadPromise = page.waitForEvent('download');
await page.locator('[data-export-project]').click();
const projectDownload = await projectDownloadPromise;
const projectPath = path.join(os.tmpdir(), 'quiz-project-v1.json');
await projectDownload.saveAs(projectPath);
const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
check('v1 keeps ten verified questions', project.questions.length === 10 && project.questions.every((question) => question.verdict === 'correct'));

await page.goto(`${base}/lab/003-quiz-game/lesson-2/`, { waitUntil: 'networkidle' });
await page.locator('[data-project-file-input]').setInputFiles(projectPath);
await page.waitForFunction(() => document.querySelector('[data-studio-body]')?.getAttribute('data-locked') === 'false');
check('lesson 2 unlocks after import', (await page.locator('[data-studio-body]').getAttribute('data-locked')) === 'false');
check('import reports ten verified questions', (await page.locator('[data-bank-meta]').innerText()).includes('10 道核验题'));

await page.locator('[data-game-field="title"]').fill('动物睡觉大挑战');
await page.locator('[data-game-field="topic"]').fill('动物奇葩睡觉姿势');
await page.locator('[data-game-field="intro"]').fill('看看谁最会睡，答完还能学到动物冷知识。');
await page.locator('[data-generate-programmer]').click();
const programmer = await page.locator('[data-programmer-output]').innerText();
check('programmer prompt includes all ten questions', (programmer.match(/"type": "single_choice"/g) || []).length === 10);
check('programmer prompt forbids changing the bank', programmer.includes('不得增删题目'));

await page.locator('[data-demo-start]').click();
check('demo starts with the first question', await page.locator('[data-demo-question]').isVisible());
for (let index = 0; index < 5; index += 1) {
  await page.locator('.qz-demo-option').first().click();
  check(`demo answer feedback ${index + 1}`, await page.locator('[data-demo-answer]').isVisible());
  await page.locator('[data-demo-next]').click();
}
check('demo shows a final score', await page.locator('[data-demo-result]').isVisible());
check('demo score is a hundred when all answers are correct', (await page.locator('[data-demo-final-score]').innerText()) === '100');
await page.locator('[data-demo-restart]').click();
check('demo restart returns to a question', await page.locator('[data-demo-question]').isVisible());

for (const id of ['start', 'amount', 'unique', 'explain', 'reset']) {
  await page.locator(`[data-test-check="${id}"]`).check();
}
await page.locator('[data-round="firstIds"]').fill('Q1、Q2、Q3、Q4、Q5');
await page.locator('[data-round="firstScore"]').fill('80');
await page.locator('[data-round="secondIds"]').fill('Q6、Q7、Q8、Q9、Q10');
await page.locator('[data-round="secondScore"]').fill('100');
await page.locator('[data-round="bugs"]').fill('开始按钮没反应，修好后复测通过。');
await page.locator('[data-roadshow="name"]').fill('动物睡觉大挑战，考考大家对动物睡眠的了解。');
await page.locator('[data-roadshow="favorite"]').fill('我最喜欢每轮随机抽 5 题，每次组合都不同。');
await page.locator('[data-roadshow="bug"]').fill('开始按钮一开始没反应，后来让 AI 修好了。');
check('v2 export unlocks after the full checklist', !(await page.locator('[data-export-v2]').isDisabled()));

const v2Promise = page.waitForEvent('download');
await page.locator('[data-export-v2]').click();
const v2Download = await v2Promise;
const v2Path = path.join(os.tmpdir(), 'quiz-project-v2.json');
await v2Download.saveAs(v2Path);
const v2 = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
check('v2 keeps the design and test log', v2.design.title === '动物睡觉大挑战' && v2.checks.every((checkItem) => checkItem.checked) && v2.rounds.secondScore === '100');
check('v2 stays at version two', v2.version === 2);

const designPromise = page.waitForEvent('download');
await page.locator('[data-export-design]').click();
const designDownload = await designPromise;
const designPath = path.join(os.tmpdir(), 'quiz-flow-design.md');
await designDownload.saveAs(designPath);
const designMarkdown = fs.readFileSync(designPath, 'utf8');
check('design sheet records the two rounds', designMarkdown.includes('第 2 轮得分：100') && designMarkdown.includes('开始按钮一开始没反应'));

check('no console errors during the flow', consoleErrors.length === 0, consoleErrors.join(' | '));

const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
check('lesson 2 has no overflow after the full flow', overflow === false);

await context.close();
await browser.close();

const failures = results.filter((result) => !result.ok);
console.log(`${results.length - failures.length}/${results.length} passed`);
if (failures.length) process.exitCode = 1;
