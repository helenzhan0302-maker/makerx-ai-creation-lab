#!/usr/bin/env bash
# MakerX AI 造物实验室 · skftai.top 域名根路径部署脚本
set -uo pipefail

REPO="helenzhan0302-maker/makerx-ai-creation-lab"
STAMP="$(date +%Y%m%d%H%M%S)"
SITE_DIR="/var/www/makerx-domain"
CONF="/etc/nginx/conf.d/makerx-domain.conf"
LEGACY_CONF="/etc/nginx/conf.d/sugarcube.conf"
WORK="/var/tmp/makerx-domain-${STAMP}"

echo "=== MAKERX-DOMAIN-DEPLOY-START ${STAMP} ==="
echo "uid=$(id -u) user=$(id -un)"

echo "--- baseline ---"
curl -s -o /dev/null -w 'baseline_ip_root=%{http_code}\n' -H 'Host: 124.222.99.128' http://127.0.0.1/ || true
curl -s -o /dev/null -w 'baseline_ip_makerx=%{http_code}\n' -H 'Host: 124.222.99.128' http://127.0.0.1/makerx/ || true
curl -s -o /dev/null -w 'baseline_domain=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/ || true

mkdir -p "$WORK"
GOT=0
for URL in \
  "https://codeload.github.com/${REPO}/tar.gz/refs/heads/deploy-domain" \
  "https://ghproxy.net/https://github.com/${REPO}/archive/refs/heads/deploy-domain.tar.gz" \
  "https://gh-proxy.com/https://github.com/${REPO}/archive/refs/heads/deploy-domain.tar.gz" \
  "https://ghfast.top/https://github.com/${REPO}/archive/refs/heads/deploy-domain.tar.gz" \
  "https://github.moeyy.xyz/https://github.com/${REPO}/archive/refs/heads/deploy-domain.tar.gz"
do
  echo "try $URL"
  if curl -fsSL --max-time 90 -o "${WORK}/site.tar.gz" "$URL"; then
    if tar tzf "${WORK}/site.tar.gz" >/dev/null 2>&1; then
      GOT=1; echo "SOURCE-DOWNLOAD-OK $URL"; break
    fi
  fi
done
if [ "$GOT" -ne 1 ]; then
  echo "ERROR: 所有下载源都失败"
  exit 1
fi

tar xzf "${WORK}/site.tar.gz" -C "$WORK"
SRC="$(find "$WORK" -maxdepth 1 -mindepth 1 -type d -name '*deploy-domain*' | head -n1)"
if [ -z "$SRC" ] || [ ! -f "${SRC}/index.html" ]; then
  echo "ERROR: 解包后找不到 index.html (SRC=$SRC)"
  ls -la "$WORK"
  exit 1
fi
if grep -q '/makerx/_astro' "${SRC}/index.html"; then
  echo "ERROR: 产物里残留 /makerx/ 绝对路径"
  exit 1
fi
echo "SOURCE-OK $SRC"

if [ -d "$SITE_DIR" ]; then
  cp -a "$SITE_DIR" "${SITE_DIR}.prev.${STAMP}" && echo "SITE-BACKUP-OK"
fi
rm -rf "$SITE_DIR"
cp -a "$SRC" "$SITE_DIR"
printf 'deploy=%s\n' "$STAMP" > "${SITE_DIR}/DEPLOY_STAMP.txt"
chown -R www-data:www-data "$SITE_DIR"
chmod -R 755 "$SITE_DIR"
echo "SITE-REPLACED-OK"

if [ -f "$CONF" ]; then cp -a "$CONF" "${CONF}.bak.${STAMP}"; echo "CONF-BACKUP-OK"; fi
if [ -f "$LEGACY_CONF" ]; then cp -a "$LEGACY_CONF" "${LEGACY_CONF}.bak.domain.${STAMP}"; echo "LEGACY-CONF-BACKUP-OK"; fi

cat > "$CONF" <<'NGINX'
server {
    listen 80;
    server_name skftai.top;

    root /var/www/makerx-domain;
    index index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    location = /makerx {
        return 301 /;
    }

    location ^~ /makerx/ {
        return 301 /;
    }

    location ~* \.(?:png|jpg|jpeg|gif|webp|svg|ico|mavatar)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    location ^~ /_astro/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}

server {
    listen 80;
    server_name www.skftai.top;
    return 301 http://skftai.top$request_uri;
}
NGINX
echo "CONF-WRITTEN-OK $CONF"

if nginx -t; then
  systemctl reload nginx && echo "NGINX-RELOAD-OK"
else
  echo "NGINX-TEST-FAILED-ROLLING-BACK"
  if [ -f "${CONF}.bak.${STAMP}" ]; then cp -a "${CONF}.bak.${STAMP}" "$CONF"; else rm -f "$CONF"; fi
  nginx -t && systemctl reload nginx
  exit 1
fi

echo "--- self check ---"
curl -s -o /dev/null -w 'domain_root=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/
curl -s -o /dev/null -w 'domain_lab=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/lab/001-ai-planet/
curl -s -o /dev/null -w 'domain_upgrade=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/lab/001-ai-planet/upgrade/
curl -s -o /dev/null -w 'www_redirect=%{http_code} -> %{redirect_url}\n' -H 'Host: www.skftai.top' http://127.0.0.1/
curl -s -o /dev/null -w 'ip_root=%{http_code}\n' -H 'Host: 124.222.99.128' http://127.0.0.1/
curl -s -o /dev/null -w 'ip_makerx=%{http_code}\n' -H 'Host: 124.222.99.128' http://127.0.0.1/makerx/
echo "=== MAKERX-DOMAIN-DEPLOY-END ==="