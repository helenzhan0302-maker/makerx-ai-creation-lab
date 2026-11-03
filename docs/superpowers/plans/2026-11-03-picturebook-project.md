# 实验 002「故事放映机」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在静态 Astro 站点中新增实验 002「故事放映机」：第 1 节用五要素追问做故事卡和 6 页分镜并导出本地工程文件；第 2 节导入该文件，完成画风、角色一致性、逐页插画提示词、检查单和首映礼路演卡。

**Architecture:** 三个无副作用的 `.mjs` 模块分别负责故事追问状态机、提示词生成、工程文件序列化与导入校验；Astro 组件只负责无障碍表单与渲染，客户端脚本只做内存状态同步。不使用网络请求、浏览器持久化、上传或 AI API；跨周恢复完全依靠孩子自己保存和导入的 JSON 文件。

**Tech Stack:** Astro 7、原生 HTML/CSS/JavaScript、Node 内置测试运行器。

---

## 文件结构

**Create**

| 文件 | 职责 |
|---|---|
| `src/lib/picturebook-story.mjs` | 起点、五要素状态、追问状态机、完成条件、故事卡摘要 |
| `src/lib/picturebook-prompts.mjs` | 分镜、主角参考图、逐页插画、修改提示词 |
| `src/lib/picturebook-project-file.mjs` | 工程文件序列化、版本号、导入校验 |
| `src/components/StoryCardBuilder.astro` | 第 1 节五要素追问与确认 |
| `src/components/StoryboardBuilder.astro` | 6 页分镜填写与阶段检查 |
| `src/components/PicturebookStudio.astro` | 第 2 节画风、角色、逐页插画、检查单、路演卡 |
| `src/components/ProjectFileBar.astro` | 保存/导入工程文件与版本提示 |
| `src/pages/lab/002-picturebook/index.astro` | 课程总览 |
| `src/pages/lab/002-picturebook/lesson-1.astro` | 第 1 节页面壳 |
| `src/pages/lab/002-picturebook/lesson-2.astro` | 第 2 节页面壳 |
| `src/styles/picturebook.css` | 实验 002 全部样式 |
| `src/content/projects/002-picturebook.md` | 首页卡片与项目元信息 |
| `tests/picturebook-story.test.mjs` | 追问状态机、完成条件 |
| `tests/picturebook-prompts.test.mjs` | 提示词契约、隐私、6 页一致性 |
| `tests/picturebook-project-file.test.mjs` | 导出/导入、版本递增、损坏文件 |

**Modify**

| 文件 | 改动 |
|---|---|
| `package.json` | `test` 脚本加入三个新测试文件 |
| `src/pages/index.astro` | 项目区增加实验 002 卡片，保持一页一个主按钮 |
| `tests/homepage.test.mjs` | 断言 002 卡片存在且链接正确 |
| `README.md` | 记录真实测试、构建与浏览器验证结果 |

---

## Task 1: 故事追问状态机

**Files:**
- Create: `src/lib/picturebook-story.mjs`
- Create: `tests/picturebook-story.test.mjs`

- [ ] **Step 1: 写失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_ELEMENTS,
  createStoryState,
  answerElement,
  nextQuestion,
  isStoryReady,
  buildStorySummary,
} from '../src/lib/picturebook-story.mjs';

test('story has exactly five elements in course order', () => {
  assert.deepEqual(STORY_ELEMENTS.map((item) => item.id), ['hero', 'goal', 'obstacle', 'action', 'result']);
});

test('a new story starts at the hero question', () => {
  const state = createStoryState();
  const question = nextQuestion(state);
  assert.equal(question.elementId, 'hero');
  assert.equal(question.attempt, 1);
  assert.ok(question.text.includes('谁'));
});

test('each question contains exactly one question mark', () => {
  let state = createStoryState();
  for (const element of STORY_ELEMENTS) {
    const question = nextQuestion(state);
    assert.equal((question.text.match(/？/g) || []).length, 1);
    state = answerElement(state, element.id, '一个可画出来的具体回答');
  }
});

test('answered element is kept as the child original words', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '  一只总把袜子藏起来的小猫  ');
  assert.equal(state.answers.hero.original, '一只总把袜子藏起来的小猫');
  assert.equal(state.answers.hero.status, 'confirmed');
});

test('blank answer does not confirm the element', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '   ');
  assert.equal(state.answers.hero.status, 'empty');
  assert.equal(isStoryReady(state), false);
});

test('unknown answer moves to a smaller choice instead of repeating', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '不知道');
  const question = nextQuestion(state);
  assert.equal(question.elementId, 'hero');
  assert.ok(question.choices.length >= 2);
  assert.equal(question.attempt, 2);
});

test('three unknown attempts allow skipping without inventing content', () => {
  let state = createStoryState();
  state = answerElement(state, 'hero', '不知道');
  state = answerElement(state, 'hero', '还是不知道');
  state = answerElement(state, 'hero', '真的不知道');
  assert.equal(state.answers.hero.status, 'pending');

  const question = nextQuestion(state);
  assert.equal(question.elementId, 'goal');
});

test('story is ready only when all five elements are confirmed', () => {
  let state = createStoryState();
  for (const element of STORY_ELEMENTS) {
    state = answerElement(state, element.id, `${element.label}的具体回答`);
  }
  assert.equal(isStoryReady(state), true);
  const summary = buildStorySummary(state);
  assert.match(summary, /主角：主角的具体回答/);
  assert.match(summary, /结果：结果的具体回答/);
});

test('summary marks skipped elements as pending instead of filling them', () => {
  const state = createStoryState();
  const summary = buildStorySummary(state);
  assert.match(summary, /主角：待补充/);
  assert.doesNotMatch(summary, /一只勇敢/);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/picturebook-story.test.mjs`
Expected: FAIL，`Cannot find module '../src/lib/picturebook-story.mjs'`。

- [ ] **Step 3: 实现最小状态机**

```js
export const STORY_ELEMENTS = [
  { id: 'hero', label: '主角', question: '你的故事里，主角是谁？', choices: ['一个小动物', '一个普通孩子', '一个会说话的物件'] },
  { id: 'goal', label: '目标', question: '主角最想完成的一件事是什么？', choices: ['找到一样东西', '去一个地方', '帮一个人'] },
  { id: 'obstacle', label: '困难', question: '是什么让这件事没那么容易？', choices: ['有人阻止', '环境太难', '主角自己害怕'] },
  { id: 'action', label: '行动', question: '主角具体做了什么？', choices: ['想了一个办法', '找人帮忙', '勇敢试了一次'] },
  { id: 'result', label: '结果', question: '最后发生了什么变化？', choices: ['目标实现了', '得到意外的结果', '主角变了'] },
];

export function createStoryState() {
  return {
    start: '',
    answers: Object.fromEntries(STORY_ELEMENTS.map((element) => [element.id, { original: '', status: 'empty', attempts: 0 }])),
  };
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function answerElement(state, elementId, answer) {
  const element = STORY_ELEMENTS.find((item) => item.id === elementId);
  if (!element) return state;
  const value = clean(answer);
  const previous = state.answers[elementId];
  const isUnknown = value === '' || /^(不知道|不会|没想好|想不出来)$/.test(value);

  return {
    ...state,
    answers: {
      ...state.answers,
      [elementId]: {
        original: isUnknown ? previous.original : value,
        status: isUnknown ? (previous.attempts + 1 >= 3 ? 'pending' : 'empty') : 'confirmed',
        attempts: previous.attempts + 1,
      },
    },
  };
}

export function nextQuestion(state) {
  const element = STORY_ELEMENTS.find((item) => state.answers[item.id].status === 'empty');
  if (!element) return { elementId: null, text: '故事卡已经准备好了。', attempt: 0, choices: [] };
  const attempt = state.answers[element.id].attempts + 1;
  return {
    elementId: element.id,
    text: attempt >= 2 ? `换个小一点的问题：${element.question}` : element.question,
    attempt,
    choices: attempt >= 2 ? element.choices : [],
  };
}

export function isStoryReady(state) {
  return STORY_ELEMENTS.every((element) => state.answers[element.id].status === 'confirmed');
}

export function buildStorySummary(state) {
  return STORY_ELEMENTS
    .map((element) => `${element.label}：${state.answers[element.id].status === 'confirmed' ? state.answers[element.id].original : '待补充'}`)
    .join('\n');
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --test tests/picturebook-story.test.mjs`
Expected: PASS，skipped 为 0。

---

## Task 2: 提示词生成

**Files:**
- Create: `src/lib/picturebook-prompts.mjs`
- Create: `tests/picturebook-prompts.test.mjs`

- [ ] **Step 1: 写失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  PAGE_COUNT,
  createStoryboard,
  buildStoryboardPrompt,
  buildReferencePrompt,
  buildPagePrompt,
  buildRevisionPrompt,
  buildSocraticPrompt,
} from '../src/lib/picturebook-prompts.mjs';

const root = process.cwd();

test('page count is exactly six in one shared constant', () => {
  assert.equal(PAGE_COUNT, 6);
  const source = fs.readFileSync(path.join(root, 'src/lib/picturebook-prompts.mjs'), 'utf8');
  assert.match(source, /export const PAGE_COUNT = 6/);
});

test('storyboard starts with six empty pages in order', () => {
  const pages = createStoryboard();
  assert.equal(pages.length, 6);
  assert.deepEqual(pages.map((page) => page.page), [1, 2, 3, 4, 5, 6]);
  assert.ok(pages.every((page) => page.scene === '' && page.action === '' && page.emotion === ''));
});

test('storyboard prompt lists pending story elements instead of inventing them', () => {
  const prompt = buildStoryboardPrompt({ hero: '', goal: '找到丢失的星星', obstacle: '', action: '', result: '' });
  assert.match(prompt, /主角：待补充/);
  assert.match(prompt, /困难：待补充/);
  assert.match(prompt, /不要自己补/);
});

test('page prompt contains all four character traits and three style settings', () => {
  const prompt = buildPagePrompt({
    page: { page: 3, scene: '雨中的车站', action: '主角举起伞', emotion: '紧张' },
    visual: { ratio: '竖版 3:4', artStyle: '治愈水彩', palette: '冷色' },
    traits: { color: '深蓝色', shape: '圆耳朵', clothes: '黄色雨衣', mark: '背上的小铃铛' },
  });
  assert.match(prompt, /第 3 页/);
  assert.match(prompt, /深蓝色/);
  assert.match(prompt, /圆耳朵/);
  assert.match(prompt, /黄色雨衣/);
  assert.match(prompt, /小铃铛/);
  assert.match(prompt, /竖版 3:4/);
  assert.match(prompt, /治愈水彩/);
  assert.match(prompt, /冷色/);
});

test('reference prompt asks for the character only, not a full page', () => {
  const prompt = buildReferencePrompt({ artStyle: '可爱卡通', palette: '暖色', traits: { color: '橘色', shape: '短尾巴', clothes: '背带裤', mark: '额头上的星星' } });
  assert.match(prompt, /只生成主角/);
  assert.match(prompt, /不要生成整页绘本/);
});

test('revision prompt only changes one page and keeps character traits', () => {
  const prompt = buildRevisionPrompt({ pageNumber: 4, change: '把雨改小', keep: '角色动作和衣服' });
  assert.match(prompt, /只修改这一页/);
  assert.match(prompt, /不要重做整本绘本/);
  assert.match(prompt, /不要改变角色的固定特征/);
});

test('prompts never include child identity fields', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/picturebook-prompts.mjs'), 'utf8');
  assert.doesNotMatch(source, /姓名|学校|住址|电话|邮箱/);
});

test('socratic prompt asks exactly one question and forbids ghostwriting', () => {
  const prompt = buildSocraticPrompt({
    element: '困难',
    story: { hero: '一只怕黑的小猫', goal: '', obstacle: '', action: '', result: '' },
    childAnswer: '',
    attempt: 1,
  });
  assert.equal((prompt.match(/？/g) || []).length, 1);
  assert.match(prompt, /不是代写者/);
  assert.match(prompt, /不要替我写完整情节/);
  assert.match(prompt, /只问我一个问题/);
});

test('socratic prompt carries the full story card on every turn', () => {
  const prompt = buildSocraticPrompt({
    element: '行动',
    story: { hero: '小猫', goal: '找回星星', obstacle: '天黑', action: '', result: '' },
    childAnswer: '它决定提灯出门',
    attempt: 2,
  });
  assert.match(prompt, /主角：小猫/);
  assert.match(prompt, /目标：找回星星/);
  assert.match(prompt, /困难：天黑/);
  assert.match(prompt, /它决定提灯出门/);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/picturebook-prompts.test.mjs`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现提示词模块**

```js
export const PAGE_COUNT = 6;

const STORY_LABELS = [
  ['hero', '主角'],
  ['goal', '目标'],
  ['obstacle', '困难'],
  ['action', '行动'],
  ['result', '结果'],
];

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function createStoryboard() {
  return Array.from({ length: PAGE_COUNT }, (_, index) => ({ page: index + 1, scene: '', action: '', emotion: '' }));
}

export function buildStoryboardPrompt(story) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  return [
    '请根据我的故事卡，帮我把故事拆成 6 页分镜。',
    '不要新增我没有说过的主要情节，不要替我改结局。',
    '',
    '我的故事卡：',
    ...lines,
    '',
    '请按 6 页输出，每页只写三项：',
    '1. 画面发生什么',
    '2. 角色在做什么',
    '3. 角色是什么情绪',
    '',
    '如果某一页信息不够，先问我一个问题，不要自己补。',
  ].join('\n');
}

export function buildReferencePrompt({ artStyle, palette, traits }) {
  return [
    '请先为我的绘本主角生成一张参考图，用来确认长相。',
    '只生成主角，不要生成整页绘本。',
    '',
    '角色固定特征：',
    `颜色：${clean(traits.color) || '待补充'}`,
    `发型/外形：${clean(traits.shape) || '待补充'}`,
    `衣服：${clean(traits.clothes) || '待补充'}`,
    `标志物：${clean(traits.mark) || '待补充'}`,
    '',
    `画风：${clean(artStyle) || '待补充'}`,
    `色调：${clean(palette) || '待补充'}`,
    '',
    '请让角色保持中性姿势、清楚露出上述特征，方便我之后逐页沿用。',
  ].join('\n');
}

export function buildPagePrompt({ page, visual, traits }) {
  return [
    `这是绘本第 ${page.page} 页的插画。`,
    '',
    `画面：${clean(page.scene) || '待补充'}`,
    `角色动作：${clean(page.action) || '待补充'}`,
    `角色情绪：${clean(page.emotion) || '待补充'}`,
    '',
    '角色固定特征（每一页都必须一致）：',
    `颜色：${clean(traits.color) || '待补充'}`,
    `发型/外形：${clean(traits.shape) || '待补充'}`,
    `衣服：${clean(traits.clothes) || '待补充'}`,
    `标志物：${clean(traits.mark) || '待补充'}`,
    '',
    `画风：${clean(visual.artStyle) || '待补充'}`,
    `色调：${clean(visual.palette) || '待补充'}`,
    `比例：${clean(visual.ratio) || '待补充'}`,
    '',
    '不要改变角色长相，不要加入文字，不要新增分镜里没有的主要角色。',
  ].join('\n');
}

export function buildRevisionPrompt({ pageNumber, change, keep }) {
  return [
    '请只修改这一页，不要重做整本绘本，也不要改变角色的固定特征。',
    '',
    `这是第 ${pageNumber} 页。`,
    `要改的地方：${clean(change) || '待补充'}`,
    `必须保留：${clean(keep) || '待补充'}`,
    '',
    '改完后告诉我：你改了哪里，还有哪里需要我自己检查。',
  ].join('\n');
}

export function buildSocraticPrompt({ element, story, childAnswer, attempt }) {
  const lines = STORY_LABELS.map(([id, label]) => `${label}：${clean(story[id]) || '待补充'}`);
  const heard = clean(childAnswer);
  return [
    '你是我的故事搭档，不是代写者。',
    '你的任务：帮我把故事想清楚，但故事由我决定。',
    '',
    '规则：',
    '1. 每次只问我一个问题，等我回答后再问下一个。',
    '2. 先复述你听到的我的原话，再指出一个还不清楚的地方。',
    '3. 不要替我写完整情节，不要替我决定结局。',
    '4. 不要评价我的想法好不好，只帮我把它说得更具体。',
    '5. 如果我说“不知道”，给我两三个方向让我选，不要逼我。',
    '6. 不要问我真实姓名、学校、住址、电话或照片。',
    '',
    '现在我的故事卡是：',
    ...lines,
    '',
    heard ? `我刚刚说的是：${heard}` : '我还没有回答这一格。',
    `这是第 ${attempt} 次追问。请从「${element}」开始，只问我一个问题。`,
  ].join('\n');
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --test tests/picturebook-prompts.test.mjs`
Expected: PASS。

---

## Task 3: 工程文件与版本管理

**Files:**
- Create: `src/lib/picturebook-project-file.mjs`
- Create: `tests/picturebook-project-file.test.mjs`

- [ ] **Step 1: 写失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION,
  createProjectFile,
  nextVersion,
  buildFileName,
  parseProjectFile,
} from '../src/lib/picturebook-project-file.mjs';

const story = { start: 'wish', hero: '小猫', goal: '找回星星', obstacle: '天黑', action: '提灯出门', result: '星星回到了天上' };
const storyboard = Array.from({ length: 6 }, (_, index) => ({ page: index + 1, scene: `画面${index + 1}`, action: `动作${index + 1}`, emotion: `情绪${index + 1}` }));
const visual = { ratio: '竖版 3:4', artStyle: '治愈水彩', palette: '冷色', traits: { color: '蓝色', shape: '圆耳', clothes: '雨衣', mark: '铃铛' } };
const checks = { storyUnderstandable: true, pageOrderClear: false, imagesMatchPlot: false, characterConsistent: false };

test('new project file contains schema, code, version and six pages', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 1 });
  assert.equal(file.schemaVersion, SCHEMA_VERSION);
  assert.equal(file.projectCode, '002-picturebook');
  assert.equal(file.version, 1);
  assert.equal(file.storyboard.length, 6);
});

test('file name carries the version', () => {
  assert.equal(buildFileName(1), 'story-project-v1.json');
  assert.equal(buildFileName(2), 'story-project-v2.json');
});

test('next export increments the version without overwriting', () => {
  assert.equal(nextVersion(null), 1);
  assert.equal(nextVersion(1), 2);
  assert.equal(nextVersion(7), 8);
});

test('round trip keeps story, storyboard, visual and checks', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 2 });
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.version, 2);
  assert.equal(parsed.data.storyboard[5].page, 6);
  assert.equal(parsed.data.visual.traits.mark, '铃铛');
});

test('invalid JSON is rejected with a readable reason', () => {
  const parsed = parseProjectFile('{not json');
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /不是工程文件/);
});

test('wrong project code is rejected', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 1 });
  file.projectCode = '001-ai-planet';
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /不是工程文件/);
});

test('missing pages are rejected instead of filled', () => {
  const file = createProjectFile({ story, storyboard: storyboard.slice(0, 5), visual, checks, version: 1 });
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /分镜缺页/);
});

test('duplicate pages are rejected', () => {
  const broken = storyboard.map((page, index) => ({ ...page, page: index === 5 ? 5 : page.page }));
  const file = createProjectFile({ story, storyboard: broken, visual, checks, version: 1 });
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /分镜页序重复/);
});

test('future schema version is rejected', () => {
  const file = createProjectFile({ story, storyboard, visual, checks, version: 1 });
  file.schemaVersion = SCHEMA_VERSION + 1;
  const parsed = parseProjectFile(JSON.stringify(file));
  assert.equal(parsed.ok, false);
  assert.match(parsed.message, /版本过新/);
});

test('serialized file never contains identity fields', () => {
  const text = JSON.stringify(createProjectFile({ story, storyboard, visual, checks, version: 1 }));
  assert.doesNotMatch(text, /姓名|学校|住址|电话|邮箱|photo/i);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/picturebook-project-file.test.mjs`
Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现工程文件模块**

```js
import { PAGE_COUNT } from './picturebook-prompts.mjs';

export const SCHEMA_VERSION = 1;
export const PROJECT_CODE = '002-picturebook';

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanStory(story = {}) {
  return {
    start: clean(story.start),
    hero: clean(story.hero),
    goal: clean(story.goal),
    obstacle: clean(story.obstacle),
    action: clean(story.action),
    result: clean(story.result),
  };
}

function cleanTraits(traits = {}) {
  return { color: clean(traits.color), shape: clean(traits.shape), clothes: clean(traits.clothes), mark: clean(traits.mark) };
}

export function createProjectFile({ story, storyboard, visual, checks, version = 1 }) {
  return {
    schemaVersion: SCHEMA_VERSION,
    projectCode: PROJECT_CODE,
    exportedAt: new Date().toISOString(),
    version,
    story: cleanStory(story),
    storyboard: (Array.isArray(storyboard) ? storyboard : []).slice(0, PAGE_COUNT).map((page) => ({
      page: Number(page.page),
      scene: clean(page.scene),
      action: clean(page.action),
      emotion: clean(page.emotion),
    })),
    visual: {
      ratio: clean(visual?.ratio),
      artStyle: clean(visual?.artStyle),
      palette: clean(visual?.palette),
      traits: cleanTraits(visual?.traits),
    },
    checks: {
      storyUnderstandable: Boolean(checks?.storyUnderstandable),
      pageOrderClear: Boolean(checks?.pageOrderClear),
      imagesMatchPlot: Boolean(checks?.imagesMatchPlot),
      characterConsistent: Boolean(checks?.characterConsistent),
    },
  };
}

export function nextVersion(previous) {
  return Number.isInteger(previous) && previous > 0 ? previous + 1 : 1;
}

export function buildFileName(version) {
  return `story-project-v${version}.json`;
}

export function parseProjectFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: '这不是工程文件：文件内容不是可读取的 JSON。' };
  }

  if (!data || typeof data !== 'object' || data.projectCode !== PROJECT_CODE) {
    return { ok: false, message: '这不是工程文件：找不到「故事放映机」的项目标记。' };
  }
  if (!Number.isInteger(data.schemaVersion) || data.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, message: '工程文件版本过新：请用更新后的页面打开，或从空白开始。' };
  }
  if (!Array.isArray(data.storyboard) || data.storyboard.length !== PAGE_COUNT) {
    return { ok: false, message: `分镜缺页：工程文件应当包含 ${PAGE_COUNT} 页分镜。` };
  }

  const pages = data.storyboard.map((page) => Number(page?.page));
  if (new Set(pages).size !== PAGE_COUNT || pages.some((page) => !Number.isInteger(page) || page < 1 || page > PAGE_COUNT)) {
    return { ok: false, message: '分镜页序重复：每一页应当只出现一次，且页码在 1–6 之间。' };
  }

  return {
    ok: true,
    data: createProjectFile({
      story: data.story,
      storyboard: data.storyboard,
      visual: data.visual,
      checks: data.checks,
      version: Number.isInteger(data.version) ? data.version : 1,
    }),
  };
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --test tests/picturebook-project-file.test.mjs`
Expected: PASS。

---

## Task 4: 第 1 节页面（故事卡与 6 页分镜）

**Files:**
- Create: `src/components/StoryCardBuilder.astro`
- Create: `src/components/StoryboardBuilder.astro`
- Create: `src/components/ProjectFileBar.astro`
- Create: `src/pages/lab/002-picturebook/lesson-1.astro`
- Create: `src/styles/picturebook.css`
- Modify: `package.json`

- [ ] **Step 1: 写页面契约测试**

在 `tests/picturebook-prompts.test.mjs` 末尾追加：

```js
test('lesson one page includes story card, storyboard and save controls', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/002-picturebook/lesson-1.astro'), 'utf8');
  const storyCard = fs.readFileSync(path.join(root, 'src/components/StoryCardBuilder.astro'), 'utf8');
  const storyboard = fs.readFileSync(path.join(root, 'src/components/StoryboardBuilder.astro'), 'utf8');

  assert.match(page, /StoryCardBuilder/);
  assert.match(page, /StoryboardBuilder/);
  assert.match(storyCard, /data-story-card/);
  assert.match(storyboard, /data-storyboard/);
  assert.match(storyboard, /PAGE_COUNT/);
  assert.match(storyboard, /data-storyboard-page/);
});

test('lesson one never persists to browser storage or calls the network', () => {
  const files = [
    'src/components/StoryCardBuilder.astro',
    'src/components/StoryboardBuilder.astro',
    'src/components/ProjectFileBar.astro',
    'src/pages/lab/002-picturebook/lesson-1.astro',
  ];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|fetch\(/);
  }
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/picturebook-prompts.test.mjs`
Expected: FAIL，页面与组件不存在。

- [ ] **Step 3: 实现组件与页面**

`src/components/StoryCardBuilder.astro` 必须包含：

- 五张要素卡，顺序固定：主角、目标、困难、行动、结果。
- 每张卡：`textarea`（孩子原话）、当前状态（空白 / 已确认 / 待补充）、一个「只问下一个问题」按钮。
- 问题区一次只显示一个问题，带 `aria-live="polite"`。
- 一个可跳过的方向选项列表，仅在第二次追问时出现。
- 一个「这句不是我想要的」回退按钮，恢复上一版原话。
- 一个「故事卡自检」区：这是我想讲的故事吗 / 最满意哪一处 / 改过什么、为什么。

`src/components/StoryboardBuilder.astro` 必须包含：

- 6 张分镜卡，每张卡固定三格：`scene`、`action`、`emotion`。
- 每张卡显示页码 1–6，不显示剧情功能标签（避免把课件未确认的对应关系写死）。
- 顶部说明：「每页只写三件事：画面发生什么、角色在做什么、情绪是什么。」
- 未完成页数统计，例如「已完成 3 / 6 页」。
- 一个「生成分镜提示词」按钮与结果 `<pre>`。

`src/pages/lab/002-picturebook/lesson-1.astro` 使用 `BaseLayout`，包含：

- 返回课程总览链接。
- 标题「故事放映机」、课次「第 1 节课」。
- 边界说明：「不填写姓名、不上传照片、内容只保存在你自己的电脑上」。
- `<StoryCardBuilder />`、`<StoryboardBuilder />`、`<ProjectFileBar version={1} />`。
- 页面脚本只维护内存状态，导出时调用 `createProjectFile` 与 `buildFileName`。

- [ ] **Step 4: 加入测试脚本并运行**

修改 `package.json` 的 `test`：

```json
"test": "node --test tests/homepage.test.mjs tests/ai-planet-builder.test.mjs tests/planet-upgrade.test.mjs tests/picturebook-story.test.mjs tests/picturebook-prompts.test.mjs tests/picturebook-project-file.test.mjs"
```

Run: `pnpm test`
Expected: PASS。

---

## Task 5: 第 2 节页面（画风、插画、检查单、路演卡）

**Files:**
- Create: `src/components/PicturebookStudio.astro`
- Create: `src/pages/lab/002-picturebook/lesson-2.astro`
- Modify: `src/styles/picturebook.css`

- [ ] **Step 1: 写页面契约测试**

在 `tests/picturebook-prompts.test.mjs` 追加：

```js
test('lesson two imports a project file before showing the studio', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/lab/002-picturebook/lesson-2.astro'), 'utf8');
  const studio = fs.readFileSync(path.join(root, 'src/components/PicturebookStudio.astro'), 'utf8');
  const fileBar = fs.readFileSync(path.join(root, 'src/components/ProjectFileBar.astro'), 'utf8');

  assert.match(page, /ProjectFileBar/);
  assert.match(page, /PicturebookStudio/);
  assert.match(studio, /data-picturebook-studio/);
  assert.match(fileBar, /type="file"/);
  assert.match(fileBar, /accept="\.json,application\/json"/);
});

test('studio exposes all four checks and three roadshow questions', () => {
  const studio = fs.readFileSync(path.join(root, 'src/components/PicturebookStudio.astro'), 'utf8');
  assert.match(studio, /故事读得懂/);
  assert.match(studio, /页序清楚/);
  assert.match(studio, /图片符合情节/);
  assert.match(studio, /主角基本统一/);
  assert.match(studio, /我的故事讲什么/);
  assert.match(studio, /我最满意的一页/);
  assert.match(studio, /我最想继续改进/);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/picturebook-prompts.test.mjs`
Expected: FAIL，组件与页面不存在。

- [ ] **Step 3: 实现第 2 节**

`PicturebookStudio.astro` 必须包含：

- 顶部工程状态：「已导入第 N 版，包含 6 页分镜」。
- 画风三组单选：比例、画风、色调。
- 角色四项输入：颜色、发型/外形、衣服、标志物。
- 「生成主角参考图提示词」按钮与结果。
- 6 页插画卡：每页显示分镜内容、生成按钮、结果 `<pre>`、选图状态（未开始 / 已选用 / 需重做）。
- 每页「我要改这一页」按钮，生成修改提示词。
- 检查单四项 checkbox。
- 路演卡三问与同伴反馈句式。
- 导出 v2 的按钮。

`lesson-2.astro` 使用 `BaseLayout`，包含返回总览、标题「第 2 节课」、`<ProjectFileBar version={2} />` 与 `<PicturebookStudio />`。

- [ ] **Step 4: 运行测试，确认通过**

Run: `pnpm test`
Expected: PASS。

---

## Task 6: 课程总览、首页入口与内容文件

**Files:**
- Create: `src/pages/lab/002-picturebook/index.astro`
- Create: `src/content/projects/002-picturebook.md`
- Modify: `src/pages/index.astro`
- Modify: `tests/homepage.test.mjs`

- [ ] **Step 1: 写首页测试**

在 `tests/homepage.test.mjs` 追加：

```js
test('homepage lists project 002 with a real detail route', () => {
  const page = read('src/pages/index.astro');
  const content = read('src/content/projects/002-picturebook.md');
  assert.match(page, /002-picturebook/);
  assert.match(page, /故事放映机/);
  assert.match(content, /title: 故事放映机/);
  assert.match(content, /code: ['"]002['"]/);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/homepage.test.mjs`
Expected: FAIL。

- [ ] **Step 3: 实现内容文件与卡片**

`src/content/projects/002-picturebook.md`：

```yaml
---
code: '002'
title: 故事放映机
status: 研发中
summary: 从一个想法开始，把故事拆成 6 页分镜，再用 AI 画出自己的绘本并放映给同伴。
---
```

首页项目区增加第二张卡片，链接到 `${baseUrl}lab/002-picturebook/`，编号显示 `002`，状态读取内容文件的 `status`。不改变主 CTA，不增加第二个实心按钮。

课程总览页包含：

- 项目头：`实验编号 002 / 两节课`。
- 第 1 节卡片：故事 + 6 页分镜；产物「故事卡 + 分镜卡 + v1 工程文件」。
- 第 2 节卡片：插画 + 首映；产物「绘本卡 + 检查单 + 路演卡 + v2 工程文件」。
- 一句边界说明：两节课分两个周六；网站不保存内容，靠你自己的工程文件继续。
- 返回首页链接。

- [ ] **Step 4: 运行测试，确认通过**

Run: `pnpm test`
Expected: PASS。

---

## Task 7: 构建、响应式与浏览器验证

**Files:**
- Modify: `README.md`（只在验证后写真实结果）

- [ ] **Step 1: 类型与构建**

Run: `pnpm check`
Expected: 0 errors。

Run: `pnpm build`
Expected: PASS，产物包含：

```
dist/lab/002-picturebook/index.html
dist/lab/002-picturebook/lesson-1/index.html
dist/lab/002-picturebook/lesson-2/index.html
```

- [ ] **Step 2: 浏览器检查**

用本地预览依次检查：

1. 首页 002 卡片可点，进入课程总览。
2. 第 1 节：五要素逐项追问、空白回答不确认、跳过显示「待补充」。
3. 第 1 节：6 页分镜固定存在，缺页时无法导出。
4. 导出 v1，刷新页面，导入 v1，内容恢复。
5. 第 2 节：画风、角色、逐页提示词、检查单、路演卡均可见。
6. 导出 v2，确认文件名递增且 v1 仍在。
7. 375 / 768 / 1440 三档无横向溢出。
8. 键盘可完成导入、填写、导出；焦点可见。
9. `prefers-reduced-motion: reduce` 下无动画且内容完整。
10. 关闭 JavaScript 后，静态说明与可打印模板仍可读。

- [ ] **Step 3: 写 README 验证记录**

只记录实际执行过的命令、退出码与关键结果；未执行的浏览器项写「未验证」。不把“应该可以”写成“已验证”。

---

## 自审

- 规格覆盖：名称与 6 页见 Task 2、Task 6；苏格拉底追问见 Task 1；跨周文件与版本管理见 Task 3；第 1、2 节页面见 Task 4、5；首页入口见 Task 6；验收见 Task 7。
- 占位扫描：没有 TODO/TBD；所有函数、字段、文件名在各任务中保持一致。
- 类型一致性：`PAGE_COUNT` 只定义在 `picturebook-prompts.mjs`；`createProjectFile` / `parseProjectFile` / `nextVersion` / `buildFileName` 在 Task 3 定义、Task 4–5 使用。
- 隐私：工程文件字段不含身份信息；所有页面禁止浏览器存储与网络请求。
