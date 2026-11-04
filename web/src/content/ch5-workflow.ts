import type { Chapter, Item } from "../types";
import { t } from "./certifications";

const D = "workflow" as const;

export const items: Item[] = [
  {
    id: "wf-01", kind: "choice", domain: D,
    concept: t("Vhodné úlohy pre AI", "Tasks suited to AI"),
    question: t("Ktorá úloha je najvhodnejšia na začiatok zavádzania AI?", "Which task is the best place to start introducing AI?"),
    options: [
      t("Opakujúca sa práca s textom, ktorej výsledok vie človek rýchlo skontrolovať", "Repetitive text work whose result a person can check quickly"),
      t("Jednorazové strategické rozhodnutie o fúzii firmy", "A one-off strategic decision about a company merger"),
      t("Úloha, pri ktorej nikto nevie, ako vyzerá správny výsledok", "A task where nobody knows what a correct result looks like"),
      t("Schvaľovanie platieb bez akejkoľvek kontroly", "Approving payments without any review"),
    ],
    correct: [0],
    explanation: t(
      "Najväčší prínos s najmenším rizikom prinášajú časté úlohy, pri ktorých sa dá výsledok ľahko overiť – napr. návrhy odpovedí, zhrnutia, triedenie.",
      "The biggest gain with the least risk comes from frequent tasks whose results are easy to check – drafting replies, summaries, triage.",
    ),
  },
  {
    id: "wf-02", kind: "choice", domain: D,
    concept: t("Človek v procese (human-in-the-loop)", "Human in the loop"),
    question: t("Čo znamená prístup „human-in-the-loop“?", "What does a “human-in-the-loop” approach mean?"),
    options: [
      t("V definovaných krokoch výstup AI kontroluje alebo schvaľuje človek", "A person reviews or approves the AI's output at defined steps"),
      t("Človek musí všetko robiť ručne a AI sa nepoužíva", "People do everything manually and AI is not used"),
      t("AI kontroluje prácu ľudí", "The AI checks people's work"),
      t("Človek sedí pri serveri", "A person sits next to the server"),
    ],
    correct: [0],
    explanation: t(
      "AI urobí väčšinu práce, človek zasahuje tam, kde je riziko alebo neistota – napríklad pred odoslaním odpovede zákazníkovi.",
      "The AI does most of the work and a person steps in where there is risk or uncertainty – for example before a reply goes to a customer.",
    ),
  },
  {
    id: "wf-03", kind: "choice", domain: D,
    concept: t("Rozdelenie úlohy na kroky", "Breaking a task into steps"),
    question: t(
      "Chceš, aby AI z 20-stranového reportu pripravila prezentáciu pre vedenie. Aký postup je najspoľahlivejší?",
      "You want the AI to turn a 20-page report into a presentation for management. Which approach is most reliable?",
    ),
    options: [
      t("Rozdeliť to na kroky: kľúčové zistenia → osnova → texty slajdov, s kontrolou po každom kroku", "Split it into steps: key findings → outline → slide text, checking after each step"),
      t("Jeden prompt „sprav prezentáciu“", "One prompt: “make a presentation”"),
      t("Poslať iba prvú stranu", "Send only the first page"),
      t("Nechať AI vybrať, čo s reportom urobí", "Let the AI decide what to do with the report"),
    ],
    correct: [0],
    explanation: t(
      "Reťazenie promptov (prompt chaining) dáva každému kroku jasný cieľ a umožňuje opraviť chybu skôr, než sa prenesie ďalej.",
      "Prompt chaining gives each step a clear goal and lets you fix an error before it propagates.",
    ),
  },
  {
    id: "wf-04", kind: "choice", domain: D,
    concept: t("Zdieľané šablóny promptov", "Shared prompt templates"),
    question: t(
      "Každý v tíme píše prompty po svojom a výsledky sa veľmi líšia. Čo pomôže?",
      "Everyone on the team writes prompts their own way and results vary widely. What helps?",
    ),
    options: [
      t("Zdokumentovať osvedčené prompty ako zdieľané šablóny a priebežne ich zlepšovať", "Document proven prompts as shared templates and keep improving them"),
      t("Zakázať AI", "Ban AI"),
      t("Nechať to tak, rôznorodosť je dobrá", "Leave it – variety is good"),
      t("Používať len jednoslovné prompty", "Use only one-word prompts"),
    ],
    correct: [0],
    explanation: t(
      "Šablóny prenášajú know-how, zjednocujú kvalitu a uľahčujú zaškolenie nových ľudí.",
      "Templates spread know-how, make quality consistent and make onboarding easier.",
    ),
  },
  {
    id: "wf-05", kind: "choice", domain: D,
    concept: t("Meranie prínosu AI", "Measuring AI impact"),
    question: t("Ako preukážeš, že AI v procese naozaj pomohla?", "How do you show that AI really helped a process?"),
    options: [
      t("Porovnám čas, kvalitu a chybovosť pred zavedením a po ňom", "Compare time, quality and error rate before and after introducing it"),
      t("Spýtam sa AI, koľko času ušetrila", "Ask the AI how much time it saved"),
      t("Spočítam, koľko promptov sme napísali", "Count how many prompts we wrote"),
      t("Netreba to merať", "There is no need to measure it"),
    ],
    correct: [0],
    explanation: t(
      "Bez východiskového stavu (baseline) nevieš, či sa niečo zlepšilo. Meraj aj kvalitu, nielen rýchlosť.",
      "Without a baseline you cannot tell whether anything improved. Measure quality too, not just speed.",
    ),
  },
  {
    id: "wf-06", kind: "choice", domain: D,
    concept: t("Automatické odpovede bez kontroly", "Unreviewed automated replies"),
    question: t("Aký je hlavný problém tohto automatického procesu?", "What is the main problem with this automated process?"),
    artifact: {
      title: t("Automaticky odoslaná odpoveď zákazníkovi", "Reply sent to a customer automatically"),
      body: t(
        "„Dobrý deň, je nám ľúto vášho problému. Ako odškodnenie vám vrátime celú sumu objednávky a pošleme nový produkt zadarmo.“\n\n(Odpoveď vygenerovala AI a odoslala sa bez kontroly. Firemná politika umožňuje vrátenie peňazí iba po posúdení reklamácie.)",
        "“Hello, we are sorry about your problem. As compensation we will refund the full order amount and send you a new product for free.”\n\n(The AI generated the reply and it was sent without review. Company policy allows refunds only after a claim has been assessed.)",
      ),
    },
    options: [
      t("Odpoveď je príliš zdvorilá", "The reply is too polite"),
      t("AI dala záväzný sľub v rozpore s politikou a nikto ho pred odoslaním neskontroloval", "The AI made a binding promise against policy and nobody reviewed it before sending"),
      t("Odpoveď je príliš krátka", "The reply is too short"),
      t("Chýba podpis s logom", "The logo signature is missing"),
    ],
    correct: [1],
    explanation: t(
      "Odpovede so záväzkami (peniaze, zmluvy, sľuby) potrebujú pravidlá v prompte a ľudské schválenie alebo aspoň automatické zachytenie pred odoslaním.",
      "Replies containing commitments (money, contracts, promises) need rules in the prompt and human approval – or at least automatic flagging before sending.",
    ),
  },
  {
    id: "wf-07", kind: "choice", domain: D,
    concept: t("Výber procesov na automatizáciu", "Choosing processes to automate"),
    question: t("Ktoré dve úlohy sú dobrými kandidátmi na podporu AI? (vyber 2)", "Which two tasks are good candidates for AI support? (choose 2)"),
    options: [
      t("Prvý návrh odpovedí na časté otázky zákazníkov", "First drafts of replies to frequent customer questions"),
      t("Konečné rozhodnutie o prepustení zamestnanca", "The final decision to dismiss an employee"),
      t("Zhrnutie zápisníc z porád", "Summarising meeting minutes"),
      t("Podpisovanie zmlúv v mene firmy", "Signing contracts on the company's behalf"),
    ],
    correct: [0, 2],
    explanation: t(
      "Návrhy a zhrnutia šetria čas a človek ich ľahko skontroluje. Rozhodnutia s právnym či osobným dopadom má robiť človek.",
      "Drafts and summaries save time and are easy to check. Decisions with legal or personal impact should be made by people.",
    ),
  },
  {
    id: "wf-s1", kind: "simulation", domain: D,
    concept: t("Návrh AI procesu", "Designing an AI workflow"),
    scenario: t(
      "Pracuješ vo firme, ktorá denne prijíma 200 e-mailov od zákazníkov. Chceš využiť Claude na ich automatické triedenie do kategórií (objednávka, reklamácia, fakturácia, technický problém, iné). Navrhni riešenie.",
      "You work at a company that receives 200 customer e-mails a day. You want to use Claude to sort them automatically into categories (order, complaint, billing, technical issue, other). Design the solution.",
    ),
    base: { accuracy: 66, latencySec: 4, costPerDay: 9, risk: 50 },
    steps: [
      {
        question: t("Ktorý model použiješ?", "Which model will you use?"),
        options: [
          { label: t("Rýchly a lacný model (trieda Haiku)", "A fast, low-cost model (Haiku class)"), effect: { accuracy: 14, latencySec: -2, costPerDay: -3 }, best: true, feedback: t("Na jasne definované kategórie často stačí menší model. Výber potvrď na testovacej sade.", "A smaller model is often enough for clearly defined categories. Confirm on a test set.") },
          { label: t("Vyvážený model (trieda Sonnet)", "A balanced model (Sonnet class)"), effect: { accuracy: 16, latencySec: -1, costPerDay: 4 }, feedback: t("Funguje, ale za mierne vyššiu presnosť platíš výrazne viac.", "It works, but you pay notably more for slightly higher accuracy.") },
          { label: t("Najvýkonnejší model (trieda Opus)", "The most capable model (Opus class)"), effect: { accuracy: 17, latencySec: 3, costPerDay: 22 }, feedback: t("Na jednoduchú klasifikáciu je to zbytočne drahé a pomalšie.", "For simple classification this is needlessly expensive and slower.") },
        ],
      },
      {
        question: t("Aké informácie poskytneš AI?", "What information will you give the AI?"),
        options: [
          { label: t("Iba pokyn „roztrieď e-mail“", "Just “classify this e-mail”"), effect: { accuracy: -10 }, feedback: t("Bez definícií kategórií model háda, čo myslíš.", "Without category definitions the model guesses what you mean.") },
          { label: t("Zoznam kategórií s definíciami a 2–3 príkladmi pre každú", "The category list with definitions and 2–3 examples each"), effect: { accuracy: 8, costPerDay: 1 }, best: true, feedback: t("Definície a príklady (few-shot) výrazne zvyšujú presnosť za malú cenu.", "Definitions and examples (few-shot) raise accuracy a lot at little cost.") },
          { label: t("Celú firemnú wiki pri každom e-maile", "The entire company wiki with every e-mail"), effect: { accuracy: 2, costPerDay: 15, latencySec: 2 }, feedback: t("Väčšina kontextu je irelevantná – platíš za tokeny, ktoré nepomáhajú.", "Most of that context is irrelevant – you pay for tokens that don't help.") },
        ],
      },
      {
        question: t("Ako budeš vyhodnocovať správnosť?", "How will you evaluate correctness?"),
        options: [
          { label: t("Nijako, AI funguje", "Not at all – the AI works"), effect: { risk: 25 }, feedback: t("Chyby zistíš až od nespokojných zákazníkov.", "You'll learn about errors from unhappy customers.") },
          { label: t("Pred spustením porovnám so 100 e-mailmi zatriedenými ľuďmi a potom týždenne kontrolujem vzorku", "Compare with 100 human-labelled e-mails before launch, then check a weekly sample"), effect: { risk: -20, accuracy: 3 }, best: true, feedback: t("Meranie na reálnych dátach odhalí slabé kategórie, ktoré potom vylepšíš.", "Measuring on real data reveals weak categories that you can then improve.") },
          { label: t("Spýtam sa AI, či si je istá", "Ask the AI whether it's sure"), effect: { risk: 5 }, feedback: t("Sebahodnotenie modelu nenahrádza meranie voči správnym odpovediam.", "The model's self-assessment doesn't replace measuring against correct answers.") },
        ],
      },
      {
        question: t("Kedy musí zasiahnuť človek?", "When must a person step in?"),
        options: [
          { label: t("Nikdy", "Never"), effect: { risk: 20 }, feedback: t("Citlivé prípady (právne hrozby, sťažnosti) môžu skončiť zle zaradené.", "Sensitive cases (legal threats, complaints) may end up misrouted.") },
          { label: t("Pri nízkej istote a pri citlivých témach (reklamácie, právne veci)", "On low confidence and sensitive topics (complaints, legal matters)"), effect: { risk: -25, accuracy: 3, costPerDay: 1 }, best: true, feedback: t("Človek rieši len hraničné prípady – automatizácia zostáva efektívna a bezpečná.", "People handle only edge cases – automation stays efficient and safe.") },
          { label: t("Človek kontroluje každý e-mail", "A person checks every e-mail"), effect: { risk: -25, latencySec: 3600 }, feedback: t("Bezpečné, ale prínos automatizácie takmer zmizne.", "Safe, but the benefit of automation almost disappears.") },
        ],
      },
    ],
    targets: { minAccuracy: 90, maxCostPerDay: 10, maxRisk: 30 },
  },
  {
    id: "wf-08", kind: "choice", domain: D, examOnly: true,
    concept: t("Pilotné nasadenie", "Piloting"),
    question: t(
      "Ako rozumne zaviesť AI asistenta do oddelenia so 150 ľuďmi?",
      "What is a sensible way to roll out an AI assistant to a 150-person department?",
    ),
    options: [
      t("Začať pilotom s malou skupinou, merať výsledky, upraviť a potom rozšíriť", "Start with a pilot group, measure results, adjust, then expand"),
      t("Spustiť pre všetkých naraz bez prípravy", "Launch for everyone at once without preparation"),
      t("Čakať, kým AI bude dokonalá", "Wait until AI is perfect"),
      t("Nechať každého, nech si poradí sám", "Let everyone figure it out alone"),
    ],
    correct: [0],
    explanation: t(
      "Pilot odhalí problémy v malom meradle, prinesie dáta o prínose a skúsenosti pre zaškolenie ostatných.",
      "A pilot reveals problems at small scale and yields data on benefits and lessons for training everyone else.",
    ),
  },
  {
    id: "wf-09", kind: "choice", domain: D, examOnly: true,
    concept: t("Smerovanie podľa istoty", "Confidence-based routing"),
    question: t(
      "Ako navrhnúť proces, v ktorom AI spracúva žiadosti, no chyby sú drahé?",
      "How should you design a process where AI handles requests but errors are expensive?",
    ),
    options: [
      t("Jasné prípady spracuje AI, nejasné alebo rizikové pošle človeku", "Clear cases are handled by AI; unclear or risky ones go to a person"),
      t("AI spracuje všetko a chyby sa opravia neskôr", "AI handles everything and errors are fixed later"),
      t("Všetko robia ľudia", "People do everything"),
      t("Žiadosti sa rozdelia náhodne", "Requests are split at random"),
    ],
    correct: [0],
    explanation: t(
      "Smerovanie podľa istoty a rizika kombinuje efektivitu automatizácie s ľudským úsudkom tam, kde je najviac potrebný.",
      "Routing by confidence and risk combines automation's efficiency with human judgement where it's needed most.",
    ),
  },
  {
    id: "wf-10", kind: "choice", domain: D, examOnly: true,
    concept: t("Integrácia cez API", "API integration"),
    question: t(
      "Zamestnanci denne ručne kopírujú stovky záznamov do AI a výsledky späť do systému. Čo zvážiť?",
      "Employees copy hundreds of records into an AI by hand every day and paste the results back. What should be considered?",
    ),
    options: [
      t("Integráciu cez API, ktorá proces zautomatizuje vrátane kontrol", "An API integration that automates the process, including checks"),
      t("Najať viac ľudí na kopírovanie", "Hire more people to copy"),
      t("Kopírovať väčšie bloky naraz bez kontroly", "Copy bigger blocks at once without checks"),
      t("Nič, ručný postup je najlepší", "Nothing – the manual process is best"),
    ],
    correct: [0],
    explanation: t(
      "Pri veľkých objemoch je ručné kopírovanie pomalé a chybové. API integrácia s validáciou výstupov je spoľahlivejšia.",
      "At high volume, manual copying is slow and error-prone. An API integration with output validation is more reliable.",
    ),
  },
];

export const chapter: Chapter = {
  id: "ch5",
  domain: D,
  title: t("Pracovné postupy s AI", "AI in workflows"),
  lessons: [
    {
      id: "ch5-l1",
      title: t("Kde AI pomôže a kde zasahuje človek", "Where AI helps and where people step in"),
      minutes: 5,
      theory: [
        t(
          "Začni úlohami, ktoré sú časté a ľahko overiteľné. Rozhodnutia s veľkým dopadom nechaj človeku a v procese jasne urči, kde človek schvaľuje.",
          "Start with tasks that are frequent and easy to verify. Leave high-impact decisions to people and define clearly where people approve.",
        ),
      ],
      items: ["wf-01", "wf-02", "wf-06", "wf-07"],
    },
    {
      id: "ch5-l2",
      title: t("Navrhni AI proces (simulácia)", "Design an AI workflow (simulation)"),
      minutes: 6,
      theory: [
        t(
          "Zložité úlohy rozdeľ na kroky, osvedčené prompty zdieľaj ako šablóny a prínos meraj voči stavu pred zavedením.",
          "Split complex tasks into steps, share proven prompts as templates and measure impact against the situation before.",
        ),
      ],
      items: ["wf-03", "wf-04", "wf-05", "wf-s1"],
    },
  ],
};
