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
const hubCardStyle = await page.locator('.qz-lesson-card').first().evaluate((element) => {
  const style = getComputedStyle(element);
  return {
    textDecoration: style.textDecorationLine,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
  };
});
check('hub cards keep the shared rounded card surface', hubCardStyle.borderRadius !== '0px' && hubCardStyle.boxShadow !== 'none', JSON.stringify(hubCardStyle));
check('hub cards are not rendered as underlined link text', hubCardStyle.textDecoration === 'none', hubCardStyle.textDecoration);

for (const width of [562, 390]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${base}/lab/003-quiz-game/`, { waitUntil: 'networkidle' });
  const narrowHub = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.qz-lesson-card')];
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      widths: cards.map((card) => Math.round(card.getBoundingClientRect().width)),
      textOverflow: cards.some((card) =>
        [...card.querySelectorAll('.lesson-card-title, .lesson-card-description, .lesson-card-action')].some(
          (node) => node.scrollWidth > node.clientWidth + 1 || node.getBoundingClientRect().right > innerWidth,
        ),
      ),
    };
  });
  check(`hub keeps two readable cards at ${width}`, !narrowHub.overflow && narrowHub.widths.length === 2 && narrowHub.widths.every((cardWidth) => cardWidth > 200) && !narrowHub.textOverflow, JSON.stringify(narrowHub));
}

await page.setViewportSize({ width: 1440, height: 1000 });

await page.goto(`${base}/lab/003-quiz-game/lesson-1/`, { waitUntil: 'networkidle' });
check('lesson 1 labels itself as lesson three', (await page.locator('.project-page-status').innerText()).includes('第 3 次课'));
check('lesson 1 drops the intro notes row', (await page.locator('.project-intro-notes').count()) === 0);
check('lesson 1 no longer repeats the slide deck as page sections', (await page.locator('[data-question-card]').count()) === 0 && (await page.locator('.qz-warmup').count()) === 0);
check('lesson 1 keeps the organiser card', (await page.locator('.qz-organizer').count()) === 1);
check('organiser prompt is rendered as text', (await page.locator('[data-organizer-output]').innerText()).includes('现在请等待我提供题目内容。'));
const promptText = await page.locator('[data-organizer-output]').innerText();
check('organiser prompt keeps its opening line', promptText.startsWith('你是一名专业的题库数据整理助手。'));

await page.locator('[data-topic-radio][value="animals"]').check();
await page.locator('[data-topic-custom]').fill('动物奇葩睡觉姿势');
check('outline prompt uses the focused topic', (await page.locator('[data-outline-output]').innerText()).includes('【动物奇葩睡觉姿势】'));
check('lesson 1 prompt section is titled as requested', (await page.locator('.qz-prompt-sheet h3').innerText()) === '出题提示词');

const overflow1440 = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
check('lesson 1 has no horizontal overflow at 1440', overflow1440 === false);

await page.goto(`${base}/lab/003-quiz-game/lesson-2/`, { waitUntil: 'networkidle' });
check('lesson 2 labels itself as lesson four', (await page.locator('.project-page-status').innerText()).includes('第 4 次课'));
check('studio starts locked', (await page.locator('[data-studio-body]').getAttribute('data-locked')) === 'true');
check('game fields start disabled', await page.locator('[data-game-field="title"]').isDisabled());
const gamePrompt = await page.locator('[data-game-prompt-output]').innerText();
check('lesson 2 shows the supplied game prompt', gamePrompt.startsWith('任务：开发儿童趣味知识挑战赛网页'));
check('lesson 2 game prompt keeps its closing line', gamePrompt.trim().endsWith('请直接完成网页开发，不要只提供设计方案或代码片段。'));
check('lesson 2 game prompt copy button is usable before import', !(await page.locator('[data-copy-game-prompt]').isDisabled()));

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
