#!/usr/bin/env bash
# MakerX AI 造物实验室 · makerx.skftai.top 子域名部署 + HTTPS
#
# 2026-11-03 用户决定：MakerX 入口从 skftai.top/makerx/ 改为独立子域名 makerx.skftai.top。
#
# 在服务器上以 root 执行：
#   bash server-deploy-subdomain.sh --dry-run   # 只看计划，不改动任何文件
#   bash server-deploy-subdomain.sh             # 部署站点 + 申请证书 + 开启 HTTPS 跳转
#
# 安全约束（本脚本严格「只新增」）：
#   - 只新增 /etc/nginx/conf.d/makerx-subdomain.conf
#   - 不修改 sugarcube.conf、makerx-domain.conf 或任何其他既有配置
#   - 站点目录 /var/www/makerx-subdomain，替换前整体备份
#   - 每次改完 nginx -t；失败自动还原且不 reload
#   - 不触碰 /var/www/sugarcube、/var/www/makerx（IP 子路径版继续可用）
set -uo pipefail

REPO="helenzhan0302-maker/makerx-ai-creation-lab"
BRANCH="deploy-subdomain"
DOMAIN="makerx.skftai.top"
SITE_DIR="/var/www/makerx-subdomain"
CONF="/etc/nginx/conf.d/makerx-subdomain.conf"
EMAIL="helen.zhan0302@gmail.com"
LOG="/var/log/makerx-subdomain.log"
STAMP="$(date +%Y%m%d%H%M%S)"
BACKUP="/root/makerx-subdomain-backup-${STAMP}"
WORK="/var/tmp/makerx-sub-${STAMP}"

DRY=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY=1 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "未知参数: $arg"; exit 2 ;;
  esac
done

LOG_WRITABLE=0
if [ "$DRY" -eq 0 ] && [ "$(id -u)" -eq 0 ]; then LOG_WRITABLE=1; fi

say() {
  if [ "$LOG_WRITABLE" -eq 1 ]; then echo "$*" | tee -a "$LOG"; else echo "$*"; fi
}
run() {
  if [ "$DRY" -eq 1 ]; then say "[dry-run] $*"; return 0; fi
  "$@"
}

reload_nginx() {
  if [ "$DRY" -eq 1 ]; then say "[dry-run] nginx -t && systemctl reload nginx"; return 0; fi
  if nginx -t >>"$LOG" 2>&1; then
    if systemctl reload nginx; then say "NGINX-RELOAD-OK"; return 0; fi
  fi
  say "NGINX-TEST-FAILED"
  tail -20 "$LOG" 2>/dev/null || true
  return 1
}

say "=== MAKERX-SUBDOMAIN START ${STAMP} dry=${DRY} ==="
say "uid=$(id -u) user=$(id -un)"
nginx -v 2>&1 | head -1 || true

if [ "$DRY" -eq 0 ]; then
  [ "$(id -u)" -eq 0 ] || { say "ERROR: 需要 root，请用 sudo bash $0"; exit 1; }
fi

# ---------- 1. DNS 预检 ----------
say "--- DNS 预检 ${DOMAIN} ---"
DNS_OK=0
if command -v getent >/dev/null 2>&1; then
  RESOLVED=$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1}' | sort -u | head -3 | tr "\n" " ")
  say "resolved=[${RESOLVED}]"
  [ -n "$RESOLVED" ] && DNS_OK=1
fi
if [ "$DNS_OK" -ne 1 ]; then
  say "WARN: ${DOMAIN} 尚解析不到。请先在 DNSPod 添加记录："
  say "      主机记录 makerx   类型 A   记录值 124.222.99.128"
  say "      添加后等 1-5 分钟，用 dig ${DOMAIN} 确认后再重跑本脚本"
  if [ "$DRY" -eq 0 ]; then exit 1; else say "(dry-run 模式继续)"; fi
fi

# ---------- 2. 部署站点文件 ----------
say "--- 下载 ${BRANCH} 构建产物 ---"
run mkdir -p "$WORK"
if [ "$DRY" -eq 1 ]; then
  say "[dry-run] download tarball ${BRANCH} -> ${SITE_DIR}"
else
  GOT=0
  for URL in     "https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}"     "https://ghproxy.net/https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz"     "https://ghfast.top/https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz"     "https://gh-proxy.com/https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz"
  do
    say "try ${URL}"
    if curl -fsSL --max-time 90 -o "${WORK}/site.tar.gz" "${URL}" && tar tzf "${WORK}/site.tar.gz" >/dev/null 2>&1; then
      GOT=1; say "SOURCE-DOWNLOAD-OK ${URL}"; break
    fi
  done
  if [ "$GOT" -ne 1 ]; then say "ERROR: 所有下载源都失败"; exit 1; fi

  tar xzf "${WORK}/site.tar.gz" -C "$WORK"
  SRC=$(find "$WORK" -maxdepth 1 -mindepth 1 -type d -name "*${BRANCH}*" | head -n1)
  [ -n "$SRC" ] || { say "ERROR: 解包后找不到目录"; ls -la "$WORK"; exit 1; }
  [ -f "${SRC}/index.html" ] || { say "ERROR: 找不到 index.html (SRC=$SRC)"; exit 1; }
  if grep -rq "/makerx/_astro" "$SRC" 2>/dev/null; then
    say "ERROR: 产物里残留 /makerx/ 绝对路径，拒绝部署"; exit 1
  fi
  say "SOURCE-OK $SRC"

  if [ -d "$SITE_DIR" ]; then
    cp -a "$SITE_DIR" "${SITE_DIR}.prev.${STAMP}" && say "SITE-BACKUP-OK ${SITE_DIR}.prev.${STAMP}"
  fi
  mkdir -p "$SITE_DIR"
  find "$SITE_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  cp -a "${SRC}/." "$SITE_DIR/"
  printf "deploy=%s\ndomain=%s\nbranch=%s\n" "$STAMP" "$DOMAIN" "$BRANCH" > "${SITE_DIR}/DEPLOY_STAMP.txt"
  chown -R www-data:www-data "$SITE_DIR" 2>/dev/null || true
  chmod -R 755 "$SITE_DIR"
  say "SITE-REPLACED-OK ${SITE_DIR}"
fi

# ---------- 3. 写 nginx 配置（只新增本文件） ----------
say "--- 备份并写 nginx 配置 ---"
run mkdir -p "$BACKUP"
if [ -f "$CONF" ] && [ "$DRY" -eq 0 ]; then cp -a "$CONF" "${BACKUP}/makerx-subdomain.conf"; fi

if [ "$DRY" -eq 1 ]; then
  say "[dry-run] write ${CONF} (listen 80, server_name ${DOMAIN}, root ${SITE_DIR})"
else
  cat > "$CONF" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    root ${SITE_DIR};
    index index.html;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ \$uri.html =404;
    }

    location ~* \.(?:png|jpg|jpeg|gif|webp|svg|ico|mavatar|woff2?) {
        expires 7d;
        add_header Cache-Control "public";
        try_files \$uri =404;
    }

    location ^~ /_astro/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
NGINX
  say "CONF-WRITTEN ${CONF}"
fi

if ! reload_nginx; then
  say "ERROR: 配置未通过 nginx -t"
  if [ "$DRY" -eq 0 ]; then
    if [ -f "${BACKUP}/makerx-subdomain.conf" ]; then cp -a "${BACKUP}/makerx-subdomain.conf" "$CONF"; else rm -f "$CONF"; fi
    nginx -t >>"$LOG" 2>&1 && systemctl reload nginx || true
    say "ROLLBACK-DONE"
  fi
  exit 1
fi

say "--- HTTP 自检 ---"
if [ "$DRY" -eq 0 ]; then
  for p in "/" "/lab/001-ai-planet/" "/lab/001-ai-planet/lesson-1/" "/lab/001-ai-planet/upgrade/"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "Host: ${DOMAIN}" "http://127.0.0.1${p}" || echo ERR)
    say "http ${p} => ${code}"
  done
fi

# ---------- 4. certbot ----------
say "--- certbot 准备 ---"
if ! command -v certbot >/dev/null 2>&1 || ! certbot plugins 2>/dev/null | grep -qi nginx; then
  run env DEBIAN_FRONTEND=noninteractive apt-get update -y
  run env DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx
fi

say "--- certbot: 签发 ${DOMAIN} 并开启 80 -> 443 跳转 ---"
if ! run certbot --nginx -d "$DOMAIN" --redirect       --non-interactive --agree-tos -m "$EMAIL" --keep-until-expiring; then
  say "ERROR: certbot 失败（HTTP 站点已可用，仅 HTTPS 未启用）"
  say "排查：curl -I http://${DOMAIN}/ ; dig ${DOMAIN}"
  exit 1
fi

if ! reload_nginx; then
  say "ERROR: 证书安装后 nginx -t 失败（证书文件已保留，可重跑）"
  exit 1
fi

# ---------- 5. 最终自检 + 部署回执 ----------
say "--- 最终自检 ---"
if [ "$DRY" -eq 0 ]; then
  ALL_OK=1
  for p in "/" "/lab/001-ai-planet/" "/lab/001-ai-planet/lesson-1/" "/lab/001-ai-planet/upgrade/"; do
    code=$(curl -sk --resolve "${DOMAIN}:443:127.0.0.1" -o /dev/null -w "%{http_code}" --max-time 10 "https://${DOMAIN}${p}" || echo ERR)
    say "https ${p} => ${code}"
    [ "$code" = "200" ] || ALL_OK=0
  done
  curl -s -o /dev/null -w "http_to_https=%{http_code} -> %{redirect_url}\n" -H "Host: ${DOMAIN}" http://127.0.0.1/ | tee -a "$LOG" 2>/dev/null || true
  say "--- 旧入口回归（应保持可用） ---"
  curl -s -o /dev/null -w "ip_root=%{http_code}\n" -H "Host: 124.222.99.128" http://127.0.0.1/ | tee -a "$LOG" 2>/dev/null || true
  curl -s -o /dev/null -w "ip_makerx=%{http_code}\n" -H "Host: 124.222.99.128" http://127.0.0.1/makerx/ | tee -a "$LOG" 2>/dev/null || true

  printf "status=%s\ndeploy=%s\ndomain=%s\nhttps=on\n" "$([ "$ALL_OK" -eq 1 ] && echo ok || echo partial)" "$STAMP" "$DOMAIN" > "${SITE_DIR}/DEPLOY_STATUS.txt"
  chmod 644 "${SITE_DIR}/DEPLOY_STATUS.txt"

  say "--- cert ---"
  certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains|Expiry" | tee -a "$LOG" 2>/dev/null || true
fi

say "=== MAKERX-SUBDOMAIN END (ok) ==="
