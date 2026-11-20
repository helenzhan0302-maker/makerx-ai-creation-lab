import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BANK_ORGANIZER_PROMPT, GAME_DEV_PROMPT } from '../src/lib/quiz-prompts.mjs';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const pages = {
  hub: read('src/pages/lab/003-quiz-game/index.astro'),
  lessonOne: read('src/pages/lab/003-quiz-game/lesson-1.astro'),
  lessonTwo: read('src/pages/lab/003-quiz-game/lesson-2.astro'),
  bankComponent: read('src/components/QuizBankWorkshop.astro'),
  gameComponent: read('src/components/QuizGameStudio.astro'),
};

test('all three quiz routes exist and link back to the course hub', () => {
  assert.match(pages.hub, /AI 趣味知识挑战赛/);
  assert.equal(fs.existsSync(path.join(root, 'src/pages/lab/003-quiz-game/index.astro')), true);
  assert.equal(fs.existsSync(path.join(root, 'src/pages/lab/003-quiz-game/lesson-1.astro')), true);
  assert.equal(fs.existsSync(path.join(root, 'src/pages/lab/003-quiz-game/lesson-2.astro')), true);
  assert.match(pages.lessonOne, /lab\/003-quiz-game\//);
  assert.match(pages.lessonTwo, /lab\/003-quiz-game\//);
});

test('lesson one contains the supplied prompt verbatim and a copy button', () => {
  assert.match(pages.lessonOne, /<QuizBankWorkshop \/>/);
  assert.match(pages.bankComponent, /AI题库整理与文件生成助手/);
  assert.match(pages.bankComponent, /data-organizer-output/);
  assert.match(pages.bankComponent, /data-copy-organizer/);
  assert.ok(pages.bankComponent.includes(BANK_ORGANIZER_PROMPT) === false);
  assert.match(pages.bankComponent, /BANK_ORGANIZER_PROMPT/);
});

test('the exact organiser prompt still starts and ends with the supplied text', () => {
  assert.equal(
    BANK_ORGANIZER_PROMPT.startsWith('你是一名专业的题库数据整理助手。'),
    true,
  );
  assert.equal(BANK_ORGANIZER_PROMPT.endsWith('现在请等待我提供题目内容。'), true);
  assert.equal(BANK_ORGANIZER_PROMPT.includes('AI题库整理与文件生成助手'), false);
});

test('lesson one keeps topic, prompt and organiser only', () => {
  assert.match(pages.bankComponent, /data-topic-options/);
  assert.match(pages.bankComponent, /<h3>出题提示词<\/h3>/);
  assert.match(pages.bankComponent, /data-copy-outline/);
  assert.match(pages.bankComponent, /data-organizer-output/);
  assert.doesNotMatch(pages.bankComponent, /data-question-card/);
  assert.doesNotMatch(pages.bankComponent, /data-download-md|data-download-json|data-export-project|data-check-bank/);
  assert.doesNotMatch(pages.bankComponent, /PPT 原版出题模板|warm-up|题库工作台|带走题库|出题官发布/);
});

test('quiz hub lesson cards reuse the two-column story layout', () => {
  assert.match(pages.hub, /qz-lesson-hub--pb/);
  assert.match(pages.hub, /qz-lesson-copy/);
  assert.match(pages.hub, /qz-lesson-art/);
  assert.match(pages.hub, /qz-lesson-meta/);
});

test('lesson two stays locked until a verified bank is imported', () => {
  assert.match(pages.lessonTwo, /<QuizGameStudio \/>/);
  assert.match(pages.gameComponent, /data-studio-body data-locked="true"/);
  assert.match(pages.gameComponent, /parseLessonOneFile/);
  assert.match(pages.gameComponent, /主题名称\.json/);
  assert.match(pages.gameComponent, /quiz-project-v2\.json/);
  assert.match(pages.gameComponent, /data-export-v2/);
  assert.match(pages.gameComponent, /data-export-design/);
});

test('lesson one drops the intro notes pill row', () => {
  assert.doesNotMatch(pages.lessonOne, /project-intro-notes/);
});

test('lesson two renders the supplied game prompt verbatim with a copy button', () => {
  assert.match(pages.gameComponent, /data-game-prompt-output/);
  assert.match(pages.gameComponent, /data-copy-game-prompt/);
  assert.match(pages.gameComponent, /GAME_DEV_PROMPT/);
  assert.equal(pages.gameComponent.includes(GAME_DEV_PROMPT), false);
  assert.equal(GAME_DEV_PROMPT.startsWith('任务：开发儿童趣味知识挑战赛网页'), true);
  assert.equal(GAME_DEV_PROMPT.endsWith('请直接完成网页开发，不要只提供设计方案或代码片段。'), true);
  assert.match(GAME_DEV_PROMPT, /连续两轮题目重复率不超过50%，即两轮最多重复2道题，至少有3道新题。/);
  assert.match(GAME_DEV_PROMPT, /返回主页不应清除已经记录的上一轮题目ID，确保再次开始挑战时仍遵守连续两轮重复率限制。/);
  assert.match(GAME_DEV_PROMPT, /中间展示题目，下方展示4个大尺寸选项卡（A、B、C、D），采用2×2布局。/);
});

test('quiz pages use no third-party images, storage or network calls', () => {
  const all = Object.values(pages).join(String.fromCharCode(10));
  assert.doesNotMatch(all, /<img\b/i);
  assert.doesNotMatch(all, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(all, /\bfetch\s*\(/);
  assert.doesNotMatch(all, /https?:\/\/[^'"\s]*(png|jpg|jpeg|webp|pptx)/i);
});

test('the only primary action on lesson one is copying the organiser prompt', () => {
  const primaryButtons = [...pages.bankComponent.matchAll(/class="[^"]*qz-button--primary[^"]*"/g)];
  assert.equal(primaryButtons.length, 1);
  assert.match(pages.bankComponent, /qz-button--primary" type="button" data-copy-organizer/);
});

test('lesson two has a single primary action: saving the v2 project', () => {
  const primaryButtons = [...pages.gameComponent.matchAll(/class="[^"]*qz-button--primary[^"]*"/g)];
  assert.equal(primaryButtons.length, 1);
  assert.match(pages.gameComponent, /qz-button--primary" type="button" data-export-v2/);
});
