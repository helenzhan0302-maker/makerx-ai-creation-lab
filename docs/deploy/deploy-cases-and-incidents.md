# 部署成功案例与故障台账

> 只记录可核对的事实：命令、执行 ID、回执、路由状态。推断会标注「推断」。
> 最近更新：2026-11-04

---

## 一、成功案例

### 案例 1：IP 子路径首发（2026-10-16）

- 入口：`http://124.222.99.128/makerx/`
- 方式：本机构建 → 推送 `deploy` 分支 → 服务器拉 tarball → 替换 `/var/www/makerx/`
- 结果：`/makerx/` 与 `/makerx/lab/001-ai-planet/` 均 200，旧站 `/`、`/introduction/` 未受影响。
- 沉淀：服务器不装 Node，构建必须在本地完成。这条后来成为所有部署的前提。

### 案例 2：`/makerx` 无斜杠入口修复（2026-10-16）

- 问题：访问 `/makerx` 时未正确跳到 `/makerx/`，出现 fallback。
- 修复：补 nginx 重定向规则，重新部署。
- 结果：`/makerx` 返回 301 → `/makerx/`，页面正常。
- 沉淀：**路由存在不等于页面正确**。要同时验证「无斜杠」「带斜杠」两种入口。

### 案例 3：改用独立子域名（2026-11-03）

- 背景：主域根路径另作他用，`skftai.top/makerx/` 与既有站点配置互相干扰。
- 决策：新建 `makerx.skftai.top`，独立 server 块 + 独立根目录 + 独立证书。
- 构建：`astro.config.subdomain.mjs`（`base: "/"`），产物推 `deploy-subdomain`。
- 结果：`https://makerx.skftai.top/` 200，证书 Let's Encrypt 签发，HTTP 301 → HTTPS，旧入口全部未受影响。
- 沉淀：一个站点一个子域，比在共享根路径里加 location 更不容易被其他配置截胡。

### 案例 4：TAT 多源下载命令跑通（2026-11-04）

- 命令：`cmd-fc0x3vye`（`makerx-deploy-002-multisrc-20261104`）
- 执行：`inv-0aqj660dbh`，ExitCode 0，耗时 93 秒。
- 线上回执：`deploy=20261104103557`，`status=ok`，`https=on`。
- 关键设计：部署脚本从 `main` 取（源码分支有 `scripts/`），站点产物从 `deploy-subdomain` 取（只有产物）。

### 案例 5：编辑台视觉改版上线（2026-11-04）

- 执行：`inv-waqrmigdic`，ExitCode 0。
- 线上回执：`deploy=20261104141710`，`status=ok`，`https=on`。
- 验证：七条路由 200，首页不再出现旧页脚文案，CSS 哈希与本地一致，生产 E2E 53/53。
- 沉淀：**验收要盯回执和哈希**，不要只看首页能不能打开。

### 案例 6：lesson-1 故事工具改版上线（2026-11-04）

- 产物：`deploy-subdomain` 提交 `c72ed50`，已推送 `origin`。
- 本地验证：单元测试 76/76，构建 7 pages，生产预览 E2E 60/60。
- 执行：复用 TAT 命令 `cmd-fc0x3vye`（`makerx-deploy-002-multisrc-20261104`），只勾选 `lhins-ce4mfndw`；UIA 读到「已选择1个实例」且「执行命令」由 disabled 变 enabled 后触发。
- 线上回执：`deploy=20261104170025`，`status=ok`，`https=on`。
- 验证：七条路由 200；lesson-1 HTML 引用 `picturebook.DzhgN6yZ.css`，与本地 `dist-subdomain/_astro` 一致；生产 E2E 60/60。
- 沉淀：**先证明「勾选状态 + 按钮已启用」，再执行**。产物就绪不等于线上已更新；只有回执变化才算发布。

---

## 二、故障台账

### F-01 DNS 子域不存在（NXDOMAIN）

- 现象：脚本 DNS 预检 `resolved=[]` 直接退出。
- 根因：DNSPod 只有 `@` 与 `www`，没有 `makerx` 记录；主域能解析不代表子域存在。
- 处理：在 DNSPod 里进入域名后新增 A 记录：主机记录 `makerx`、值 `124.222.99.128`、TTL 600。
- 防复发：部署前先 `dig +short makerx.skftai.top`，有 IP 才继续。主机记录不要填全域名，否则会被拼成 `makerx.skftai.top.skftai.top`。

### F-02 服务器访问 raw.githubusercontent.com 被阻断

- 现象：`curl` 长时间无响应，像卡死。
- 根因：国内节点访问 raw.githubusercontent.com 常被阻断或极慢。
- 处理：改用 jsDelivr、ghfast、ghproxy、gh-proxy 多源；TAT 命令已内置多源回退。
- 防复发：任何服务器侧下载都要设置 `--max-time`，并准备至少两个镜像源。

### F-03 `curl: (23) Failure writing output to destination`

- 现象：下载脚本时写文件失败。
- 根因：写到了当前用户无权限的目录（`/root`），或 `/tmp` 在该机器上异常。
- 处理：改写到 `/var/tmp` 或用户可写目录。
- 防复发：不要把「命令本身正确」当成「路径一定可写」。

### F-04 HTTP 200 是假象（nginx 默认站点兜底）

- 现象：子域首页 200，但 `DEPLOY_STAMP.txt` 仍是旧值、`DEPLOY_STATUS.txt` 404。
- 根因：nginx 没匹配到 `server_name` 时落到默认 server，任意域名都返回 200。
- 处理：补正确的 server 块并 reload。
- 防复发：**永远用回执文件判成功**，不要用首页状态码。

### F-05 产物分支里没有部署脚本

- 现象：首个 TAT 命令 `cmd-a61syn0i` / `inv-0aqin3084u` ExitCode 1，90 秒超时，线上未变。
- 根因：外层命令只从 `codeload` 下载，且从 `deploy-subdomain` 找 `scripts/`；该分支只有构建产物，`find` 结果为空。
- 处理：改为从 `main` 取脚本、从 `deploy-subdomain` 取产物，并校验脚本包含 `/lab/002-picturebook/`。
- 防复发：**源码与产物分属不同分支**，下载源必须与内容对应。

### F-06 桌面 UI 自动化误点与坐标偏移

- 现象：尝试用鼠标点击腾讯云 TAT 页面时，点击落到其他窗口或页面其他控件；截图与点击坐标不一致。
- 根因（已确认的部分）：多显示器/缩放环境下截图坐标与输入坐标不一致；前台窗口可能被其他应用抢走；内嵌浏览器对 UI Automation 暴露不完整。
- 处理：改为键盘导航（Tab + 空格），并在每次操作后截图确认；勾选实例这一步用键盘成功。
- 防复发：
  1. 操作前先确认前台窗口是目标窗口，操作后立即复查。
  2. 不用固定坐标盲点；优先用键盘焦点与可访问性名称。
  3. 执行类按钮点击前，必须有一次「按钮已启用」的截图证据。
  4. 一旦发现误点，立即停止并重新确认窗口，不要连续尝试。

### F-07 构建产物与线上不一致（缓存/兜底误判）

- 现象：页面看起来是旧的。
- 根因可能是浏览器缓存、CDN、或 nginx 兜底，未逐一验证。
- 处理：比对线上 HTML 引用的 `_astro` 哈希与本地 `dist-subdomain/_astro`。
- 防复发：把「哈希一致」列为验收项。

### F-08 `pnpm check` 因既有 `design/` 报错导致 heap OOM

- 现象：`pnpm check` 退出码 134，无法作为验收依据。
- 根因：`design/poster/**` 的既有类型错误，与本轮改动无关。
- 处理：不声称类型检查通过；以构建 + 测试 + E2E 作为验收。
- 防复发：在记录里明确写「未通过 / 原因」，不要省略。

---

## 三、从故障反推的硬规则

1. 服务器不构建，只接收产物。
2. 脚本从 `main` 取，产物从 `deploy-subdomain` 取。
3. 成功只认 `DEPLOY_STAMP` 变化 + `DEPLOY_STATUS=ok` + 七条路由 200 + 哈希一致 + E2E 全过。
4. 任何一次「看起来成功了」但回执没变，都按失败处理。
5. UI 自动化不做盲点；每次动作后必须重新观察。
