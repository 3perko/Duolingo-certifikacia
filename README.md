# AI QUEST – Duolingo na certifikácie umelej inteligencie

Mobilná (PWA) aplikácia, ktorá používateľa 10–15 minút denne systematicky pripravuje na
certifikácie Anthropic (Claude). Pôvodný produktový návrh je v [`docs/navrh.md`](docs/navrh.md).

Tento repozitár obsahuje **MVP** podľa fázy 1 návrhu (certifikácia *Claude Certified Associate –
Foundations*) a z fázy 2 aj **AI učiteľa** a **AI hodnotenie promptov**.

> AI QUEST je nezávislý projekt. Nie je oficiálne schválený spoločnosťou Anthropic a nepoužíva
> skúškové otázky – všetok obsah je pôvodný a pred zverejnením musí prejsť odbornou kontrolou.

## Čo je hotové

| Časť návrhu | Stav v MVP |
| --- | --- |
| §2 Úvodná obrazovka (séria, úroveň, XP, pripravenosť, kapitoly so zámkami) | ✅ `web/src/screens/Home.tsx` |
| §3 Štruktúra podľa 7 hodnotených oblastí a ich váh | ✅ 7 kapitol, 15 lekcií, 7 boss fightov |
| §4 Typ 1 – výber odpovede (aj viac správnych) | ✅ 69 otázok SK/EN, poradie možností sa mieša |
| §4 Typ 2 – oprav chybný prompt | ✅ 4 úlohy, hodnotí Claude podľa rubriky; offline odhad, keď AI nie je dostupná |
| §4 Typ 3 – nájdi chybu v odpovedi AI | ✅ otázky s ukážkou výstupu AI (finančná analýza, preklad, prompt injection…) |
| §4 Typ 4 – praktická AI simulácia | ✅ triedenie 200 e-mailov denne, optimalizácia nákladov; čísla z pevného modelu scenára |
| §5 AI učiteľ („Vysvetli mi to“ / „Vysvetli jednoduchšie“ + kontrolná otázka) | ✅ pozná úroveň, počet lekcií, slabé pojmy a dĺžku prestávky |
| §6 Inteligentné opakovanie | ✅ FSRS-4.5 pre každú otázku, tabuľka tém s úspešnosťou a ďalším opakovaním |
| §7 Simulátor skúšky (120 min, 60 otázok, analýza podľa oblastí, odporúčanie) | ✅ vlastné hodnotenie, bez prepočtu na oficiálnu škálu 720/1000 |
| §8 Jazykové režimy Začiatočník / Pokročilý / Certifikácia | ✅ |
| §9 Gamifikácia: XP, séria, úrovne, odznaky, denný cieľ, boss fight | ✅ bez trestov za chyby |
| §9 Ligy, týždenné výzvy | ⏳ vyžaduje účty a server |
| §10 PWA (inštalácia na plochu, offline) | ✅ manifest + service worker |
| §11 Pôvod obsahu (zdroj, verzia dokumentácie, stav kontroly) | ✅ pole `meta` pri každej položke |
| §12 FREE limit AI úloh | ✅ jednoduchý limit požiadaviek na backende; platby ⏳ |
| §13 Fázy 2–3: Developer/Architect, AI Lab, agent builder, firemné účty | ⏳ |

## Architektúra

```
web/      React + TypeScript (Vite) – PWA, celý učebný engine beží v prehliadači
  src/content/   obsah kapitol (SK/EN), certifikácie a váhy oblastí
  src/engine/    FSRS, pokrok/XP/séria/odznaky, skúška, simulácie, offline hodnotenie promptov
  src/screens/   Domov, prehrávač lekcií, Opakovanie, Skúška, Profil
server/   Python + FastAPI – AI učiteľ a AI hodnotenie promptov cez Claude API
docs/     produktový návrh
```

* **Pokrok** sa v MVP ukladá do `localStorage`. Engine je napísaný ako čisté funkcie
  (`web/src/engine/progress.ts`), takže prechod na PostgreSQL + Supabase Auth z návrhu znamená
  vymeniť iba vrstvu ukladania v `web/src/store.tsx`.
* **AI volania** idú výhradne cez backend (API kľúč nikdy nie je v prehliadači). Používa sa model
  `claude-opus-5-5` (zmeniteľný premennou `AI_QUEST_MODEL`), štruktúrované výstupy (JSON schéma)
  a serverový fallback pri odmietnutí. Text od používateľa sa modelu posiela oddelený značkami ako
  dáta, nie ako pokyny.
* **Skóre promptu** neurčuje model číslom – model vráti stav každého kritéria (splnené /
  čiastočne / chýba) a skóre sa z neho počíta deterministicky podľa váh rubriky.
* **Simulácie** počítajú výsledok z pevných efektov rozhodnutí (`web/src/engine/simulation.ts`),
  nie z odhadu AI – rovnaké rozhodnutia dajú vždy rovnaké čísla.
* **Simulátor skúšky** skladá 60 otázok podľa váh oblastí (21/16/15/14/12/12/10 %) metódou
  najväčších zvyškov. Zámerne nepredstiera oficiálne škálované skóre.

## Spustenie

Backend (Python 3.10+):

```bash
cd server
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...   # bez kľúča aplikácia funguje, AI funkcie prejdú na offline režim
uvicorn app.main:app --reload --port 8000
```

Frontend (Node 18+):

```bash
cd web
npm install
npm run dev        # http://localhost:5173, /api sa presmeruje na :8000
```

Testy:

```bash
cd web && npm test && npm run typecheck
cd server && python -m pytest
```

Konfigurácia backendu: `AI_QUEST_MODEL`, `AI_QUEST_CORS_ORIGINS` (predvolene
`http://localhost:5173`), `AI_QUEST_RATE_LIMIT` (30) a `AI_QUEST_RATE_WINDOW_S` (600).
Frontend nasadený mimo domény API nastaví `VITE_API_URL`.

## Obsah

Každá položka má `domain`, `concept` (pre AI učiteľa a sledovanie slabých miest) a `meta`
(`source`, `docVersion`, `reviewed`). Keď Anthropic zmení požiadavky skúšky, vyhľadaním podľa
`docVersion` sa nájde obsah na aktualizáciu. Testy (`web/src/engine/engine.test.ts`) kontrolujú
integritu obsahu – jedinečné ID, platné správne odpovede, oba jazyky, dosť otázok na plnú skúšku
v každej oblasti a dosiahnuteľnú optimálnu cestu v každej simulácii.

Údaje o certifikáciách (ceny, parametre skúšky, obmedzenie na Claude Partner Network) sú prevzaté
z návrhu a pred vydaním ich treba overiť na oficiálnych stránkach Anthropic
(`web/src/content/certifications.ts`).

## Ďalšie kroky

1. Odborná kontrola obsahu a nastavenie `reviewed: true`.
2. Účty a synchronizácia pokroku (Supabase Auth + PostgreSQL), ligy a týždenné výzvy.
3. Generovanie nových variantov otázok pri opakovaní (§6) – s kontrolou proti zdrojovej dokumentácii.
4. Cesta AI Fluency pre začiatočníkov, potom Developer a Architect s AI Lab režimom (§14–15).
5. Platby (Premium) a firemné licencie s prehľadom pripravenosti tímu.
