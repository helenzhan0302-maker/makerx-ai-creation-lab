# 参考站第一手实测记录

- 日期：2026-10-14
- 方式：真实浏览器渲染（Playwright）后读取 DOM、可访问性树、计算样式、`@keyframes`、`prefers-reduced-motion` 规则。
- **限制（重要）**：本环境的视觉模型不可用（`modlens` 与图像输入均返回 401 / 「模型不支持图像输入」）。因此以下结论**全部来自可测量的代码事实**，不包含主观观感判断（例如「看起来很有质感」这类描述一律不写）。截图未做人工判读。
- 被排除的工具：`crawler` skill 的 HTTP 抓取因本机 `no_proxy` 含不可解析条目（`<local>`、`[::1]`）而报 `httpx.InvalidURL`；`web_fetch` 对 JS 重站点只能取到几乎空的内容（haoqi.design 仅返回 `HAOQI©2026`）。故改用浏览器实测。

---

## 一、haoqi.design（任务书点名的首要参考）

### 实测到的结构与做法

**1. 固定式「仪表盘外壳」**
- `<header>` 为 `fixed inset-0 flex flex-col justify-between`，铺满视口、`pointer-events-none`。
- 顶栏：站名 / `Work` / `Contact` / `THEME[A]` / `SOUND[|]`。
- 底栏：时钟 `22:40 19°C`、`GMT+8 CN`、坐标 `0597 X 0379 Y`。
- 正文在内部 `overflow-y-auto overscroll-contain no-scrollbar lenis` 容器里滚动（Lenis 平滑滚动）。
- 效果：内容像在**一台仪器的面板里**滚动。这类「外壳 + 内滚动」很适合做成实验室「实验舱」的感觉。

**2. 色彩（计算样式实测）**
| 用途 | 值 |
|---|---|
| 页面底色 | `rgb(251, 250, 244)` — 米白 / 纸感 |
| 文字与分隔线 | `rgb(0, 0, 0)` 纯黑（边框色出现 239 次，全站发丝网格） |
| 唯一强调色 | `#C0FE04` — 荧光酸绿（用于手绘 SVG 签名描边） |
| 次级文字 | `rgba(54, 54, 48, 0.6)` |
| 另有 | `rgba(54, 54, 48, 0.32)`、一层 `mix-blend-difference` 的固定覆盖层 |

→ **底色 + 黑色发丝线 + 单一高饱和强调色**，仅 3 类颜色承担全部视觉。这是「克制底色 + 有表现力主视觉」的实证。

**3. 字体**
- 仅一种自定义可变字体：`tiktok`（weight `100 900`，`document.fonts` 显示 `status: loaded`）。
- 另有等宽风格的 `font-mono-2` 类用于 HUD 顶底栏，制造「工程 / 终端」气质。
- ⚠️ 该字体是第三方品牌字体，**不可复制字体文件**；本项目需选可授权替代品。

**4. 首屏文案层级（实测顺序）**
```
眉标：Design & Engineering
主张：Thinking in systems. Designing with care.        ← 视觉最大
自述：I'm Haoqi Wen, leading Design Engineering and AI exploration at ■■■■■■…
      Outside work, I build design tools for team efficiency.
落款：I bring craft & taste to digital work            ← 手绘 SVG 签名描边动画
```
- 「■■■■■■」是**故意的脱敏**（隐藏雇主名）。这既是趣味手法，也正好是儿童隐私场景可直接复用的思路：**用遮蔽/代号代替真实信息，而且是设计的一部分，不像缺陷。**

**5. 项目条目的档案式结构（实测链接文本）**
```
Coding Project | Reunimos™        | 2024-2026
Coding Project | Inspire Mono     | 2025
aDrive 阿里云盘 | 2020-2022
Shore Icon     | 2022
Teambition     | 2018-2020
FoF: See Hear Touch | 2022 | event↗
```
→ 结构 = **类型标签 + 名称 + 年份（+ 外部标记）**。本项目改写为：**编号 + 项目名 + 课时/时长 + 状态**。

**6. 动效清单（`@keyframes` 实测）**
`caret-blink`（终端光标）、`ltBlink`、`rtSpin`（无限旋转）、`hsstFadeIn` / `hsstFadeOut`、`svg-sign-draw` / `svg-sign-show`。
- 签名描边实现（从 DOM 读到）：
  ```css
  .svg-sign__path { opacity: 0; fill: none; }
  .svg-sign.is-drawing .svg-sign__path {
    animation: svg-sign-show 0s linear var(--path-delay) forwards,
               svg-sign-draw var(--path-dur) cubic-bezier(0.65,0,0.35,1) var(--path-delay) forwards;
  }
  @keyframes svg-sign-draw { to { stroke-dashoffset: 0; } }
  ```
  每条路径用内联变量 `--path-len / --path-dur / --path-delay` 做**错峰描边**，产生「有人在现场写下来」的感觉。
- 过渡：`opacity`、`width`、颜色类（Tailwind 的 color/bg/border 组）。
- **没有** WebGL / Three.js；只有一个全屏 `<canvas>`（1268×632）与若干内联 SVG。
- **全站零 `<img>`**：所有视觉都是矢量 / canvas 绘制。

**7. `prefers-reduced-motion` 处理（实测到的 4 条规则）**
```css
@media (prefers-reduced-motion: reduce) { .motion-reduce\:transition-none { transition-property: none; } }
@media (prefers-reduced-motion: reduce) { html, body { scroll-behavior: auto !important; } }
@media (prefers-reduced-motion: reduce) { .rt-rotate-infinite { animation: auto ease 0s 1 normal none running none; } }
@media (prefers-reduced-motion: reduce) {
  .svg-sign.is-drawing .svg-sign__path { animation: none; stroke-dashoffset: 0; opacity: 1; }
}
```
→ 关键做法：**不是把动画变慢，而是让元素直接处于「最终已完成」状态**（描边立即完整显示）。本项目必须照此办理。

**8. 可访问性（实测）**
- 优点：装饰 SVG 标了 `aria-hidden="true"`；按钮有语义化 `aria-label`（`"Theme: system"`、`"Sound playing, click to pause"`）；动画可关。
- ⚠️ **缺点（不要照抄）**：整页**没有任何 `<h1>`/`<h2>`**，标题层级缺失；`document.body.innerText` 为空（文本不在常规渲染流中），`<meta name="viewport">` 带 `maximum-scale=1.0, user-scalable=no`——**禁止缩放**，对低视力用户不友好。
- 本项目对策：必须有真实 `h1`/`h2` 层级；**不禁用缩放**（改为 `width=device-width, initial-scale=1`）。

---

## 二、hiesther.me（同一参考清单中的「ESTHER不二」）

> 注：本次会话首次访问 `haoqi.design` 时浏览器曾落在 `hiesther.me`，两者均在参考清单内，故一并实测。以下数据来自渲染后的 DOM。

**1. 世界观：桌面 / 终端隐喻**
- 顶部导航：`01主页` `02作品集` `03我的OS`。
- 首页是一个**桌面**：底部任务栏 `esther OS / About / Values / Now / 22:42`，桌面上散落文件图标，文件名带扩展名徽标：`.md 域名教程`、`.md 人生系统`、`.md 部署教程`、`.html 不二的书架`、`.html Build Your Tool`、`Design Skill`、`Cola+OB自媒体`、`git`、`网页进化史`、`生日快乐！`，还有一张贴纸图与头像。
- Hero 是一个**终端窗口**：`esther@universe ~ zsh` → `$ whoami` → `> ESTHER不二`；`$ cat about.md` → `> 在AI时代认真生活的女生`；`$ echo "1 person + AI = 1 team"`；`$ open esther-os.app`。
- 交互提示：`Press Enter to Launch`，旁边一个 `↓`。
- 页脚是终端的收尾：`$ echo "see you"` → `See you next time.` → `$ cat contact.md` → `$ fortune`（一句诗）→ `$ exit` → `[Process completed]`。

**2. 结构区块（实测 class 与高度）**
| 区块 | class | 高度(px) | 内容 |
|---|---|---|---|
| Hero | `hero-section` | 632 | 终端自述窗口 |
| 桌面 | `desktop` | 632 | 散落的「文件」图标 |
| 收尾 | `exit-section` | 2528 | 作品集 dim_01–dim_04 + 能力矩阵 + 联系 |
| 作品页 | `works-page` | 0（初始隐藏） | `1 Person + AI = 1 Team`，h1 76px/700 |
| 画布页 | `canvas-page` | 0（初始隐藏） | 提示语 `Scroll 缩放 · Drag 移动画布` |

**3. 作品集分栏（dim_01–dim_04）**
```
dim_01 内容创作   → 2 條目 + 「更多内容 →」
dim_02 设计系统skill → 2 條目
dim_03 AI 实践    → 3 條目
dim_04 品牌运营   → 「更多作品整理中 →」
```
每条 = 标题 + 一句说明 + `→` 出口。**「整理中」这个空状态是显式写出来的**，而不是留空或造假——与本项目「即将开放」的处理一致。

**4. 色彩（实测，与 haoqi 完全不同的一套）**
| 用途 | 值 |
|---|---|
| 正文主色 | `rgb(26, 26, 46)`（近黑深蓝） |
| 强调黄 | `rgb(244, 215, 88)`（出现 108 次） |
| 强调蓝 | `rgb(43, 127, 216)`、`rgb(30, 91, 168)` |
| 底色 | `rgb(254, 252, 246)`、`rgb(255, 255, 255)` |
| 次级文字 | `rgb(74, 74, 90)`、`rgb(102, 102, 102)`、`rgb(138, 138, 154)` |

→ 米白底 + 深蓝墨 + 黄蓝双强调，偏「贴纸 / 练习本」的活泼路线。

**5. 标题与字号（实测）**
| 元素 | 字号 / 字重 |
|---|---|
| `h1` 主张 `1 Person + AI = 1 Team` | 76px / 700 |
| `h2` 作品集 | 33.6px / 900 |
| `h3` 分栏标题 | 17.6px / 700 |
| 隐藏语义 `h1`（SEO 摘要） | 32px / 700 |

→ **语义标题与视觉标题分离**：页面上看不见的地方放一个 32px 的语义 `h1` 供搜索引擎/读屏使用，视觉主角另用一个大号标题。这是可复用的手法（本项目的做法可以更直接：直接用真正的大号 `h1`）。

**6. 动效清单（`@keyframes` 实测）**
`lineReveal`、`blink`、`bounce`、`wp-twinkle`、`wp-wobble`、`starPop`、`winPop`、`pulseUp`。
→ 大量**小型、一次性、装饰性**动画（闪烁、摇摆、星星弹出、弹跳）。这类「小动作」比一个大 3D 场景便宜得多，也更容易做减动效降级。

**7. 其他可复用手法**
- `role="button"` + 具名 `aria-label`（如「Protected — enter passcode to reveal」），密码区用 `■■■■■■` 遮蔽。
- 有一个会说话的 Agent 角色「Cola」做导览（本项目**不学**：涉及实时后端与儿童对话，超出 MVP 范围）。
- 底部 `↑ 回到开始 · Back to Start`，长页面的显式出口。

---

## 三、从实测数据得出的可迁移原则（不作主观延伸）

1. **一条强主张 + 一个强调色 + 一个动作。** 两个站点的首屏都只有一个视觉主角，颜色都收敛到「底色 + 墨色 + 1 个强调色」。
2. **强调色只给最重要的那一下。** haoqi 的荧光绿只用在手绘描边；hiesther 的黄只用在贴纸与强调词。不是到处刷。
3. **动效 = 一次入场 + 若干微型循环或一次性小动作。** 没有重场景；关键帧数量少、名字具体（`caret-blink`、`starPop`、`lineReveal`）。
4. **降级 = 直接给最终态。** 参考站把无限旋转整个关掉、把描边直接设为已完成。不是减速。
5. **视觉资产矢量原生。** haoqi 全站零 `<img>`，靠 SVG + canvas + CSS。对本项目意味着「自己画」是可行且足够的路线，不必找图或买图。
6. **元信息条 = 记忆点。** 时钟、坐标、`GMT+8`、文件扩展名徽标——这些**看起来没用的小数字**构成了「这是个真实运转的系统」的错觉，成本极低、辨识度高。
7. **档案式条目胜过轮播。** 项目用「类型 + 名称 + 年份」一行行排，比卡片轮播更适合内容持续增长的站点。
8. **空状态显式说明。** hiesther 直接写「更多作品整理中 →」。本项目对应「即将开放 / 研发中」，且不编造内容。
9. **两站点共同的反面教材（本项目不采用）**：全站无标题层级、`user-scalable=no` 禁止缩放、正文文本不在常规渲染流中。三者在教育场景都是硬伤。

---

## 四、清单中其余站点的处理

参考清单共 32 条 URL。除上述两条外，其余站点**未做逐个深读**，原因：
- 本会话环境视觉模型不可用，逐站人工判读截图不可行；
- 已完成的长尾调研见 `references/research/` 下另一份由子任务产出的报告（若该报告标注了抓取失败，即为失败，不补写）。
- **不声称**已阅读未实际访问的站点。
