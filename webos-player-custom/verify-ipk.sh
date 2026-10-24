#!/usr/bin/env bash
# Validate the actual .ipk bytes after LG packaging, not only TypeScript sources.
set -euo pipefail

IPK="${1:-}"
if [[ -z "$IPK" || ! -f "$IPK" ]]; then
  echo "Usage: bash verify-ipk.sh <path-to-built.ipk>" >&2
  exit 2
fi
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
ar t "$IPK" | grep -qx 'debian-binary'
ar t "$IPK" | grep -qx 'control.tar.gz'
ar t "$IPK" | grep -qx 'data.tar.gz'
ar p "$IPK" data.tar.gz | tar -xzf - -C "$work"

app="$work/usr/palm/applications/com.archsgio.iptv"
service="$work/usr/palm/services/com.archsgio.iptv.service"
test -s "$app/js/app.js"
test -s "$app/css/hybrid-guide.css"
test -s "$app/css/virtual-numpad.css"
test -s "$app/index.html"
test -s "$service/services.json"
grep -Fq 'montecrestese_last_hybrid_channel_v1' "$app/js/app.js"
grep -Fq 'luna://com.webos.applicationManager' "$app/js/app.js"
grep -Fq 'com.webos.app.livetv' "$app/js/app.js"
grep -Fq 'com.webos.app.browser' "$app/js/app.js"
if grep -Fq 'montecrestese_hybrid_connection_v1' "$app/js/app.js"; then
  echo "FAIL: obsolete Mac/PC bridge configuration compiled into TV-only player" >&2
  exit 1
fi
grep -Fq 'Catalogo Montecrestese' "$app/js/app.js"
grep -Fq 'Rai 3 TGR Piemonte' "$app/js/app.js"
grep -Fq 'hybrid-guide.css' "$app/index.html"
grep -Fq 'virtual-numpad.css' "$app/index.html"

node - "$app/appinfo.json" "$app/resources/it/appinfo.json" "$service/services.json" <<'NODE'
const fs = require('fs');
const [mainFile, italianFile, serviceFile] = process.argv.slice(2);
const app = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
const it = JSON.parse(fs.readFileSync(italianFile, 'utf8'));
const service = JSON.parse(fs.readFileSync(serviceFile, 'utf8'));
if (app.id !== 'com.archsgio.iptv' ||
    app.title !== 'IPTV Montecrestese' ||
    it.title !== 'IPTV Montecrestese' ||
    service.id !== 'com.archsgio.iptv.service' ||
    app.main !== 'index.html') {
  throw Error('IPK LG metadata, Italian app title or service ID differs');
}
console.log('OK: LG app metadata, Italian locale and bundled service verified');
NODE
echo "OK: packaged JS contains TV-only native LG launcher, last-source state, regional LCN and D-pad CSS; no Mac bridge"
sha256sum "$IPK"
