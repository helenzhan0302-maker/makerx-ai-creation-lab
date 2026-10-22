# 进度记录

## 任务 0 开工回执（2026-10-22）

- 目标：为 AI星球第 2 节课新建「升级工坊」页，四步点选生成修改型中文提示词 + 路演卡，带可玩预览。
- 顺序：任务 1 纯函数与测试 → 任务 2 页面与预览 → 任务 3 浏览器实测与记录。
- 基线核对：node v24.20.0 / pnpm 11.25.0；`pnpm test` 16 项全过，skip 0；`pnpm build` 通过（2 页）；`pnpm check` 11 个错误全在 `design/poster/**`，`src/` 下 0 个。
- 最大风险：预览动效无法机器判定，只能靠浏览器实测 + 领导亲验；因此把逻辑全部放进可测的纯函数，动效脚本用 try 隔离。
- 第二条风险：`package.json` 的 test 脚本只允许追加新测试文件，不改动已有两条。
- 不做：准备步、必须保留勾选、整页尾焰、任何存储/联网/新依赖。

## 任务 1 完成（纯函数与测试）

- 新建 `src/lib/planet-upgrade.mjs`：6 个头像效果、6 个特效、8 个宠物、4 个动作，含 `createUpgradeState`/`validateUpgradeStep`/`validateUpgradeAll`/`buildUpgradePrompt`/`buildRoadshowCard`。
- 新建 `tests/planet-upgrade.test.mjs`，12 条断言。
- `pnpm test`：28 项，28 通过，0 失败，0 跳过。
- 反向验证：把 `MAX_AVATAR_EFFECTS` 改成 4 → 27 过 1 失败；改回 3 → 28 全绿。

## 任务 2 完成（页面与预览）

- 新建 `src/components/PlanetUpgradeBuilder.astro`、`src/pages/lab/001-ai-planet/upgrade.astro`、`src/styles/planet-upgrade.css`。
- 第 1 节课页只加「第 1 节课」标签与第 2 节课入口；七步生成器未动。
- 实测发现并修复一个真 bug：canvas 在隐藏步骤里初始化为 1×1，导致尾焰画不出来；改用 `ResizeObserver` 在容器可见后重新量尺寸。
- 摸头热区从「整个预览框」收窄为「上半部分」，避免正常看眼睛时误触。

## 任务 3 完成（浏览器实测）

Playwright + Chromium 实测（详见 README「第 2 节课升级工坊」）：

- 375/768/1440 三档 `scrollWidth === clientWidth`，无横向溢出。
- `prefers-reduced-motion: reduce` 下 `animationName=none`，24 张选项卡仍在。
- 眼睛跟随：瞳孔 49→51.4 / 62→64.0，仍在眼眶内。
- 摸头：头顶热区触发气泡 `is-visible` 与回弹。
- 尾焰：canvas 288×154，移动后绘制 97 像素。
- 复制：反馈正确，剪贴板与提示词一致。
- 提示词首行与路演卡三问均正确。

## 补充说明（超出任务书指定路径的两处小改动）

- `src/styles/ai-planet-builder.css` 增加 `.lesson-next-link` 样式（第 1 节课入口链接需要可读样式），只新增 14 行，未改任何既有规则。
- `package.json` 的 test 脚本仅追加 `tests/planet-upgrade.test.mjs`，未改动前两条。
