# MakerX AI 造物实验室

> 把脑海里的想法，动手造出来。

一个持续生长的「品牌首页 + 项目档案」轻量静态网站：MakerX 用真实的制作、测试和分享不断迭代课程与项目。

- 当前交付：**首页动态 Hero 原型** —— 使用用户提供的首屏视觉参考重建 HTML/CSS/SVG 网页舞台，验证品牌主视觉和参考站式动效节奏。
- 品牌主张：**把脑海里的想法，动手造出来。**

---

## 当前状态

**当前状态：Phase 0 规划已完成，首页 Hero 原型、AI星球项目页与课堂提示词工具已可运行；静态站点已按 IP 子路径部署到腾讯云，完整内容集合与课程物料检查仍待接入。**

| 阶段 | 内容 | 状态 |
|---|---|---|
| Phase 0 | 规划文档、设计方向、技术选型 | ✅ 完成（2026-10-15） |
| Phase 1 | 首页 Hero 原型 | ✅ 完成（2026-10-15） |
| Phase 2 | 项目档案与项目详情页 | 🟡 进行中（AI星球项目页与课堂工具已完成，正式课程详情仍待接入） |
| Phase 3 | 完整内容校验、可访问性、构建与部署 | 🟡 部分完成（测试、类型检查、构建和腾讯云部署已通过；完整内容校验仍待接入） |
| Phase 4 | 课堂试用后迭代 | ⬜ 未开始（需要真实课堂反馈） |

已落地的东西：Astro 7 静态首页、设计令牌、`100svh` HTML/SVG 动态首屏、项目档案锚点、`AI星球` 项目卡片与项目页、一步一项/汇总式中文提示词生成器、原生入场 / 轨道 / 几何体 / 鼠标尾焰 / 滚动揭示动效和基础可访问性结构。项目卡片读取 `src/content/projects/001-ai-base.md` 的轻量展示字段；正式课程内容仍待确认。

**2026-10-15 原型决策**（设计规格见 [`docs/superpowers/specs/2026-10-15-makerx-homepage-hero-design.md`](docs/superpowers/specs/2026-10-15-makerx-homepage-hero-design.md)）：首屏严格占满 `100svh`；首屏图只作为构图与色彩参考，不作为 Hero 图片渲染；品牌名、主张、角标和装饰轨道都是真实 HTML/SVG；滚动后进入品牌级项目档案区，并展示当前已确认的 `AI星球` 卡片。卡片只标记「研发中」，通过真实链接进入项目页；项目页提供不联网、不保存的中文提示词工具，不伪造课程下载或报名入口。

---

## 规划文档

| 文档 | 内容 |
|---|---|
| [决策与冲突记录](docs/decisions.md) | **决策优先级 + 已解决/未决冲突。文档矛盾时先读这份。** |
| [产品简报](docs/product-brief.md) | 定位、人群、范围、实验 001 的真实来源、待确认事项 |
| [视觉方向](docs/visual-direction.md) | 色彩、字体、动效、移动端与降级策略 |
| [站点地图](docs/site-map.md) | 路由、页面区块、组件清单 |
| [内容模型](docs/content-model.md) | 内容字段契约与校验规则 |
| [AGENTS.md](AGENTS.md) | 给 AI 编码代理的项目约束 |
| [首屏图实测](references/research/2026-10-15-hero-image-measurement.md) | 用户提供的首屏视觉参考（1774×887）的文件实测与校正记录 |
| [参考站实测（haoqi / hiesther）](references/research/2026-10-14-reference-measurements.md) | 第一手 DOM / 计算样式 / 动画实测记录 |
| [参考站实测（20 站）](references/research/2026-10-14-portfolio-sites-20.md) | 参考清单里另外 20 站的逐站实测 + 综合原则 |
| [第 1 节 PPT 提取记录（旧版课件）](references/research/2026-10-14-lesson01-extract.md) | 15 页旧版《我的 AI 小基地》PPT 的逐页 OCR + 两份工作纸全文 |
| [第 1 节课堂素材（2026-10-17 实际交付）](references/research/2026-10-17-lesson01-delivered.md) | 新版《我的AI星球》16 页 PPT 逐页 OCR + 当天真实课堂流程 + 孩子表现（脱敏） |
| [第 1 节课课堂复盘与改进建议](docs/classroom/2026-10-17-lesson01-总结.md) | 面向团队的复盘：四个孩子的教学机会、家长反馈的准确结论、明天要改的四处 |

### 首屏素材

`references/MakerX AI造物实验室.png` 是用户提供的首屏视觉参考。本次原型保留该文件作为构图、色彩和品牌关系依据，但首页不把它作为主视觉图片展示，而是用 HTML/CSS/SVG 重建首屏舞台。

![首屏素材](references/MakerX%20AI造物实验室.png)

实测属性（不只是描述）：

- 1774 × 887（2:1），PNG `rgb24`，当前文件大小 `1,423,897` bytes
- 品牌色：深墨 `#111315`、青 `#77DAF8`、长春花蓝 `#7BA4F0`、白高光 `#F8F7FA`
- **约束**：深墨在深色底上对比度仅 1.03:1 → **页面底色必须是浅色**（定为冰蓝 `#E9F2FD`）

> ⚠️ **证据限制**：首屏图的尺寸与像素格式来自当前文件实测；旧研究稿中的透明度统计不适用于当前文件。视觉观感需要用户在浏览器中确认。当前原型使用保守的 `alt` 文案「MakerX AI 造物实验室品牌视觉图」，后续可按最终构图调整。

---

## 运行方式

```bash
pnpm install          # 安装依赖
pnpm dev              # 本地开发服务器
pnpm build            # 生产构建
pnpm preview          # 预览构建产物
pnpm check            # astro check：类型检查
  pnpm test             # 首页与 AI星球工具领域/页面契约测试
```

当前原型包含首页、AI星球项目页和课堂提示词工具；正式课程物料、完整内容集合和项目详情内容会在后续阶段接入。

### 已核对的环境（2026-10-15 实测）

| 项 | 版本 / 结果 |
|---|---|
| Node | `v24.19.0` |
| pnpm | `11.25.0` |
| Git | `2.45.1.windows.1`；仓库已初始化，`main` 已推送并跟踪 `origin/main` |
| 依赖 | `astro ^7.3.8`；dev: `@astrojs/check ^0.9.10`、`typescript ^6.0.3`、`cross-env ^10.1.0`、`@types/node ^26.6.5` |

依赖选择说明（AGENTS.md §2 硬约束 11「不引入重型依赖」）：

- **`typescript` 锁 `^6.0.3` 而不是 latest**：`typescript@7` 与 `@astrojs/check` 的 peer 范围（`^5 || ^6`）冲突。
- **`cross-env`**：只为在 npm 脚本里跨平台设置 `ASTRO_TELEMETRY_DISABLED=1`。Astro 的遥测默认会往 `~/.config/astro` 写配置；本机 `$HOME` 只读，不关掉遥测构建直接崩（`EROFS`）。顺带也符合本项目「不向第三方上报」的一贯立场。
- **`yaml`（dev）**：`check-resources.mjs` 需要独立解析 frontmatter；Zod 那条路径只在 Astro 内部可用。
- **`@types/node`（dev）**：`astro.config.mjs` 用了 `node:url`，`astro check` 需要 node 类型。
- 运行期依赖目前只有 `astro`。

### GitHub 推送配置（2026-10-15 实测）

直连 `github.com:443` 在本机**间歇性超时**（不是稳定可用，也不是稳定不可用）。已配置**仅对 github.com 生效**的代理，不影响 gitee 等其他远端：

```bash
git config --global http.https://github.com/.proxy http://127.0.0.1:7897
```

| 命令 | 退出码 | 关键输出 |
|---|---|---|
| `curl -x http://127.0.0.1:7897 https://github.com` × 12 | `0` | **12/12 成功**，均 `http_code=200`，平均 `1.79s`（`1.53s`–`2.31s`） |
| `curl -4 https://github.com`（直连）× 20 | `28` | **0/20 成功**，全部 `code=000` 超时（10s 上限）。本次窗口内直连持续不可用 |
| `curl -4 https://github.com`（直连）× 8（另一时间窗口） | `0` | **8/8 成功**，`200`，`0.76s`–`3.86s`。**同一配置下直连时通时不通** |
| `curl https://gitee.com`（直连对照） | `0` | `http_code=200`，`2.32s` —— 仅 GitHub 受影响 |
| `git push -u origin main` | `0` | `* [new branch] main -> main` |
| `git ls-remote origin` | `0` | `refs/heads/main` = 本地 `HEAD` = `0c4cbf5` |
| `git rev-list --left-right --count '@{u}...HEAD'` | `0` | `0	0`（无落后/领先） |

`git push` 走代理后，同一路径下连续观察**未再出现失败**。

依赖前提：本机需运行 Clash Verge（`verge-mihomo`）并监听 `127.0.0.1:7897`。代理进程未运行时，`git push` 会退回直连，**可能**超时也可能成功，取决于当时的网络状况。

> ⚠️ **未验证**：间歇性超时的原因（运营商 / DNS / 代理规则 / 对端限速）**未定位**。以上只是可用性测量，不是根因结论。

**推送失败时怎么判断是哪一环**：

| 现象 | 含义 | 处理 |
|---|---|---|
| `Failed to connect to 127.0.0.1 port 7897 ... Couldn't connect to server` | 代理没在跑（Clash Verge 未启动） | 启动 Clash Verge，确认 `127.0.0.1:7897` 在监听 |
| `Failed to connect to github.com port 443 ... timed out` | 代理未生效，走了直连 | 复查 `git config --global --get http.https://github.com/.proxy` |
| `HTTP 401` / `Authentication failed` | 凭证过期（代理已通） | 重新登录；凭证由 Git Credential Manager 管理 |
| 推送很慢或中途断开 | 代理节点带宽不足 | 在 Clash 里换节点 |

### 首页原型验证记录（真实命令 + 退出码 + 关键输出）

| 命令 | 退出码 | 关键输出 |
|---|---|---|
| `pnpm install` | `0` | Astro 7.3.8 与检查工具安装完成 |
| `pnpm test` | `0` | 首页 2 个 + AI星球工具 5 个测试通过 |
| `pnpm check` | `0` | `Result (5 files): 0 errors, 0 warnings, 0 hints` |
| `pnpm build` | `0` | `2 page(s) built`；生成首页与 `dist/lab/001-ai-planet/index.html` |
| `curl -I http://localhost:4321/` | `0` | 本地开发服务器返回 `200 OK` / `text/html` |
| `Invoke-WebRequest http://localhost:4321/` | `0` | 首页返回 `200 OK`，返回 HTML 包含 `hero-stage` 和 `MakerX` |
| 首屏 Hero 资源检查 | `0` | 首页 HTML 不引用 `makerx-hero.png`，装饰使用内联 SVG |

### 浏览器实测（Codex In-app Browser，2026-10-15）

> ⚠️ 以下是当前原型的 DOM / 可访问性与资源检查；视觉观感仍需要你在浏览器中确认。

- 页面标题为 `MakerX AI 造物实验室`，存在 skip link、主导航、`h1`、主张、内联 SVG 舞台和项目档案锚点。
- Hero 是 `100svh` 单列结构，页面首屏不使用 PNG 主视觉；品牌文字和装饰轨道由 HTML/SVG 提供。
- 页面主导航和「探索造物项目」文字 CTA 均指向本页真实存在的 `#project-list`。
- 页面语义树中包含 `AI星球` 项目卡片，状态为「研发中」，没有编造项目数量、模块数量、课程工具或下载入口。
- 已打开本地视觉预览：`Maker` 为唯一可见品牌字样，大型 SVG 玻璃十字承担唯一的 `X`；项目档案标题在桌面视口保持单行。
- 本轮修改后重新执行 `pnpm test`、`pnpm check`、`pnpm build`，均为退出码 `0`；浏览器语义树中 `h1` 的可访问名称仍为 `MakerX`。
- 本轮微调仅将首屏 `X` 向 `Maker` 左移，未改变其结构、配色或立体样式。

### AI星球工具验证记录（2026-10-15）

| 命令 / 检查 | 退出码 / 结果 | 关键输出 |
|---|---|---|
| `pnpm test` | `0` | 首页 2 个 + AI星球工具 5 个测试通过，共 7 个 |
| `pnpm check` | `0` | `0 errors, 0 warnings, 0 hints` |
| `pnpm build` | `0` | 生成 `/index.html` 与 `/lab/001-ai-planet/index.html` |
| 本地开发服务 | 使用已运行的 `http://localhost:4321/` | `pnpm dev` 检测到已有 Astro 服务，复用该服务完成浏览器检查 |
| 浏览器流程 | 已验证 | 首页项目卡片进入 AI星球；7 步填写、汇总、生成中文提示词和复制成功反馈均可见 |

浏览器流程中使用了虚构内容「我的星空屋 / 太空旅行者 / 我的梦想 / 梦幻想象 / 葡萄紫 + 天空蓝 / 中间开花」，未填写姓名等敏感信息。颜色汇总确认按点击顺序生成主色与搭配色；提示词结果只在当前页面内显示。

### 腾讯云部署记录（2026-10-16 实测）

部署方式遵循本机文件 `腾讯云挂新网站操作手册-IP子路径方案.md`：不新建独立 `server` 块，只在现有 Nginx 配置中新增 `/makerx/` location；旧站点目录 `/var/www/sugarcube/` 未覆盖。

- 访问地址：`http://124.222.99.128/makerx/`
- AI星球页面：`http://124.222.99.128/makerx/lab/001-ai-planet/`
- 服务器部署目录：`/var/www/makerx/`
- 子路径构建配置：`astro.config.mjs` 设置 `base: '/makerx'`，内部首页与项目链接均带子路径前缀。
- Nginx 配置：`/etc/nginx/conf.d/sugarcube.conf`；修改前已创建带时间戳备份。

| 检查 | 结果 |
|---|---|
| `pnpm test` | `0`；7 个测试通过 |
| `pnpm check` | `0`；0 errors / 0 warnings / 0 hints |
| `pnpm build` | `0`；首页与 AI星球页构建完成 |
| `nginx -t` | `0`；syntax is ok / test is successful |
| 公网 `/makerx/` | `HTTP 200` |
| 公网 `/makerx/lab/001-ai-planet/` | `HTTP 200` |
| 公网 `/makerx/_astro/BaseLayout.lzNKD0X9.css` | `HTTP 200` |
| 公网旧站点 `/` | `HTTP 200` |
| 公网旧站点 `/introduction/` | `HTTP 200` |

### 复制与汇总修复验证记录（2026-10-16）

修复两处公网反馈：公网 HTTP（IP 子路径）下 `navigator.clipboard` 不可用导致复制总失败；AI星球汇总草图标签与答案分成两行。

- 复制策略：先尝试 `navigator.clipboard.writeText`，失败或不可用则降级到隐藏 `textarea` + `document.execCommand('copy')`，只有真实返回成功才提示「已复制」；两种方式都失败才提示手动复制。实现位于 `src/lib/ai-planet-builder.mjs` 的 `copyTextToClipboard`。
- 汇总布局：`.summary-row` 改为 `dt` + `dd` 两列 grid，同一起始行，`dd` 可换行；标签在 `dt` 文本内补全角冒号。

| 命令 / 检查 | 退出码 / 结果 | 关键输出 |
|---|---|---|
| `pnpm test` | `0` | 14 个测试通过（新增复制 5 个 + 汇总/复制契约 2 个） |
| `pnpm check` | `0` | `0 errors, 0 warnings, 0 hints` |
| `pnpm build` | `0` | 首页与 AI星球页构建完成；产物中含 `execCommand` 降级与 `${term}：` 模板 |
| 本地预览 `127.0.0.1:4322`（安全上下文） | 已验证 | `secure_context=true`；汇总 7 行全部同一行；复制提示「已复制，可以交给 AI 制作网站啦！」；无控制台错误 |
| 局域网 `192.168.0.115:4323`（**非安全上下文**，模拟公网 IP HTTP） | 已验证 | `isSecureContext=false`、`navigator.clipboard` 为 `undefined`；降级路径复制成功并提示「已复制」；临时 `textarea` 复制前后均为 `0` |
| Windows 剪贴板内容比对（有头 Chromium，非安全上下文） | 已验证 | 点击复制后系统剪贴板 195 字符，与页面提示词逐字符一致（`True`） |
| 375px / 768px 窄屏几何 | 已验证 | 汇总各行仍同一行；无横向溢出（`scrollWidth <= innerWidth + 1`） |

以上均在本机 Windows + Chromium 测得；真实手机浏览器仍未测。

### 公网重新部署（2026-10-16 实测）

服务器上**没有安装 Node / npm / pnpm**（已用自动化助手实测：`NO-NODE` / `NO-NPM` / `NO-PNPM`），因此不能在服务器上构建。改用「本机构建 → 推送构建产物分支 → 服务器拉取」的零依赖方式。

- 构建产物推送分支：`deploy`（仅含 `index.html`、`assets/`、`lab/`、`_astro/` 六个文件，不含源码与文档）。
- 服务器拉取地址：`https://codeload.github.com/helenzhan0302-maker/makerx-ai-creation-lab/tar.gz/refs/heads/deploy`（服务器实测可访问，`HTTP 200`）。
- 部署目录：`/var/www/makerx/`；旧版本先备份到 `/var/www/makerx.prev/` 再替换，全部用 `sudo` 执行并重置为 `www-data:www-data`。
- Nginx 配置**未改动**（`/etc/nginx/conf.d/sugarcube.conf` 及其备份保持原样），仅替换静态文件。

| 检查 | 结果 |
|---|---|
| 服务器端 `grep -c execCommand /var/www/makerx/_astro/*.js` | `1`（复制降级逻辑已在线上） |
| 服务器端 `grep -o summary-row ...css` | 命中 `summary-row` |
| 服务器端 `curl`：`/makerx/` / `/makerx/lab/001-ai-planet/` / `/` / `/introduction/` | 全部 `HTTP 200` |
| 公网 `http://124.222.99.128/makerx/`（首页） | `HTTP 200` |
| 公网 `http://124.222.99.128/makerx/lab/001-ai-planet/`（AI星球页） | `HTTP 200` |
| 公网 CSS / JS 资源 | 均 `HTTP 200`，且含 `summary-row` 两列 grid、`overflow-wrap:anywhere`、`execCommand` |
| 公网旧站点 `/`、`/introduction/` | 均 `HTTP 200`（未受影响） |

**公网功能实测（无头 Chromium 直连公网 IP，非安全上下文）**

| 检查 | 结果 |
|---|---|
| `window.isSecureContext` | `false` |
| `typeof navigator.clipboard` | `undefined`（正是原先复制失败的根因） |
| 复制按钮反馈 | 「已复制，可以交给 AI 制作网站啦！」 |
| 临时 `textarea` 残留 | `0`（复制后已清理） |
| 汇总 7 行 | 全部标签与答案同一行（`sameLine: true`） |
| 控制台错误 / 横向溢出 | 无 / 无 |
| Windows 系统剪贴板内容比对 | 195 字符，与页面提示词逐字符一致（`True`） |

有头 Chromium 点击复制后，Windows 系统剪贴板确实收到了与页面提示词逐字符相同的 195 字符文本，说明非安全上下文下的降级复制真实生效，不是只显示成功文案。

### AI星球页排版优化（2026-10-16）

按用户要求优化 AI星球页（`/makerx/lab/001-ai-planet/`）的字体与布局，参考 `dino-kupinic.dev` 项目详情页的排版原则（面包屑式层级、克制字号、标签 chips、单列可读宽度、大留白）。只借鉴排版原则，未复制其配色、字体或任何资产。

改动要点（`src/styles/ai-planet-builder.css` 与 `src/pages/lab/001-ai-planet.astro`）：

- 页标题 `AI星球` 原用 `clamp(4rem, 14vw, 11rem)` + `letter-spacing: -0.12em`，中文字形互相挤压重叠；改为 `clamp(2.6rem, 5.5vw, 4.25rem)` + `-0.02em`、行高 1.08。
- 内层小标题（工具区、步骤标题、结果标题）同步收小字号与负字距，避免中文碰撞。
- 内容宽度从 1440px 收到 1180px，首屏介绍区最大 52rem，输入框限宽 36rem，正文行高提到 1.7。
- 首屏三条说明改为 chips（参考站的标签样式），页头状态徽标改为圆角胶囊。
- 步骤区最小高度 30rem → 20rem，卡片与内边距整体收紧，减少大面积空白。
- 媒体查询同步整理：900px 与 600px 下卡片降为两列，移除已失效的 `builder-heading` 网格覆盖规则。

| 命令 / 检查 | 结果 |
|---|---|
| `pnpm test` | `0`；14 个测试全部通过 |
| `pnpm check` | `0`；0 errors / 0 warnings / 0 hints |
| `pnpm build` | `0`；首页与 AI星球页构建完成 |
| 本地 375px / 768px / 900px 几何 | 无横向溢出（`scrollWidth <= innerWidth + 1`）；900px 下卡片正确降至两列 |
| 本地完整流程 | 7 步填写 → 汇总 → 生成提示词全部正常；控制台无 error / warn |

#### 已知问题（本次未修）

~~生成的提示词编号跳号~~ —— **已于同日修复**，见下一节。

### AI星球页紧凑化与提示词编号修复（2026-10-16）

用户反馈「卡片布局下字太大，一页内容显示不下」，并要求修复提示词跳号与不带斜杠的 `/makerx` 入口。

**1. 提示词固定编号**（`src/lib/ai-planet-builder.mjs`）

- 原来只在填写了自我介绍时才输出「三、」，未填写时编号从「二、」直接跳到「四、」。
- 改为**始终输出「三、」**：有内容时列出，没有时写作「三、我想这样介绍自己：这次先不写」。编号固定为连续的一到七。
- 新增测试 `prompt keeps fixed numbering when introduction fields are empty` 覆盖两种情况。

**2. 排版紧凑化**（`src/styles/ai-planet-builder.css`）

- 首屏标题 `clamp(2.6rem,5.5vw,4.25rem)` → `clamp(2.1rem,4.2vw,3.25rem)`；导语、chips、页头内边距同步收小。
- 工具区标题 `clamp(1.6rem,3vw,2.35rem)` → `clamp(1.3rem,2.2vw,1.75rem)`；步骤标题 `clamp(1.35rem,2.4vw,1.8rem)` → `clamp(1.15rem,1.8vw,1.45rem)`。
- 步骤区 `min-height: 20rem` → `0`，内边距减半；卡片 `min-height: 7.5rem` → `0`（由内容撑开），内边距与圆角同步收紧。
- 头像卡片列数 3 → 4 列，浅色卡片描述字号 0.82rem → 0.76rem；布局/风格保持 3 列。
- 输入框、按钮、汇总行、结果区、代码块的字号与间距整体下调一档。

**3. 各步骤实测高度（1440px 宽）**：介绍自己 294px、网站内容 416px、网站风格 339px、颜色 430px、页面布局 391px、汇总 427px、头像 631px —— 全部可在常见笔记本一屏内看完（改动前头像步骤为 732px 且含大量空白）。

| 命令 / 检查 | 结果 |
|---|---|
| `pnpm test` | `0`；15 个测试通过（新增编号测试 1 个） |
| `pnpm check` | `0`；0 errors / 0 warnings / 0 hints |
| `pnpm build` | `0`；产物 CSS 哈希更新为 `001-ai-planet.B2ISDxcZ.css` |
| 本地 1440px 各步骤几何 | 见上，最高 631px |
| 本地 375px 窄屏 | 无横向溢出（`scrollWidth 360 <= innerWidth 375`） |
| 提示词输出实测 | 未填自我介绍时编号为「一…七」连续，第三条显示「这次先不写」 |

**4. `/makerx` 不带斜杠入口** —— 见下一节。

### `/makerx` 无斜杠入口修复 + 上线部署（2026-10-16）

**问题**：`http://124.222.99.128/makerx`（不带结尾斜杠）落到 nginx 原有的 `location /`，被三颗方糖官网兜底接走，显示的是旧站首页。

**修复**：在 `/etc/nginx/conf.d/sugarcube.conf` 的 `location /makerx/ {` **之前**插入一条精确匹配：

```nginx
location = /makerx {
    return 301 /makerx/;
}
```

与配置里已有的 `/introduction` → `/introduction/` 是同一套写法。改动由 `scripts/server-deploy.sh` 自动完成：先备份配置，插入后用 `python3` 精确插到锚点前；`nginx -t` 不通过就自动回滚且不 reload。

**部署通道**：OrcaTerm 网页终端（腾讯云控制台 → 轻量应用服务器 → 登录 → **免密连接（TAT）**）。服务器不接受本机 SSH 密码登录（`root` / `ubuntu` / `lighthouse` / `admin` 均返回 `AuthenticationException`），本机 `paramiko` 直连不可用。终端为 canvas 渲染读不到回显，因此用「命令执行 → 结果写入临时文件 → 从公网 HTTP 读回」的方式回收输出，事后已删除全部探针文件。

| 命令 / 检查 | 结果 |
|---|---|
| `bash scripts/server-deploy.sh`（服务器端，root） | `EXIT=0`；`SOURCE-OK` / `SITE-BACKUP-OK` / `SITE-REPLACED-OK` / `CONF-BACKUP-OK` / `REDIRECT-WRITTEN` / `NGINX-RELOAD-OK` |
| `nginx -t` | `test is successful`（另有两条与本次无关的既有 warning：`duplicate MIME type "text/html"`、`conflicting server name "124.222.99.128"`） |
| 公网 `http://124.222.99.128/makerx` | `301` → `http://124.222.99.128/makerx/` |
| 公网 `http://124.222.99.128/makerx/` | `200` |
| 公网 `http://124.222.99.128/makerx/lab/001-ai-planet/` | `200` |
| 公网 `http://124.222.99.128/makerx/_astro/001-ai-planet.B2ISDxcZ.css` | `200`；本地比对含 `clamp(2.1rem,4.2vw,3.25rem)` 与 `choice-grid--avatars` |
| 公网 `ProjectPromptBuilder...BYdAZc3U.js` | `200`；含「这次先不写」，确认编号修复已上线 |
| 公网 `http://124.222.99.128/`（三颗方糖旧站） | `200`；标题仍为「三颗方糖AI增长 \| 让AI主动推荐你的品牌」 |
| 公网 `http://124.222.99.128/introduction/`（旧站介绍页） | `200` |
| 浏览器实测 1440px 各步骤高度 | 名字 257px、头像 631px、自我介绍 294px、网站内容 416px、风格 339px、颜色 430px、布局 374px、汇总 427px |
| 浏览器实测 1440px 页标题字号 | `52px`（`clamp(2.1rem,4.2vw,3.25rem)` 在 1440px 的上限值） |
| 浏览器实测完整流程 | 7 步 → 汇总 → 生成提示词，编号「一…七」连续，未填自我介绍显示「三、我想这样介绍自己：这次先不写」 |
| 横向溢出（1440px） | 无（`scrollWidth 1425 <= innerWidth 1440`） |
| 服务器备份 | 站点 `/var/www/makerx.prev.20261016155924`；配置 `sugarcube.conf.bak.20261016155924` |

> ⚠️ 首次验证公网页面时读到的是浏览器缓存里的旧 CSS（页标题 68px），强制刷新后才是 52px。判断线上样式是否更新应看 CSS 文件名哈希或绕过缓存。

### 提示词开头对齐工作纸 + 布局卡片去蓝图（2026-10-17）

用户反馈两件事：布局选择卡片上的蓝色示意图不想要；生成的提示词开头要改成工作纸里的那句话。

**1. 提示词开头**（`src/lib/ai-planet-builder.mjs:184`）

- 原：`请根据下面的想法，帮我设计一个个人网站。`
- 现：`请帮我做一个【个人网站】。下面是我的想法：`
- 与课堂工作纸（`references/research/2026-10-14-lesson01-extract.md` §三）和 `docs/content-model.md` 的 `p-site-template` 完全一致。此前设计稿里的写法属于历史版本，已在 `docs/decisions.md` 记为 C-16。

**2. 布局卡片去掉蓝色示意图**（`src/components/ProjectPromptBuilder.astro:182`、`src/styles/ai-planet-builder.css`）

- 删掉五个布局卡片上的 `.layout-glyph`（蓝青渐变方块拼出的队形示意图），改用与风格卡片一致的 `✦` 标记。
- CSS 里对应的 `.layout-glyph*` 共 12 条规则一并删除，不留死代码。记为 C-17。

| 命令 / 检查 | 结果 |
|---|---|
| `pnpm test` | `0`；16 个测试通过（新增布局卡片断言 1 个） |
| `pnpm check` | `0`；0 errors / 0 warnings / 0 hints |
| `pnpm build` | `0`；CSS 哈希更新为 `001-ai-planet.DmH2DGXH.css`，JS 为 `...DyPNS5W-.js` |
| 构建产物比对 | JS 含「请帮我做一个【个人网站】」；`layout-glyph` 在 JS / CSS / HTML 中均已不存在 |
| 浏览器实测（本地 1440px） | 布局步骤 5 张卡片，标记均为 `✦`，页面无 `linear-gradient(180deg, var(--brand-cyan)` |
| 浏览器实测完整流程 | 生成提示词首行为新开头句；编号「一…七」仍连续 |

**3. 删掉提示词结尾的附加句**（`src/lib/ai-planet-builder.mjs:210`）

- 原提示词在七段之后还跟了一行「请先理解我的想法，再用适合小学生的方式完成网站。不要添加我没有提到的个人信息。」——这行是实现时自行加的，**不在课堂工作纸的模板里**，用户确认要删。
- 现在提示词以「七、页面布局：……」结束。把用户填的内容原样交给 AI，不再附加模板之外的话。
- 隐私保护不依赖这一句：页面本身就不收集姓名等个人信息（`src/content.config.ts` 与 `scripts/check-resources.mjs` 的共享正则仍在构建时强制）。

| 命令 / 检查 | 结果 |
|---|---|
| `pnpm test` | `0`；16 个测试通过（新增两条断言：不出现结尾句、以第七行收尾） |
| `pnpm check` | `0`；0 errors / 0 warnings / 0 hints |
| 浏览器实测完整流程 | 提示词末行为「七、页面布局：竖着一路排」，全文不含「不要添加我没有提到的个人信息」 |

> ✅ **上线状态（2026-10-17 已部署）**：三项改动已上线。
>
> 部署过程：腾讯云控制台与 OrcaTerm 的登录会话当天过期，重新登录被图形验证码拦住，由用户本人完成验证后继续。OrcaTerm 二次连接又要求微信扫码 MFA，因此改走**自动化助手（TAT）**通道：在上海地域创建命令 `makerx-deploy-20261017`（`cmd-8id45dxm`），内容为「下载 `deploy` 分支 tarball → 备份 `/var/www/makerx` → 替换 → 重置属主 → 自检」，对实例 `lhins-ce4mfndw` 执行，`ExitCode 0`、耗时 15 秒。
>
> ⚠️ 上一轮卡住时，腾讯云控制台曾在 OrcaTerm 报出「当前账号中没有找到该实例」，重连后恢复正常；TAT 通道全程未受影响。

### 上线后公网实测（2026-10-17）

| 检查 | 结果 |
|---|---|
| `http://124.222.99.128/makerx` | `301` → `/makerx/` |
| `http://124.222.99.128/makerx/` | `200` |
| `http://124.222.99.128/makerx/lab/001-ai-planet/` | `200`；HTML 引用 `DmH2DGXH.css` 与 `CdLGBQV6.js`（旧哈希 `B2ISDxcZ` / `BYdAZc3U` 已不在页面中） |
| `http://124.222.99.128/`（三颗方糖旧站） | `200` |
| `http://124.222.99.128/introduction/` | `200` |
| 线上 JS 内容 | 含「请帮我做一个【个人网站】」；**不含**「不要添加我没有提到的个人信息」 |
| 线上 CSS 内容 | **不含** `layout-glyph` |
| 线上浏览器实测（布局步骤） | 5 张布局卡片，标记均为 `✦`，页面无 `.layout-glyph` 元素 |
| 线上浏览器完整流程 | 7 步 → 汇总 → 生成提示词；首行为新开头句，末行为「七、页面布局：竖着一路排」，全文无附加结尾句 |
| TAT 执行记录 | `inv-ua0t8j07fu`，命令成功，`ExitCode 0`，15 秒 |
| 服务器备份 | 站点 `/var/www/makerx.prev.<时间戳>`（由部署命令生成） |

### 服务器旧备份清理（2026-10-17）

历史部署累积了多份站点备份、nginx 配置备份与 `/tmp` 工作目录。经用户确认后，用 TAT 命令 `makerx-cleanup-20261017`（`cmd-q5hb0s3k`）清理，**每类保留最新一份作为回滚点**。

| 项目 | 清理前 | 清理后 |
|---|---|---|
| 站点备份 `/var/www/makerx.prev*` | 4 份（`.prev`、`.prev2`、`.prev.20261016155924`、`.prev.20261017101711`） | 保留 `makerx.prev.20261017101711` |
| nginx 配置备份 `/etc/nginx/conf.d/*.bak*` | 3 份 | 保留 `sugarcube.conf.bak.20261016155924` |
| `/tmp/makerx-*` 工作目录 | 5 份 | 保留 `makerx-20261017101711`（最新一次部署的临时目录） |

清理后服务器自检（同一次命令内执行）：`makerx=200`、`lab=200`、`root=200`；`df -h` 显示根分区 40G 中已用 7.9G（21%）。
TAT 执行记录 `inv-va0tvsghdr`，**命令成功，ExitCode 0，耗时小于 1 秒**。

### 第 2 节课升级工坊（2026-10-22）

新增路由 `/makerx/lab/001-ai-planet/upgrade/`：四步点选（头像 → 鼠标特效 → 屏幕宠物 → 检查并生成），产出修改型中文提示词、自检清单与路演卡。第 1 节课页只加了「第 1 节课」标签与进入第 2 节课的入口，七步生成器未改动。

**命令实测**

| 命令 | 结果 |
|---|---|
| `pnpm test` | 28 项，28 通过，0 失败，0 跳过（基线 16 + 新增 12） |
| `pnpm build` | 通过，3 个页面；`dist/lab/001-ai-planet/upgrade/index.html` 已生成 |
| `pnpm check` | 11 个错误，全部在 `design/poster/**`（未跟踪文件）；`src/` 下 0 个错误 |
| 反向验证 | 把 `MAX_AVATAR_EFFECTS` 改成 4 → 测试变红（27 过 1 失败）；改回 3 → 28 全绿 |

**浏览器实测**（Playwright + Chromium，本地 dev server）

| 检查 | 实测值 |
|---|---|
| 375px | `scrollWidth=375`，`clientWidth=375`，无横向溢出 |
| 768px | `scrollWidth=768`，`clientWidth=768`，无横向溢出 |
| 1440px | `scrollWidth=1440`，`clientWidth=1440`，无横向溢出 |
| `prefers-reduced-motion: reduce` | 头像 `animationName=none`；24 张选项卡仍在，文字不丢失 |
| 眼睛跟随 | 瞳孔 `cx` 49 → 51.4、`cy` 62 → 64.0，仍在眼眶范围内 |
| 摸头 | 鼠标进入头顶热区后气泡 `is-visible`，头像回弹 |
| 尾焰 | 预览框内 canvas 实测尺寸 288×154，移动后绘制 97 个像素 |
| 复制提示词 | 反馈「已复制，可以粘贴给 AI 啦！」，剪贴板内容与提示词一致 |
| 提示词首行 | 「请在我上一条消息做好的网站基础上继续修改，做出「我的AI星球 2.0」。」 |
| 路演卡 | 三问齐全：介绍网站 / 相对 1.0 改了什么 / 未来还想怎么改 |

**未验证**：真实手机与微信内置浏览器未测；真实课堂使用效果待验证。

### 第 2 节课视觉与结构改版（2026-10-23）

按浏览器反馈做了 8 项调整：课程总览页拆成两张独立卡片（Lesson 1 内容原样保留）、头像重绘为厚涂漫画风、六个效果环绕头像排布、发光呼吸加强、摸头加眯眼与气泡、换表情改为点击、五种尾焰差异拉开、宠物改为七只自绘 SVG + 暖光微缩场景。

**路由**

| 路径 | 内容 |
|---|---|
| `/makerx/lab/001-ai-planet/` | 课程总览：两张卡片分别进入第 1 / 第 2 节课 |
| `/makerx/lab/001-ai-planet/lesson-1/` | 第 1 节课七步生成器（内容未改，新增返回总览与第 2 课入口） |
| `/makerx/lab/001-ai-planet/upgrade/` | 第 2 节课升级工坊 |

**命令实测**

| 命令 | 结果 |
|---|---|
| `pnpm test` | 28 项，28 通过，0 失败（两条旧路径断言改为总览页 + lesson-1 页，断言强度未降低） |
| `pnpm build` | 通过，4 个页面（首页、总览、lesson-1、upgrade） |
| `pnpm check` | 11 个错误，全部在 `design/poster/**`（历史遗留、未跟踪）；`src/` 下 0 个错误 |

**浏览器实测**（Playwright + Chromium，本地 dev server，`/makerx/` 基路径）

| 检查 | 实测值 |
|---|---|
| 总览页 | 2 张 `.lesson-card`，链接分别为 `lesson-1/` 与 `upgrade/`，标题「造出你的 AI星球」「升级你的 AI星球 2.0」 |
| 375 / 768 / 1440px | `scrollWidth` 均等于 `clientWidth`，三档都无横向溢出 |
| 发光呼吸 | 连续采样 `opacity` 0.88 → 0.99 → 0.74 → 0.34，`transform` 同步在 0.90–1.14 间缩放，`animationName=avatar-breathe` |
| 点击换表情 | 嘴型 `d` 从 `M88 133q12 12 24 0` 变为 `M85 131q15 19 30 0` |
| 摸头 | 气泡 `is-visible=true`，`is-patting=true`，眯眼图层 `opacity=1` |
| 五种尾焰 | 星尘 826、彩虹 1705、气泡 4384、像素 959、涟漪 10854 个非透明像素，色相分布互不相同 |
| 宠物切换 | 8 个选项逐个切换，每次只有 1 个 `data-pet-shape` 可见 |
| 复制提示词 | 反馈「已复制，可以粘贴给 AI 啦！」，剪贴板与提示词逐字一致 |
| 提示词内容 | 含「小机器狗」「豆豆」「点击换表情」，修改型开头保持不变 |
| `prefers-reduced-motion: reduce` | 头像、光圈、光环、宠物待机、台灯、萤火虫的 `animationName` 全为 `none`；18 张选项卡仍在 |
| 控制台 | 0 条 error / pageerror |

**未验证**：真实手机与微信内置浏览器未测；宠物与头像的实际观感仍需用户确认（本环境只能报告像素与几何测量，不能声称「看过」效果）。

### 头像互动升级：Mesh Avatar Studio（2026-10-23）

按用户要求，头像不再使用 CSS 假眼睛 / 眼皮贴片，改为**开源 Mesh Avatar Studio 生成的真实可动模型**。本地工程位于 `D:\Workspace\mesh-avatar-studio\projects\my-particle-avatar`，站点只发布不含源图的网页包 `public/assets/avatar/particle-avatar.mavatar`（1,279,610 bytes，引用时带 `?v=2` 避免缓存旧包）。

**实现方式**

| 能力 | 实现 | 状态 |
|---|---|---|
| 真实可动头像 | 官方 `<mesh-avatar>` Web Component + `mesh-avatar-element@0.1.1` WebGL 运行时；900×900 工程、8 个眼部图层、可编辑 rig | 已接入并实测加载 |
| 眼睛跟着鼠标看 | `pointermove` 映射到运行时的 `gazeX / gazeY`，同时轻微驱动 `angleX / angleY` | 已验证，参数随鼠标变化 |
| 摸头有反应 | 头像顶部 32% 热区触发 `shy` 表情 + `tilt` 动作 + 气泡「嘿嘿，好痒～」，不再用会闭眼 2 秒的 `giggle` | 已验证气泡与表情 |
| 点击换表情 | 依次切换 `shy / surprise / angry / neutral`，表情保持到下一次点击；默认勾选，无需额外开启 | 已验证四档均生效 |
| 发光呼吸 / 轻轻浮动 | 作用在 WebGL 舞台外框；`prefers-reduced-motion` 下关闭 | 已验证 |
| 会眨眼 | 勾选时交还运行时做自然短眨（约 0.17 秒）；不勾时眼睑固定睁开 | 已验证 1.4 秒内 5 帧闭合 |
| 手机触摸 | 触摸头像触发摸头；`touch-action: manipulation` | 仅桌面模拟，真实手机未测 |
| 键盘 | 头像 `tabindex=0`，Enter / 空格换表情 | 已验证结构 |

**三步独立提示词（2026-10-23）**

第 2 课从「一次生成总提示词」改为三步：**头像 → 鼠标特效 → 屏幕宠物**。每一步生成后显示「下一步」按钮，必须复制并确认改好才继续；鼠标特效或宠物选择「这次不加」时直接跳过。每段提示词都固定写明「只改这一块」「前面已完成的升级保留」「不要重做网站」。

**命令实测（2026-10-23，Windows PowerShell）**

| 命令 | 结果 |
|---|---|
| `pnpm test` | 31 项，31 通过，0 失败 |
| `pnpm build` | 通过，4 个页面（首页、总览、lesson-1、upgrade） |

> 注意：同一目录同时被 Windows 与 WSL 使用。WSL 侧执行构建会因缺少 `@rolldown/binding-wasm32-wasi` 失败；**构建与测试统一用 Windows PowerShell**。

**浏览器实测（Chromium 151 headless + Playwright，`localhost:4321`）**

| 检查 | 实测值 |
|---|---|
| 真实头像加载 | `customElements` 已注册；`mesh.avatar` 存在；Shadow DOM canvas 336×336；无 pageerror |
| 视线跟随 | 鼠标移到头像右侧后 `gazeX=0.5715`、`angleX=3.06°`，视线真实偏移 |
| 摸头 | 气泡 `is-visible`，文案「嘿嘿，好痒～」 |
| 点击换表情 | 连点依次得到 `shy → surprise → angry → neutral`，气泡同步为「嘿嘿，有点害羞～ / 哇，被发现啦！ / 哼，我可是很认真的！ / 今天也要发光！」；3 秒后仍保持所选表情 |
| 随机闭眼 | 关闭 `setAutoMotion` / `setAutoIdle` 后，未勾「会眨眼」时 5 秒内 `eyeROpen` 恒为 1.000，不再出现 1.8 秒的长闭眼 |
| 第 1 步提示词 | 只含「头像效果：眼睛跟着鼠标看、发光呼吸」，不含鼠标或宠物内容 |
| 第 2 步提示词 | 只含「鼠标特效：星尘拖尾」，不含头像或宠物内容 |
| 第 3 步提示词 | 只含「屏幕宠物：小机器狗」，并显示路演卡 |
| 跳过分支 | 鼠标特效选「这次不加」→ 标题「第 2 步：这一步先跳过」，提示词与复制按钮隐藏，「下一步」保留 |
| 390px 移动端 | `scrollWidth=390`、`innerWidth=390`，无横向溢出；头像宽 304.8px |
| 控制台 | 0 条 pageerror；仅有预期警告 `sprites.json` 缺失（尚未生成差分表情，不影响基础动作） |

**未验证 / 已知限制**：

- 尚未生成 drawn variants（闭眼 / 半闭 / 微笑眼、嘴型差分图）；当前表情由运行时参数与内置动作实现，`sprites.json` 警告属预期。若要更精细的闭眼与口型，需要后续生成差分素材（会先把源图与蒙版发给图像模型，需用户另行确认）。
- 头像底板 `built/base.png` 的眼窝原先被切成扁平肤色，闭眼会露出色块；本次已用同侧脸颊的真实珠粒皮肤重建，并用闭眼截图确认无平板色块、无下眼睑糊片。
- 真实手机、微信内置浏览器未测；WebGL2 不可用的设备会显示静态说明，但头像本身不播放。
- 头像最终观感仍需用户确认。

### 尚未核对 / 未验证

- **真实移动设备**（iOS Safari、Android Chrome、微信内置浏览器）—— 未测。
- **375px、768px、1440px 三档运行时几何**—— AI星球工具页 375px / 768px 已实测（见上一小节，无横向溢出）；首页与 1440px 档尚未逐档测量。
- **`prefers-reduced-motion` 运行时切换**—— 已有 CSS 降级规则，尚未在浏览器中切换系统偏好实测。
- **关闭 JavaScript 的运行时页面**—— 已通过“无 JS 时 CSS 不隐藏内容”的代码结构设计，尚未在浏览器上下文中实测。
- **真实屏幕阅读器**（VoiceOver / NVDA）—— 未测；目前只检查语义属性。
- **真实移动网络**（手机 4G/5G、微信内置浏览器）—— 当前仅从外部公网请求验证，尚未在真实手机网络中手动打开。
- **canonical / sitemap**—— 当前部署使用 IP 子路径，没有配置真实域名，也未生成 canonical / sitemap。
- **视觉观感**—— 已提供本地浏览器预览，但最终是否符合你的审美需要你确认。

---

## 内容如何新增一个实验（后续内容系统规划）

以下流程来自 Phase 0 内容模型，当前 Hero 原型尚未接入内容集合和详情页模板。

1. 复制 `src/content/projects/_template.md` 为 `002-<slug>.md`（文件名决定路由 `/lab/002-<slug>/`）。
2. 按 [内容模型](docs/content-model.md) 填字段；不确定的信息写进 `openQuestions[]` 或标「待确认」，**不要编造**。
3. 名称未定的项目设 `status: "developing"` + `pageState: "coming-soon"`：**不会**生成详情路由，首页卡片显示成虚线框、不可点，页脚只显示文字不显示链接。
4. 物料先标 `pending`，等**真实文件存在 + 公开授权确认**后再切 `ready`，并补 `path` 与 `license`。
5. 内容系统接入后再跑完整的物料与死链检查；当前原型使用 `pnpm test`、`pnpm check` 和 `pnpm build`。

> 第 3 条的「不需要改组件」是实测过的：开发时临时加过一份 `coming-soon` 实验，卡片按预期变成不可点；
> 改成 `live` 后路由、首页入口、上下页导航全部自动出现。**唯一需要留意的地方是「谁可以出现在链接里」**——
> 所有生成站内链接的地方都要先过 `hasDetailRoute()`（`src/lib/projects.ts`），否则会造出指向不存在路由的死链。

### 物料文件放在哪里

`public/assets/` 是**唯一**允许放可下载课程物料的地方（内容文件里的 `resources[].path` 必须写 `assets/...` 或 `downloads/...`）。

放文件之前必须同时满足两件事，缺一不可：

1. **文件真实存在**（不是占位、不是空白模板）。
2. **已确认可以公开**。第一版没有登录系统，凡发布出去的静态文件**任何人都能访问**。

只有两件都满足，才把内容文件里的物料从 `state: "pending"` 改成 `"ready"`，并补上 `path` 与 `license`。
`scripts/check-resources.mjs` 会在每次构建前逐条核对文件是否真的在磁盘上，对不上就**阻断构建**。

还没准备好的物料保持 `pending`：页面只显示「待补充」和说明，**不会渲染下载链接**。宁可少一个下载，也不给一个点不开的链接。

---

## 需要用户拍板的事（阻塞项）

这些是开发过程中**刻意没有自行假设**的点。默认值都已可运行，但需要你确认或提供材料：

| # | 事项 | 当前默认 |
|---|---|---|
| D-01 | 造物黄 `#FFC53D` 的去留（是否用于 CTA / 高亮） | 令牌已声明、**全站 0 次使用**；主按钮依旧是深墨 `#111315` |
| D-08 | 首屏图 `alt` 文案 | 临时文案（只能从像素统计与 OCR 推出「左深墨字 + 右青蓝装置」这类可测量事实，**没有人看过这张图**） |
| D-02 | 「模块数量」统一口径（工作纸 5 站 / 提示词模板 3 个空位 / PPT 收尾说 4 个） | 全站与内容文件中**不出现任何具体个数**，改列为 `openQuestions`；由脚本拦截 |
| D-04 | 课程物料的公开授权 | 6 份物料全部 `pending`，页面显示「待补充」，不渲染下载链接 |
| D-05 | 联系方式 | 显示「待补充」；脚本会拦截手机号/邮箱等真实联系方式 |
| D-03 | 孩子实际使用的建站工具 | `prerequisites.tools` 只写类别 + 「待确认」，不写产品名 |
| — | 第 2 节课教案 | 仓库与本机都没有这份文件 → 课次 02 只写「待确认」，**不补一段看起来合理的流程** |
| — | 部署域名与方式 | 未定。定了之后在 `astro.config.mjs` 里补 `site`，才能生成正确的 canonical 与 sitemap |
| — | 每步时长 | 只有「工作纸填写 10 分钟」有原文出处；其余显示「时长待确认」，没有自行分配 90 分钟 |

---

## 约束摘要

- 第一版不做登录、数据库、支付、上传、学生管理、完整 LMS。
- 不收集、不公开儿童真实个人信息；示例一律使用虚构代号。
- 不生成虚假课程文件或指向不存在文件的下载链接；`ready` 状态由构建前脚本强制校验文件真实存在。
- **不编造未确认的课程细节**（例如模块数量、第 2 节课流程）。
- 只借鉴参考站的设计原则，不复制其源代码、图片、字体、文案或独特视觉作品。
- 页面响应式、键盘可用、尊重 `prefers-reduced-motion`；一页只有一个主按钮。
- 文档互相矛盾时，按 [决策优先级](docs/decisions.md) 判定并记录，**不静默选一个版本执行**。

完整约束见 [AGENTS.md](AGENTS.md)。
