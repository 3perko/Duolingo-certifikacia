#!/usr/bin/env bash
# Checks the tools needed to run AI QUEST. Safe to run any time; changes nothing.
#   bash "installation guide/scripts/check-prereqs.sh" [docker|local|all]
# Exit code 0 = everything needed for the chosen mode is present.
set -u
MODE="${1:-all}"
FAIL=0

ok()   { printf '  [OK]      %-16s %s\n' "$1" "$2"; }
miss() { printf '  [CHYBA]   %-16s %s\n' "$1" "$2"; FAIL=1; }
warn() { printf '  [POZOR]   %-16s %s\n' "$1" "$2"; }

ver_ge() { # ver_ge 3.12.1 3.10 -> true if first >= second
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

echo "AI QUEST – kontrola predpokladov (režim: $MODE)"

if command -v git >/dev/null 2>&1; then ok git "$(git --version | awk '{print $3}')"; else miss git "nainštaluj Git (krok 1 v návode)"; fi

if [ "$MODE" = "docker" ] || [ "$MODE" = "all" ]; then
  if command -v docker >/dev/null 2>&1; then
    ok docker "$(docker --version | sed 's/Docker version //; s/,.*//')"
    if docker info >/dev/null 2>&1; then ok "docker daemon" "beží"; else miss "docker daemon" "nebeží – spusti Docker Desktop / sudo systemctl start docker"; fi
    if docker compose version >/dev/null 2>&1; then ok "docker compose" "$(docker compose version --short 2>/dev/null)"; else miss "docker compose" "chýba plugin docker compose v2"; fi
  else
    miss docker "nainštaluj Docker (krok 1 v návode)"
  fi
fi

if [ "$MODE" = "local" ] || [ "$MODE" = "all" ]; then
  PY=""
  for c in python3 python; do command -v "$c" >/dev/null 2>&1 && PY="$c" && break; done
  if [ -n "$PY" ]; then
    v="$($PY -c 'import sys;print("%d.%d.%d"%sys.version_info[:3])')"
    if ver_ge "$v" 3.10; then ok python "$v"; else miss python "$v – potrebná verzia 3.10 alebo novšia"; fi
    if $PY -c 'import venv' >/dev/null 2>&1; then ok "python venv" "dostupný"; else miss "python venv" "chýba modul venv (Debian/Ubuntu: sudo apt install python3-venv)"; fi
  else
    miss python "nainštaluj Python 3.10+ (krok 1 v návode)"
  fi
  if command -v node >/dev/null 2>&1; then
    v="$(node --version | tr -d v)"
    if ver_ge "$v" 18.0; then ok node "$v"; else miss node "$v – potrebná verzia 18 alebo novšia (odporúčaná 22)"; fi
  else
    miss node "nainštaluj Node.js 22 LTS (krok 1 v návode)"
  fi
  if command -v npm >/dev/null 2>&1; then ok npm "$(npm --version)"; else miss npm "príde spolu s Node.js"; fi
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [ -f "$ROOT/.env" ]; then ok ".env" "existuje ($ROOT/.env)"; else warn ".env" "zatiaľ neexistuje – vytvor ho skriptom make-env.sh (krok 3)"; fi

echo
if [ "$FAIL" -eq 0 ]; then echo "Výsledok: všetko potrebné je pripravené."; else echo "Výsledok: niečo chýba – pozri riadky [CHYBA]."; fi
exit "$FAIL"
