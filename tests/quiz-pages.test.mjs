import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BANK_ORGANIZER_PROMPT } from '../src/lib/quiz-prompts.mjs';

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

test('lesson one exposes ten editable question cards and three deliverables', () => {
  assert.match(pages.bankComponent, /Array\.from\(\{ length: BANK_SIZE \}/);
  assert.match(pages.bankComponent, /data-download-md/);
  assert.match(pages.bankComponent, /data-download-json/);
  assert.match(pages.bankComponent, /data-export-project/);
  assert.match(pages.bankComponent, /data-check-bank/);
  assert.match(pages.bankComponent, /quiz-project-v1\.json/);
});

test('lesson two stays locked until the verified bank is imported', () => {
  assert.match(pages.lessonTwo, /<QuizGameStudio \/>/);
  assert.match(pages.gameComponent, /data-studio-body data-locked="true"/);
  assert.match(pages.gameComponent, /parseQuizProjectFile/);
  assert.match(pages.gameComponent, /quiz-project-v1\.json/);
  assert.match(pages.gameComponent, /quiz-project-v2\.json/);
  assert.match(pages.gameComponent, /data-export-v2/);
  assert.match(pages.gameComponent, /data-export-design/);
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
