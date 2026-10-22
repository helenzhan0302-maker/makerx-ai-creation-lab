import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  AVATAR_EFFECT_OPTIONS,
  CURSOR_EFFECT_OPTIONS,
  PET_ACTION_OPTIONS,
  PET_TYPE_OPTIONS,
  buildRoadshowCard,
  buildUpgradePrompt,
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

test('avatar step rejects more than three selections', () => {
  const state = createUpgradeState();
  state.avatarEffects = ['follow-cursor', 'glow', 'blink', 'float'];

  const result = validateUpgradeStep(state, 0);

  assert.equal(result.valid, false);
  assert.match(result.message, /三个/);
});

test('cursor effect set to none omits the cursor line from the prompt', () => {
  const state = createUpgradeState();
  state.cursorEffect = 'none';
  const prompt = buildUpgradePrompt(state);

  assert.doesNotMatch(prompt, /鼠标特效/);
});

test('pet type set to none omits the pet line from the prompt', () => {
  const state = createUpgradeState();
  state.petType = 'none';
  const prompt = buildUpgradePrompt(state);

  assert.doesNotMatch(prompt, /屏幕宠物/);
});

test('custom pet without a description is blocked', () => {
  const state = createUpgradeState();
  state.petType = 'custom';
  state.petCustom = '   ';

  const result = validateUpgradeStep(state, 2);

  assert.equal(result.valid, false);
  assert.match(result.message, /描述/);
});

test('prompt opens with the modify-not-rebuild instruction', () => {
  const state = createUpgradeState();
  const prompt = buildUpgradePrompt(state);
  const firstLine = prompt.split('\n')[0];

  assert.equal(firstLine, '请在我上一条消息做好的网站基础上继续修改，做出「我的AI星球 2.0」。');
  assert.match(prompt, /^不要重新做一个新网站。$/m);
});

test('prompt always keeps the preservation and no-fabrication rules', () => {
  const state = createUpgradeState();
  const prompt = buildUpgradePrompt(state);

  assert.match(prompt, /一、必须保留/);
  assert.match(prompt, /不要编造我的经历、奖项和事实/);
  assert.match(prompt, /不要删除我没提到的内容/);
  assert.match(prompt, /五、完成后请告诉我/);
});

test('selected effects and pet details appear in Chinese', () => {
  const state = createUpgradeState();
  state.avatarEffects = ['follow-cursor', 'glow'];
  state.cursorEffect = 'stardust';
  state.petType = 'robot-dog';
  state.petName = '豆豆';
  state.petActions = ['follow-cursor', 'jump'];
  const prompt = buildUpgradePrompt(state);

  assert.match(prompt, /眼睛跟着鼠标看/);
  assert.match(prompt, /发光呼吸/);
  assert.match(prompt, /星尘拖尾/);
  assert.match(prompt, /小机器狗/);
  assert.match(prompt, /豆豆/);
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

test('lesson one page only gains the lesson labels and upgrade entry', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/001-ai-planet.astro'), 'utf8');

  assert.match(page, /ProjectPromptBuilder/);
  assert.match(page, /upgrade\//);
});
