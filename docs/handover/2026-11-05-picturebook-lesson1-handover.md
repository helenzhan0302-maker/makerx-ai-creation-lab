# 交接文档 · 002「故事放映机」第 1 节课改版

> 生成时间：2026-11-05（Asia/Shanghai）
> 交接范围：本工作区当前**未提交**的 lesson-1 改版，以及把它安全发布到 `https://makerx.skftai.top/` 的完整步骤。
> 本文只写**已核对的事实**；推断会标注「推断」，没跑过的会标注「未验证」。

---

## 0. 一句话状态

代码改完、76/76 单元测试与 63/63 本地浏览器 E2E 已通过、`dist-subdomain` 已重新构建（7 页）；**但 17 个源码文件尚未提交，线上仍是旧版 `deploy=20261104170025`，本轮改版没有部署。**

---

## 1. 项目与产出目标（重读 PPT 后的结论）

- 课程：002「故事放映机」，两节课分两个周六上。
- 课程 PPT：`AI_绘本造物指南`（15 页，用户提供的源文件，不在仓库内）。
- **孩子要带走的东西**：自己的故事 + 6 页分镜（每页有叙事任务）+ 6 张插图 + 一版首映，**不是** AI 代写的一篇故事。
- 对外只写「课堂上能访问的智能体产品」，不写具体品牌、不外链、不写账号要求（D-14）。
- 固定 6 页（D-13）；网站不做账号、不做数据库、不做浏览器持久化（D-25）。

### 第 1 节课链路（网站已实现）

选起点（角色 / 愿望 / 奇怪的事）→ 写一句「故事种子」→ 生成提示词 → 粘到课堂智能体 → **一次一问** → 智能体用孩子原话写完整故事 → **孩子确认/修改** → 回填五行故事卡 → 填 6 页分镜 → 故事卡与分镜都完成才可保存 `story-project-v1.json`。

### 第 2 节课链路（网站已实现）

导入 v1 → 选比例 / 画风 / 色调 → 「AI 从故事提取主角四项外观」提示词 → 填四项固定特征 → 生成主角参考图提示词 → 逐页生成与检查 → 四项出厂检查 → 首映路演卡 → 保存 `story-project-v2.json`。

### 苏格拉底提示词的硬规则（`buildSocraticPrompt`）

1. 每次只问一个问题，不提前给整套问卷。
2. 每次提问前先复述「上一条回答更新了什么判断」。
3. 区分：画面里看得见的事实 / 解释 / 喜好 / 希望发生的事。
4. 只问可能改变故事的问题；已有清楚答案的不重复问。
5. 孩子说「不知道」时给 2–3 个可画出来的方向让他选。
6. 最多 6 问，信息够就停。
7. 不询问真实姓名、学校、住址、电话、照片。
8. 第二阶段用孩子原话写完整故事，列出「用了哪些原话」，写完不自行定稿。
9. 第三阶段请孩子确认；孩子说改哪里就只改那一处。
10. 孩子说「就是这样」后才输出五行故事卡，并提醒回网站填卡。

**外观提取不放在第 1 节**，它是第 2 节的独立提示词（`buildTraitExtractionPrompt`）。

---

## 2. 当前工作区状态（已核对）

```
分支：main（与 origin/main 同步于 5d0659c）
最新提交：5d0659c feat(picturebook): add story inspirations and three-phase Socratic prompt
工作区：17 个已修改文件，未提交
线上：deploy=20261104170025，status=ok，https=on（旧版）
```

### 2.1 待提交文件（只提交这些）

```text
.gitignore
README.md
docs/decisions.md
src/components/PicturebookStudio.astro
src/components/ProjectFileBar.astro
src/components/StoryCardBuilder.astro
src/components/StoryboardBuilder.astro
src/lib/picturebook-project-file.mjs
src/lib/picturebook-prompts.mjs
src/lib/picturebook-story.mjs
src/lib/picturebook-workspace.mjs
src/pages/lab/002-picturebook/lesson-1.astro
src/styles/ai-planet-builder.css
src/styles/picturebook.css
tests/browser-picturebook.mjs
tests/picturebook-prompts.test.mjs
tests/picturebook-story.test.mjs
```

### 2.2 明确不要提交（既有未跟踪文件，与本轮无关）

```text
AI_Planet_Upgrade_Mission.pptx
MakerX_AI少儿课程体系设计文档.docx
design-demos/
references/research/2026-10-19-*
src/assets/
src/components/AvatarArt.astro
婷婷微信二维码.jpg
```

### 2.3 本轮改了什么

| 文件 | 变化 |
|---|---|
| `src/lib/picturebook-prompts.mjs` | 新增 `STORY_STARTS`（3 类起点 × 6 个灵感）、`PAGE_BEATS`（6 页叙事任务）、`buildTraitExtractionPrompt`；重写 `buildSocraticPrompt` 为三阶段；`buildStoryboardPrompt` 增加每页叙事任务与四项输出 |
| `src/lib/picturebook-story.mjs` | 删除网页端逐题追问（`nextQuestion` / `answerElement`），改为 `saveStoryField`；故事卡只记录孩子确认过的原话 |
| `src/lib/picturebook-workspace.mjs` | 新增 `start`（默认 `character`）与 `seed`；删除 undo 历史；导入旧文件时缺 `seed` 也能读 |
| `src/lib/picturebook-project-file.mjs` | 工程文件新增可选 `story.seed`，旧 v1 仍可导入 |
| `src/components/StoryCardBuilder.astro` | 第 1 节改为「起点 → 种子 → 生成提示词 → 回填确认卡」；灵感 chip 只填入输入框、不自动确认；删除故事自检块 |
| `src/components/StoryboardBuilder.astro` | 每页显示叙事任务标签与提示 |
| `src/components/ProjectFileBar.astro` | 新增 `requireStory`；保存前置条件改为「故事卡 5 行 + 6 页分镜」 |
| `src/components/PicturebookStudio.astro` | 第 2 节新增「从故事提取主角四项外观」面板 |
| `src/pages/lab/002-picturebook/lesson-1.astro` | 页面文案改为种子/追问/确认流程；保存条传 `requireStory` |
| `src/styles/*.css` | 修复 `.pb-button[hidden]` 被 `display:inline-flex` 覆盖；手机端返回链接换行；新增种子/灵感/叙事任务样式 |
| `tests/*` | 断言更新到 63 项浏览器检查与 76 项单元测试 |
| `docs/decisions.md` | 新增 D-23、D-24、D-25 |
| `README.md` | 新增「C · 课程目标复核与提示词重构（未部署）」小节 |

---

## 3. 已验证 / 未验证

### 3.1 已验证（本次交接前重新跑过）

| 项 | 结果 | 证据 |
|---|---|---|
| 单元测试 | **76 pass / 0 fail / 0 skipped** | 2026-11-05 本机 `pnpm test` |
| 子域构建 | 退出码 0，**7 pages** | `dist-subdomain` 共 20 个文件；`lesson-1/index.html` 构建于 2026-11-05 10:14 |
| 本地生产预览 E2E | **63/63 通过** | `PB_BASE=http://localhost:4413 node tests/browser-picturebook.mjs` |
| 线上旧版回执 | `deploy=20261104170025`、`status=ok`、`https=on` | 公网 `DEPLOY_STAMP.txt` / `DEPLOY_STATUS.txt` |
| 线上旧版 CSS | `picturebook.DzhgN6yZ.css`，且不含「故事种子」 | 公网 lesson-1 HTML |
| 新构建 CSS | `picturebook.65mMGA-u.css` | `dist-subdomain/lab/002-picturebook/lesson-1/index.html` |

本地 E2E 覆盖：起点与灵感、种子提示词、三阶段苏格拉底提示词、故事卡 5 行门槛、6 页叙事任务、v1→v2 版本递增、导入旧文件、375/768/1440 无横向溢出、reduced motion、无 JS、控制台 0 错误。

### 3.2 未验证（不要声称已通过）

- **真实手机**（iOS Safari / Android Chrome）。
- **微信内置浏览器**。
- **真实屏幕阅读器**（VoiceOver / NVDA）。
- **`pnpm check`**：仍因既有 `design/` 代码导致 heap OOM（退出码 134），**未通过**，不能写成「类型检查通过」。
- **本轮改版的线上表现**：尚未部署，线上仍是旧版。

---

## 4. 发布步骤（按顺序执行）

所有 PowerShell 命令必须显式指定 `shell: powershell`；本机有多次误用 bash 导致 `Get-Content: command not found` 的记录。

### 4.1 提交源码到 main

```powershell
git add .gitignore README.md docs/decisions.md src/components/PicturebookStudio.astro src/components/ProjectFileBar.astro src/components/StoryCardBuilder.astro src/components/StoryboardBuilder.astro src/lib/picturebook-project-file.mjs src/lib/picturebook-prompts.mjs src/lib/picturebook-story.mjs src/lib/picturebook-workspace.mjs src/pages/lab/002-picturebook/lesson-1.astro src/styles/ai-planet-builder.css src/styles/picturebook.css tests/browser-picturebook.mjs tests/picturebook-prompts.test.mjs tests/picturebook-story.test.mjs
git commit -m "feat(picturebook): restructure story seed flow and Socratic prompts"
git -c http.https://github.com/.proxy=http://127.0.0.1:7892 push origin main
```

> Git 推送必须走代理 `http://127.0.0.1:7892`；默认 7897 已失效。

### 4.2 同步部署产物

```powershell
robocopy dist-subdomain .superpowers\deploy-subdomain-wt4 /MIR /XD .git
git -C .superpowers\deploy-subdomain-wt4 status --short
```

确认差异只包含本次构建产物（`_astro/`、`lab/`、`index.html` 等），再提交：

```powershell
git -C .superpowers\deploy-subdomain-wt4 add -A
git -C .superpowers\deploy-subdomain-wt4 commit -m "deploy(subdomain): lesson 1 seed flow and Socratic prompt rewrite"
git -C .superpowers\deploy-subdomain-wt4 -c http.https://github.com/.proxy=http://127.0.0.1:7892 push origin deploy-subdomain
git -C .superpowers\deploy-subdomain-wt4 -c http.https://github.com/.proxy=http://127.0.0.1:7892 ls-remote origin deploy-subdomain
```

`ls-remote` 返回的 SHA 必须等于本地 `git -C .superpowers\deploy-subdomain-wt4 rev-parse HEAD`。

### 4.3 TAT 发布（唯一服务器发布通道）

命令页：

```text
https://console.cloud.tencent.com/lighthouse/command/invoke?rid=4&id=cmd-fc0x3vye
```

- 命令名：`makerx-deploy-002-multisrc-20261104`
- 实例：`lhins-ce4mfndw` / `124.222.99.128`
- 地域：上海 `rid=4`
- **不要用** `cmd-a61syn0i`（旧的失败命令）
- 一次执行约 90–120 秒，超时 600 秒

UI 自动化要点（来自真实误点）：

1. 重新枚举前台窗口；不要复用旧 HWND。
2. 用可访问性名称选中 `命令列表 - 自动化助手 - 轻量云 - 控制台` 标签，执行 `SelectionItemPattern.Select()`。
3. 不要按固定坐标点击，不要连续盲按 Tab。
4. 复选框通常有 3 个：`CHK[0]` 上传开关、`CHK[1]` 表头全选、`CHK[2]` `lhins-ce4mfndw` 行。
5. 用 `TogglePattern` 勾选 `CHK[2]`，确认出现「已选择1个实例」，且「执行命令」由 disabled 变 enabled。
6. 用 `InvokePattern` 执行「执行命令」。
7. 每次动作后重新观察，发现点错立即停止。

### 4.4 验收（缺一不可）

```powershell
curl.exe -s -L https://makerx.skftai.top/DEPLOY_STAMP.txt
curl.exe -s -L https://makerx.skftai.top/DEPLOY_STATUS.txt
```

要求：

- `deploy=` **不再是 `20261104170025`**。
- `status=ok`、`https=on`。

七条路由全 200：

```text
/
/lab/001-ai-planet/
/lab/001-ai-planet/lesson-1/
/lab/001-ai-planet/upgrade/
/lab/002-picturebook/
/lab/002-picturebook/lesson-1/
/lab/002-picturebook/lesson-2/
```

线上 lesson-1 HTML 应引用 `picturebook.65mMGA-u.css`（若重新构建后哈希变化，以 `dist-subdomain/lab/002-picturebook/lesson-1/index.html` 实际引用为准）。

生产 E2E：

```powershell
$env:PB_BASE='https://makerx.skftai.top'
node tests/browser-picturebook.mjs
```

期望 **63/63**。

### 4.5 回填 README

部署成功后更新 README 的「C · 课程目标复核与提示词重构」：

- 新 `DEPLOY_STAMP` 时间戳；
- 76/76 单元测试、63/63 生产 E2E；
- 新 CSS 哈希；
- 明确 `pnpm check` 未通过（既有 `design/` OOM）；
- 明确真实手机 / 微信 / 屏幕阅读器未验证；
- 标题从「未部署」改为已部署。

然后再提交 main 并推送。

---

## 5. 关键事实与约束

| 项 | 值 |
|---|---|
| 对外地址 | `https://makerx.skftai.top/` |
| 构建配置 | `astro.config.subdomain.mjs`（`site: https://makerx.skftai.top`，`base: "/"`） |
| 产物目录 | `dist-subdomain`（7 页，20 个文件） |
| 产物分支 | `deploy-subdomain`（只含静态产物） |
| 部署工作树 | `.superpowers/deploy-subdomain-wt4`（`wt2` 停在旧提交，不要用） |
| 服务器 | 腾讯云轻量 `lhins-ce4mfndw` / `124.222.99.128`，Ubuntu 22.04 |
| 站点目录 | `/var/www/makerx-subdomain` |
| 服务器运行时 | **无 Node / npm / pnpm**，不能服务器构建 |
| SSH | 私钥被拒，不能直连 |
| 云 API | 本机无 `tccli`、无腾讯云凭证 |
| Git 代理 | `http://127.0.0.1:7892` |

### 硬约束（违反即失败）

1. 不提交儿童真实信息（姓名、学校、住址、电话、照片）。
2. 不伪造课程内容、下载链接或未确认的物料。
3. 不做账号、数据库、浏览器持久化；数据隔离只在孩子自己的工程文件。
4. 固定 6 页；两节课分两个周六。
5. 不声称 `pnpm check` 通过。
6. 不声称看过图片；本环境视觉模型不可用。
7. 不用「首页 200」判断部署成功，只认回执 + 路由 + 哈希 + E2E。

---

## 6. 部署踩坑记录（防复发）

| 编号 | 现象 | 根因 | 规则 |
|---|---|---|---|
| F-04 | 首页 200 但线上没更新 | nginx 默认站点兜底，任意域名都 200 | 只认 `DEPLOY_STAMP` 变化 |
| F-05 | TAT 90 秒超时、线上未变 | 从 `deploy-subdomain` 找 `scripts/`，该分支只有产物 | 脚本从 `main` 取，产物从 `deploy-subdomain` 取 |
| F-06 | 桌面自动化点击落到别的窗口 | 多显示器/缩放坐标偏移；前台窗口被抢 | 不用固定坐标；用 UIA + 每次动作后复查 |
| F-07 | 页面看起来是旧的 | 缓存 / CDN / nginx 兜底 | 比对线上 HTML 的 `_astro` 哈希 |
| F-08 | `pnpm check` 退出码 134 | 既有 `design/` 类型错误 heap OOM | 记录为「未通过」，不省略 |
| — | `astro preview` 读到旧页面 | `astro preview` 固定读 `dist/`，不是 `dist-subdomain/` | 先 `robocopy dist-subdomain dist /MIR` |
| — | PowerShell 命令报 `Get-Content: command not found` | 误用了 bash shell | 所有命令显式 `shell: powershell` |
| — | Git push 失败 | 默认代理 7897 失效 | 显式 `-c http.https://github.com/.proxy=http://127.0.0.1:7892` |

---

## 7. 新会话开场提示（可直接粘贴）

```text
请先读 docs/handover/2026-11-05-picturebook-lesson1-handover.md 和 AGENTS.md，然后继续完成 002 第 1 节课改版的提交与部署。

当前状态：17 个源码文件已改完但未提交；单元测试 76/76、本地 E2E 63/63 已通过；dist-subdomain 已构建 7 页；线上仍是旧版 deploy=20261104170025。

请按交接文档第 4 节执行：提交 main → 推送 deploy-subdomain 产物 → TAT 发布（cmd-fc0x3vye，只勾 lhins-ce4mfndw）→ 用回执/七条路由/CSS 哈希/生产 E2E 验收 → 回填 README。

约束：所有 PowerShell 命令必须显式 shell: powershell；Git 走代理 127.0.0.1:7892；不要声称 pnpm check 通过；不要提交交接文档列出的既有未跟踪文件。
```
