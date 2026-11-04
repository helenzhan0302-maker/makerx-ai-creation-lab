#!/usr/bin/env bash
set -euo pipefail

REPO="helenzhan0302-maker/makerx-ai-creation-lab"
BRANCH="deploy-tool"
STAMP="$(date +%Y%m%d%H%M%S)"
TARGET="/var/www/tool-skftai"
CONF="/etc/nginx/sites-available/tool-skftai.conf"
WORK="/tmp/tool-deploy-${STAMP}"
TARBALL="https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}"

echo "=== TOOL-DEPLOY-START ${STAMP} ==="

mkdir -p "$WORK"
ok=0
for u in "$TARBALL" "https://ghfast.top/${TARBALL}" "https://ghproxy.net/${TARBALL}"; do
  echo "try $u"
  if curl -fsSL --connect-timeout 15 --max-time 120 -o "${WORK}/site.tar.gz" "$u"; then ok=1; break; fi
done
[ "$ok" -eq 1 ] || { echo "TARBALL-DOWNLOAD-FAILED"; exit 1; }

tar xzf "${WORK}/site.tar.gz" -C "$WORK"
SRC="$(find "$WORK" -maxdepth 1 -type d -name 'makerx-ai-creation-lab-*' | head -1)"
[ -n "$SRC" ] || { echo "SRC-NOT-FOUND"; exit 1; }
[ -f "${SRC}/tool-site/index.html" ] || { echo "INDEX-NOT-FOUND"; exit 1; }
echo "SOURCE-OK ${SRC}"

echo "--- 现有 nginx 配置 ---"
ls -l /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null || true
grep -R "tool.skftai.top" /etc/nginx/sites-available /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null || echo "NO-EXISTING-TOOL-CONF"

tar -czf "/root/nginx-backup-${STAMP}.tgz" /etc/nginx/sites-available /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null || true

if [ -d "$TARGET" ]; then
  cp -a "$TARGET" "${TARGET}.prev.${STAMP}"
  echo "SITE-BACKUP-OK ${TARGET}.prev.${STAMP}"
fi
mkdir -p "$TARGET"
find "$TARGET" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a "${SRC}/tool-site/." "$TARGET/"
chown -R www-data:www-data "$TARGET"
chmod -R 755 "$TARGET"
echo "SITE-REPLACED-OK"

echo "$STAMP" > "${TARGET}/DEPLOY_STAMP.txt"

cp "${SRC}/nginx-tool.conf" "$CONF"
ln -sfn "$CONF" /etc/nginx/sites-enabled/tool-skftai.conf

if ! nginx -t; then
  echo "NGINX-TEST-FAILED-ROLLBACK"
  rm -f /etc/nginx/sites-enabled/tool-skftai.conf
  exit 1
fi
systemctl reload nginx
echo "NGINX-RELOADED-OK"

echo "--- 本机验证 ---"
curl -s -o /dev/null -w "tool-home %{http_code}\n" -H "Host: tool.skftai.top" http://127.0.0.1/
curl -s -o /dev/null -w "tool-resources %{http_code}\n" -H "Host: tool.skftai.top" http://127.0.0.1/resources
curl -s -o /dev/null -w "root-domain %{http_code}\n" -H "Host: skftai.top" http://127.0.0.1/
curl -s -o /dev/null -w "makerx %{http_code}\n" -H "Host: makerx.skftai.top" http://127.0.0.1/
echo "STAMP=$(cat "${TARGET}/DEPLOY_STAMP.txt")"
echo "=== TOOL-DEPLOY-END ==="