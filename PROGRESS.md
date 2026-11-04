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

## 完工审计（白名单复核）

- 曾把 `.lesson-next-link` 写进白名单外的 `src/styles/ai-planet-builder.css`，审计时撤回；该文件现与开工前逐字节一致（`git diff quiet` 通过）。
- 样式改放白名单内的 `src/styles/planet-upgrade.css`，第 1 节课页引入该文件（该页本身在白名单内）。
- `package.json` 的 test 脚本仅追加 `tests/planet-upgrade.test.mjs`，未改动前两条。
- 白名单外文件（已有测试、`ai-planet-builder.mjs`、`ProjectPromptBuilder.astro`、`index.astro`、`astro.config.mjs`、`design/`、`docs/superpowers/specs/`、`pnpm-lock.yaml`）`git diff` 全部为空。
- 依赖未变：`dependencies` 仍只有 `astro`。

## 实验 002「故事放映机」交付（2026-11-03）

- 完成第 1、2 节课页面与课堂工具：苏格拉底式追问、6 页分镜、本地工程文件 v1/v2、版本递增、画风/角色/逐页插画提示词、检查单与路演卡。
- `npm test`：73 pass / 0 fail / 0 skipped。
- subdomain 构建：7 pages built，退出码 0。
- 浏览器端到端：44/44 通过（含导出前置条件、重复保存升版、导入后导出、三档响应式、reduced motion、无 JS）。
- 部署产物已推送 `origin/deploy-subdomain`，提交 `df816ca`。
- **服务器端未发布**：SSH 全部被拒绝，缺少腾讯云 TAT/API 凭据；公网 002 路由仍 404，旧回执未更新。

## 实验 002 服务器发布（2026-11-04，已验证成功）

- 通过腾讯云自动化助手（TAT，上海地域）执行部署，未使用 SSH。
- 失败尝试：`cmd-a61syn0i` / `inv-0aqin3084u`，ExitCode 1。原因：外层命令只从 `codeload.github.com` 下载，而 `deploy-subdomain` 分支只有构建产物、无 `scripts/`，`find` 为空；90 秒超时。线上文件未变动。
- 成功命令：`cmd-fc0x3vye`（`makerx-deploy-002-multisrc-20261104`），从 `main` 多源下载部署脚本（jsDelivr → ghfast → ghproxy），执行 `inv-0aqj660dbh`，**ExitCode 0，耗时 93 秒**。
- 线上回执：`DEPLOY_STAMP.txt = deploy=20261104103557`，`DEPLOY_STATUS.txt = status=ok / https=on`。
- 七条路由均 `200`（含 002 三条）；`http://makerx.skftai.top/` 301 → HTTPS。
- 生产 E2E：`PB_BASE=https://makerx.skftai.top node tests/browser-picturebook.mjs` → **44/44 通过**。
- 旧入口 `http://124.222.99.128/` 与 `/makerx/` 仍 `200`。
- 未验证：真实手机 / 微信内置浏览器、真实屏幕阅读器；`https://skftai.top/` 主域证书不匹配为历史遗留，未改动。

