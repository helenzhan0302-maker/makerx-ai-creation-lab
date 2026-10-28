#!/usr/bin/env bash
# MakerX AI 造物实验室 · skftai.top 根路径回退 + 启用 HTTPS
#
# 2026-10-28 用户决定：
#   1. skftai.top 根路径另有用途，MakerX 不再占用根路径
#   2. MakerX 固定地址：https://skftai.top/makerx/
#   3. 启用 HTTPS
#
# 用法（服务器 root）：
#   bash server-setup-skftai-https.sh --dry-run         # 只打印将要执行的动作
#   bash server-setup-skftai-https.sh                   # 第一步：根路径回退 + 申请并安装证书（不强制跳转）
#   bash server-setup-skftai-https.sh --enable-redirect  # 第二步：443 放行后，HTTP 全量跳 HTTPS
#
# 安全约束：
#   - 改动前把相关配置备份到 /root/makerx-backup-<时间戳>/
#   - 每次改完跑 nginx -t；失败自动还原备份且不 reload
#   - 不修改 /var/www/sugarcube 与 /var/www/makerx 内的站点文件
set -uo pipefail

CONF_DIR="/etc/nginx/conf.d"
SUGAR_CONF="${CONF_DIR}/sugarcube.conf"
DOMAIN_CONF="${CONF_DIR}/makerx-domain.conf"
WWW_CONF="${CONF_DIR}/skftai-www.conf"
MAKERX_DIR="/var/www/makerx"
EMAIL="helen.zhan0302@gmail.com"
LOG="/var/log/makerx-skftai.log"

MODE="setup"
DRY=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY=1 ;;
    --enable-redirect) MODE="redirect" ;;
    *) echo "未知参数: $arg"; exit 2 ;;
  esac
done

STAMP="$(date +%Y%m%d%H%M%S)"
BACKUP="/root/makerx-backup-${STAMP}"

say() { echo "$*" | tee -a "$LOG"; }
run() {
  if [ "$DRY" -eq 1 ]; then
    echo "[dry-run] $*" | tee -a "$LOG"
    return 0
  fi
  "$@"
}

reload_nginx() {
  if [ "$DRY" -eq 1 ]; then
    echo "[dry-run] nginx -t && systemctl reload nginx" | tee -a "$LOG"
    return 0
  fi
  if nginx -t 2>&1 | tee -a "$LOG"; then
    systemctl reload nginx
    say "NGINX-RELOAD-OK"
    return 0
  fi
  return 1
}

backup_current() {
  run mkdir -p "$BACKUP"
  run cp -a "$SUGAR_CONF" "${BACKUP}/sugarcube.conf"
  [ -f "$DOMAIN_CONF" ] && run cp -a "$DOMAIN_CONF" "${BACKUP}/makerx-domain.conf"
  [ -f "$WWW_CONF" ] && run cp -a "$WWW_CONF" "${BACKUP}/skftai-www.conf"
  say "BACKUP-OK ${BACKUP}"
  return 0
}

restore_current() {
  say "ROLLBACK: 从 ${BACKUP} 还原配置"
  run cp -a "${BACKUP}/sugarcube.conf" "$SUGAR_CONF"
  if [ -f "${BACKUP}/makerx-domain.conf" ]; then
    run cp -a "${BACKUP}/makerx-domain.conf" "$DOMAIN_CONF"
  else
    run rm -f "$DOMAIN_CONF"
  fi
  if [ -f "${BACKUP}/skftai-www.conf" ]; then
    run cp -a "${BACKUP}/skftai-www.conf" "$WWW_CONF"
  else
    run rm -f "$WWW_CONF"
  fi
  [ "$DRY" -eq 0 ] && { nginx -t && systemctl reload nginx || true; }
}

write_www_conf() {
  local scheme="$1"
  if [ "$DRY" -eq 1 ]; then
    echo "[dry-run] write ${WWW_CONF} (www -> ${scheme}://skftai.top)" | tee -a "$LOG"
    return 0
  fi
  cat > "$WWW_CONF" <<NGINX
server {
    listen 80;
    server_name www.skftai.top;
    return 301 ${scheme}://skftai.top\$request_uri;
}
NGINX
  say "WWW-CONF-WRITTEN ${scheme}"
}

say "=== MAKERX-SKFTAI START ${STAMP} mode=${MODE} dry=${DRY} ==="
say "uid=$(id -u) user=$(id -un)"
nginx -v 2>&1 | tee -a "$LOG" || true

if [ "$DRY" -eq 0 ]; then
  [ "$(id -u)" -eq 0 ] || { say "ERROR: 需要 root，请用 sudo bash $0"; exit 1; }
  [ -f "$SUGAR_CONF" ] || { say "ERROR: 找不到 ${SUGAR_CONF}"; exit 1; }
  [ -f "${MAKERX_DIR}/index.html" ] || { say "ERROR: 找不到 ${MAKERX_DIR}/index.html"; exit 1; }
fi

say "--- baseline ---"
for path in "/" "/makerx" "/makerx/" "/makerx/lab/001-ai-planet/"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "Host: skftai.top" "http://127.0.0.1${path}" || echo ERR)
  loc=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time 10 -H "Host: skftai.top" "http://127.0.0.1${path}" || true)
  say "before ${path} => ${code} ${loc}"
done

backup_current

# ---------------- 第一步：根路径回退 ----------------
if [ "$MODE" = "setup" ]; then
  if [ -f "$DOMAIN_CONF" ]; then
    say "--- 移除 makerx-domain.conf，把根路径还给原站点 ---"
    run rm -f "$DOMAIN_CONF"
  else
    say "SKIP: makerx-domain.conf 不存在"
  fi

  write_www_conf "http"

  if ! reload_nginx; then
    say "ERROR: 回退后 nginx -t 失败，已还原"
    restore_current
    exit 1
  fi

  say "--- 回退自检 ---"
  for path in "/" "/makerx" "/makerx/" "/makerx/lab/001-ai-planet/"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "Host: skftai.top" "http://127.0.0.1${path}" || echo ERR)
    loc=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time 10 -H "Host: skftai.top" "http://127.0.0.1${path}" || true)
    say "after ${path} => ${code} ${loc}"
  done

  say "--- 安装 certbot（如缺失） ---"
  if ! command -v certbot >/dev/null 2>&1; then
    run env DEBIAN_FRONTEND=noninteractive apt-get update -y
    run env DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx
  fi

  say "--- certbot: 申请并安装证书（暂不强制跳转） ---"
  if ! run certbot --nginx -d skftai.top --no-redirect \
        --non-interactive --agree-tos -m "$EMAIL" --keep-until-expiring; then
    say "ERROR: certbot 失败。请检查 skftai.top 的 A 记录与 80 端口"
    say "注意：certbot 会自动回滚它对 nginx 配置的改动"
    exit 1
  fi

  if ! reload_nginx; then
    say "ERROR: 证书安装后 nginx -t 失败，已还原（证书文件保留，可重新运行）"
    restore_current
    exit 1
  fi

  say "--- HTTPS 自检（本机 443） ---"
  curl -sk --resolve skftai.top:443:127.0.0.1 -o /dev/null -w "https_root=%{http_code}\n" https://skftai.top/ | tee -a "$LOG" || true
  curl -sk --resolve skftai.top:443:127.0.0.1 -o /dev/null -w "https_makerx=%{http_code}\n" https://skftai.top/makerx/ | tee -a "$LOG" || true
  curl -s -o /dev/null -w "ip_root=%{http_code}\n" -H "Host: 124.222.99.128" http://127.0.0.1/ | tee -a "$LOG" || true
  curl -s -o /dev/null -w "ip_makerx=%{http_code}\n" -H "Host: 124.222.99.128" http://127.0.0.1/makerx/ | tee -a "$LOG" || true

  say "--- cert ---"
  certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains|Expiry" | tee -a "$LOG" || true
  say "NEXT: 腾讯云控制台放行 TCP:443 后，运行 bash $0 --enable-redirect"
  say "=== MAKERX-SKFTAI END (setup) ==="
  exit 0
fi

# ---------------- 第二步：HTTP 全量跳 HTTPS ----------------
say "--- certbot: 启用 80 -> 443 跳转 ---"
if ! run certbot --nginx -d skftai.top --redirect \
      --non-interactive --agree-tos -m "$EMAIL" --keep-until-expiring; then
  say "ERROR: 启用跳转失败"
  restore_current
  exit 1
fi

write_www_conf "https"

if ! reload_nginx; then
  say "ERROR: 跳转配置未通过 nginx -t，已还原"
  restore_current
  exit 1
fi

say "--- 跳转自检 ---"
for path in "/" "/makerx/" "/makerx/lab/001-ai-planet/"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "Host: skftai.top" "http://127.0.0.1${path}" || echo ERR)
  loc=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time 10 -H "Host: skftai.top" "http://127.0.0.1${path}" || true)
  say "http ${path} => ${code} ${loc}"
done
curl -s -o /dev/null -w "www_redirect=%{http_code} -> %{redirect_url}\n" -H "Host: www.skftai.top" http://127.0.0.1/ | tee -a "$LOG" || true
curl -sk --resolve skftai.top:443:127.0.0.1 -o /dev/null -w "https_makerx=%{http_code}\n" https://skftai.top/makerx/ | tee -a "$LOG" || true
say "=== MAKERX-SKFTAI END (redirect) ==="
