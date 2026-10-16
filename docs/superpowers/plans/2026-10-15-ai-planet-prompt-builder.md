# AI星球课堂提示词工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在静态 Astro 网站中增加「AI星球」项目页和课堂填写工具，让孩子通过中文卡片与输入框生成可复制的中文建站提示词。

**Architecture:** 用一个无副作用的 `.mjs` 领域模块保存选项、状态校验和提示词生成逻辑；Astro 组件只负责无障碍表单结构和页面展示，客户端脚本负责步骤切换与内存状态同步。页面不使用网络请求、浏览器持久化或数据库。

**Tech Stack:** Astro 7、原生 HTML/CSS、原生浏览器 JavaScript、Node 内置测试运行器。

---

## 文件结构

- Create: `src/lib/ai-planet-builder.mjs` —— 头像、内容、风格、颜色、布局选项；状态工厂；步骤校验；中文提示词纯函数。
- Create: `src/components/ProjectPromptBuilder.astro` —— `form`、步骤面板、汇总区、结果区和中文无障碍标签。
- Create: `src/pages/lab/001-ai-planet.astro` —— AI星球项目页和工具入口。
- Create: `src/styles/ai-planet-builder.css` —— 工具页面的卡片、进度、结果、移动端和降级样式。
- Create: `tests/ai-planet-builder.test.mjs` —— 领域逻辑测试和关键页面契约测试。
- Modify: `src/pages/index.astro` —— 把第一个项目改为可点击的 AI星球卡片。
- Modify: `src/content/projects/001-ai-base.md` —— 更新项目展示标题和摘要，保持现有轻量内容来源兼容。
- Modify: `tests/homepage.test.mjs` —— 更新名称断言并增加项目入口断言。
- Modify: `docs/site-map.md` —— 同步 AI星球名称、项目入口和实际路由。
- Modify: `docs/content-model.md` —— 同步当前原型的轻量字段说明和名称。
- Modify: `README.md` —— 记录真实验证命令与结果。
- Modify: `.gitignore` —— 忽略 brainstorming 生成的 `.superpowers/` 临时预览目录，但保留受版本管理的设计稿和计划稿。

### Task 1: 先建立领域逻辑测试

**Files:**
- Create: `tests/ai-planet-builder.test.mjs`
- Create: `src/lib/ai-planet-builder.mjs`

- [ ] **Step 1: 写失败测试，覆盖状态、校验和提示词规则**

测试必须验证：空状态不能生成；网站名字、头像/描述、内容、风格、颜色、布局分别触发中文错误；头像最多两个；颜色最多三个；自我介绍为空时不输出空白段；生成结果包含中文字段和用户选择。

测试示例结构：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPrompt,
  createInitialState,
  validateStep,
} from '../src/lib/ai-planet-builder.mjs';

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
  assert.doesNotMatch(prompt, /一句话介绍我自己：\s*\n/);
});
```

- [ ] **Step 2: 运行测试确认当前失败**

Run: `node --test tests/ai-planet-builder.test.mjs`
Expected: FAIL，原因是 `src/lib/ai-planet-builder.mjs` 尚不存在。

- [ ] **Step 3: 实现最小领域模块**

在 `src/lib/ai-planet-builder.mjs` 导出以下稳定接口：

```js
export const AVATAR_OPTIONS = [{ id, label, description }];
export const SECTION_OPTIONS = [{ id, label }];
export const STYLE_OPTIONS = [{ id, label, description }];
export const COLOR_OPTIONS = [{ id, label, hex }];
export const LAYOUT_OPTIONS = [{ id, label, description }];
export const STEP_LABELS = ['网站名字', '头像 / 形象', '介绍自己', '网站内容', '网站风格', '主色与搭配色', '页面布局', '检查并生成'];
export function createInitialState();
export function validateStep(state, stepIndex);
export function buildPrompt(state);
```

状态字段固定为：`websiteName`、`avatars`、`avatarCustom`、`intro`（含 `self`、`favorite`、`known`）、`sections`、`sectionsCustom`、`style`、`colors`、`customColor`、`layout`。

校验函数只返回 `{ valid: boolean, message: string }`，不修改传入状态；`buildPrompt` 只读取状态，不执行 DOM 操作、不联网。头像和颜色校验按合并后的实际值计算上限，避免自定义输入绕过限制。

- [ ] **Step 4: 运行领域测试确认通过**

Run: `node --test tests/ai-planet-builder.test.mjs`
Expected: PASS，所有领域测试通过。

### Task 2: 搭建 AI星球项目页与表单骨架

**Files:**
- Create: `src/components/ProjectPromptBuilder.astro`
- Create: `src/pages/lab/001-ai-planet.astro`
- Create: `src/styles/ai-planet-builder.css`

- [ ] **Step 1: 写页面契约测试**

在 `tests/ai-planet-builder.test.mjs` 增加文本契约：项目页存在、页面标题为 AI星球、包含 `fieldset`/`legend`、包含 `复制提示词` 和 `返回修改`、没有姓名输入字段，并且组件引用领域模块而非把所有选项复制到脚本里。

- [ ] **Step 2: 实现无障碍表单结构**

组件导入 Task 1 的选项数组，用 `fieldset` 分组；选择项使用原生 `input` + `label`，卡片只作为视觉样式。每个步骤使用 `data-step-panel`，汇总和结果区初始隐藏。字段全部使用中文标签，保留普通文本可选中的提示词区域。

页面设置 `BaseLayout` 的中文标题与描述，显示项目编号、AI星球、静态页面说明和隐私提示；不添加上传、保存、登录、报名入口。

- [ ] **Step 3: 实现基础样式与响应式布局**

沿用 `tokens.css` 的浅色底、深墨文字和青蓝装饰。桌面端使用宽内容面板和两列卡片布局，窄屏改为单列；卡片最小点击区域为 44px；提示词区域允许换行或滚动但不造成页面横向溢出。为 `:focus-visible`、错误状态、已选状态和 `prefers-reduced-motion` 提供样式。

- [ ] **Step 4: 运行 Astro 检查确认骨架可编译**

Run: `pnpm check`
Expected: PASS；如果此时客户端脚本尚未接入，页面仍可读，动态控制暂不验证。

### Task 3: 接入步骤状态、汇总和提示词生成

**Files:**
- Modify: `src/components/ProjectPromptBuilder.astro`
- Modify: `src/styles/ai-planet-builder.css`

- [ ] **Step 1: 添加客户端内存状态同步**

在 Astro `<script>` 中读取表单控件生成 `state`，只保存在模块内变量；监听 `input` 和 `change` 更新状态，不使用 `localStorage`、`sessionStorage`、Cookie、`fetch` 或其他网络 API。

- [ ] **Step 2: 添加步骤导航与校验反馈**

实现 `showStep(stepIndex)`、`readStateFromForm()`、`renderSummary(state)` 三个页面函数。点击下一步前调用 `validateStep`，失败时在当前步骤内显示中文错误并将焦点移到第一个错误控件；成功后进入下一步。头像超出两个、颜色超出三个时立即撤销本次勾选并显示限制提示。

- [ ] **Step 3: 添加汇总与结果动作**

汇总页显示已选择的卡片和输入内容，并提供“返回修改”。点击生成后调用 `buildPrompt`，把结果写入 `textContent`，展示结果面板和“复制提示词”。复制成功显示 `已复制，可以交给 AI 制作网站啦！`；API 不可用或失败时保留结果并显示手动复制提示。

- [ ] **Step 4: 实现减少动效与无脚本降级**

脚本只控制当前步骤可见性，所有核心字段和说明在 HTML 中存在；CSS 在 `prefers-reduced-motion: reduce` 下关闭面板切换动画。无 JavaScript 时不显示伪造的已生成结果，不产生任何网络请求。

- [ ] **Step 5: 运行测试与类型检查**

Run: `node --test tests/ai-planet-builder.test.mjs && pnpm check`
Expected: 领域与页面契约测试 PASS，Astro 检查 PASS。

### Task 4: 接入首页项目入口与内容文案

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/content/projects/001-ai-base.md`
- Modify: `tests/homepage.test.mjs`

- [ ] **Step 1: 更新项目内容源**

把轻量 frontmatter 的 `title` 改为 `AI星球`，摘要改为真实且克制的项目说明；不添加虚构课时、物料、报名或下载字段。

- [ ] **Step 2: 将项目卡片变为真实链接**

把当前 `article.project-card` 改为指向 `/lab/001-ai-planet/` 的 `<a>` 或在保留卡片语义的情况下让卡片整体可点击，保留“研发中”状态和箭头，不改变首页首屏结构。

- [ ] **Step 3: 更新首页测试**

断言首页包含 `AI星球`、`/lab/001-ai-planet/` 和项目入口，断言旧的 `AI 小基地` 不再作为首页对外标题出现，同时保留首屏 HTML、尾焰和 reduced-motion 断言。

- [ ] **Step 4: 运行首页测试**

Run: `pnpm test`
Expected: PASS。

### Task 5: 同步项目文档与临时产物规则

**Files:**
- Modify: `docs/site-map.md`
- Modify: `docs/content-model.md`
- Modify: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: 同步站点地图**

将项目档案和页面入口中的对外名称改为 AI星球，新增实际路由 `/lab/001-ai-planet/` 和课堂提示词工具说明；保留原始课件标题仅作为历史素材说明，不把未授权物料改成可下载链接。

- [ ] **Step 2: 同步内容模型当前原型说明**

将轻量数据源示例从 AI 小基地改为 AI星球，说明项目页和提示词工具已落地，同时不写固定模块数量、不改变正式课程内容的未确认状态。

- [ ] **Step 3: 忽略临时 brainstorming 输出**

在 `.gitignore` 增加 `.superpowers/`，确保预览缓存不会进入版本管理；设计稿和计划稿位于 `docs/superpowers/`，用 `git add -f` 在需要提交时显式管理。

- [ ] **Step 4: 记录真实验证结果**

在 README 的验证记录中追加本次执行的 `pnpm test`、`pnpm check`、`pnpm build` 和浏览器检查结果；未执行的项目明确标记为“未验证”。

### Task 6: 构建、浏览器和隔离性验收

**Files:**
- Modify: `src/lib/ai-planet-builder.mjs`、`src/components/ProjectPromptBuilder.astro` 或 `src/styles/ai-planet-builder.css`（仅在验证发现问题时）
- Modify: `README.md`

- [ ] **Step 1: 运行生产构建**

Run: `pnpm build`
Expected: PASS，生成 `/lab/001-ai-planet/index.html`，无死链或构建错误。

- [ ] **Step 2: 运行本地预览并检查关键流程**

Run: `pnpm dev`
打开首页，点击 AI星球卡片；用键盘完成网站名字、头像、内容、风格、颜色、布局的选择，确认汇总、生成和复制反馈可见。

- [ ] **Step 3: 检查边界与隐私隔离**

在两个独立标签页分别填写不同内容，确认互不影响；刷新其中一个标签页，确认该页内容清空而另一页不变。检查页面源码与网络面板确认没有姓名字段、`fetch`、存储 API 或上传请求。

- [ ] **Step 4: 检查移动端与降级策略**

在窄屏尺寸检查无横向溢出；用 Tab 完成操作；启用 `prefers-reduced-motion` 确认内容静态完整；关闭 JavaScript确认项目说明和字段仍可读。

- [ ] **Step 5: 写入最终验证记录**

把每条已执行命令、退出码、关键结果和未验证项写入 `README.md`，不得把推断结果写成已验证。

---

## 计划自审

- 规范覆盖：入口与名称由 Task 4 覆盖；步骤与选项由 Task 1–3 覆盖；静态隔离与隐私由 Task 3、Task 6 覆盖；响应式、无障碍和 reduced-motion 由 Task 2、Task 3、Task 6 覆盖；文档与验证由 Task 5–6 覆盖。
- 占位扫描：计划中没有 `TODO`、`TBD` 或未定义的函数名；每个实现函数和文件职责均已在任务中明确。
- 类型/接口一致性：Task 1 定义的 `createInitialState`、`validateStep`、`buildPrompt` 贯穿 Task 2–3；状态字段在计划中只使用一套命名。
- 范围检查：本计划只处理 AI星球静态课堂提示词工具，不引入数据库、登录、上传、第三方服务或无关首页重构。
