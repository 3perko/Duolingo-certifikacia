# AI QUEST – Duolingo na certifikácie umelej inteligencie

Mobilná (PWA) aplikácia, ktorá používateľa 10–15 minút denne systematicky pripravuje na
certifikácie Anthropic (Claude). Pôvodný produktový návrh je v [`docs/navrh.md`](docs/navrh.md).

**Dokumentácia:**
[`How-It-Works/index.html`](How-It-Works/index.html) – interaktívny popis, ako aplikácia funguje, na 4 úrovniach (otvor v prehliadači) ·
[`installation guide/`](installation%20guide/README.md) – inštalácia servera krok za krokom (lokálne aj v cloude)

> AI QUEST je nezávislý projekt. Nie je oficiálne schválený spoločnosťou Anthropic a nepoužíva
> skúškové otázky – všetok obsah je pôvodný a pred zverejnením musí prejsť odbornou kontrolou.

## Čo je hotové

| Časť návrhu | Stav |
| --- | --- |
| §1 Certifikácie | ✅ 4 cesty: **Associate** (podľa oficiálnych 7 oblastí a váh), **AI Fluency** pre začiatočníkov (4D rámec, príprava na kurz Anthropic), **Developer** a **Architect** (predbežné osnovy AI QUEST, kým nebude verejný oficiálny obsah) |
| §2 Úvodná obrazovka | ✅ séria, úroveň, XP, pripravenosť, denný cieľ, kapitoly so zámkami, prepínač ciest |
| §3 Štruktúra | ✅ 20 kapitol, 32 lekcií, boss fight na konci každej kapitoly |
| §4 Typy úloh 1–4 | ✅ 138 otázok SK/EN (aj „nájdi chybu vo výstupe AI“), 5 úloh na prompty hodnotených Claude, 2 simulácie procesov |
| §5 AI učiteľ | ✅ „Vysvetli mi to“ / „Vysvetli jednoduchšie“ + kontrolná otázka; pozná úroveň, chyby a prestávku |
| §6 Inteligentné opakovanie | ✅ FSRS-4.5 + **AI varianty otázok**: časť otázok sa pri opakovaní vráti ako nový scenár |
| §7 Simulátor skúšky | ✅ pre každú cestu, váhy podľa oblastí, analýza a cielené precvičenie |
| §8 Jazykové režimy | ✅ Začiatočník / Pokročilý / Certifikácia |
| §9 Gamifikácia | ✅ XP, séria, úrovne, odznaky, denný cieľ, boss fighty, **týždenné výzvy**, **týždenné ligy** (5 úrovní, skupiny po 30, postup/zostup) |
| §10 Architektúra | ✅ React + TS PWA, FastAPI, PostgreSQL/SQLite, Supabase Auth, Claude API, FSRS; každá certifikácia je samostatný balík (`Track`) |
| §11 Tvorba obsahu | ✅ pipeline: dokument → AI návrh → AI kontrola voči zdroju → schválenie odborníkom → načítanie do aplikácie; audit podľa verzie dokumentácie |
| §12 Obchodný model | ✅ FREE / PREMIUM (Stripe predplatné) / BUSINESS (firemné licencie, prehľad pripravenosti tímu); denné limity AI |
| §13–14 AI Lab, stavba agentov | ✅ misie „Vytvor svojho prvého AI agenta“ a „Agent zákazníckej podpory“: skladanie z blokov + automatické testy funkčnosti, bezpečnosti a spoľahlivosti |
| §15 Certification mode + AI Lab mode | ✅ oba režimy, prepojené cez XP, výzvy a opakovanie |
| Natívne aplikácie (Capacitor) | ⏳ PWA sa dá nainštalovať; zabalenie cez Capacitor je ďalší krok |

## Architektúra

```
web/                React + TypeScript (Vite) – PWA
  src/content/      cesty (tracks), kapitoly, otázky SK/EN, AI Lab misie, schválený obsah (approved/)
  src/engine/       FSRS, pokrok, výzvy, skúška, simulácie, testy agentov, zlúčenie pokroku (sync)
  src/screens/      Domov, Opakovanie, AI Lab, Liga, Skúška, Profil, Premium, Tím, prehrávač lekcií
  scripts/          audit obsahu
server/             Python + FastAPI
  app/ai.py         AI učiteľ, hodnotenie promptov, varianty otázok (Claude API, štruktúrované výstupy)
  app/auth.py       Supabase JWT (HS256 aj JWKS) / vývojové prihlásenie
  app/account.py    účet, synchronizácia pokroku, ligy, výmaz účtu (GDPR)
  app/leagues.py    týždenné ligy
  app/plans.py      FREE/PREMIUM, denné kvóty AI
  app/billing.py    Stripe Checkout, zákaznícky portál, webhook
  app/orgs.py       firemné účty a prehľad tímu
  tools/            content pipeline
content/review-queue/  návrhy otázok čakajúce na odbornú kontrolu
```

Dôležité rozhodnutia:

* **Funguje aj offline a bez servera.** Učenie beží v prehliadači; server pridáva účty,
  synchronizáciu, ligy, platby a AI. Bez AI kľúča prejdú AI funkcie na offline náhradu.
* **Synchronizácia bez straty dát.** Počítadlá XP a týždenných štatistík sú vedené zvlášť pre
  každé zariadenie (grow-only counter), takže súbežné učenie na mobile a notebooku sa pri zlúčení
  sčíta. Server používa optimistické zamykanie (409 → klient zlúči a zopakuje).
* **Bezpečnosť AI.** API kľúč je len na serveri; text od používateľa ide modelu oddelený
  značkami ako dáta; skóre promptu a agentov sa počíta deterministicky; varianty otázok a návrhy
  obsahu sa validujú (počet a rozsah správnych odpovedí, citácia zo zdroja).
* **Platby.** Prehliadač nikdy nevidí ceny ani kľúče; stav predplatného nastavuje iba overený
  Stripe webhook.
* **Prístupnosť.** Automatický audit axe-core (WCAG 2 A/AA) na hlavných obrazovkách v svetlom
  aj tmavom režime bez nálezov; viditeľný fokus pre klávesnicu, oznamovanie spätnej väzby
  čítačkám obrazovky, rešpektovanie „obmedziť pohyb“.
* **Odolnosť.** Rozbehnutá skúška prežije prepnutie záložky aj zatvorenie aplikácie; denný limit
  AI sa míňa iba pri úspešnej odpovedi.
* **Súkromie.** V lige sa zobrazuje len meno a týždenné XP (dá sa vypnúť); správca firmy vidí
  súhrn pokroku člena, s čím člen súhlasí pri vstupe; účet sa dá úplne zmazať.

## Spustenie

Backend (Python 3.10+):

```bash
cd server
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # doplň hodnoty
set -a; . ./.env; set +a
uvicorn app.main:app --reload --port 8000
```

Frontend (Node 18+):

```bash
cd web
npm install
npm run dev
```

Aplikácia beží na http://localhost:5173 a požiadavky na `/api` presmeruje na port 8000.

Režimy servera (všetko v `server/.env.example`):

| Čo | Ako zapnúť |
| --- | --- |
| AI funkcie | `ANTHROPIC_API_KEY` (model `AI_QUEST_MODEL`, predvolene `claude-opus-5-5`) |
| Databáza | `DATABASE_URL` – SQLite pre vývoj, `postgresql+psycopg://…` v produkcii |
| Prihlásenie (produkcia) | `SUPABASE_URL` a/alebo `SUPABASE_JWT_SECRET` na serveri; `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` vo frontende |
| Prihlásenie (vývoj) | `AI_QUEST_DEV_AUTH=1` a `AI_QUEST_SECRET` – prihlásenie iba e-mailom, nikdy nie v produkcii |
| Platby | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_BUSINESS`, `STRIPE_WEBHOOK_SECRET` (webhook na `/api/billing/webhook`) |
| FREE/PREMIUM bez Stripe | `AI_QUEST_BILLING=1` (vo vývojovom režime sa plán prepína tlačidlom) |

Bez týchto premenných je všetko odomknuté a aplikácia funguje lokálne bez účtov.

Testy:

```bash
cd web && npm test && npm run typecheck
cd server && pip install -r requirements-dev.txt && python -m pytest
```

Testy backendu sa dajú pustiť aj proti PostgreSQL:

```bash
TEST_DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/aiquest_test python -m pytest
```

GitHub Actions (`.github/workflows/ci.yml`) pri každom pushi spustí typecheck, testy a build
frontendu, audit obsahu, migrácie a testy backendu na SQLite aj PostgreSQL.

## Nasadenie

Celý stack (PostgreSQL + API + web cez nginx) sa spustí cez Docker:

```bash
cp server/.env.example .env
docker compose up --build
```

Pred spustením v `.env` vyplň produkčné hodnoty: `AI_QUEST_DEV_AUTH=0`, Supabase, Stripe,
`ANTHROPIC_API_KEY` a `POSTGRES_PASSWORD`. Aplikácia potom beží na http://localhost:8080.

* API kontajner pri štarte spustí `alembic upgrade head`. Pri PostgreSQL schému menia iba
  migrácie (`server/migrations`); test `test_migrations.py` zlyhá, ak sa model zmení bez migrácie.
* nginx servíruje PWA (service worker a `index.html` bez cache, assety s dlhou cache) a
  `/api` posiela do API vrátane Stripe webhooku `/api/billing/webhook`.
* Varovanie v logu pri štarte upozorní na zapnuté vývojové prihlásenie alebo chýbajúci
  `STRIPE_WEBHOOK_SECRET`.

## Tvorba a údržba obsahu

```bash
# 1. AI navrhne otázky z oficiálneho dokumentu a druhou kontrolou ich overí voči zdroju
cd server
python -m tools.content_pipeline draft --source exam-guide.md --doc-version 2026-10 \
  --domain evaluation --domain-name "Evaluating and verifying AI outputs" --count 8
# 2. Odborník upraví content/review-queue/<súbor>.json a schváleným otázkam nastaví "reviewed": true
# 3. Schválené otázky sa presunú do aplikácie (web/src/content/approved/)
python -m tools.content_pipeline approve ../content/review-queue/<súbor>.json
# Prehľad obsahu a položiek písaných podľa staršej verzie dokumentácie
cd ../web && npm run content:audit -- --stale 2026-10
```

Každá položka má `meta` (`source`, `docVersion`, `reviewed`). Testy kontrolujú integritu
obsahu: jedinečné ID, platné odpovede, oba jazyky, dosť otázok na skúšku každej cesty,
dosiahnuteľnú optimálnu cestu v simuláciách a referenčný návrh každej AI Lab misie.

Údaje o certifikáciách (ceny, parametre skúšky, obmedzenie na Claude Partner Network) sú prevzaté
z návrhu a pred vydaním ich treba overiť na oficiálnych stránkach Anthropic
(`web/src/content/certifications.ts`).

## Čo ešte treba pred spustením pre verejnosť

1. Odborná kontrola všetkého obsahu (zatiaľ `reviewed: false`) a nahradenie predbežných osnov
   Developer/Architect oficiálnymi, keď budú dostupné.
2. Vytvoriť Supabase projekt, Stripe produkty a nastaviť produkčné premenné.
3. Overiť ceny a podmienky certifikácií u Anthropic; právne texty (obchodné podmienky, GDPR).
4. Zabaliť PWA cez Capacitor pre Google Play a App Store.
5. Ligy: týždenné XP hlási klient. Server prijme len reálne dosiahnuteľný rast (cca 1 200 XP
   za hodinu s rezervou, najviac 25 000 za týždeň), plná ochrana by vyžadovala počítať XP na serveri.
