# AI QUEST – inštalačný návod servera

Tento návod ťa prevedie celou inštaláciou AI QUEST **na vlastnom počítači** (Windows, macOS
alebo Linux) a neskôr **v cloude**. Je písaný pre človeka, ale každý krok má aj presný príkaz,
spôsob overenia a očakávaný výsledok, takže ho vie spoľahlivo vykonať aj Claude Code.

> Všetky príkazy sa spúšťajú z **koreňa repozitára** (priečinok `Duolingo-certifikacia`),
> pokiaľ nie je uvedené inak. Názov tohto priečinka obsahuje medzeru, preto cesty k skriptom
> píš v úvodzovkách: `bash "installation guide/scripts/verify.sh"`.

---

## Pokyny pre Claude Code (a iného AI asistenta)

Ak tento návod vykonáva AI asistent, platia tieto pravidlá:

1. **Najprv zisti stav, potom konaj.** Spusti `bash "installation guide/scripts/check-prereqs.sh" <docker|local>`
   a podľa výsledku pokračuj krokom, ktorý ešte nie je splnený. Všetky skripty sú bezpečné na
   opakované spustenie.
2. **Systémový softvér inštaluj len so súhlasom používateľa.** Príkazy so `sudo`, inštalátory a
   zmeny systému najprv ukáž a vysvetli.
3. **Tajomstvá nikdy nevypisuj, neukladaj do gitu ani do správ.** `.env` je v `.gitignore`.
   API kľúče (Anthropic, Stripe, Supabase) nech používateľ vloží do `.env` sám, alebo ich zapíš
   bez ich zopakovania vo výstupe. `make-env.sh` hodnoty nikdy nevypisuje.
4. **Po každom kroku spusti jeho overenie** zo stĺpca „Overenie“. Ak nesedí s očakávaným
   výsledkom, zastav sa, pozri [Riešenie problémov](#12-riešenie-problémov) a povedz používateľovi,
   čo presne zlyhalo.
5. **Nikdy bez výslovného súhlasu nespúšťaj** `docker compose down -v` ani nemaž
   `server/aiquest.db`: zmaže to všetky dáta používateľov.
6. **Vývojové prihlásenie (`AI_QUEST_DEV_AUTH=1`) nikdy nenechávaj zapnuté, keď je server
   dostupný z internetu.** Ktokoľvek by sa prihlásil len e-mailom.
7. Na konci spusti `bash "installation guide/scripts/verify.sh" <adresa>` a výsledok ukáž používateľovi.

---

## 0. Čo budeš inštalovať a ktorú cestu zvoliť

AI QUEST má tri časti:

| Časť | Technológia | Úloha |
| --- | --- | --- |
| Webová aplikácia (PWA) | React + TypeScript | Všetko, čo vidí používateľ. Učenie beží priamo v prehliadači. |
| API server | Python 3.13 + FastAPI | AI učiteľ, účty, synchronizácia, ligy, platby, firemné tímy |
| Databáza | PostgreSQL 16 (alebo SQLite pri vývoji) | Účty, pokrok, ligy, tímy |

Voliteľné externé služby (dajú sa doplniť kedykoľvek neskôr):

| Služba | Na čo | Bez nej |
| --- | --- | --- |
| Anthropic API | AI učiteľ, hodnotenie promptov, varianty otázok | AI funkcie bežia v offline režime |
| Supabase | Bezpečné prihlásenie (e-mail + heslo) | Vývojové prihlásenie len e-mailom, vhodné iba lokálne |
| Stripe | Predplatné Premium a firemné licencie | Všetko je odomknuté pre každého |

**Zvoľ jednu cestu:**

| | **A – Priamo na počítači** | **B – Docker (odporúčané)** |
| --- | --- | --- |
| Na čo | Vývoj a skúšanie, úprava kódu | Bežná prevádzka, rovnaké ako neskôr v cloude |
| Potrebuješ | Python 3.10+, Node.js 22 | Docker Desktop / Docker Engine |
| Databáza | SQLite (súbor `server/aiquest.db`) | PostgreSQL v kontajneri |
| Adresa | http://localhost:5173 | http://localhost:8080 |
| Štart | 2 terminály | 1 príkaz |

> **Stav overenia:** cesta A bola otestovaná od nuly presne podľa tohto návodu. Pri ceste B sa
> overili migrácie, štart servera a celé API proti PostgreSQL 16 bez kontajnerov. Samotné Docker
> obrazy sa zatiaľ nezostavovali (v testovacom prostredí nebežal Docker), takže prvé
> `docker compose up --build` je ich prvý reálny test. Ak zlyhá, pozri
> [Riešenie problémov](#12-riešenie-problémov).

---

## 1. Inštalácia predpokladov

### Spoločné pre obe cesty: Git

| Systém | Príkaz / postup |
| --- | --- |
| Windows | Stiahni a nainštaluj Git z https://git-scm.com/download/win (pribalí aj **Git Bash**, v ktorom fungujú skripty tohto návodu) |
| macOS | `xcode-select --install` |
| Ubuntu / Debian | `sudo apt update && sudo apt install -y git curl` |

### Cesta B: Docker

| Systém | Postup |
| --- | --- |
| Windows 10/11 | Nainštaluj **Docker Desktop** (https://www.docker.com/products/docker-desktop/), pri inštalácii nechaj zapnuté **WSL 2**. Po inštalácii Docker Desktop spusti. |
| macOS | Nainštaluj **Docker Desktop** pre svoj procesor (Apple Silicon / Intel) a spusti ho. |
| Ubuntu / Debian | `curl -fsSL https://get.docker.com \| sudo sh` a potom `sudo usermod -aG docker $USER` (odhlás sa a prihlás, aby to platilo). |

Overenie: `docker --version` aj `docker compose version` vypíšu verziu a `docker info` skončí bez chyby.

### Cesta A: Python a Node.js

| Systém | Python 3.10+ (odporúčaný 3.13) | Node.js 22 LTS |
| --- | --- | --- |
| Windows | https://www.python.org/downloads/ – pri inštalácii zaškrtni **Add python.exe to PATH** | https://nodejs.org (verzia LTS) |
| macOS | `brew install python@3.13` (Homebrew: https://brew.sh) | `brew install node@22` |
| Ubuntu / Debian | `sudo apt install -y python3 python3-venv python3-pip` | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash - && sudo apt install -y nodejs` |

Overenie: `python3 --version` (na Windows `python --version`) ukáže 3.10 alebo vyššiu verziu,
`node --version` ukáže v18 alebo vyššiu (odporúčaná v22).

### Automatická kontrola

```bash
bash "installation guide/scripts/check-prereqs.sh" docker   # alebo: local
```

**Očakávaný výsledok:** všetky riadky `[OK]` a na konci „všetko potrebné je pripravené“.
Riadok `[POZOR] .env` je v tejto chvíli v poriadku, súbor `.env` vznikne v kroku 3.

> **Windows:** skripty `.sh` spúšťaj v **Git Bash** alebo vo **WSL**, nie v PowerShell.
> Pri ceste B s Docker Desktopom stačí Git Bash.

---

## 2. Stiahnutie kódu

```bash
git clone https://github.com/3perko/Duolingo-certifikacia.git
cd Duolingo-certifikacia
```

Ak pracuješ na vývojovej vetve: `git checkout claude/eager-pascal-44ltkd`.

**Overenie:** `ls` ukáže priečinky `web`, `server`, `installation guide`, `How-It-Works`.

---

## 3. Konfigurácia (`.env`)

Všetky nastavenia servera sú v jednom súbore `.env` v koreni repozitára. Vytvorí ho skript
a vygeneruje doň náhodné tajomstvá:

```bash
# cesta B (Docker):
bash "installation guide/scripts/make-env.sh" --mode docker
# cesta A (priamo na počítači):
bash "installation guide/scripts/make-env.sh" --mode local
```

Skript existujúci `.env` neprepíše. S `--force` ho prepíše, starý zálohuje a **zachová**
existujúce tajomstvá. Heslo databázy totiž platí od prvého spustenia, takže jeho zmena by
odstrihla server od dát.

**Overenie:** súbor `.env` existuje a `grep -c '^AI_QUEST_SECRET=' .env` vypíše `1`.

### Čo v `.env` doplniť ručne

Otvor `.env` v textovom editore. Všetko je voliteľné, aplikácia funguje aj bez toho:

| Premenná | Kde ju získaš | Účinok |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → **API Keys** → Create Key (účet potrebuje kredit) | Zapne AI učiteľa, AI hodnotenie a varianty otázok |
| `AI_QUEST_MODEL` | voliteľné, predvolene `claude-opus-5-5` | Zmena modelu |
| `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | [Krok 7](#7-voliteľné-prihlásenie-cez-supabase) | Skutočné účty s heslom |
| `STRIPE_*` | [Krok 8](#8-voliteľné-platby-cez-stripe) | Predplatné Premium a Business |
| `AI_QUEST_DEV_AUTH` | `1` = prihlásenie len e-mailom (iba lokálne), `0` = vypnuté | Pozri bezpečnostné poznámky |
| `AI_QUEST_FREE_DAILY_AI`, `AI_QUEST_PREMIUM_DAILY_AI` | predvolene 10 a 200 | Denné limity AI volaní |

> Ak nenastavíš Supabase ani dev prihlásenie (`AI_QUEST_DEV_AUTH=0`), aplikácia funguje bez
> účtov: učenie áno, synchronizácia, ligy a tímy nie.

---

## 4. Cesta B – spustenie cez Docker (odporúčané)

```bash
docker compose up -d --build
```

Prvé spustenie trvá niekoľko minút (sťahujú sa obrazy, inštalujú sa balíky). Docker spustí tri
kontajnery: `db` (PostgreSQL), `api` (pri štarte sám aplikuje migrácie databázy) a `web` (nginx).

**Overenie:**

```bash
docker compose ps                                    # všetky 3 služby "running" / db "healthy"
bash "installation guide/scripts/verify.sh" http://localhost:8080
```

**Očakávaný výsledok:** riadky `[OK]` pre webovú aplikáciu a API, na konci „inštalácia funguje“.
Otvor **http://localhost:8080**.

Užitočné príkazy:

| Čo | Príkaz |
| --- | --- |
| Logy servera | `docker compose logs -f api` |
| Zastaviť (dáta ostanú) | `docker compose stop` |
| Znova spustiť | `docker compose up -d` |
| Po zmene `.env` | `docker compose up -d` (pri zmene `VITE_*` treba `docker compose up -d --build web`) |

Kontajnery majú `restart: unless-stopped`, takže sa po reštarte počítača spustia samé, ak sa
spustí aj Docker (v Docker Desktop: *Settings → General → Start Docker Desktop when you sign in*).

---

## 5. Cesta A – spustenie priamo na počítači

### 5A.1 Server (terminál 1)

macOS / Linux / Git Bash:

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate            # Git Bash na Windows: source .venv/Scripts/activate
pip install -r requirements-dev.txt
python -m pytest -q                  # voliteľné: overí inštaláciu
set -a; . ../.env; set +a            # načíta nastavenia z .env
uvicorn app.main:app --port 8000
```

Windows PowerShell (alternatíva bez Git Bash):

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Get-Content ..\.env | Where-Object { $_ -match '^[A-Z_]+=' } | ForEach-Object { $k,$v = $_ -split '=',2; Set-Item "env:$k" $v }
uvicorn app.main:app --port 8000
```

**Overenie:** v termináli sa objaví `Application startup complete.` a pri zapnutom dev
prihlásení aj varovanie `AI_QUEST_DEV_AUTH is on…` (to je v poriadku lokálne). Testy vypíšu
`30 passed`. Databáza sa vytvorí sama ako `server/aiquest.db`.

### 5A.2 Webová aplikácia (terminál 2)

```bash
cd web
npm ci
npm run dev
```

Ak používaš Supabase, vytvor `web/.env.local` s tými istými hodnotami ako v `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Overenie:**

```bash
bash "installation guide/scripts/verify.sh" http://localhost:5173
```

Otvor **http://localhost:5173**. Vite presmeruje `/api` na server na porte 8000.

> Vývojový server Vite je určený len pre tento počítač. **Nevystavuj ho do siete ani na
> internet.** Nástroje Vite a Vitest majú známe zraniteľnosti dev servera, ktoré sa opravia až
> prechodom na novšie hlavné verzie. Na prístup z telefónu alebo z internetu použi cestu B.

---

## 6. Prvé spustenie aplikácie

1. Otvor aplikáciu (8080 pri Dockeri, 5173 pri ceste A).
2. Aplikácia funguje hneď aj bez prihlásenia. Pokrok sa vtedy ukladá v prehliadači.
3. **Profil → Účet**: prihlás sa. V dev režime stačí e-mail a meno, so Supabase e-mail a heslo.
   Po prihlásení sa pokrok synchronizuje so serverom.
4. Ak sú zapnuté platby, Premium si v dev režime zapneš tlačidlom
   **Profil → Premium → Zapnúť Premium (vývojový režim)**.

---

## 7. (Voliteľné) Prihlásenie cez Supabase

1. Vytvor si účet a nový projekt na https://supabase.com (bezplatný plán stačí).
2. V nastaveniach projektu v časti **API** nájdeš **Project URL** a verejný kľúč
   **anon / public**. Názvy sekcií sa v rozhraní Supabase občas menia, hľadaj tieto dva údaje.
3. Do `.env` zapíš:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public kľúč>
   AI_QUEST_DEV_AUTH=0
   ```
   Ak projekt podpisuje tokeny **zdieľaným JWT tajomstvom** (staršie projekty, nastavenia
   *JWT Secret*), doplň aj `SUPABASE_JWT_SECRET=<tajomstvo>`. Novšie projekty s asymetrickými
   kľúčmi stačí nastaviť cez `SUPABASE_URL`, server si verejné kľúče stiahne sám (JWKS).
4. V Supabase v časti **Authentication → URL configuration** nastav **Site URL** na adresu
   aplikácie (`http://localhost:8080` alebo tvoju doménu). Tam vedie odkaz z potvrdzovacieho
   e-mailu.
5. Reštartuj: Docker `docker compose up -d --build`, cesta A reštartuj server aj `npm run dev`
   (a vytvor `web/.env.local` podľa 5A.2).

**Overenie:** `verify.sh` vypíše `prihlásenie: Supabase`. V aplikácii sa v profile zobrazí
formulár s heslom a registrácia pošle potvrdzovací e-mail.

---

## 8. (Voliteľné) Platby cez Stripe

Najprv všetko nastav v **testovacom režime** (Test mode), kde sa dá platiť testovacou kartou
`4242 4242 4242 4242`.

1. Účet na https://dashboard.stripe.com.
2. **Product catalog → Add product**:
   - „AI QUEST Premium“, opakovaná (recurring) mesačná cena, napríklad 6,99 EUR. Skopíruj
     **Price ID** (`price_…`).
   - „AI QUEST Business“, opakovaná cena **za licenciu**. Skopíruj **Price ID**.
3. **Developers → API keys**: skopíruj **Secret key** (`sk_test_…`).
4. **Settings → Billing → Customer portal**: raz ulož nastavenia, inak sa správa predplatného
   neotvorí.
5. Do `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_PREMIUM=price_...
   STRIPE_PRICE_BUSINESS=price_...
   AI_QUEST_PUBLIC_URL=http://localhost:8080
   ```
6. **Webhook.** Stripe musí serveru oznámiť, že platba prebehla.
   - **Na vlastnom počítači:** nainštaluj Stripe CLI (https://docs.stripe.com/stripe-cli) a spusti
     ```bash
     stripe login
     stripe listen --forward-to localhost:8080/api/billing/webhook   # cesta A: localhost:8000
     ```
     Príkaz vypíše `whsec_…`. Zapíš ho ako `STRIPE_WEBHOOK_SECRET` a reštartuj server.
     `stripe listen` musí bežať, kým testuješ platby.
   - **V cloude:** v **Developers → Webhooks** pridaj endpoint `https://tvoja-domena/api/billing/webhook`
     s udalosťami `checkout.session.completed`, `customer.subscription.updated` a
     `customer.subscription.deleted`. Jeho *Signing secret* zapíš do `STRIPE_WEBHOOK_SECRET`.
7. Reštartuj server (`docker compose up -d`).

**Overenie:** `verify.sh` vypíše „obmedzenia FREE/PREMIUM sú zapnuté (platby: True)“. Po
testovacej platbe sa v profile do niekoľkých sekúnd objaví 💎 Premium. Ak nie, pozri logy
(`docker compose logs api`): pri štarte bez `STRIPE_WEBHOOK_SECRET` server vypíše varovanie.

Bez Stripe môžeš obmedzenia vyskúšať aj takto: `AI_QUEST_BILLING=1` a plán prepínaš
tlačidlom v dev režime.

---

## 9. Prístup z telefónu

| Spôsob | Postup | Inštalácia ako aplikácia (PWA) |
| --- | --- | --- |
| Rovnaká Wi-Fi | Zisti IP počítača (`ipconfig` na Windows, `ipconfig getifaddr en0` na macOS, `hostname -I` na Linuxe) a na telefóne otvor `http://<IP>:8080` (cesta B). Firewall musí povoliť port 8080. | Nie. Prehliadač vyžaduje HTTPS. |
| HTTPS tunel | Nainštaluj `cloudflared` (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) a spusti `cloudflared tunnel --url http://localhost:8080`. Dostaneš verejnú adresu `https://….trycloudflare.com`. | Áno |

> **Pozor:** tunel sprístupní aplikáciu celému internetu. Predtým nastav `AI_QUEST_DEV_AUTH=0`
> a použi Supabase. Nastav aj `AI_QUEST_PUBLIC_URL` na adresu tunela, aby presmerovanie po
> platbe smerovalo správne. Dočasná adresa `trycloudflare.com` sa pri každom spustení mení. Na
> trvalé nasadenie použi vlastnú doménu (krok 10).

---

## 10. Neskôr: nasadenie v cloude

### Možnosť 1 – vlastný server (VPS), najjednoduchšie

Funguje na akomkoľvek Linux serveri (napr. Ubuntu 24.04, 2 GB RAM stačia):

1. Nainštaluj Docker: `curl -fsSL https://get.docker.com | sudo sh`
2. Stiahni kód (krok 2) a vytvor `.env`:
   `bash "installation guide/scripts/make-env.sh" --mode docker --dev-auth off`
3. Doplň do `.env` produkčné hodnoty: Anthropic, Supabase, Stripe (živé kľúče) a
   `AI_QUEST_PUBLIC_URL=https://tvoja-domena.sk`.
4. Nasmeruj doménu (DNS záznam A) na IP servera.
5. **HTTPS cez Caddy.** Caddy si certifikát vybaví sám. Nainštaluj ho podľa
   https://caddyserver.com/docs/install a do `/etc/caddy/Caddyfile` zapíš:
   ```
   tvoja-domena.sk {
       reverse_proxy localhost:8080
   }
   ```
   Potom `sudo systemctl reload caddy`. Aby port 8080 nebol priamo dostupný zvonka, vytvor v
   koreni repozitára `docker-compose.override.yml`:
   ```yaml
   services:
     web:
       ports: !override
         - "127.0.0.1:8080:80"
   ```
6. `docker compose up -d --build` a overenie `bash "installation guide/scripts/verify.sh" https://tvoja-domena.sk`.
7. V Supabase nastav Site URL a v Stripe webhook na novú doménu (kroky 7 a 8).

### Možnosť 2 – spravovaná databáza

Ak chceš databázu mimo servera (napr. PostgreSQL, ktorý je súčasťou Supabase projektu), prepíš
jej adresu v `docker-compose.override.yml`:

```yaml
services:
  api:
    depends_on: !reset {}
    environment:
      DATABASE_URL: postgresql+psycopg://user:heslo@host:5432/postgres?sslmode=require
```

a spúšťaj len `docker compose up -d --build api web`. Riadok `!reset` zabezpečí, že sa lokálna
databáza nespustí. Migrácie sa pri štarte API aplikujú samé. Značky `!reset` a `!override`
vyžadujú Docker Compose 2.24 alebo novší (`docker compose version`).

### Kontrolný zoznam pred verejným spustením

- [ ] `AI_QUEST_DEV_AUTH=0` a funkčné prihlásenie cez Supabase
- [ ] HTTPS (Caddy alebo iný reverse proxy)
- [ ] Živé Stripe kľúče a webhook na produkčnú doménu
- [ ] Silné `POSTGRES_PASSWORD` a `AI_QUEST_SECRET` (vygenerované skriptom)
- [ ] Pravidelná záloha databázy (krok 11)
- [ ] Obchodné podmienky a zásady ochrany osobných údajov (GDPR)
- [ ] Odborná kontrola obsahu (pozri hlavný `README.md`)

---

## 11. Prevádzka

| Úloha | Docker (cesta B) | Priamo (cesta A) |
| --- | --- | --- |
| Aktualizácia | `git pull` → `docker compose up -d --build` (migrácie sa spustia samé) | `git pull` → v `server`: `pip install -r requirements-dev.txt`, `set -a; . ../.env; set +a`, `alembic upgrade head` → reštart; vo `web`: `npm ci` |
| Záloha | `docker compose exec -T db pg_dump -U aiquest aiquest > zaloha-$(date +%F).sql` | zastav server a skopíruj `server/aiquest.db` |
| Obnova | do prázdnej databázy: `docker compose exec -T db psql -U aiquest aiquest < zaloha.sql` | vráť späť súbor `aiquest.db` |
| Stav | `bash "installation guide/scripts/verify.sh" http://localhost:8080` | `… verify.sh http://localhost:5173` |

## 12. Riešenie problémov

| Príznak | Príčina a riešenie |
| --- | --- |
| `check-prereqs.sh`: `docker daemon nebeží` | Spusti Docker Desktop, na Linuxe `sudo systemctl start docker`. |
| `permission denied … docker.sock` (Linux) | `sudo usermod -aG docker $USER` a znova sa prihlás. |
| Skript `.sh` hlási `$'\r': command not found` | Súbor má konce riadkov z Windows. Spúšťaj v Git Bash/WSL, prípadne `git config core.autocrlf input` a znova `git clone`. |
| Port 8080, 8000 alebo 5173 je obsadený | Nájdi proces (`lsof -i :8080` na macOS/Linuxe, `netstat -ano \| findstr 8080` na Windows) alebo zmeň port v `docker-compose.yml` (`"8081:80"`). |
| Server hneď spadne s `AI_QUEST_DEV_AUTH requires AI_QUEST_SECRET` | `.env` nemá tajomstvo, spusti `make-env.sh` (krok 3). Pri ceste A nezabudni `set -a; . ../.env; set +a`. |
| `docker compose up --build` zlyhá pri `npm ci` alebo `pip install` | Chýba internet alebo ho blokuje proxy. Zopakuj; v logu hľadaj prvý riadok s chybou. |
| API po zmene `POSTGRES_PASSWORD` nevie pripojiť databázu | PostgreSQL si pamätá heslo z prvého spustenia. Vráť pôvodné heslo zo zálohy `.env.backup.*`. `docker compose down -v` všetko zmaže a **stratíš dáta**. |
| `verify.sh`: AI kľúč nie je nastavený | Doplň `ANTHROPIC_API_KEY` a reštartuj. AI požiadavky vracajúce 503 = neplatný kľúč alebo chýbajúci kredit. |
| Prihlásenie cez Supabase nefunguje, v profile chýba pole na heslo | `VITE_SUPABASE_*` sa vkladajú do aplikácie pri zostavení: `docker compose up -d --build web` (cesta A: `web/.env.local` a reštart `npm run dev`). |
| Po potvrdení e-mailu ma to presmeruje na zlú adresu | V Supabase oprav **Site URL** (krok 7). |
| Zaplatil som, ale nemám Premium | Webhook nedorazil: beží `stripe listen`? Sedí `STRIPE_WEBHOOK_SECRET`? Pozri `docker compose logs api`. |
| Na telefóne sa aplikácia nedá nainštalovať | Inštalácia vyžaduje HTTPS, použi tunel alebo doménu (kroky 9 a 10). |
| Zmeny kódu sa neprejavia | Docker: `docker compose up -d --build`. V prehliadači obnov stránku, service worker si novú verziu stiahne pri ďalšom načítaní. |

---

## Prehľad krokov (kontrolný zoznam)

| # | Krok | Príkaz | Overenie | Očakávaný výsledok |
| --- | --- | --- | --- | --- |
| 1 | Predpoklady | podľa systému (krok 1) | `bash "installation guide/scripts/check-prereqs.sh" docker` | všetko `[OK]` |
| 2 | Kód | `git clone …` | `ls` | `web`, `server`, `installation guide` |
| 3 | Konfigurácia | `bash "installation guide/scripts/make-env.sh" --mode docker` | `grep -c '^AI_QUEST_SECRET=' .env` | `1` |
| 4 | Spustenie | `docker compose up -d --build` | `docker compose ps` | 3 služby bežia |
| 5 | Overenie | – | `bash "installation guide/scripts/verify.sh" http://localhost:8080` | „inštalácia funguje“ |
| 6 | AI (voliteľné) | doplň `ANTHROPIC_API_KEY`, `docker compose up -d` | `verify.sh` | „AI kľúč je nastavený“ |
| 7 | Supabase (voliteľné) | krok 7 | `verify.sh` | „prihlásenie: Supabase“ |
| 8 | Stripe (voliteľné) | krok 8 | `verify.sh` | „platby: True“ |

Pri ceste A sa kroky 3 až 5 menia: `--mode local`, krok 5A a `verify.sh http://localhost:5173`.

Ako aplikácia funguje vnútri, popisuje interaktívny dokument `How-It-Works/index.html`
(otvor ho v prehliadači).
