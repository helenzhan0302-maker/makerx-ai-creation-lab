#!/usr/bin/env bash
# 把 MakerX AI 工具盒挂到 makerx.skftai.top/365ai/ 下
# 不改任何 nginx 配置：复用 makerx 现有 server 块的 root 与 try_files
set -uo pipefail

REPO="helenzhan0302-maker/makerx-ai-creation-lab"
BRANCH="deploy-tool"
DOMAIN="makerx.skftai.top"
MAKERX_ROOT="/var/www/makerx-subdomain"
TARGET="${MAKERX_ROOT}/365ai"
STAMP="$(date +%Y%m%d%H%M%S)"
WORK="/var/tmp/365ai-${STAMP}"

say() { echo "$*"; }

say "=== 365AI-DEPLOY-START ${STAMP} ==="

if [ "$(id -u)" -ne 0 ]; then say "ERROR: 需要 root"; exit 1; fi

if [ ! -d "$MAKERX_ROOT" ]; then
  say "ERROR: 找不到 makerx 站点目录 $MAKERX_ROOT"
  exit 1
fi

say "--- 现有 makerx root ---"
ls -la "$MAKERX_ROOT" | head -20

mkdir -p "$WORK"
GOT=0
for u in \
  "https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}" \
  "https://ghproxy.net/https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz" \
  "https://ghfast.top/https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz" \
  "https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/tool-site/index.html"
do
  say "try ${u}"
  if curl -fsSL --connect-timeout 15 --max-time 120 -o "${WORK}/site.tar.gz" "$u" 2>/dev/null && tar tzf "${WORK}/site.tar.gz" >/dev/null 2>&1; then
    GOT=1; say "SOURCE-DOWNLOAD-OK ${u}"; break
  fi
done

if [ "$GOT" -ne 1 ]; then
  say "WARN: tarball 失败，改用 jsDelivr 逐文件"
  SRC="${WORK}/${BRANCH}"
  mkdir -p "$SRC"
  FAIL=0
  for f in index.html resources.html styles.css resources.css app.js robots.txt assets/favicon.svg; do
    mkdir -p "${SRC}/$(dirname "$f")"
    curl -fsSL --max-time 60 -o "${SRC}/${f}" "https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/tool-site/${f}" || FAIL=$((FAIL+1))
  done
  if [ "$FAIL" -ne 0 ]; then say "ERROR: jsDelivr 失败 ${FAIL} 个"; exit 1; fi
  SRC_OK="$SRC"
else
  tar xzf "${WORK}/site.tar.gz" -C "$WORK"
  ROOTDIR=$(find "$WORK" -maxdepth 1 -mindepth 1 -type d -name "*${BRANCH}*" | head -n1)
  [ -n "$ROOTDIR" ] || { say "ERROR: 解包后找不到目录"; ls -la "$WORK"; exit 1; }
  SRC_OK="${ROOTDIR}/tool-site"
fi

[ -f "${SRC_OK}/index.html" ] || { say "ERROR: 找不到 index.html"; exit 1; }
say "SOURCE-OK ${SRC_OK}"

if [ -d "$TARGET" ]; then
  mv "$TARGET" "${TARGET}.prev.${STAMP}" && say "BACKUP-OK ${TARGET}.prev.${STAMP}"
fi

mkdir -p "$TARGET"
cp -a "${SRC_OK}/." "$TARGET/"
rm -rf "${TARGET}/vercel.json"
chown -R www-data:www-data "$TARGET" 2>/dev/null || true
chmod -R 755 "$TARGET"
printf "deploy=%s\nurl=https://%s/365ai/\nbranch=%s\nupstream=%s\nnote=makerx deploy wipes this dir; rerun this script after any makerx redeploy\n" "$STAMP" "$DOMAIN" "$BRANCH" "$REPO" > "${TARGET}/DEPLOY_STAMP.txt"
chmod 644 "${TARGET}/DEPLOY_STAMP.txt"
say "SITE-REPLACED-OK ${TARGET}"
ls -la "$TARGET"

say "--- 自检（Host: ${DOMAIN}）---"
ALL_OK=1
for p in "/365ai/" "/365ai/resources" "/365ai/resources.html" "/365ai/styles.css" "/365ai/assets/favicon.svg"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -H "Host: ${DOMAIN}" "http://127.0.0.1${p}" || echo ERR)
  say "http ${p} => ${code}"
  [ "$code" = "200" ] || ALL_OK=0
done

say "--- 现有 makerx 回归（必须仍为 200）---"
for p in "/" "/lab/002-picturebook/"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}${p}" || echo ERR)
  say "https ${p} => ${code}"
  [ "$code" = "200" ] || ALL_OK=0
done

say "--- /prompts 应为 404（未发布）---"
curl -s -o /dev/null -w "http /365ai/prompts => %{http_code}\n" -H "Host: ${DOMAIN}" "http://127.0.0.1/365ai/prompts" || true

say "STAMP=${STAMP}"
say "RESULT=$([ "$ALL_OK" -eq 1 ] && echo ok || echo fail)"
say "=== 365AI-DEPLOY-END ==="