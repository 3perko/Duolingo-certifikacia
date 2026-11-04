#!/usr/bin/env bash
# Verifies a running AI QUEST installation. Changes nothing except, in dev-login mode,
# creating one test account (verify@example.com).
#   bash "installation guide/scripts/verify.sh" [BASE_URL]
#   BASE_URL: http://localhost:8080 (docker, default) | http://localhost:5173 (local) | your https domain
set -u
BASE="${1:-http://localhost:8080}"
BASE="${BASE%/}"
FAIL=0
pass() { printf '  [OK]     %s\n' "$1"; }
fail() { printf '  [CHYBA]  %s\n' "$1"; FAIL=1; }
info() { printf '  [INFO]   %s\n' "$1"; }

command -v curl >/dev/null 2>&1 || { echo "Chýba curl."; exit 2; }
PY=$(command -v python3 || command -v python || true)
[ -n "$PY" ] || { echo "Chýba python3 (na čítanie JSON)."; exit 2; }
json() { "$PY" -c "import sys,json; d=json.load(sys.stdin); print($1)"; }

echo "AI QUEST – overenie inštalácie na $BASE"

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
if [ "$code" = "200" ]; then pass "webová aplikácia odpovedá (HTTP 200)"; else fail "webová aplikácia: HTTP $code (beží web/vite?)"; fi

health=$(curl -s "$BASE/api/health" || true)
if echo "$health" | json 'd["status"]' 2>/dev/null | grep -q ok; then
  pass "API odpovedá: $health"
  ai=$(echo "$health" | json 'd["ai"]'); auth=$(echo "$health" | json 'd["auth"]'); billing=$(echo "$health" | json 'd["billing"]'); payments=$(echo "$health" | json 'd["payments"]')
  [ "$ai" = "True" ] && pass "AI kľúč je nastavený" || info "AI kľúč nie je nastavený – AI funkcie pobežia v offline režime"
  case "$auth" in
    supabase) pass "prihlásenie: Supabase" ;;
    dev) info "prihlásenie: vývojový režim (len e-mail) – nepoužívať verejne" ;;
    none) info "prihlásenie vypnuté – účty, ligy a synchronizácia nebudú dostupné" ;;
  esac
  [ "$billing" = "True" ] && info "obmedzenia FREE/PREMIUM sú zapnuté (platby: $payments)" || info "platby vypnuté – všetko je odomknuté"
else
  fail "API na $BASE/api/health neodpovedá správne: ${health:-žiadna odpoveď}"
fi

if [ "${auth:-}" = "dev" ]; then
  token=$(curl -s -X POST "$BASE/api/auth/dev-login" -H 'Content-Type: application/json' -d '{"email":"verify@example.com","name":"Verify"}' | json 'd["access_token"]' 2>/dev/null || true)
  if [ -n "$token" ]; then
    me=$(curl -s "$BASE/api/me" -H "Authorization: Bearer $token")
    echo "$me" | json 'd["email"]' 2>/dev/null | grep -q verify@example.com && pass "prihlásenie a /api/me fungujú" || fail "/api/me: $me"
    put=$(curl -s -o /dev/null -w '%{http_code}' -X PUT "$BASE/api/progress" -H "Authorization: Bearer $token" -H 'Content-Type: application/json' -d '{"data":{"version":2},"summary":{}}')
    [ "$put" = "200" ] && pass "zápis do databázy funguje" || fail "zápis pokroku: HTTP $put"
  else
    fail "vývojové prihlásenie zlyhalo"
  fi
fi

echo
if [ "$FAIL" -eq 0 ]; then echo "Výsledok: inštalácia funguje. Otvor $BASE v prehliadači."; else echo "Výsledok: niečo nefunguje – pozri [CHYBA] a sekciu Riešenie problémov v návode."; fi
exit "$FAIL"
