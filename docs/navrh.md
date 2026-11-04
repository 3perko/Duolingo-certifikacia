# AI QUEST – Duolingo na certifikácie umelej inteligencie

*Návrh mobilnej aplikácie na prípravu na certifikácie Anthropic. Pôvodný produktový návrh, podľa
ktorého vzniklo MVP v tomto repozitári. Údaje o certifikáciách sú k októbru 2026 a pred vydaním ich
treba overiť na oficiálnych stránkach Anthropic.*

Aplikácia funguje podobne ako Duolingo, ale namiesto jazykov systematicky pripravuje používateľa na
oficiálne AI certifikácie spoločnosti Anthropic (Claude). Používateľ sa každý deň 10–15 minút učí,
rieši interaktívne úlohy, získava skúsenostné body a postupne sa približuje k úspešnému absolvovaniu
certifikačnej skúšky. Neučí sa iba teóriu – učí sa prakticky používať AI, vytvárať prompty,
vyhodnocovať odpovede a neskôr zostavovať AI agentov.

## 1. Na aké certifikácie sa zameriame?

| Certifikácia | Zameranie | Cena skúšky |
| --- | --- | --- |
| Claude Certified Associate – Foundations | Praktické používanie AI | 99 USD |
| Claude Certified Developer – Foundations | Vývoj AI aplikácií a agentov | 125 USD |
| Claude Certified Architect – Foundations | Návrh AI riešení a agentických systémov | 125 USD |
| Claude Certified Architect – Professional | Podnikové AI architektúry | 175 USD |

Profesionálne certifikačné skúšky sú momentálne dostupné iba pracovníkom organizácií zapojených do
Claude Partner Network. Prípravná aplikácia môže byť verejne dostupná každému.

**Odporúčanie:** podporovať všetky štyri certifikácie, ako prvú implementovať *Claude Certified
Associate – Foundations* (najširšia skupina používateľov, nepotrebuje rozsiahlu technickú
infraštruktúru). Technické certifikácie pridať neskôr.

## 2. Ako bude aplikácia fungovať?

Úvodná obrazovka:

```
AI QUEST
🎓 Tvoja certifikácia: Claude Certified Associate
🔥 Denná séria: 12 dní   ⭐ Tvoja úroveň: 8   💎 Získané XP: 1 850   📊 Pripravenosť na skúšku: 34 %

Pokračuj v učení
🟢 Kapitola 1 – Základy AI (100 %)
🟢 Kapitola 2 – Prompt Engineering (100 %)
🟡 Kapitola 3 – Hodnotenie výstupov (45 %)
🔒 Kapitola 4 – Výber AI modelov
🔒 Kapitola 5 – Pracovné postupy
🔒 Kapitola 6 – Bezpečnosť AI
🔒 Kapitola 7 – Optimalizácia
```

Používateľ nemusí rozmýšľať, čo sa má učiť – aplikácia mu automaticky pripravuje ďalšie lekcie
podľa pokroku a chýb.

## 3. Štruktúra vzdelávania

Vychádza priamo z oficiálneho obsahu skúšky Claude Certified Associate:

| Oblasť certifikácie | Váha pri skúške |
| --- | --- |
| Hodnotenie a overovanie AI výstupov | 21 % |
| Integrácia AI do pracovných procesov | 16 % |
| Bezpečnosť, riadenie rizík a zodpovedné používanie AI | 15 % |
| Prompt Engineering a vykonávanie úloh | 14 % |
| Výber produktov a modelov | 12 % |
| Konfigurácia a správa znalostí | 12 % |
| Riešenie problémov a optimalizácia | 10 % |

Každá oblasť sa delí na kapitoly s 15–20 krátkymi lekciami (3–5 minút), napr. Prompt Engineering:
čo je prompt, kontext, formulovanie požiadaviek, system vs. user prompt, few-shot, štruktúrované
výstupy, XML značky, minimalizácia halucinácií, praktická tvorba promptov, záverečný test. Na
dokončenie kapitoly musí používateľ preukázať, že problematike skutočne rozumie.

## 4. Typy interaktívnych úloh

* **Typ 1 – výber správnej odpovede.** Napr. „Čo je hlavnou výhodou few-shot promptingu?“ Po
  odpovedi krátke vysvetlenie a 10 XP.
* **Typ 2 – oprav chybný prompt.** Používateľ prepíše „Napíš mi niečo o umelej inteligencii.“;
  hodnotiaci AI model posúdi úlohu, publikum, formát a obmedzenia, dá skóre (napr. 90/100) a
  vysvetlí, ako prompt zlepšiť.
* **Typ 3 – nájdi chybu v odpovedi AI.** Napr. finančná analýza s neexistujúcimi údajmi – čo urobiť
  pred jej použitím. Dôležité pre hodnotenie výstupov a bezpečnosť.
* **Typ 4 – praktická AI simulácia.** Firma denne prijíma 200 e-mailov; používateľ rozhoduje o
  modeli, kontexte, vyhodnocovaní a zásahoch človeka. Výsledok (presnosť 94 %, čas 2 s, náklady
  8 USD/deň) pochádza zo simulácie alebo merania, nie z náhodného odhadu AI.

## 5. AI učiteľ

Tlačidlá „💬 Vysvetli mi to“ a „🧒 Vysvetli jednoduchšie“; učiteľ potom položí kontrolnú otázku.
Pozná aktuálnu úroveň, absolvované lekcie, otázky, na ktorých používateľ zlyhal, pojmy, ktorým
nerozumie, a dĺžku prestávky od posledného učenia.

## 6. Inteligentné opakovanie

Spaced repetition: správne zodpovedanú otázku aplikácia odloží, pri chybe ju zaradí skôr. Prehľad
tém s úspešnosťou a termínom ďalšieho opakovania. Aplikácia nebude opakovať iba identické otázky –
bude generovať nové scenáre testujúce rovnakú vedomosť.

## 7. Simulátor certifikačnej skúšky

120 minút, 60 otázok, jedna alebo viac správnych odpovedí. Oficiálna skúška používa škálované skóre
s hranicou 720 z rozsahu 100–1 000; simulátor má vlastné hodnotenie a netvrdí, že určité percento
znamená úspech. Po simulácii analýza podľa oblastí a odporúčanie AI učiteľa s automaticky
pripravenými cielenými lekciami.

## 8. Jazyková podpora

Slovenčina a angličtina v troch režimoch: Začiatočník (SK/SK), Pokročilý (vysvetlenia SK, otázky
EN), Certifikácia (EN/EN) – skúšky sú v angličtine, používateľ sa postupne učí odbornú terminológiu.

## 9. Gamifikácia

XP, séria, úroveň, odznaky, denný cieľ (napr. 50 XP), ligy, týždenné výzvy, boss fight na konci
kapitoly. Bez trestov za chyby – súťaženie je založené na pokroku, pravidelnosti a zvládnutých
vedomostiach.

## 10. Technická architektúra

| Komponent | Technológia |
| --- | --- |
| Frontend | React + TypeScript |
| Mobilná verzia | PWA, neskôr Capacitor |
| Backend | Python + FastAPI |
| Databáza | PostgreSQL |
| Prihlasovanie | Supabase Auth |
| AI učiteľ a AI hodnotenie | Claude API |
| Statické testy | Vlastný hodnotiaci systém |
| Opakovanie | FSRS algoritmus |

Modulárna architektúra – každá certifikácia je samostatný vzdelávací balík; neskôr možno pridať
certifikácie OpenAI, AWS, Microsoft Azure či Google Cloud.

## 11. Tvorba obsahu

Oficiálna dokumentácia → AI analyzuje oblasti → AI navrhne lekcie a otázky → kontrolný systém overí
obsah podľa dokumentácie → odborná kontrola a schválenie → publikovanie. Každá otázka má zdroj,
tematickú oblasť a verziu dokumentácie. Používa sa iba originálny obsah, žiadne chránené skúškové
otázky, a aplikácia netvrdí, že je oficiálne schválená spoločnosťou Anthropic.

## 12. Obchodný model

* **FREE:** základné lekcie, obmedzené množstvo AI úloh, sledovanie pokroku, denné opakovanie.
* **PREMIUM (pracovný návrh 6,99 €/mesiac):** všetky lekcie a certifikácie, neobmedzené testy, AI
  učiteľ s primeranými limitmi, praktické simulácie, simulátor skúšky, pokročilé štatistiky.
* **BUSINESS:** firemné licencie s prehľadom pripravenosti zamestnancov (hypotéza na overenie).

## 13. Postup realizácie

| Fáza | Funkcionalita | Cieľ |
| --- | --- | --- |
| MVP | Associate certifikácia, lekcie, XP, testy, pokrok | Overenie záujmu |
| AI verzia | AI učiteľ, hodnotenie promptov, adaptívne opakovanie | Personalizácia |
| Profesionálna verzia | Developer, Architect, praktické laboratóriá, firemné účty | Rozšírenie |

Na začiatku PWA namiesto natívnych aplikácií – jednoduchší vývoj a testovanie.

## 14. Čo inak ako Duolingo

Okrem zapamätania aj praktické schopnosti: napr. misia „Vytvor svojho prvého AI agenta“ vo
vizuálnom prostredí (prijatie otázky, vyhľadanie v dokumentoch, posúdenie dostatku údajov,
odpoveď so zdrojom) s automatickým testom funkčnosti, bezpečnosti a spoľahlivosti.

## 15. Finálny produkt

* **🎓 Certification mode** – príprava na konkrétnu skúšku, vyhodnocovanie pripravenosti a slabých
  miest.
* **🧪 AI Lab mode** – experimenty, simulácie, tvorba promptov, agentov a AI aplikácií.

Keďže profesionálne certifikácie sú obmedzené na partnerské organizácie, aplikácia bude mať aj
samostatnú cestu **AI Fluency** pre začiatočníkov, ktorá pripraví aj na verejný kurz Anthropic
*AI Fluency: Framework & Foundations* (12 lekcií, certifikát o absolvovaní cez Anthropic).
