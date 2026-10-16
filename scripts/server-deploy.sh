#!/usr/bin/env bash
# MakerX AI 造物实验室 · 服务器部署脚本
#
# 用途：把 GitHub `deploy` 分支上的静态产物同步到 /var/www/makerx/，
#       并确保 nginx 里有 `location = /makerx` → `/makerx/` 的 301 重定向。
#
# 在服务器上以 root 执行：
#   bash server-deploy.sh
#
# 安全约束：
#   - 只写 /var/www/makerx/ 和 nginx 配置；绝不触碰 /var/www/sugarcube/（三颗方糖旧站）
#   - 替换站点目录前先整体备份成 /var/www/makerx.prev.<时间戳>
#   - 改 nginx 前先备份；`nginx -t` 不通过就自动回滚，不 reload
set -euo pipefail

REPO="helenzhan0302-maker/makerx-ai-creation-lab"
TARBALL="https://codeload.github.com/${REPO}/tar.gz/refs/heads/deploy"
STAMP="$(date +%Y%m%d%H%M%S)"
SITE_DIR="/var/www/makerx"
CONF="/etc/nginx/conf.d/sugarcube.conf"
WORK="/tmp/makerx-deploy-${STAMP}"
SRC="${WORK}/makerx-ai-creation-lab-deploy"

echo "=== MAKERX-DEPLOY-START ${STAMP} ==="

echo "--- 现有 nginx location 一览 ---"
grep -n "location" "$CONF" || true

# 1. 下载并解包 deploy 分支产物
mkdir -p "$WORK"
curl -fsSL -o "${WORK}/site.tar.gz" "$TARBALL"
tar xzf "${WORK}/site.tar.gz" -C "$WORK"
if [ ! -f "${SRC}/index.html" ]; then
  echo "ERROR: 解包后找不到 index.html（${SRC}）"
  exit 1
fi
echo "SOURCE-OK ${SRC}"

# 2. 备份并替换站点目录
if [ -d "$SITE_DIR" ]; then
  cp -a "$SITE_DIR" "${SITE_DIR}.prev.${STAMP}"
  echo "SITE-BACKUP-OK ${SITE_DIR}.prev.${STAMP}"
fi
rm -rf "$SITE_DIR"
cp -a "$SRC" "$SITE_DIR"
chown -R www-data:www-data "$SITE_DIR"
chmod -R 755 "$SITE_DIR"
echo "SITE-REPLACED-OK"

# 3. 补 /makerx → /makerx/ 的 301（已存在则跳过）
if [ ! -f "$CONF" ]; then
  echo "ERROR: 找不到 nginx 配置 $CONF"
  exit 1
fi
cp -a "$CONF" "${CONF}.bak.${STAMP}"
echo "CONF-BACKUP-OK ${CONF}.bak.${STAMP}"

python3 - "$CONF" <<'PY'
import sys

path = sys.argv[1]
text = open(path, encoding="utf-8").read()

if "location = /makerx {" in text:
    print("REDIRECT-ALREADY-PRESENT")
    raise SystemExit(0)

anchor = "location /makerx/ {"
if anchor not in text:
    print("ERROR: 配置里找不到 location /makerx/")
    raise SystemExit(1)

block = "location = /makerx {\n        return 301 /makerx/;\n    }\n\n    "
index = text.index(anchor)
open(path, "w", encoding="utf-8").write(text[:index] + block + text[index:])
print("REDIRECT-WRITTEN")
PY

if nginx -t; then
  systemctl reload nginx
  echo "NGINX-RELOAD-OK"
else
  cp -a "${CONF}.bak.${STAMP}" "$CONF"
  echo "NGINX-TEST-FAILED-ROLLED-BACK"
  exit 1
fi

# 4. 自检
echo "--- 自检 ---"
grep -n "location = /makerx" "$CONF" || echo "WARN: 配置里没找到重定向"
curl -s -o /dev/null -w 'noSlash=%{http_code} -> %{redirect_url}\n' http://127.0.0.1/makerx
curl -s -o /dev/null -w 'slash=%{http_code}\n' http://127.0.0.1/makerx/
curl -s -o /dev/null -w 'lab=%{http_code}\n' http://127.0.0.1/makerx/lab/001-ai-planet/
curl -s -o /dev/null -w 'root=%{http_code}\n' http://127.0.0.1/
ls -l "${SITE_DIR}/_astro/"
echo "=== MAKERX-DEPLOY-END ==="
