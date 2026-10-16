import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildPrompt,
  createInitialState,
  validateStep,
} from '../src/lib/ai-planet-builder.mjs';

const root = process.cwd();

test('empty state blocks generation at the first required step', () => {
  const result = validateStep(createInitialState(), 0);

  assert.equal(result.valid, false);
  assert.match(result.message, /网站名字/);
});

test('avatar and color limits are enforced', () => {
  const state = createInitialState();
  state.avatars = ['pixel-builder', 'robot-inventor', 'space-traveler'];
  state.colors = ['天空蓝', '海洋蓝', '薄荷绿', '草地绿'];

  assert.equal(validateStep(state, 1).valid, false);
  assert.equal(validateStep(state, 5).valid, false);
});

test('prompt omits empty introduction fields and includes selected Chinese values', () => {
  const state = {
    ...createInitialState(),
    websiteName: '我的星空屋',
    avatars: ['space-traveler'],
    sections: ['我的梦想'],
    style: '梦幻想象',
    colors: ['葡萄紫', '天空蓝'],
    layout: '中间开花',
  };
  const prompt = buildPrompt(state);

  assert.match(prompt, /我的星空屋/);
  assert.match(prompt, /太空旅行者/);
  assert.match(prompt, /我的梦想/);
  assert.match(prompt, /五、整体风格：梦幻想象/);
  assert.match(prompt, /七、页面布局：中间开花/);
  assert.doesNotMatch(prompt, /一句话介绍我自己：\s*\n/);
});

test('project page exposes the approved Chinese builder contract', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/001-ai-planet.astro'), 'utf8');
  const component = fs.readFileSync(path.join(root, 'src/components/ProjectPromptBuilder.astro'), 'utf8');

  assert.match(page, /AI星球/);
  assert.match(component, /<fieldset/);
  assert.match(component, /复制提示词/);
  assert.match(component, /返回修改/);
  assert.doesNotMatch(component, /孩子姓名/);
});

test('builder keeps options in the domain module instead of duplicating them in the page', () => {
  const component = fs.readFileSync(path.join(root, 'src/components/ProjectPromptBuilder.astro'), 'utf8');

  assert.match(component, /ai-planet-builder/);
  assert.doesNotMatch(component, /像素建造师.*机器人发明家/s);
  assert.doesNotMatch(component, /localStorage|sessionStorage|fetch\(|innerHTML/);
});
