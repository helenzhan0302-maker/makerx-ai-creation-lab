# 待裁决清单

## 已发现、未自行处理

1. **`design/poster/` 的 11 个 `astro check` 错误**（基线就有，见 README）。这是海报脚本目录，属于别的活；按任务要求未修改。需要有人决定是否给 `design/` 加 tsconfig 排除或补类型。
## 已自行解决

2. **入口链接样式曾写进白名单外的 `src/styles/ai-planet-builder.css`**：完工审计时发现违反白名单，已把那 14 行原样撤回（该文件与开工前逐字节一致），改为放进白名单内新建的 `src/styles/planet-upgrade.css`，并在第 1 节课页引入该文件。

## 无

其余无阻塞。
