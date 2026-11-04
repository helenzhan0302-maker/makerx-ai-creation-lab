#!/usr/bin/env bash
set -euo pipefail

DOMAIN="tool.skftai.top"
TARGET="/var/www/tool-skftai"
NGINX_CONF="/etc/nginx/sites-available/tool-skftai.conf"
STAMP="20261104183518"

echo "== 1. 备份现有 nginx 配置 =="
tar -czf "/root/nginx-backup-${STAMP}.tgz" /etc/nginx/sites-available /etc/nginx/sites-enabled 2>/dev/null || true
ls -la "/root/nginx-backup-${STAMP}.tgz"

echo "== 2. 部署静态文件 =="
mkdir -p "${TARGET}"
find "${TARGET}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
tar -xzf /tmp/tool-skftai.tar.gz -C "${TARGET}"
chown -R www-data:www-data "${TARGET}"
chmod -R 755 "${TARGET}"
ls -la "${TARGET}" | head -20

echo "== 3. 安装 nginx 配置 =="
cp /tmp/tool-skftai.conf "${NGINX_CONF}"
ln -sfn "${NGINX_CONF}" /etc/nginx/sites-enabled/tool-skftai.conf
nginx -t

echo "== 4. 重载 nginx =="
systemctl reload nginx

echo "== 5. 本机验证 =="
curl -s -o /dev/null -w "tool 首页   %{http_code}\n" -H "Host: ${DOMAIN}" http://127.0.0.1/
curl -s -o /dev/null -w "tool 资源页 %{http_code}\n" -H "Host: ${DOMAIN}" http://127.0.0.1/resources
curl -s -o /dev/null -w "现有根域    %{http_code}\n" -H "Host: skftai.top" http://127.0.0.1/
curl -s -o /dev/null -w "现有 makerx %{http_code}\n" -H "Host: makerx.skftai.top" http://127.0.0.1/

echo "== 完成 =="