# 待裁决清单

## 已发现、未自行处理

1. **`design/poster/` 的 11 个 `astro check` 错误**（基线就有，见 README）。这是海报脚本目录，属于别的活；按任务要求未修改。需要有人决定是否给 `design/` 加 tsconfig 排除或补类型。

## 已自行解决

1. **入口链接样式曾写进白名单外的 `src/styles/ai-planet-builder.css`**：完工审计时发现违反白名单，已把那 14 行原样撤回（该文件与开工前逐字节一致），改为放进白名单内新建的 `src/styles/planet-upgrade.css`，并在第 1 节课页引入该文件。
2. **实验 002 服务器端发布被访问权限阻塞（2026-11-04 已解除）**：SSH 与腾讯云 API 凭据均不可用，改用 TAT。首个命令 `cmd-a61syn0i` 因下载源与分支内容不匹配失败（ExitCode 1，线上未变）；修正命令 `cmd-fc0x3vye` 执行 `inv-0aqj660dbh` **ExitCode 0**，`DEPLOY_STAMP.txt = deploy=20261104103557`，`DEPLOY_STATUS.txt = status=ok`，七条路由 200，生产 E2E 44/44。

## 无

其余无阻塞。
