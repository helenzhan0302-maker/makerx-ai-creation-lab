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

const projectPath = path.join(os.tmpdir(), 'quiz-organizer-bank.json');
const questions = Array.from({ length: 10 }, (_, index) => ({
  id: `ANIMALS-001-Q${String(index + 1).padStart(3, '0')}`,
  type: 'single_choice',
  question: `第 ${index + 1} 题：动物睡觉冷知识`,
  options: [
    { key: 'A', text: `第 ${index + 1} 题的正确选项` },
    { key: 'B', text: '干扰选项 B' },
    { key: 'C', text: '干扰选项 C' },
    { key: 'D', text: '干扰选项 D' },
  ],
  answer: 'A',
  explanation: `第 ${index + 1} 题的答案解释，来自核验资料。`,
  keywords: ['动物', '睡觉'],
  source: ['中国数字科技馆'],
  verification: 'verified',
}));
fs.writeFileSync(projectPath, JSON.stringify({
  bank_id: 'ANIMALS-001',
  title: '动物奇葩睡觉姿势',
  category: '动物王国',
  age_range: [9, 12],
  version: '1.0',
  question_count: 10,
  questions,
}, null, 2));
check('organiser JSON has ten verified questions', questions.length === 10 && questions.every((question) => question.verification === 'verified'));

const pendingPath = path.join(os.tmpdir(), 'quiz-organizer-pending.json');
const pendingQuestions = structuredClone(questions);
pendingQuestions[4].verification = 'pending';
fs.writeFileSync(pendingPath, JSON.stringify({
  bank_id: 'ANIMALS-001',
  title: '动物奇葩睡觉姿势',
  question_count: 10,
  questions: pendingQuestions,
}, null, 2));

await page.goto(`${base}/lab/003-quiz-game/lesson-2/`, { waitUntil: 'networkidle' });
await page.locator('[data-project-file-input]').setInputFiles(pendingPath);
await page.waitForFunction(() => document.querySelector('[data-import-feedback]')?.textContent.includes('还没有核验通过'));
check('lesson 2 rejects an unverified organiser JSON', (await page.locator('[data-studio-body]').getAttribute('data-locked')) === 'true');

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
