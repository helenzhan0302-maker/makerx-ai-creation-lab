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

await page.goto(`${base}/lab/003-quiz-game/`, { waitUntil: 'networkidle' });
check('quiz hub loads', (await page.locator('h1').innerText()).includes('AI 趣味知识挑战赛'));
check('hub has two lesson entries', (await page.locator('.lesson-card').count()) === 2);
check('hub has no horizontal overflow', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));

await page.goto(`${base}/lab/003-quiz-game/lesson-1/`, { waitUntil: 'networkidle' });
check('lesson 1 labels itself as lesson three', (await page.locator('.project-page-status').innerText()).includes('第 3 次课'));
check('ten question cards', (await page.locator('[data-question-card]').count()) === 10);
check('lesson 1 starts with downloads disabled', await page.locator('[data-download-md]').isDisabled());
check('organiser prompt is rendered as text', (await page.locator('[data-organizer-output]').innerText()).includes('现在请等待我提供题目内容。'));
const promptText = await page.locator('[data-organizer-output]').innerText();
check('organiser prompt keeps its opening line', promptText.startsWith('你是一名专业的题库数据整理助手。'));

await page.locator('[data-warmup-option="A"]').click();
check('warm-up gives feedback', (await page.locator('[data-warmup-result]').innerText()).includes('正确答案是 C'));

await page.locator('[data-topic-radio][value="animals"]').check();
await page.locator('[data-topic-custom]').fill('动物奇葩睡觉姿势');
await page.locator('[data-copy-outline]').click();
check('outline prompt uses the focused topic', (await page.locator('[data-outline-output]').innerText()).includes('【动物奇葩睡觉姿势】'));

await page.locator('[data-question-card="1"] summary').click();
await page.locator('[data-question="1"][data-field="question"]').fill('章鱼有几颗心脏？');
await page.locator('[data-question="1"][data-option="0"]').fill('1 颗');
await page.locator('[data-question="1"][data-option="1"]').fill('2 颗');
await page.locator('[data-question="1"][data-option="2"]').fill('3 颗');
await page.locator('[data-question="1"][data-option="3"]').fill('4 颗');
await page.locator('[data-question="1"][data-field="answer"]').selectOption('C');
await page.locator('[data-question="1"][data-field="explanation"]').fill('一颗主心脏供全身，两颗鳃心脏供鳃部呼吸。');
await page.locator('[data-question="1"][data-field="keywords"]').fill('章鱼、心脏');
await page.locator('[data-question="1"][data-field="source"]').fill('中国数字科技馆');
await page.locator('[data-question="1"][data-field="evidence"]').fill('章鱼有 3 颗心脏。');
await page.locator('[data-question="1"][data-field="verdict"]').selectOption('correct');
check('one verified question counted', (await page.locator('[data-verified-count]').innerText()).includes('1 / 10'));
check('bank still keeps downloads disabled', await page.locator('[data-export-project]').isDisabled());

const overflow1440 = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
check('lesson 1 has no horizontal overflow at 1440', overflow1440 === false);

await page.goto(`${base}/lab/003-quiz-game/lesson-2/`, { waitUntil: 'networkidle' });
check('lesson 2 labels itself as lesson four', (await page.locator('.project-page-status').innerText()).includes('第 4 次课'));
check('studio starts locked', (await page.locator('[data-studio-body]').getAttribute('data-locked')) === 'true');
check('game fields start disabled', await page.locator('[data-game-field="title"]').isDisabled());

const badFile = path.join(os.tmpdir(), 'quiz-bad-project.json');
fs.writeFileSync(badFile, JSON.stringify({ projectCode: '003-quiz-game', schemaVersion: 2, questions: [] }));
await page.locator('[data-project-file-input]').setInputFiles(badFile);
let invalidBankMessage = '';
try {
  await page.locator('[data-import-feedback]').filter({ hasText: '当前文件不是完整题库' }).waitFor({ timeout: 3000 });
  invalidBankMessage = await page.locator('[data-import-feedback]').innerText();
} catch {}
check('invalid bank is rejected', invalidBankMessage.includes('当前文件不是完整题库'), invalidBankMessage);

for (const width of [1024, 390]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${base}/lab/003-quiz-game/lesson-2/`, { waitUntil: 'networkidle' });
  check(`lesson 2 has no horizontal overflow at ${width}`, !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
}

await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(`${base}/lab/003-quiz-game/lesson-1/`, { waitUntil: 'networkidle' });
const motion = await page.emulateMedia({ reducedMotion: 'reduce' });
const animation = await page.evaluate(() => getComputedStyle(document.querySelector('.qz-topic-card')).transitionDuration);
check('reduced motion removes transitions', motion !== null && animation.split(',').every((value) => parseFloat(value) < 0.01), animation);
await context.close();
await browser.close();

const failures = results.filter((result) => !result.ok);
console.log(`${results.length - failures.length}/${results.length} passed`);
if (consoleErrors.length) console.log('console errors:', consoleErrors);
if (failures.length) process.exitCode = 1;
