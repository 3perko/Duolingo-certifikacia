#!/usr/bin/env bash
# Creates the configuration file .env in the repository root from server/.env.example,
# with freshly generated secrets. Never prints secret values.
#
#   bash "installation guide/scripts/make-env.sh" --mode docker      # docker compose (http://localhost:8080)
#   bash "installation guide/scripts/make-env.sh" --mode local       # Python + Node directly (http://localhost:5173)
#   options: --dev-auth on|off (default on)   --force (overwrite an existing .env, a backup is kept)
set -euo pipefail

MODE=""; DEV_AUTH="on"; FORCE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --mode) MODE="$2"; shift 2 ;;
    --dev-auth) DEV_AUTH="$2"; shift 2 ;;
    --force) FORCE=1; shift ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "Neznámy parameter: $1" >&2; exit 2 ;;
  esac
done
case "$MODE" in docker|local) ;; *) echo "Zadaj --mode docker alebo --mode local" >&2; exit 2 ;; esac
case "$DEV_AUTH" in on|off) ;; *) echo "--dev-auth musí byť on alebo off" >&2; exit 2 ;; esac

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXAMPLE="$ROOT/server/.env.example"
TARGET="$ROOT/.env"

if [ -f "$TARGET" ] && [ "$FORCE" -ne 1 ]; then
  echo ".env už existuje ($TARGET) – nič som nezmenil. Na prepísanie použi --force."
  exit 0
fi
# With --force keep existing secrets: PostgreSQL remembers the password from its first start,
# and a new AI_QUEST_SECRET would sign everyone out. Everything else is regenerated.
old() { [ -f "$TARGET" ] && grep -E "^$1=" "$TARGET" | tail -n1 | cut -d= -f2- || true; }
OLD_SECRET="$(old AI_QUEST_SECRET)"; OLD_PG="$(old POSTGRES_PASSWORD)"
case "$OLD_SECRET" in ""|change-me*) OLD_SECRET="" ;; esac
case "$OLD_PG" in ""|change-me*) OLD_PG="" ;; esac
if [ -f "$TARGET" ]; then cp -p "$TARGET" "$TARGET.backup.$(date +%Y%m%d%H%M%S)"; echo "Pôvodný .env zálohovaný (ostatné hodnoty z neho prenes ručne, ak treba)."; fi

rand() {
  if command -v openssl >/dev/null 2>&1; then openssl rand -hex 32
  elif command -v python3 >/dev/null 2>&1; then python3 -c 'import secrets;print(secrets.token_hex(32))'
  else head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; fi
}

if [ "$MODE" = "docker" ]; then URL="http://localhost:8080"; DB="sqlite:///./aiquest.db"; else URL="http://localhost:5173"; DB="sqlite:///./aiquest.db"; fi
DEV=$([ "$DEV_AUTH" = "on" ] && echo 1 || echo 0)

# set_kv KEY VALUE – replaces "KEY=..." (also a commented "# KEY=...") in the target file
set_kv() {
  local key="$1" val="$2"
  if grep -qE "^#? ?$key=" "$TARGET"; then
    awk -v k="$key" -v v="$val" 'BEGIN{done=0} { if (!done && ($0 ~ "^"k"=" || $0 ~ "^# ?"k"=")) { print k"="v; done=1 } else print }' "$TARGET" > "$TARGET.tmp" && mv "$TARGET.tmp" "$TARGET"
  else
    printf '%s=%s\n' "$key" "$val" >> "$TARGET"
  fi
}

cp "$EXAMPLE" "$TARGET"
set_kv AI_QUEST_SECRET "${OLD_SECRET:-$(rand)}"
set_kv POSTGRES_PASSWORD "${OLD_PG:-$(rand)}"
set_kv AI_QUEST_DEV_AUTH "$DEV"
set_kv AI_QUEST_PUBLIC_URL "$URL"
set_kv AI_QUEST_CORS_ORIGINS "$URL"
set_kv DATABASE_URL "$DB"
chmod 600 "$TARGET"  # only you can read the secrets

echo "Vytvorený $TARGET (režim: $MODE, adresa: $URL, vývojové prihlásenie: $DEV_AUTH)."
if [ -n "$OLD_SECRET$OLD_PG" ]; then echo "Zachované existujúce tajomstvá (AI_QUEST_SECRET, POSTGRES_PASSWORD)."; else echo "Vygenerované: AI_QUEST_SECRET, POSTGRES_PASSWORD (hodnoty sa nevypisujú)."; fi
echo "Doplň ručne podľa návodu: ANTHROPIC_API_KEY (voliteľné), Supabase a Stripe (voliteľné)."
if [ "$MODE" = "local" ]; then
  echo "Pre režim local: ak budeš používať Supabase, skopíruj VITE_SUPABASE_URL a VITE_SUPABASE_ANON_KEY aj do web/.env.local (krok 5A)."
fi
