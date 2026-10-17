import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildPrompt,
  copyTextToClipboard,
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
  assert.match(prompt, /^你是一位经验丰富的网站设计专家，特别擅长帮小学生做出好看又好用的个人网站。$/m);
  assert.match(prompt, /^请帮我做一个【个人网站】。下面是我的想法：$/m);
  assert.match(prompt, /五、整体风格：梦幻想象/);
  assert.match(prompt, /七、页面布局：中间开花/);
  assert.doesNotMatch(prompt, /一句话介绍我自己：\s*\n/);
  assert.doesNotMatch(prompt, /不要添加我没有提到的个人信息/);
  assert.match(prompt, /七、页面布局：中间开花$/);
});

test('layout cards drop the blue diagram and use the shared mark', () => {
  const component = fs.readFileSync(path.join(root, 'src/components/ProjectPromptBuilder.astro'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'src/styles/ai-planet-builder.css'), 'utf8');

  assert.doesNotMatch(component, /layout-glyph/);
  assert.doesNotMatch(styles, /layout-glyph/);
  assert.match(component, /choice-card--layout[\s\S]*?choice-card-mark[\s\S]*?choice-card-label/);
});

test('prompt keeps fixed numbering when introduction fields are empty', () => {
  const state = {
    ...createInitialState(),
    websiteName: '我的星空屋',
    avatars: ['space-traveler'],
    sections: ['我的梦想'],
    style: '梦幻想象',
    colors: ['天空蓝'],
    layout: '中间开花',
  };
  const prompt = buildPrompt(state);

  assert.match(prompt, /三、我想这样介绍自己：这次先不写/);
  assert.match(prompt, /四、网站上要放的内容：我的梦想/);

  const stateWithIntro = { ...state, intro: { self: '我喜欢看书', favorite: '', known: '' } };
  const promptWithIntro = buildPrompt(stateWithIntro);

  assert.match(promptWithIntro, /三、我想这样介绍自己：/);
  assert.match(promptWithIntro, /一句话介绍我自己：我喜欢看书/);
  assert.match(promptWithIntro, /四、网站上要放的内容：我的梦想/);
  assert.doesNotMatch(promptWithIntro, /这次先不写/);
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

/** @typedef {{ value: string, style: Record<string, string>, attributes: Record<string, string>, parentNode: unknown, removed: boolean, setAttribute(name: string, value: string): void, focus(): void, select(): void, setSelectionRange(start: number, end: number): void, remove(): void }} TextareaStub */

/** @param {{ execCommandResult?: boolean }} [options] */
const createDocumentStub = ({ execCommandResult = true } = {}) => {
  /** @type {TextareaStub[]} */
  const textareas = [];
  const state = { lastCommand: /** @type {string | null} */ (null) };
  const documentStub = {
    body: { appendChild(/** @type {TextareaStub} */ node) { node.parentNode = documentStub.body; } },
    createElement(/** @type {string} */ tagName) {
      /** @type {TextareaStub & { tagName: string }} */
      const node = {
        tagName,
        value: '',
        style: {},
        attributes: {},
        parentNode: null,
        removed: false,
        setAttribute(/** @type {string} */ name, /** @type {string} */ value) { node.attributes[name] = value; },
        focus() {},
        select() {},
        setSelectionRange() {},
        remove() { node.removed = true; node.parentNode = null; },
      };
      textareas.push(node);
      return node;
    },
    execCommand(/** @type {string} */ command) {
      state.lastCommand = command;
      return execCommandResult;
    },
  };
  return { documentStub, textareas, state };
};

test('copy prefers the async clipboard API', async () => {
  /** @type {string[]} */
  const writes = [];
  const { documentStub, textareas } = createDocumentStub();
  const environment = {
    navigator: { clipboard: { writeText: async (/** @type {string} */ text) => { writes.push(text); } } },
    document: documentStub,
  };

  const copied = await copyTextToClipboard('AI星球提示词', environment);

  assert.equal(copied, true);
  assert.deepEqual(writes, ['AI星球提示词']);
  assert.equal(textareas.length, 0);
});

test('copy falls back to a temporary textarea when the clipboard API is missing', async () => {
  const { documentStub, textareas, state } = createDocumentStub();

  const copied = await copyTextToClipboard('AI星球提示词', { navigator: {}, document: documentStub });

  assert.equal(copied, true);
  assert.equal(state.lastCommand, 'copy');
  assert.equal(textareas.length, 1);
  assert.equal(textareas[0].value, 'AI星球提示词');
  assert.equal(textareas[0].removed, true);
});

test('copy falls back when the clipboard API rejects', async () => {
  const { documentStub, state } = createDocumentStub();
  const environment = {
    navigator: { clipboard: { writeText: async () => { throw new Error('not allowed'); } } },
    document: documentStub,
  };

  const copied = await copyTextToClipboard('AI星球提示词', environment);

  assert.equal(copied, true);
  assert.equal(state.lastCommand, 'copy');
});

test('copy reports failure when both strategies fail and still cleans up', async () => {
  const { documentStub, textareas } = createDocumentStub({ execCommandResult: false });
  const environment = {
    navigator: { clipboard: { writeText: async () => { throw new Error('not allowed'); } } },
    document: documentStub,
  };

  const copied = await copyTextToClipboard('AI星球提示词', environment);

  assert.equal(copied, false);
  assert.equal(textareas[0].removed, true);
});

test('copy reports failure when no DOM is available', async () => {
  const copied = await copyTextToClipboard('AI星球提示词', {});

  assert.equal(copied, false);
});

test('builder summary renders each label and answer on one line with a colon', () => {
  const component = fs.readFileSync(path.join(root, 'src/components/ProjectPromptBuilder.astro'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'src/styles/ai-planet-builder.css'), 'utf8');

  assert.match(component, /termElement\.textContent = `\$\{term\}：`/);
  assert.match(styles, /\.summary-row\s*\{[^}]*grid-template-columns:\s*max-content/s);
  assert.match(styles, /\.summary-row dd\s*\{[^}]*margin:\s*0/s);
  assert.match(styles, /\.summary-row dd\s*\{[^}]*overflow-wrap:\s*anywhere/s);
});

test('builder copy button uses the shared clipboard helper and reports real results', () => {
  const component = fs.readFileSync(path.join(root, 'src/components/ProjectPromptBuilder.astro'), 'utf8');

  assert.match(component, /copyTextToClipboard/);
  assert.match(component, /已复制，可以交给 AI 制作网站啦！/);
  assert.doesNotMatch(component, /navigator\.clipboard\.writeText/);
});
