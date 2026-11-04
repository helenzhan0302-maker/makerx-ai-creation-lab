# MakerX 子域名部署 SOP

> 适用对象：`https://makerx.skftai.top/`（腾讯云轻量实例 `lhins-ce4mfndw`，Ubuntu 22.04，上海 `rid=4`）。
> 本文只记录**已验证**的操作与已实际发生的故障。尚未验证的步骤会明确标注「未验证」。
> 最近更新：2026-11-04

---

## 一、不可绕开的事实

| 事实 | 依据 |
|---|---|
| 服务器没有 Node / npm / pnpm，**不能在服务器上构建** | 2026-10-16 用自动化助手实测输出 `NO-NODE` / `NO-NPM` / `NO-PNPM` |
| 因此流程固定为「本机构建 → 推构建产物分支 → 服务器拉取替换」 | 同上，已连续多次验证 |
| 对外地址是独立子域名，`base` 必须为 `/` | `astro.config.subdomain.mjs`：`site: https://makerx.skftai.top`、`base: "/"` |
| 构建产物分支是 `deploy-subdomain`，只含静态产物（`index.html`、`_astro/`、`assets/`、各路由目录） | `git -C .superpowers/deploy-subdomain-wt4 ls-tree` 共 20 个文件 |
| 服务器站点目录 `/var/www/makerx-subdomain`，替换前整目录备份为 `.prev.<时间戳>` | `scripts/server-deploy-subdomain.sh` |
| nginx 配置文件 `/etc/nginx/conf.d/makerx-subdomain.conf`，脚本只新增/覆盖这一个文件 | 同上 |
| 脚本在 `nginx -t` 失败时自动还原配置、且不 reload | 同上 |
| 部署完成会写 `DEPLOY_STAMP.txt` 与 `DEPLOY_STATUS.txt` | 同上，公网可读 |
| 服务器 SSH 私钥 `~/.ssh/id_ed25519_makerx*` 当前**不被接受**（`Permission denied (publickey,password)`） | 2026-11-04 本机实测 |
| 当前没有可用的腾讯云 API 凭证（`tccli` 不存在，无 `TENCENT*` 环境变量） | 2026-11-04 本机实测 |
| 因此服务器侧发布当前只能走**腾讯云控制台 TAT 页面** | 2026-11-04 实际操作路径 |

## 二、标准流程

### 0. 前置检查（本机）

```powershell
git status --short --branch
git log -1 --oneline
curl.exe -s -L https://makerx.skftai.top/DEPLOY_STAMP.txt
```

记录部署前的线上 `deploy=` 时间戳。**后面必须看到它变化**，否则等于没部署。

### 1. 验收源码

```powershell
pnpm test
pnpm exec astro build --config astro.config.subdomain.mjs --outDir dist-subdomain
```

要求：

- 单元测试全绿（当前基线 76 pass）。
- 构建退出码 0，页面数为 7。
- `dist-subdomain` 中不出现 `/makerx/_astro` 绝对路径（脚本也会拦截）。

### 2. 生产预览 E2E

```powershell
pnpm exec astro preview --config astro.config.subdomain.mjs --port 4400
$env:PB_BASE='http://127.0.0.1:4400'
node tests/browser-picturebook.mjs
```

当前基线：60/60。失败就不要往下走。

### 3. 同步产物到 `deploy-subdomain`

工作树：`.superpowers/deploy-subdomain-wt4`（不要使用 `wt2`，它停在旧提交）。

```powershell
robocopy dist-subdomain .superpowers\deploy-subdomain-wt4 /MIR /XD .git
```

然后确认：

```powershell
git -C .superpowers/deploy-subdomain-wt4 status --short
git -C .superpowers/deploy-subdomain-wt4 diff --stat
```

提交信息格式：

```text
deploy(subdomain): <一句话说明本次线上变化>
```

推送（本机需要代理）：

```powershell
git -C .superpowers/deploy-subdomain-wt4 -c http.https://github.com/.proxy=http://127.0.0.1:7892 push origin deploy-subdomain
```

### 4. 服务器发布（TAT）

在腾讯云控制台打开已保存命令：

```text
https://console.cloud.tencent.com/lighthouse/command/invoke?rid=4&id=cmd-fc0x3vye
```

命令名 `makerx-deploy-002-multisrc-20261104`，它会：

1. 从 `main` 分支多源下载 `scripts/server-deploy-subdomain.sh`（jsDelivr → ghfast → ghproxy）。
2. 校验脚本包含 `/lab/002-picturebook/`。
3. 在服务器上执行脚本：下载 `deploy-subdomain` 产物 → 备份 → 替换 → nginx 校验 → HTTPS 自检 → 写回执。

操作要点：

- 只勾选 `lhins-ce4mfndw`（`124.222.99.128`）。
- 必须看到「已选择 1 个实例」且「执行命令」按钮变为可用。
- 一次执行约 90–120 秒。

### 5. 验收（必须做，不能凭感觉）

```powershell
curl.exe -s -L https://makerx.skftai.top/DEPLOY_STAMP.txt
curl.exe -s -L https://makerx.skftai.top/DEPLOY_STATUS.txt
```

通过条件：

- `deploy=` 是**新的**时间戳，不是部署前那个。
- `status=ok`，`https=on`。

七条路由必须全部 200：

```text
/
/lab/001-ai-planet/
/lab/001-ai-planet/lesson-1/
/lab/001-ai-planet/upgrade/
/lab/002-picturebook/
/lab/002-picturebook/lesson-1/
/lab/002-picturebook/lesson-2/
```

生产 E2E：

```powershell
$env:PB_BASE='https://makerx.skftai.top'
node tests/browser-picturebook.mjs
```

最后比对线上 CSS 哈希与本地 `dist-subdomain/_astro` 一致，确认不是旧缓存或 nginx 兜底。

### 6. 回填记录

在 `README.md` 对应小节补充：

- 新 `DEPLOY_STAMP`
- 测试与 E2E 数量
- 新 CSS / JS 哈希
- 未验证项（真实手机、屏幕阅读器、`pnpm check` 状态）

---

## 三、验收判据（缺一不可）

| 判据 | 为什么 |
|---|---|
| `DEPLOY_STAMP` 变化 | 首页 200 可能是 nginx 默认站点兜底，不能证明部署 |
| `DEPLOY_STATUS=ok` | 脚本只有在七条路由全 200 时才写 ok |
| 七条路由 200 | 少一条就说明产物或路由缺失 |
| 线上 CSS 哈希 = 本地构建哈希 | 证明线上确实是这次构建 |
| 生产 E2E 全过 | 证明交互功能没被部署破坏 |

## 四、回滚

站点每次替换前会生成 `/var/www/makerx-subdomain.prev.<时间戳>`。回滚时用 TAT 执行：

```bash
cp -a /var/www/makerx-subdomain.prev.<时间戳>/. /var/www/makerx-subdomain/
chown -R www-data:www-data /var/www/makerx-subdomain
nginx -t && systemctl reload nginx
```

`nginx -t` 失败就不要 reload。回滚后同样要核对 `DEPLOY_STAMP`（回滚会带回旧回执，这是预期行为，必须在记录里写明）。

## 五、未验证事项

- 真实手机、微信内置浏览器上的表现。
- 真实屏幕阅读器。
- `https://skftai.top/` 主域证书不匹配（历史遗留，与本子域无关）。
- 腾讯云 TAT 页面在不同分辨率/缩放下的人工操作稳定性（见故障台账 F-06）。
