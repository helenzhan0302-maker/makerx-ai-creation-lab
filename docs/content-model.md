# MakerX AI 造物实验室｜内容模型（Phase 0）

> 目的：把**课程内容**和**页面组件**彻底分开。新增「实验 002」时，理想改动 = **新增 1 个内容文件 + 最多 1 张图片**，页面代码零改动。
> 本文档定义字段契约。示例值均来自已核对的真实材料；**未确认的字段一律省略或标记为待确认，不填猜测值。**
> 决策优先级与已修正的冲突见 [`docs/decisions.md`](decisions.md)。

---

## 一、目录与文件约定

```
src/content/projects/
├─ 001-my-ai-base.md          ← 文件 id 即 URL slug
├─ 002-<kebab-case>.md        ← 未来新增
└─ _template.md               ← 新建项目的拷贝模板（下划线前缀，不参与构建路由）
```

- 文件名规则：`<三位编号>-<英文短横线 slug>.md` → 路由 `/lab/<文件名去扩展名>/`。
- 一个实验 = 一个文件。**不把项目文字写进 `.astro` 组件。**
- 长文正文（可选）写在 markdown body；结构化字段写在 frontmatter。
- 不使用 `draft: true` 来"藏"未完成内容 —— 那会让构建静默丢页面。未完成的信息用 `openQuestions[]` 或字段级的"待确认"**在页面上显式可见**。

---

## 二、字段契约

### 2.1 身份与卡片（首页与详情页共用）

| 字段 | 类型 | 必填 | 说明 | 实验 001 的值 |
|---|---|---|---|---|
| `code` | string | ✅ | 三位编号 | `"001"` |
| `codeLabel` | string | ✅ | 编号展示文案 | `"实验编号 001"` |
| `title` | string | ✅ | 项目名，**沿用已打磨的名称** | `"我的 AI 小基地"` |
| `subtitle` | string | ✅ | 一句话项目说明（卡片与详情头共用） | `"用 AI 把一个想法变成可打开、可继续改进的个人网页。"` |
| `status` | enum | ✅ | **课程就绪度**：`developing` \| `open` \| `planned` | `"developing"` |
| `statusLabel` | string | ✅ | 状态中文展示 | `"研发中"` |
| `pageState` | enum | ✅ | **页面实现状态**：`live` \| `coming-soon`。与 `status` 是两件事，见 §2.1.1 | `"live"` |
| `order` | number | ✅ | 排序与「上一/下一实验」计算 | `1` |
| `sessions` | number | ✅ | 课次数 | `2` |
| `sessionMinutes` | number | ✅ | 单次时长（分钟） | `90` |
| `ageRange` | string | ✅ | 适龄 | `"9–12 岁"` |
| `classSize` | number | ✅ | 每班人数 | `5` |
| `taskLine` | string | ✅ | 「项目任务」一段话 | `"把自己的想法变成个人网页，并在第二阶段改进它。"` |
| `outcomes` | string[] | ✅ | 学完拿到什么（可见清单） | 见 §三示例（**不得写入未定义的模块个数**） |
| `updated` | string(YYYY-MM-DD) | ⬜ | 内容最后更新日期。**可选**：缺失时页面**不显示**日期，而不是显示「待确认」 | 省略（内容未定稿） |
| `accentToken` | enum | ⬜ | 项目卡的主题强调色，**取值必须是 `visual-direction.md` §3.1 里已存在的令牌名** | 省略（使用默认） |
| `cover` | image | ⬜ | 项目卡封面（**只用自制/已授权素材**，没有就省略，不占位假图） | 暂缺 |
| `heroImage` | image | ⬜ | 项目页头图（同上，只用已授权素材） | 暂缺 |

#### 2.1.1 为什么 `status` 与 `pageState` 必须分开

一个字段无法同时表达两件互相独立的事：

| 问题 | 由谁回答 | 影响什么 |
|---|---|---|
| **课程内容做好了没？** | `status` | 状态徽标文案与颜色 |
| **页面能不能点？** | `pageState` | 卡片是否渲染为 `<a>`、是否显示箭头 |

实验 001 正好是两者相反的典型：**页面已实现（能点），但第 2 节课内容未定（不算「开放中」）**。若只有一个 `status`，就会被迫在「撒谎说开放中」和「有页面却标成不可点」之间二选一。拆开后：

- `status: "developing"` + `pageState: "live"` → 徽标显示「研发中」，卡片**仍可点击**。
- `pageState: "coming-soon"` → 卡片渲染为 `<div>`（不可点、虚线边框、无箭头），且**不得存在详情路由**。

### 2.2 教学字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `bigIdea` | string | 为什么值得做（给家长与老师的一句话） |
| `learningGoals[]` | object[] | 每一项：`skill`（能力名）、`kidFacing`（孩子版「我能…」）、`evidence`（老师看的证据）、`done`（怎么算做到） |
| `prerequisites` | object | `device`（string）、`tools`（string[]，**工具名待确认前只写类别**）、`safety`（string[]） |
| `sessionPlans[]` | object[] | `id`（`"s01"`）、`label`（`"课次 01"`）、`title`、`durationMin`、`goal`、`produce`（本课产出）、`steps[]`；**未定稿的课次用 `goal: "待确认"` + `steps: []`，不得编造步骤** |
| `sessionPlans[].steps[]` | object[] | `n`（序号）、`title`、`minutes`、`action`（孩子要做的动作句）、`output`（这一步的产出）、`teacherTip`（老师提示）、`promptRef`（可选，指向 `prompts[].id`） |
| `boundaries[]` | string[] | 本次课**刻意不做**的事（如「今天先不做：动画、音乐、多个页面、点赞」） |
| `openQuestions[]` | string[] | 本项目**尚未确认**的事项，页面需要时可显式展示（如「模块数量待确认」）。这是「不编造」的落地字段 |

### 2.3 物料字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `prompts[]` | object[] | `id`、`title`、`when`（什么场景用）、`body`（可复制的提示词正文）、`howToEdit[]`（把哪些词换成自己的）、`isExample`（boolean，示例而非标准答案要标 true） |
| `resources[]` | object[] | `id`、`title`、`kind`（`worksheet` \| `promptcard` \| `slide` \| `checklist`）、`state`（`ready` \| `pending`）、`path`（**仅 `ready` 时允许**，`public/` 下的相对路径）、`note`（`pending` 时写给用户看的说明）、`license`（公开授权说明） |

**硬规则**
1. `state: "pending"` 时**不得**渲染 `<a href>`，只渲染「待补充」+ `note`。
2. `state: "ready"` 必须**同时**满足：存在 `path`、该路径的文件真实存在、`license` 非空。**由构建前检查脚本强制**（§4.2），不是靠自律。
3. 不存在「半真」状态：宁可少一个下载，不可多一个死链。
4. **第一版没有登录系统** → 凡是发布出去的页面与静态文件**任何人可访问**。因此 `ready` 的前提不仅是「文件在仓库里」，还包括**「已确认可以公开」**。未确认公开授权的物料（含教师自制的 PPT、工作纸）一律保持 `pending`。

### 2.4 评价与展示字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `rubric[]` | object[] | `id`、`dimension`（内容/风格/布局/可用性/能解释自己的决定）、`kidCan`（孩子能做什么）、`start` / `good` / `great`（三档描述）、`teacherLooksFor` |
| `reflectionPrompts[]` | string[] | 引导孩子解释决定的提问（过程证据） |
| `pitch` | object | `durationMin`（`3`）、`outline[]`（每段：`label` + `say`）、`checklist[]`、`audience`（`"爸爸妈妈"`） |
| `portfolio` | object | `whatGoesIn[]`、`nextStep`、`publicByDefault`（**必须为 `false`**） |

### 2.5 隐私字段（每个项目强制声明）

| 字段 | 类型 | 说明 |
|---|---|---|
| `privacy.noRealNames` | boolean | 恒为 `true` |
| `privacy.noPhotos` | boolean | 恒为 `true` |
| `privacy.exampleOnly` | boolean | 页面示例一律使用虚构角色 |
| `privacy.notes[]` | string[] | 本项目的额外边界说明 |

`publicByDefault` **只存在于 `portfolio` 对象下**（`portfolio.publicByDefault`），`privacy` 对象不再持有该字段 —— 早期文档曾把它写成 `privacy.publicByDefault`，属于笔误，已统一（`docs/decisions.md` C-05）。校验规则见 §4.1 第 4 条。

页面上必须能读到这段承诺；`portfolio.publicByDefault: false` 与 `privacy.*` 的组合由校验保证，避免以后误开公开。

---

## 三、实验 001 的填充示例（节选，其余按上表补齐）

```yaml
---
code: "001"
codeLabel: "实验编号 001"
title: "我的 AI 小基地"
subtitle: "用 AI 把一个想法变成可打开、可继续改进的个人网页。"
status: "developing"
statusLabel: "研发中"
pageState: "live"
order: 1
sessions: 2
sessionMinutes: 90
ageRange: "9–12 岁"
classSize: 5
taskLine: "把自己的想法变成个人网页，并在第二阶段改进它。"
outcomes:
  - "一个能双击打开的网页文件"
  - "填好的《内容工作纸》与《网站提示词》"
  - "一段 3 分钟的讲解"
  # ⚠️ 刻意不写模块数量：工作纸 5 站 / 提示词模板 3 个空位 / PPT 说 4 个，
  #    三处不一致，定义统一前不得在此写出具体个数（docs/decisions.md D-02）
openQuestions:
  - "模块到底有几个、分别是什么（工作纸与提示词模板数目不一致）"
  - "孩子实际使用哪个 AI 建站工具"
  - "第 2 节课的教案内容"
  - "第 1 节 PPT 与两份工作纸是否允许公开"
bigIdea: "先学会把想法说清楚，再让 AI 帮你把它做出来 —— 做出来之后还要能改、能讲。"
learningGoals:
  - skill: "需求表达"
    kidFacing: "我能把想要的东西写成 AI 看得懂的话。"
    evidence: "《内容工作纸》5 站填写完整"
    done: "每一站都有具体内容，不是『好看的东西』这类模糊说法"
  # …其余 5 项按任务书补齐
prerequisites:
  device: "可联网的笔记本电脑"
  tools: ["待确认：孩子实际使用的 AI 建站工具"]   # 不写具体产品名，直到确认
  safety:
    - "不填写真实姓名、学校、住址或电话"
    - "不使用真实照片作为头像"
    - "文件只保存在老师指定的位置"
sessionPlans:
  - id: "s01"
    label: "课次 01"
    title: "做出我的 1.0"
    durationMin: 90
    goal: "把想法写成结构化提示词，生成一个能打开的个人网页。"
    produce: "一个能双击打开的网页文件 + 填好的《内容工作纸》"
    steps:
      - n: 1
        title: "同题不同画"
        minutes: 10
        action: "照着同一句话画一幅画，再和第二轮的结果比一比。"
        output: "两张画 + 一句话发现"
        teacherTip: "引导出『说得越清楚，结果越接近我想要的』。"
      - n: 2
        title: "AI 不会读心术"
        minutes: 5
        action: "说出为什么『画一个好看的东西』画不出来。"
        output: "一句结论：这就是提示词。"
      # …按 PPT 顺序继续
  - id: "s02"
    label: "课次 02"
    title: "改成 2.0 并讲出来"
    durationMin: 90
    goal: "待确认（第 2 节课教案尚未提供）"
    produce: "待确认"
    steps: []
boundaries:
  - "今天先不做：动画、音乐、多个页面、点赞"
resources:
  - id: "worksheet-content"
    title: "内容工作纸 · 我的第一个个人网站"
    kind: "worksheet"
    state: "pending"
    note: "共 5 站：网站名字、头像、自我介绍、风格与主色、布局。需确认是否允许公开。"
  - id: "prompt-template"
    title: "网站制作提示词（七段式模板）"
    kind: "promptcard"
    state: "pending"
    note: "网站名称 / 我是谁 / 头像 / 模块 / 风格 / 主色 / 布局。需确认是否允许公开。"
prompts:
  - id: "p-site-template"
    title: "七段式建站提示词"
    when: "写完《内容工作纸》之后，准备让 AI 生成网页时"
    body: |
      你是一位经验丰富的网站设计专家，特别擅长帮小学生做出好看又好用的个人网站。
      请帮我做一个【个人网站】。下面是我的想法：
      一、网站名称：…
      二、我是谁（一句话介绍）：…
      三、我的头像：…
      四、网站上要放哪些内容（模块）：1. … 2. … 3. …
      五、整体风格：…（活泼热闹 / 安静干净 / 科技酷炫 / 自然清爽 / 梦幻想象）
      六、主色：…  搭配色：…
      七、布局结构：…
    howToEdit:
      - "把每一行的省略号换成《内容工作纸》里你自己写的内容"
      - "风格只能选一个，颜色写 1～3 个"
      - "布局先挑一种，不要一次全要"
  - id: "p-site-example"
    title: "示例（不是标准答案）"
    when: "不知道怎么写的时候，看看别人怎么写"
    isExample: true
    body: |
      角色设定：顶级科技极客
      网站主题：我的火星生存基地
      颜色调性：深空黑和荧光绿
      第一模块包含：一个超酷炫的太空站自我介绍
    howToEdit:
      - "把火星、深空黑、太空站换成你自己的主题和颜色"
pitch:
  durationMin: 3
  audience: "爸爸妈妈"
  outline:
    - label: "我是谁"
      say: "我的网站叫什么，我是谁。"
    - label: "我的三个决定"
      say: "模块、风格、布局，我为什么这样选。"
    - label: "下一版"
      say: "我还想改什么。"
portfolio:
  whatGoesIn: ["网页文件", "《内容工作纸》", "3 分钟讲解的记录"]
  nextStep: "待确认：作品集后续如何整理"
  publicByDefault: false
privacy:
  noRealNames: true
  noPhotos: true
  exampleOnly: true
  notes:
    - "页面示例使用虚构角色（如『我的火星生存基地』），不使用学生的真实作品与信息。"
# updated 字段省略：内容未定稿时页面不显示日期（填入真实日期后才会出现）
---
```

---

## 四、校验规则

校验分两层：**第 1 层是字段 schema**（Zod，构建时随内容集合校验）；**第 2 层是文件系统检查**（构建前独立脚本，因为 schema 无法知道磁盘上有没有文件）。

### 4.1 字段层（Zod schema，`src/content.config.ts`）

1. `code` 唯一且为三位数字字符串；`order` 唯一。
2. `status ∈ {developing, open, planned}`；`pageState ∈ {live, coming-soon}`；`statusLabel` 非空。
3. `status === "open"` 时 `pageState` 必须为 `"live"`（开放中的项目不可能没有页面）。
4. `portfolio.publicByDefault === false` 恒成立；`privacy.noRealNames` / `noPhotos` / `exampleOnly` 恒为 `true`。
   ⚠️ 路径以 `portfolio.` 开头 —— 早期版本误写成 `privacy.publicByDefault`（`docs/decisions.md` C-05）。
5. `prompts[].body` 非空；正文不得包含儿童真实个人信息。
6. `learningGoals[]` 至少 4 项，且每项 `evidence` 与 `done` 非空（不允许无法验收的目标）。
7. `rubric[]` 必须包含「能解释自己的决定」维度。
8. `sessions ≥ 1`；`sessionPlans` 长度与 `sessions` 一致。未定稿的课次允许 `goal: "待确认"` + `steps: []`，但**不允许**编造步骤。
9. **`updated` 为可选**：未提供时通过校验（页面不渲染日期）；一旦提供，必须是合法的 `YYYY-MM-DD` 且**不得是未来日期**。
   ⚠️ 不提供「非日期占位值」这条路：`"待确认"` 会直接被拒绝，而不是被放行（`docs/decisions.md` C-06）。
10. **`resources[]` 的字段级规则**：
    - `state === "pending"` → 允许没有 `path`/`license`，但 `note` 必须非空。
    - `state === "ready"` → **必须**同时有 `path`（非空）与 `license`（非空），且**不得**有 `note` 里的"待补充"字样。
11. `accentToken` 若提供，必须是 `visual-direction.md` §3.1 中**已定义的令牌名之一**（用一个常量数组约束，令牌改名时一并更新）。
    ⚠️ 早期示例写的 `"lime"` 在任何文档里都不存在（`docs/decisions.md` C-04）。
12. `outcomes[]` / `title` / `subtitle` / 正文中**不得出现未定义的模块数量**（D-02 未解决前，禁止出现「N 个模块」这类断言）。
13. 正文与字段中禁止出现真实机构联系方式，除非该字段被明确标注为已确认公开。

### 4.2 文件层（构建前检查脚本，**必须真正实现**）

**为什么必须有这一层**：Zod 只能校验字段的**形状**（字符串非空、枚举合法），它**看不到磁盘**。`path: "worksheets/内容工作纸.pdf"` 在 schema 眼里是一个完全合法的字符串，即使这个文件根本不存在。所以「不生成虚假下载链接」这条硬约束**不能只靠 schema**，必须有真实的文件系统检查。

要求：

| 项 | 规格 |
|---|---|
| 位置 | `scripts/check-resources.mjs` |
| 运行方式 | `package.json` 的 `"prebuild"` 与 `"predev"` 钩子；另在 Astro 集成钩子里再调一次（具体钩子名待按安装到的 Astro 版本核对） |
| 输入 | 扫描 `src/content/projects/*.md` 的 frontmatter |
| 检查 1 | 每个 `state: "ready"` 的条目，其 `path` 指向的文件**必须存在于 `public/` 下** |
| 检查 2 | `state: "ready"` 的条目必须有非空 `license` |
| 检查 3 | 反向检查：`public/` 下**不应存在**未被任何内容文件引用、却看起来像课程物料的孤儿文件（只警告，不阻断） |
| 检查 4 | 扫描渲染后的 `dist/**/*.html`，确认所有站内链接与资源引用都能解析到真实文件（死链检查） |
| 失败行为 | **退出码非 0，并逐条打印「哪个实验 / 哪个物料 / 缺什么」**，阻断构建 |
| 明确不做 | 不联网、不校验外部 URL、不下载任何东西 |

> `pnpm build` 必须在前置检查通过后才执行；**不允许**用 `--ignore-scripts` 之类的方式绕过。若某次确实需要跳过，必须在 README 记录原因。

### 4.3 这两层共同保证的事

第 8 / 10 / 12 条与文件层检查，是「不生成虚假课程文件、不指向不存在的下载」这条硬约束在**数据层 + 文件层**的落点：**宁可让页面显示「待补充」，也不要让模型补一段看起来合理的课程内容，更不要给一个点不开的链接。**

---

## 五、新增「实验 002」的操作流程

1. 复制 `_template.md` → `002-<slug>.md`。
2. 填身份字段。名称未定就设 `status: "developing"` + `pageState: "coming-soon"`（此时**不要**建详情路由）。
3. 填 `learningGoals`、`sessionPlans`、`prompts`、`rubric`、`pitch`；未确认的写进 `openQuestions[]`。
4. 物料先进 `pending`，等**真实文件存在 + 公开授权确认**后再切 `ready` 并补 `path` 与 `license`。
5. 本地跑 `pnpm build`（会先执行 §4.2 的文件检查），确认两层校验都通过。
6. **不改动任何 `.astro` 组件**；若确实需要新组件，说明理由后再加。

---

## 六、与 Astro 的对接（实现方式，待落地时按实际版本核对）

数据源建议用 Astro 的内容集合（Content Collections）：一个 `projects` 集合，`schema` 用 Zod 表达 §4.1 的字段规则；§4.2 的文件检查用独立脚本实现。

- 已完成核对：本机 Node `v26.9.0`、npm `11.19.1`、pnpm `8.15.9`，npm registry 可达；`npm view astro version` 返回 `7.3.8`。
- **未核对**：Astro 7 的 `content.config.ts` 具体 API（loader 写法、Zod 版本约束）与集成钩子名称 —— 本文档只约定字段契约，落地时以安装到的版本为准并在 `AGENTS.md` / `README.md` 记录实际命令与结果。
- **`updated` 的"可选 + 条件校验"** 与 **`resources` 的"按 `state` 分支校验"** 都需要 Zod 的 discriminated union / `superRefine` 之类的写法，属于落地时要实测的点。
- 备选方案（若 Astro 引入成本过高）：同样用 Markdown + frontmatter，在构建脚本里自行解析校验；字段契约不变，迁移成本低。
