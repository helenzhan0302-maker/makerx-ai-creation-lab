import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const base = process.env.PB_BASE || 'http://127.0.0.1:4321';
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

await page.goto(`${base}/lab/002-picturebook/lesson-1/`, { waitUntil: 'networkidle' });
check('lesson 1 loads', (await page.locator('h1').innerText()).includes('故事放映机'));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.locator('#projects').scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
const homeLayout = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.project-card')].map((card) => {
    const rect = card.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  const title = document.querySelector('.archive-panel h2');
  const body = document.querySelector('.project-card-copy > p:last-child');
  return {
    cards,
    overflow: document.documentElement.scrollWidth > innerWidth,
    titleLetter: title ? getComputedStyle(title).letterSpacing : '',
    bodySize: body ? parseFloat(getComputedStyle(body).fontSize) : 0,
    orbit: getComputedStyle(document.querySelector('.orbit-system')).animationName,
    frames: getComputedStyle(document.querySelector('.storyboard-frame')).animationName,
  };
});
check('home shows two compact cards side by side', homeLayout.cards.length === 2 && homeLayout.cards.every((card) => card.width > 300 && card.width < 420 && card.height < 320), JSON.stringify(homeLayout.cards));
check('home archive title has no negative tracking', homeLayout.titleLetter === 'normal');
check('home card body is at least 15px', homeLayout.bodySize >= 15, String(homeLayout.bodySize));
check('home project cards run separate motion', homeLayout.orbit === 'project-orbit' && homeLayout.frames === 'frame-fill');
check('home has no horizontal overflow', homeLayout.overflow === false);

await page.goto(`${base}/lab/002-picturebook/`, { waitUntil: 'networkidle' });
const hubLayout = await page.evaluate(() => {
  const title = document.querySelector('.pb-lesson-card .lesson-card-title');
  return {
    overflow: document.documentElement.scrollWidth > innerWidth,
    titleLetter: title ? getComputedStyle(title).letterSpacing : '',
    story: getComputedStyle(document.querySelector('.pb-story-path')).animationName,
    paint: getComputedStyle(document.querySelector('.pb-paint-fill')).animationName,
    hasBoundary: Boolean(document.querySelector('.pb-boundary')),
    chipStrip: Boolean(document.querySelector('.pb-chip-strip')),
  };
});
check('lesson hub title has no negative tracking', hubLayout.titleLetter === 'normal');
check('lesson hub runs separate motion per lesson', hubLayout.story === 'pb-story-dash' && hubLayout.paint === 'pb-paint');
check('lesson hub omits the removed notice', hubLayout.hasBoundary === false && hubLayout.chipStrip === false);
check('lesson hub has no horizontal overflow', hubLayout.overflow === false);

await page.goto(`${base}/lab/002-picturebook/lesson-1/`, { waitUntil: 'networkidle' });
check('story card present', (await page.locator('[data-story-card]').count()) === 1);
check('storyboard has six pages', (await page.locator('[data-storyboard-page]').count()) === 6);
check('export controls present', (await page.locator('[data-export-project]').count()) === 1);
check('export disabled before storyboard is complete', await page.locator('[data-export-project]').isDisabled());
check('export explains the story card is missing first', (await page.locator('[data-project-file-bar] [data-file-feedback]').innerText()).includes('故事卡'));
check('seed panel offers character ideas', (await page.locator('[data-story-inspiration] .pb-choice-chip--idea').count()) >= 6);
check('story check block was removed', (await page.locator('[data-review]').count()) === 0);
const lessonOneSteps = await page.locator('.pb-kicker').allInnerTexts();
check(
  'lesson 1 steps are numbered continuously',
  ['step 01', 'step 02', 'step 03', 'step 04'].every((step) =>
    lessonOneSteps.some((text) => text.toLowerCase().startsWith(step)),
  ),
  lessonOneSteps.join(' | '),
);

await page.locator('[data-story-inspiration] .pb-choice-chip--idea').first().click();
check('inspiration fills the seed field', (await page.locator('[data-story-seed]').inputValue()).includes('会发光的小恐龙'));

const answers = [
  ['hero', '一只总把袜子藏起来的小猫'],
  ['goal', '想把丢失的星星挂回天上'],
  ['obstacle', '夜里太黑，它又怕黑'],
  ['action', '提着萤火虫灯笼出门'],
  ['result', '星星回到天上，它也敢关灯睡觉了'],
];

for (const [element, value] of answers) {
  await page.locator(`[data-story-input][data-element="${element}"]`).fill(value);
}

await page.locator('[data-story-input][data-element="result"]').fill('');
check('export stays blocked when a story line is missing', await page.locator('[data-export-project]').isDisabled());
check('blocked save names the story card first', (await page.locator('[data-project-file-bar] [data-file-feedback]').innerText()).includes('故事卡'));
await page.locator('[data-story-input][data-element="result"]').fill('星星回到天上，它也敢关灯睡觉了');

const confirmed = await page.locator('[data-story-status][data-state="confirmed"]').count();
check('all five story elements confirmed', confirmed === 5, String(confirmed));
check('storyboard cards show the six story beats', (await page.locator('.pb-page-beat').count()) === 6 && (await page.locator('.pb-page-beat').first().innerText()).includes('认识主角'));

const pages = [
  ['小猫发现星星不见了', '抬起头看天空', '着急'],
  ['小猫找出萤火虫灯笼', '踮脚取下灯笼', '有点害怕'],
  ['小猫走进黑黑的树林', '提灯往前走', '紧张'],
  ['小猫遇到迷路的小兔', '把灯举高照路', '坚定'],
  ['小猫和小兔一起找到星星', '伸手接住星星', '开心'],
  ['星星回到天上，小猫关灯睡觉', '躺在床上闭眼', '安心'],
];

for (let index = 0; index < pages.length; index += 1) {
  const card = page.locator(`[data-storyboard-page="${index + 1}"]`);
  const fields = card.locator('[data-page-field]');
  for (let fieldIndex = 0; fieldIndex < 3; fieldIndex += 1) {
    await fields.nth(fieldIndex).fill(pages[index][fieldIndex]);
  }
}
check('storyboard progress six of six', (await page.locator('[data-storyboard-progress]').innerText()).includes('6 / 6'));
check('export enabled after storyboard is complete', await page.locator('[data-export-project]').isEnabled());

await page.locator('[data-generate-socratic]').click();
const socraticText = await page.locator('[data-socratic-output]').innerText();
check('socratic prompt has the three phases', socraticText.includes('第一阶段') && socraticText.includes('第二阶段') && socraticText.includes('第三阶段'));
check('socratic prompt carries the filled story card', socraticText.includes('主角：一只总把袜子藏起来的小猫'));
check('socratic prompt asks the child to confirm the story', socraticText.includes('这是你想讲的故事吗'));
check('socratic prompt carries the seed and the six-question cap', socraticText.includes('会发光的小恐龙') && socraticText.includes('最多问 6 个问题'));

const downloadV1Promise = page.waitForEvent('download');
await page.locator('[data-export-project]').click();
const downloadV1 = await downloadV1Promise;
const v1Path = path.join(os.tmpdir(), 'story-project-v1-browser.json');
await downloadV1.saveAs(v1Path);
const v1 = JSON.parse(fs.readFileSync(v1Path, 'utf8'));
check('v1 filename', downloadV1.suggestedFilename() === 'story-project-v1.json', downloadV1.suggestedFilename());
check('v1 has six storyboard pages', v1.storyboard.length === 6);
check('v1 keeps original story text', v1.story.hero === '一只总把袜子藏起来的小猫');
check('v1 carries image records', v1.images.length === 6);

const downloadV1AgainPromise = page.waitForEvent('download');
await page.locator('[data-export-project]').click();
const downloadV1Again = await downloadV1AgainPromise;
check(
  'second save on the same page increments the version',
  downloadV1Again.suggestedFilename() === 'story-project-v2.json',
  downloadV1Again.suggestedFilename(),
);
const repeatedPath = path.join(os.tmpdir(), 'story-project-v2-repeat-browser.json');
await downloadV1Again.saveAs(repeatedPath);

await page.reload({ waitUntil: 'networkidle' });
check('refresh clears in-memory storyboard', (await page.locator('[data-storyboard-progress]').innerText()).includes('0 / 6'));

await page.goto(`${base}/lab/002-picturebook/lesson-2/`, { waitUntil: 'networkidle' });
check('studio is gated before import', await page.locator('[data-import-gate]').isVisible());
check('studio body hidden before import', await page.locator('[data-studio-body]').isHidden());
check('lesson 2 export disabled before import', await page.locator('.pb-stack-end [data-export-project]').isDisabled());
check('lesson 2 export asks for import first', (await page.locator('.pb-stack-end [data-file-feedback]').innerText()).includes('先导入'));

await page.locator('[data-project-file-input]').setInputFiles(v1Path);
await page.waitForFunction(() => !document.querySelector('[data-studio-body]').hidden);
check('studio visible after import', await page.locator('[data-studio-body]').isVisible());
check('import status shows v1', (await page.locator('[data-import-status]').innerText()).includes('第 1 版'));
check('six page cards after import', (await page.locator('[data-studio-page]').count()) === 6);
check('imported scene shown', (await page.locator('[data-mini-scene]').first().innerText()).includes('小猫发现星星不见了'));
check('lesson 2 export enabled after import', await page.locator('.pb-stack-end [data-export-project]').isEnabled());

await page.locator('[data-trait="color"]').fill('深蓝色');
await page.locator('[data-trait="shape"]').fill('圆耳朵、短尾巴');
await page.locator('[data-trait="clothes"]').fill('黄色雨衣');
await page.locator('[data-trait="mark"]').fill('背上的小铃铛');
await page.locator('[data-generate-traits]').click();
const traitsPrompt = await page.locator('[data-traits-output]').innerText();
check('trait extraction carries the seed', traitsPrompt.includes('故事种子：会发光的小恐龙'));
check('trait extraction carries the start kind', traitsPrompt.includes('起点类型：一个角色'));
await page.locator('[data-generate-reference]').click();
const reference = await page.locator('[data-reference-output]').innerText();
check('reference prompt has all traits', ['深蓝色', '圆耳朵', '黄色雨衣', '小铃铛'].every((text) => reference.includes(text)));

await page.locator('[data-generate-page][data-page="3"]').click();
const pagePrompt = await page.locator('[data-studio-page="3"] [data-page-output]').innerText();
check('page prompt includes storyboard and style', pagePrompt.includes('第 3 页') && pagePrompt.includes('治愈水彩'));

await page.locator('[data-studio-page="2"] [data-toggle-revision]').click();
await page.locator('[data-studio-page="2"] [data-revision-change]').fill('把雨改小一点');
await page.locator('[data-studio-page="2"] [data-revision-keep]').fill('角色动作和黄色雨衣');
await page.locator('[data-studio-page="2"] [data-generate-revision]').click();
const revision = await page.locator('[data-studio-page="2"] [data-revision-output]').innerText();
check('revision prompt only changes one page', revision.includes('只修改这一页') && revision.includes('第 2 页'));

await page.locator('[data-studio-page="2"] [data-image-state="2"][value="selected"]').check();
await page.locator('[data-studio-page="2"] [data-page-check="action"]').check();
await page.locator('[data-studio-page="2"] [data-page-check="expression"]').check();
await page.locator('[data-studio-page="2"] [data-page-check="environment"]').check();
await page.locator('[data-studio-page="2"] [data-page-check="color"]').check();
check('selected image status label', (await page.locator('[data-studio-page="2"] [data-image-status]').innerText()) === '已选用');
check('four page checks retained', (await page.locator('[data-studio-page="2"] [data-page-check]:checked').count()) === 4);

for (const key of ['storyUnderstandable', 'pageOrderClear', 'imagesMatchPlot', 'characterConsistent']) {
  await page.locator(`[data-final-check="${key}"]`).check();
}
await page.locator('[data-roadshow="story"]').fill('小猫为了找回星星，提着灯笼走进黑夜，还帮助了小兔。');
await page.locator('[data-roadshow="favoritePage"]').selectOption('2');
await page.locator('[data-roadshow="reason"]').fill('灯笼的光让画面很温暖。');
await page.locator('[data-roadshow="improvement"]').fill('想让树林看起来更安静。');

const downloadV2Promise = page.waitForEvent('download');
await page.locator('.pb-stack-end [data-export-project]').click();
const downloadV2 = await downloadV2Promise;
const v2Path = path.join(os.tmpdir(), 'story-project-v2-browser.json');
await downloadV2.saveAs(v2Path);
const v2 = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
check('v2 filename', downloadV2.suggestedFilename() === 'story-project-v2.json', downloadV2.suggestedFilename());
check('v2 keeps six pages', v2.storyboard.length === 6);
check('v2 keeps selected image and checks', v2.images[1].status === 'selected' && v2.images[1].checks.color === true);
check('v2 keeps four final checks', Object.values(v2.checks).every(Boolean));
check('v2 carries roadshow card', v2.roadshow.favoritePage === 2 && v2.roadshow.reason.includes('温暖'));
check('v2 keeps four character traits', v2.visual.traits.mark === '背上的小铃铛');
check('v1 file still exists', fs.existsSync(v1Path));

for (const width of [375, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${base}/lab/002-picturebook/lesson-1/`, { waitUntil: 'networkidle' });
  const overflow1 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.goto(`${base}/lab/002-picturebook/lesson-2/`, { waitUntil: 'networkidle' });
  const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.goto(`${base}/lab/002-picturebook/`, { waitUntil: 'networkidle' });
  const overflow3 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  check(`no horizontal overflow at ${width}px`, !overflow1 && !overflow2 && !overflow3, `${overflow1}/${overflow2}/${overflow3}`);
}

await page.setViewportSize({ width: 1440, height: 1000 });
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(`${base}/lab/002-picturebook/lesson-1/`, { waitUntil: 'networkidle' });
const animation = await page.locator('.pb-button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
const animationSeconds = Number.parseFloat(animation);
check('reduced motion removes transitions', Number.isFinite(animationSeconds) && animationSeconds < 0.01, animation);
check('story content visible under reduced motion', await page.locator('[data-story-card]').isVisible());

const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1024, height: 900 } });
const noJsPage = await noJsContext.newPage();
await noJsPage.goto(`${base}/lab/002-picturebook/lesson-2/`, { waitUntil: 'networkidle' });
check('no-JS page still explains import', (await noJsPage.locator('body').innerText()).includes('打开工程文件'));
check('no-JS page still shows checks', (await noJsPage.locator('body').innerText()).includes('故事读得懂'));
await noJsContext.close();

check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));

await browser.close();
const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed`);
if (failed.length) process.exitCode = 1;
