#!/usr/bin/env bash
# MakerX AI 造物实验室 · skftai.top 域名根路径部署脚本
#
# 用途：
#   1) 把 GitHub `deploy-domain` 分支（根路径构建产物）同步到 /var/www/makerx-domain/
#   2) 新增独立 nginx server 块，让 skftai.top / www.skftai.top 指向该目录
#   3) 保留既有 124.222.99.128 的 /（三颗方糖）与 /makerx/（子路径版）完全不受影响
#
# 在服务器上以 root 执行：
#   bash server-deploy-domain.sh
#
# 安全约束：
#   - 只写 /var/www/makerx-domain/ 和新增的 /etc/nginx/conf.d/makerx-domain.conf
#   - 绝不修改 /etc/nginx/conf.d/sugarcube.conf（旧站配置）
#   - 绝不触碰 /var/www/sugarcube/ 与 /var/www/makerx/
#   - 改 nginx 前先备份；`nginx -t` 不通过自动回滚，不 reload
set -euo pipefail

REPO="helenzhan0302-maker/makerx-ai-creation-lab"
TARBALL="https://codeload.github.com/${REPO}/tar.gz/refs/heads/deploy-domain"
STAMP="$(date +%Y%m%d%H%M%S)"
SITE_DIR="/var/www/makerx-domain"
CONF="/etc/nginx/conf.d/makerx-domain.conf"
LEGACY_CONF="/etc/nginx/conf.d/sugarcube.conf"
WORK="/var/tmp/makerx-domain-${STAMP}"
SRC="${WORK}/makerx-ai-creation-lab-deploy-domain"

echo "=== MAKERX-DOMAIN-DEPLOY-START ${STAMP} ==="

# 0. 记录改动前基线
echo "--- 改动前基线 ---"
BEFORE_ROOT="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: 124.222.99.128' http://127.0.0.1/ || true)"
BEFORE_MAKERX="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: 124.222.99.128' http://127.0.0.1/makerx/ || true)"
BEFORE_DOMAIN="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: skftai.top' http://127.0.0.1/ || true)"
echo "BASELINE ip_root=${BEFORE_ROOT} ip_makerx=${BEFORE_MAKERX} domain_root=${BEFORE_DOMAIN}"

# 1. 下载并解包 deploy-domain 分支产物
mkdir -p "$WORK"
curl -fsSL -o "${WORK}/site.tar.gz" "$TARBALL"
tar xzf "${WORK}/site.tar.gz" -C "$WORK"
if [ ! -f "${SRC}/index.html" ]; then
  echo "ERROR: 解包后找不到 index.html（${SRC}）"
  exit 1
fi
if grep -q '/makerx/_astro' "${SRC}/index.html"; then
  echo "ERROR: 产物里残留 /makerx/ 绝对路径，构建有误"
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

# 3. 写入独立 server 块（不动 sugarcube.conf）
if [ -f "$CONF" ]; then
  cp -a "$CONF" "${CONF}.bak.${STAMP}"
  echo "CONF-BACKUP-OK ${CONF}.bak.${STAMP}"
fi
cp -a "$LEGACY_CONF" "${LEGACY_CONF}.bak.domain.${STAMP}"
echo "LEGACY-CONF-BACKUP-OK ${LEGACY_CONF}.bak.domain.${STAMP}"

cat > "$CONF" <<'NGINX'
# MakerX AI 造物实验室 · 域名根路径
# 由 scripts/server-deploy-domain.sh 生成
server {
    listen 80;
    listen [::]:80;
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
    listen [::]:80;
    server_name www.skftai.top;
    return 301 http://skftai.top$request_uri;
}
NGINX
echo "CONF-WRITTEN-OK ${CONF}"

# 4. 语法检查 → 失败则回滚
if nginx -t; then
  systemctl reload nginx
  echo "NGINX-RELOAD-OK"
else
  echo "NGINX-TEST-FAILED-ROLLING-BACK"
  if [ -f "${CONF}.bak.${STAMP}" ]; then
    cp -a "${CONF}.bak.${STAMP}" "$CONF"
  else
    rm -f "$CONF"
  fi
  nginx -t && systemctl reload nginx
  exit 1
fi

# 5. 自检
echo "--- 自检 ---"
curl -s -o /dev/null -w 'domain_root=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/
curl -s -o /dev/null -w 'domain_lab=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/lab/001-ai-planet/
curl -s -o /dev/null -w 'domain_lesson1=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/lab/001-ai-planet/lesson-1/
curl -s -o /dev/null -w 'domain_upgrade=%{http_code}\n' -H 'Host: skftai.top' http://127.0.0.1/lab/001-ai-planet/upgrade/
curl -s -o /dev/null -w 'www_redirect=%{http_code} -> %{redirect_url}\n' -H 'Host: www.skftai.top' http://127.0.0.1/
curl -s -o /dev/null -w 'ip_root=%{http_code}\n' -H 'Host: 124.222.99.128' http://127.0.0.1/
curl -s -o /dev/null -w 'ip_makerx=%{http_code}\n' -H 'Host: 124.222.99.128' http://127.0.0.1/makerx/
curl -s -H 'Host: skftai.top' http://127.0.0.1/ | grep -o '<title>[^<]*</title>' || true
ls -l "$SITE_DIR"
echo "=== MAKERX-DOMAIN-DEPLOY-END ==="