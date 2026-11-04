import type { Chapter, Domain, Item } from "../types";
import { mc, t } from "./helpers";

/**
 * Claude Certified Architect (Foundations / Professional). Preliminary
 * curriculum written by us around solution-design skills; replace with the
 * official exam outline once it is available to the team.
 */

export const domains: Domain[] = [
  { id: "ar-patterns", name: t("Architektonické vzory", "Architecture patterns"), weight: 25 },
  { id: "ar-reliability", name: t("Spoľahlivosť a hodnotenie", "Reliability and evaluation"), weight: 25 },
  { id: "ar-security", name: t("Bezpečnosť a governance", "Security and governance"), weight: 25 },
  { id: "ar-scale", name: t("Škálovanie a náklady", "Scale and cost"), weight: 25 },
];

const P = "ar-patterns";
const R = "ar-reliability";
const S = "ar-security";
const C = "ar-scale";

export const items: Item[] = [
  mc("ar-01", P, ["Prompt chaining", "Prompt chaining"],
    ["Úloha sa dá rozdeliť na pevné kroky, kde výstup jedného je vstupom ďalšieho. Ktorý vzor zvolíš?", "A task splits into fixed steps where each output feeds the next. Which pattern do you choose?"],
    [["Reťazenie promptov s kontrolou medzi krokmi", "Prompt chaining with checks between steps"], ["Plne autonómny agent", "A fully autonomous agent"], ["Jeden obrovský prompt", "One giant prompt"], ["Ručné spracovanie", "Manual processing"]], 0,
    ["Reťazenie zvyšuje presnosť za cenu latencie a medzi krokmi dovoľuje programové kontroly (gates).", "Chaining trades latency for accuracy and allows programmatic checks (gates) between steps."]),
  mc("ar-02", P, ["Routing", "Routing"],
    ["Požiadavky zákazníkov sú rôzneho typu (fakturácia, technika, reklamácie). Ako ich efektívne spracovať?", "Customer requests come in different types (billing, technical, complaints). How do you handle them efficiently?"],
    [["Najprv klasifikovať (routing) a každý typ poslať do špecializovaného postupu či modelu", "Classify first (routing) and send each type to a specialised flow or model"], ["Všetko jedným univerzálnym promptom", "Everything through one universal prompt"], ["Náhodne", "At random"], ["Iba najväčším modelom", "Only with the largest model"]], 0,
    ["Routing oddeľuje zodpovednosti – jednoduché typy môže riešiť lacnejší model, zložité výkonnejší.", "Routing separates concerns – simple types can go to a cheaper model, complex ones to a stronger model."]),
  mc("ar-03", P, ["Orchestrátor a pracovníci", "Orchestrator-workers"],
    ["Kedy je vhodný vzor orchestrátor – pracovníci (orchestrator-workers)?", "When is the orchestrator-workers pattern a good fit?"],
    [["Keď sa podúlohy nedajú určiť vopred a centrálny model ich dynamicky rozdeľuje a skladá výsledky", "When subtasks can't be known in advance and a central model divides them dynamically and merges results"], ["Keď je úloha triviálna", "When the task is trivial"], ["Keď chceme minimalizovať počet volaní za každú cenu", "When we want the fewest calls at any cost"], ["Nikdy", "Never"]], 0,
    ["Napr. zmeny vo viacerých súboroch kódu či rešerš z viacerých zdrojov. Prináša vyššie náklady aj zložitosť.", "E.g. changes across many code files or research across many sources. It brings higher cost and complexity."]),
  mc("ar-04", P, ["Paralelizácia", "Parallelization"],
    ["Potrebuješ posúdiť zmluvu z právneho, finančného a bezpečnostného hľadiska. Ako skrátiť čas?", "You need to review a contract from legal, financial and security angles. How do you cut the time?"],
    [["Spustiť nezávislé posúdenia paralelne a výsledky spojiť", "Run independent reviews in parallel and merge the results"], ["Postupne jedným promptom", "Sequentially in one prompt"], ["Vynechať dve hľadiská", "Skip two angles"], ["Použiť menší kontext", "Use less context"]], 0,
    ["Nezávislé podúlohy možno paralelizovať; rovnaký vzor slúži aj na hlasovanie viacerých pokusov.", "Independent subtasks can run in parallel; the same pattern also supports voting across attempts."]),
  mc("ar-05", P, ["Jednoduchosť", "Simplicity first"],
    ["Aký princíp platí pri návrhu AI riešení?", "Which principle applies when designing AI solutions?"],
    [["Začať najjednoduchším riešením a zložitosť pridávať, až keď ju merania ospravedlnia", "Start with the simplest solution and add complexity only when measurements justify it"], ["Vždy začať multi-agentným systémom", "Always start with a multi-agent system"], ["Čím viac modelov, tým lepšie", "The more models the better"], ["Nikdy nemerať", "Never measure"]], 0,
    ["Každá vrstva pridáva latenciu, náklady a miesta zlyhania. Musí priniesť merateľný prínos.", "Every layer adds latency, cost and failure points. It must deliver measurable benefit."],
    { examOnly: true }),

  mc("ar-06", R, ["Evaluačná sada", "Evaluation suite"],
    ["Čo by malo predchádzať nasadeniu novej verzie promptu do produkcie?", "What should precede deploying a new prompt version to production?"],
    [["Spustenie evaluačnej sady a porovnanie s doterajšou verziou", "Running the eval suite and comparing with the current version"], ["Pocit, že je lepšia", "A feeling that it's better"], ["Otestovanie na jednom príklade", "Testing on one example"], ["Nič", "Nothing"]], 0,
    ["Evaly fungujú ako regresné testy – zachytia zhoršenia, ktoré by si inak zistil od používateľov.", "Evals act as regression tests – they catch degradations you'd otherwise hear about from users."]),
  mc("ar-07", R, ["Fallback", "Fallbacks"],
    ["AI služba je dočasne nedostupná. Čo má urobiť dobre navrhnutý systém?", "The AI service is temporarily unavailable. What should a well-designed system do?"],
    [["Degradovať elegantne – opakovať s odstupom, prepnúť na záložný postup alebo informovať používateľa", "Degrade gracefully – retry with backoff, switch to a fallback path or inform the user"], ["Spadnúť bez hlásenia", "Crash silently"], ["Vrátiť vymyslené dáta", "Return fabricated data"], ["Zablokovať všetkých používateľov", "Lock out all users"]], 0,
    ["Externé závislosti zlyhávajú. Návrh má počítať s timeoutmi, opakovaním a záložnými cestami.", "External dependencies fail. The design must plan for timeouts, retries and fallback paths."]),
  mc("ar-08", R, ["Ľudská kontrola v architektúre", "Human review in architecture"],
    ["Kde v architektúre umiestniť ľudskú kontrolu pri vysokom riziku?", "Where in the architecture should human review go for high-risk cases?"],
    [["Pred nezvratnými alebo vysoko rizikovými akciami, so smerovaním podľa istoty a typu prípadu", "Before irreversible or high-risk actions, routed by confidence and case type"], ["Na koniec mesiaca na všetko", "At month end on everything"], ["Nikde", "Nowhere"], ["Iba pri chybách servera", "Only on server errors"]], 0,
    ["Cielená kontrola zachová efektivitu automatizácie a zároveň chráni tam, kde je to najdôležitejšie.", "Targeted review keeps automation efficient while protecting where it matters most."]),
  mc("ar-09", R, ["Pozorovateľnosť", "Observability"],
    ["Prečo logovať vstupy, výstupy, volania nástrojov a rozhodnutia agenta (s ohľadom na ochranu údajov)?", "Why log inputs, outputs, tool calls and agent decisions (with data protection in mind)?"],
    [["Aby sa dali chyby dohľadať, vyhodnotiť a opraviť", "So errors can be traced, evaluated and fixed"], ["Aby bol systém pomalší", "To make the system slower"], ["Kvôli marketingu", "For marketing"], ["Netreba", "No need"]], 0,
    ["Bez stôp (traces) je ladenie viackrokových AI systémov takmer nemožné.", "Without traces, debugging multi-step AI systems is nearly impossible."]),
  mc("ar-10", R, ["Drift kvality", "Quality drift"],
    ["Ako zachytíš, že sa kvalita odpovedí časom zhoršuje (napr. zmena dát, používateľov)?", "How do you detect answer quality degrading over time (e.g. changing data, users)?"],
    [["Pravidelným hodnotením vzorky produkčných výstupov a sledovaním metrík", "Regularly evaluating a sample of production outputs and tracking metrics"], ["Čakaním na sťažnosti", "Waiting for complaints"], ["Nedá sa", "It can't be done"], ["Reštartom servera", "Restarting the server"]], 0,
    ["Priebežné hodnotenie na reálnej prevádzke dopĺňa offline evaly pred nasadením.", "Ongoing evaluation on live traffic complements offline evals before deployment."],
    { examOnly: true }),

  mc("ar-11", S, ["Hranica dôvery", "Trust boundary"],
    ["Ktoré tvrdenie o system prompte je z pohľadu bezpečnosti správne?", "Which statement about the system prompt is correct from a security standpoint?"],
    [["System prompt nie je bezpečnostná hranica – oprávnenia a kontroly musia byť vynútené v kóde a infraštruktúre", "The system prompt is not a security boundary – permissions and checks must be enforced in code and infrastructure"], ["System prompt zaručí, že model nikdy neurobí nič zlé", "The system prompt guarantees the model never misbehaves"], ["System prompt je šifrovaný", "The system prompt is encrypted"], ["System prompt nahrádza autentifikáciu", "The system prompt replaces authentication"]], 0,
    ["Model môže byť zmanipulovaný. Kritické pravidlá vynucuj deterministicky mimo modelu.", "The model can be manipulated. Enforce critical rules deterministically outside the model."]),
  mc("ar-12", S, ["Oddelenie dát a pokynov", "Separating data from instructions"],
    ["Ako navrhnúť spracovanie nedôveryhodných dokumentov?", "How should processing of untrusted documents be designed?"],
    [["Označiť ich ako dáta, obmedziť dostupné nástroje počas ich spracovania a citlivé akcie oddeliť", "Mark them as data, restrict available tools while processing them and isolate sensitive actions"], ["Vložiť ich medzi systémové pokyny", "Put them among the system instructions"], ["Dôverovať im rovnako ako používateľovi", "Trust them as much as the user"], ["Spracovať ich s administrátorskými právami", "Process them with admin rights"]], 0,
    ["Obrana proti prompt injection je viacvrstvová: oddelenie, minimálne oprávnenia, potvrdenia a monitorovanie.", "Defending against prompt injection is layered: separation, least privilege, confirmations and monitoring."]),
  mc("ar-13", S, ["Ochrana osobných údajov", "Data protection"],
    ["Firma chce posielať do AI zákaznícke tikety s osobnými údajmi. Čo musí architektúra riešiť?", "A company wants to send customer tickets with personal data to AI. What must the architecture address?"],
    [["Právny základ, minimalizáciu/anonymizáciu údajov, uchovávanie, prístupové práva a zmluvné podmienky dodávateľa", "Legal basis, data minimisation/anonymisation, retention, access rights and the vendor's contractual terms"], ["Iba rýchlosť", "Only speed"], ["Nič, ak je to interné", "Nothing if it's internal"], ["Iba farbu UI", "Only UI colour"]], 0,
    ["Ochrana údajov je architektonická požiadavka, nie dodatočná úprava.", "Data protection is an architectural requirement, not an afterthought."]),
  mc("ar-14", S, ["Audit a zodpovednosť", "Audit and accountability"],
    ["Prečo potrebuje podnikové AI riešenie auditnú stopu rozhodnutí?", "Why does an enterprise AI solution need an audit trail of decisions?"],
    [["Kvôli zodpovednosti, regulácii a schopnosti spätne vysvetliť, čo sa stalo a prečo", "For accountability, regulation and the ability to explain afterwards what happened and why"], ["Nepotrebuje", "It doesn't"], ["Iba pre rýchlosť", "Only for speed"], ["Aby AI mala pamäť", "So the AI has memory"]], 0,
    ["Najmä pri rozhodnutiach o ľuďoch či peniazoch musí byť jasné, kto a na základe čoho rozhodol.", "Especially for decisions about people or money it must be clear who decided and on what basis."]),
  mc("ar-15", S, ["Governance modelov", "Model governance"],
    ["Poskytovateľ vydá novú verziu modelu. Ako postupuje dobre riadená organizácia?", "The provider releases a new model version. What does a well-governed organisation do?"],
    [["Otestuje ju na vlastných evaloch, naplánuje migráciu a sleduje vyradenie starých verzií", "Tests it on its own evals, plans the migration and tracks deprecation of old versions"], ["Ihneď prepne všetko bez testov", "Switches everything at once without testing"], ["Nikdy neaktualizuje", "Never upgrades"], ["Nechá to na náhode", "Leaves it to chance"]], 0,
    ["Verzie modelov sa menia a staré sa vyraďujú. Riadená migrácia chráni kvalitu aj kontinuitu.", "Model versions change and old ones are retired. A managed migration protects quality and continuity."],
    { examOnly: true }),

  mc("ar-16", C, ["Odstupňovanie modelov", "Model tiering"],
    ["Systém spracúva milióny jednoduchých a tisíce zložitých požiadaviek mesačne. Aká stratégia je nákladovo efektívna?", "A system handles millions of simple and thousands of complex requests a month. What strategy is cost-effective?"],
    [["Odstupňovať modely podľa náročnosti – malý model na jednoduché, výkonný na zložité, overené evalmi", "Tier models by difficulty – small for simple, strong for complex, validated by evals"], ["Najväčší model na všetko", "The largest model for everything"], ["Najmenší model na všetko bez testov", "The smallest model for everything without tests"], ["Žiadne AI", "No AI"]], 0,
    ["Tiering optimalizuje pomer cena/kvalita. Pozor: viac modelov znamená viac údržby a evalov.", "Tiering optimises cost/quality. Note: more models means more maintenance and evals."]),
  mc("ar-17", C, ["Latencia", "Latency"],
    ["Používatelia sa sťažujú na pomalé odpovede chatu. Čo pomôže najviac?", "Users complain about slow chat answers. What helps most?"],
    [["Streaming, kratší kontext, rýchlejší model pre jednoduché otázky a caching stabilnej časti promptu", "Streaming, shorter context, a faster model for simple questions and caching the stable prompt part"], ["Dlhšie system prompty", "Longer system prompts"], ["Viac krokov v reťazci", "More steps in the chain"], ["Nič", "Nothing"]], 0,
    ["Vnímaná rýchlosť závisí najmä od času do prvého textu; streaming a caching ho skracujú.", "Perceived speed depends mostly on time to first text; streaming and caching shorten it."]),
  mc("ar-18", C, ["Kapacita a limity", "Capacity and limits"],
    ["Plánuješ špičku 10× väčšej záťaže počas kampane. Na čo myslieť?", "You expect a 10× load peak during a campaign. What should you plan for?"],
    [["Rate limity účtu, frontovanie, opakovanie s odstupom a presun neurgentnej práce do dávok", "Account rate limits, queuing, retries with backoff and moving non-urgent work to batches"], ["Na nič", "Nothing"], ["Iba na väčší monitor", "Just a bigger monitor"], ["Vypnúť logovanie", "Turn off logging"]], 0,
    ["Kapacitné plánovanie AI systémov zahŕňa limity poskytovateľa, nielen vlastné servery.", "Capacity planning for AI includes provider limits, not just your own servers."]),
  mc("ar-19", C, ["Náklady na úlohu", "Cost per task"],
    ["Ako správne porovnať náklady dvoch riešení?", "How do you correctly compare the cost of two solutions?"],
    [["Podľa ceny za úspešne dokončenú úlohu vrátane opakovaní a ľudských zásahov", "By cost per successfully completed task, including retries and human intervention"], ["Iba podľa ceny za token", "Only by price per token"], ["Podľa dĺžky promptu", "By prompt length"], ["Podľa počtu modelov", "By the number of models"]], 0,
    ["Lacnejší model, ktorý potrebuje viac pokusov alebo ľudských opráv, môže byť v súčte drahší.", "A cheaper model needing more retries or human fixes can cost more overall."]),
  mc("ar-20", C, ["Kontext vs. RAG", "Long context vs. RAG"],
    ["Znalostná báza má 200 strán a mení sa raz za mesiac. Čo zvážiš?", "A knowledge base has 200 pages and changes monthly. What do you consider?"],
    [["Či je lacnejšie a spoľahlivejšie vložiť ju celú do kontextu s cachingom, alebo použiť RAG – rozhodnúť meraním", "Whether it's cheaper and more reliable to put it all in context with caching or use RAG – decide by measuring"], ["RAG je vždy jediná možnosť", "RAG is always the only option"], ["Vždy všetko do kontextu bez cachingu", "Always everything in context without caching"], ["Nič z toho", "Neither"]], 0,
    ["Pri veľkých kontextových oknách a cachingu nie je RAG vždy nutný. Rozhodujú náklady, latencia a kvalita na vašich dátach.", "With large context windows and caching, RAG isn't always required. Cost, latency and quality on your data decide."],
    { examOnly: true }),
];

export const chapters: Chapter[] = [
  { id: "ar1", domain: P, title: t("Architektonické vzory", "Architecture patterns"), lessons: [
    { id: "ar1-l1", title: t("Workflowy a agenti", "Workflows and agents"), minutes: 5,
      theory: [t("Základné stavebné bloky: reťazenie promptov, routing, paralelizácia, orchestrátor – pracovníci a autonómny agent. Vyber najjednoduchší, ktorý úlohu spoľahlivo vyrieši.", "Core building blocks: prompt chaining, routing, parallelisation, orchestrator-workers and autonomous agents. Pick the simplest that solves the task reliably.")],
      items: ["ar-01", "ar-02", "ar-03", "ar-04"] },
  ] },
  { id: "ar2", domain: R, title: t("Spoľahlivosť a hodnotenie", "Reliability and evaluation"), lessons: [
    { id: "ar2-l1", title: t("Evaly, fallbacky, ľudská kontrola", "Evals, fallbacks, human review"), minutes: 5,
      theory: [t("Spoľahlivosť vzniká z evalov pred nasadením, pozorovateľnosti v prevádzke, záložných ciest a cielenej ľudskej kontroly.", "Reliability comes from pre-deployment evals, production observability, fallback paths and targeted human review.")],
      items: ["ar-06", "ar-07", "ar-08", "ar-09"] },
  ] },
  { id: "ar3", domain: S, title: t("Bezpečnosť a governance", "Security and governance"), lessons: [
    { id: "ar3-l1", title: t("Hranice dôvery a ochrana údajov", "Trust boundaries and data protection"), minutes: 5,
      theory: [t("Model nie je bezpečnostná hranica. Vynucuj oprávnenia v kóde, oddeľ nedôveryhodné dáta, chráň osobné údaje a veď auditnú stopu.", "The model is not a security boundary. Enforce permissions in code, isolate untrusted data, protect personal data and keep an audit trail.")],
      items: ["ar-11", "ar-12", "ar-13", "ar-14"] },
  ] },
  { id: "ar4", domain: C, title: t("Škálovanie a náklady", "Scale and cost"), lessons: [
    { id: "ar4-l1", title: t("Výkon, kapacita a ekonomika", "Performance, capacity and economics"), minutes: 5,
      theory: [t("Optimalizuj cenu za dokončenú úlohu: odstupňuj modely, využi caching a dávky, plánuj rate limity a meraj latenciu.", "Optimise cost per completed task: tier models, use caching and batches, plan for rate limits and measure latency.")],
      items: ["ar-16", "ar-17", "ar-18", "ar-19"] },
  ] },
];
