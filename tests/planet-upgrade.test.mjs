import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  AVATAR_EFFECT_OPTIONS,
  CURSOR_EFFECT_OPTIONS,
  DEFAULT_AVATAR_EFFECTS,
  PET_ACTION_OPTIONS,
  PET_TYPE_OPTIONS,
  buildRoadshowCard,
  buildUpgradeStepPrompt,
  createUpgradeState,
  validateUpgradeStep,
} from '../src/lib/planet-upgrade.mjs';

const root = process.cwd();

test('upgrade options expose the agreed counts', () => {
  assert.equal(AVATAR_EFFECT_OPTIONS.length, 6);
  assert.equal(CURSOR_EFFECT_OPTIONS.length, 6);
  assert.equal(PET_TYPE_OPTIONS.length, 8);
  assert.equal(PET_ACTION_OPTIONS.length, 4);
});

test('avatar step rejects zero selections', () => {
  const state = createUpgradeState();
  state.avatarEffects = [];

  const result = validateUpgradeStep(state, 0);

  assert.equal(result.valid, false);
  assert.match(result.message, /头像/);
});

test('expression preview is enabled by default so tapping the avatar responds', () => {
  assert.ok(DEFAULT_AVATAR_EFFECTS.includes('expression'));
  assert.ok(createUpgradeState().avatarEffects.includes('expression'));
});

test('avatar preview disables random reactive motions that close the eyes for seconds', () => {
  const component = fs.readFileSync(path.join(root, 'src/components/PlanetUpgradeBuilder.astro'), 'utf8');

  assert.match(component, /setAutoMotion\(false\)/);
  assert.match(component, /setAutoIdle\(false\)/);
  assert.doesNotMatch(component, /play\('giggle'\)/);
});

test('avatar step rejects more than three selections', () => {
  const state = createUpgradeState();
  state.avatarEffects = ['follow-cursor', 'glow', 'blink', 'float'];

  const result = validateUpgradeStep(state, 0);

  assert.equal(result.valid, false);
  assert.match(result.message, /三个/);
});

test('cursor step with none generates no prompt so the page can skip it', () => {
  const state = createUpgradeState();
  state.cursorEffect = 'none';

  assert.equal(buildUpgradeStepPrompt(state, 1), '');
});

test('pet step with none generates no prompt so the page can skip it', () => {
  const state = createUpgradeState();
  state.petType = 'none';

  assert.equal(buildUpgradeStepPrompt(state, 2), '');
});

test('custom pet without a description is blocked', () => {
  const state = createUpgradeState();
  state.petType = 'custom';
  state.petCustom = '   ';

  const result = validateUpgradeStep(state, 2);

  assert.equal(result.valid, false);
  assert.match(result.message, /描述/);
});

test('avatar prompt only changes the avatar and forbids rebuilding', () => {
  const state = createUpgradeState();
  const prompt = buildUpgradeStepPrompt(state, 0);
  const firstLine = prompt.split('\n')[0];

  assert.equal(firstLine, '请在我上一条消息做好的网站基础上继续修改。这是第 1 步：头像升级。');
  assert.match(prompt, /请只修改头像相关的代码和样式/);
  assert.match(prompt, /不要重新做一个新网站/);
  assert.doesNotMatch(prompt, /鼠标特效：/);
  assert.doesNotMatch(prompt, /屏幕宠物：/);
});

test('avatar prompt keeps the preservation and no-fabrication rules', () => {
  const state = createUpgradeState();
  const prompt = buildUpgradeStepPrompt(state, 0);

  assert.match(prompt, /二、必须保留/);
  assert.match(prompt, /不要编造我的经历、奖项和事实/);
  assert.match(prompt, /不要重新做一个新网站/);
  assert.match(prompt, /四、完成后请告诉我/);
});

test('each step prompt contains only that step in Chinese', () => {
  const state = createUpgradeState();
  state.avatarEffects = ['follow-cursor', 'glow'];
  state.cursorEffect = 'stardust';
  state.petType = 'robot-dog';
  state.petName = '豆豆';
  state.petActions = ['follow-cursor', 'jump'];

  const avatarPrompt = buildUpgradeStepPrompt(state, 0);
  const cursorPrompt = buildUpgradeStepPrompt(state, 1);
  const petPrompt = buildUpgradeStepPrompt(state, 2);

  assert.match(avatarPrompt, /眼睛跟着鼠标看/);
  assert.match(avatarPrompt, /发光呼吸/);
  assert.doesNotMatch(avatarPrompt, /星尘拖尾|小机器狗/);
  assert.match(cursorPrompt, /星尘拖尾/);
  assert.doesNotMatch(cursorPrompt, /眼睛跟着鼠标看|小机器狗/);
  assert.match(petPrompt, /小机器狗/);
  assert.match(petPrompt, /豆豆/);
  assert.doesNotMatch(petPrompt, /星尘拖尾|眼睛跟着鼠标看/);
});

test('each step tells the AI to keep the previous upgrade', () => {
  const state = createUpgradeState();
  state.avatarEffects = ['blink'];
  state.cursorEffect = 'bubbles';
  state.petType = 'cat';

  for (const stepIndex of [0, 1, 2]) {
    const prompt = buildUpgradeStepPrompt(state, stepIndex);
    assert.match(prompt, /前面已经做好的升级也保留/);
  }
});

test('roadshow card answers the three lesson questions', () => {
  const state = createUpgradeState();
  const card = buildRoadshowCard(state);

  assert.match(card, /介绍自己的网站/);
  assert.match(card, /相对 1\.0 做了哪些改进/);
  assert.match(card, /未来你还想如何改善/);
});

test('upgrade page is wired to the builder and stays reduced-motion aware', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/001-ai-planet/upgrade.astro'), 'utf8');
  const component = fs.readFileSync(path.join(root, 'src/components/PlanetUpgradeBuilder.astro'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'src/styles/planet-upgrade.css'), 'utf8');

  assert.match(page, /PlanetUpgradeBuilder/);
  assert.match(component, /data-upgrade-form/);
  assert.match(component, /reduced-motion|prefers-reduced-motion/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.doesNotMatch(component, /localStorage|sessionStorage|document\.cookie/);
});

test('course hub keeps lesson one and lesson two as separate entries', () => {
  const hub = fs.readFileSync(path.join(root, 'src/pages/lab/001-ai-planet/index.astro'), 'utf8');
  const lessonOne = fs.readFileSync(path.join(root, 'src/pages/lab/001-ai-planet/lesson-1.astro'), 'utf8');

  assert.match(hub, /lesson-1\//);
  assert.match(hub, /upgrade\//);
  assert.match(hub, /第 1 节课/);
  assert.match(hub, /第 2 节课/);
  assert.match(lessonOne, /ProjectPromptBuilder/);
});
