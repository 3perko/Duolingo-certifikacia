import type { Chapter, Item } from "../types";
import { t } from "./certifications";

const D = "models" as const;

export const items: Item[] = [
  {
    id: "mo-01", kind: "choice", domain: D,
    concept: t("Rodiny modelov Claude", "Claude model families"),
    question: t(
      "Potrebuješ denne roztriediť tisíce krátkych správ do piatich jasných kategórií. Ktorý typ modelu je rozumný prvý kandidát?",
      "You need to sort thousands of short messages a day into five clear categories. Which kind of model is a sensible first candidate?",
    ),
    options: [
      t("Najmenší a najrýchlejší model (trieda Haiku)", "The smallest, fastest model (Haiku class)"),
      t("Vždy najvýkonnejší model bez ohľadu na cenu", "Always the most capable model regardless of cost"),
      t("Model na generovanie obrázkov", "An image generation model"),
      t("Žiadny – na klasifikáciu sa AI nehodí", "None – AI is not suited to classification"),
    ],
    correct: [0],
    explanation: t(
      "Pri jednoduchých, objemných úlohách býva menší model dostatočne presný a výrazne lacnejší a rýchlejší. Over to na testovacej sade.",
      "For simple, high-volume tasks a smaller model is often accurate enough and much cheaper and faster. Confirm it on a test set.",
    ),
  },
  {
    id: "mo-02", kind: "choice", domain: D,
    concept: t("Výber modelu podľa náročnosti", "Choosing a model by difficulty"),
    question: t(
      "Úloha vyžaduje analýzu dlhej zmluvy, porovnanie s internými pravidlami a viackrokové zdôvodnenie. Čo zvolíš?",
      "The task requires analysing a long contract, comparing it with internal rules and multi-step reasoning. What do you choose?",
    ),
    options: [
      t("Najvýkonnejší dostupný model (trieda Opus) alebo vyvážený model (trieda Sonnet) po otestovaní", "The most capable model available (Opus class), or a balanced model (Sonnet class) after testing"),
      t("Najmenší model, lebo je najlacnejší", "The smallest model because it is cheapest"),
      t("Akýkoľvek model, na výbere nezáleží", "Any model – the choice doesn't matter"),
      t("Model, ktorý odpovie najkratšie", "Whichever model gives the shortest answers"),
    ],
    correct: [0],
    explanation: t(
      "Zložité uvažovanie nad dlhými textami je doménou výkonnejších modelov. Cena za chybu je tu vyššia ako cena za tokeny.",
      "Complex reasoning over long texts is where more capable models shine. Here the cost of an error outweighs the cost of tokens.",
    ),
  },
  {
    id: "mo-03", kind: "choice", domain: D,
    concept: t("Claude aplikácia vs. API", "Claude apps vs. the API"),
    question: t(
      "Firma chce, aby jej vlastný interný systém automaticky posielal dokumenty na spracovanie modelu Claude. Čo použije?",
      "A company wants its own internal system to automatically send documents to Claude for processing. What should it use?",
    ),
    options: [
      t("Claude API", "The Claude API"),
      t("Ručné kopírovanie do webovej aplikácie Claude", "Copy-pasting into the Claude web app by hand"),
      t("Mobilnú aplikáciu Claude", "The Claude mobile app"),
      t("E-mail na podporu Anthropic", "An e-mail to Anthropic support"),
    ],
    correct: [0],
    explanation: t(
      "Aplikácie Claude (web, desktop, mobil) sú určené ľuďom. Na integráciu do vlastných systémov a automatizáciu slúži API.",
      "The Claude apps (web, desktop, mobile) are for people. The API is for integrating Claude into your own systems and automation.",
    ),
  },
  {
    id: "mo-04", kind: "choice", domain: D,
    concept: t("Claude Code", "Claude Code"),
    question: t("Na čo je určený Claude Code?", "What is Claude Code designed for?"),
    options: [
      t("Agentická práca so softvérom – čítanie, úpravy a spúšťanie kódu v projekte", "Agentic software work – reading, editing and running code in a project"),
      t("Šifrovanie e-mailov", "Encrypting e-mails"),
      t("Tvorba prezentácií v PowerPointe bez AI", "Making PowerPoint slides without AI"),
      t("Účtovníctvo", "Accounting"),
    ],
    correct: [0],
    explanation: t(
      "Claude Code je nástroj, v ktorom Claude ako agent pracuje priamo s kódom a súbormi projektu – navrhuje zmeny, spúšťa príkazy a testy.",
      "Claude Code is a tool in which Claude works as an agent directly with a project's code and files – proposing changes and running commands and tests.",
    ),
  },
  {
    id: "mo-05", kind: "choice", domain: D,
    concept: t("Kvalita, rýchlosť a cena", "Quality, speed and cost"),
    question: t(
      "Ktoré tri faktory sa pri výbere modelu typicky vyvažujú?",
      "Which three factors are typically traded off when choosing a model?",
    ),
    options: [
      t("Kvalita výstupu, rýchlosť (latencia) a cena", "Output quality, speed (latency) and cost"),
      t("Farba rozhrania, jazyk a písmo", "Interface colour, language and font"),
      t("Počet používateľov, logo a licencia operačného systému", "Number of users, logo and OS licence"),
      t("Iba cena", "Only cost"),
    ],
    correct: [0],
    explanation: t(
      "Výkonnejšie modely bývajú presnejšie, ale pomalšie a drahšie. Správny výber závisí od toho, čo daná úloha naozaj potrebuje.",
      "More capable models tend to be more accurate but slower and more expensive. The right choice depends on what the task really needs.",
    ),
  },
  {
    id: "mo-06", kind: "choice", domain: D,
    concept: t("Multimodalita", "Multimodality"),
    question: t(
      "Máš snímku grafu z reportu a chceš z nej vyčítať trendy. Čo platí?",
      "You have a screenshot of a chart from a report and want to read the trends. What is true?",
    ),
    options: [
      t("Claude vie analyzovať obrázky, napr. grafy a snímky obrazovky – kľúčové hodnoty však over", "Claude can analyse images such as charts and screenshots – but verify key values"),
      t("Obrázky treba vždy najprv ručne prepísať do textu", "Images must always be transcribed to text by hand first"),
      t("Claude spracuje iba obrázky vo formáte BMP", "Claude only accepts BMP images"),
      t("AI modely nevedia pracovať s obrázkami", "AI models cannot work with images"),
    ],
    correct: [0],
    explanation: t(
      "Modely Claude prijímajú aj obrázky. Čítanie presných hodnôt z grafov môže byť nepresné, preto dôležité čísla over.",
      "Claude models accept images as input. Reading exact values off charts can be imprecise, so verify important numbers.",
    ),
  },
  {
    id: "mo-07", kind: "choice", domain: D, examOnly: true,
    concept: t("Testovanie kandidátskych modelov", "Testing candidate models"),
    question: t(
      "Ako sa najlepšie rozhodnúť medzi dvoma modelmi pre konkrétnu firemnú úlohu?",
      "What is the best way to choose between two models for a specific business task?",
    ),
    options: [
      t("Porovnať ich na reprezentatívnej vzorke reálnych úloh podľa kvality, rýchlosti a ceny", "Compare them on a representative sample of real tasks for quality, speed and cost"),
      t("Vybrať novší, novší je vždy lepší na všetko", "Pick the newer one – newer is always better at everything"),
      t("Vybrať podľa názvu", "Pick by name"),
      t("Spýtať sa jedného z modelov, ktorý je lepší", "Ask one of the models which is better"),
    ],
    correct: [0],
    explanation: t(
      "Všeobecné benchmarky sú len orientačné. Rozhoduje výkon na tvojich dátach a tvojich kritériách.",
      "General benchmarks are only indicative. What matters is performance on your data and your criteria.",
    ),
  },
  {
    id: "mo-08", kind: "choice", domain: D, examOnly: true,
    concept: t("Context window pri dlhých dokumentoch", "Context window and long documents"),
    question: t(
      "Chceš naraz analyzovať veľmi rozsiahlu dokumentáciu. Na čo musíš pri výbere riešenia myslieť?",
      "You want to analyse very large documentation at once. What must you consider when choosing a solution?",
    ),
    options: [
      t("Či sa obsah zmestí do context window modelu, prípadne ho rozdeliť alebo vyhľadávať relevantné časti", "Whether the content fits in the model's context window – otherwise split it or retrieve relevant parts"),
      t("Na dĺžke nezáleží, model spracuje neobmedzené množstvo textu", "Length doesn't matter – the model handles unlimited text"),
      t("Dokumenty treba vždy preložiť do angličtiny", "Documents must always be translated into English"),
      t("Stačí poslať iba názvy súborov", "Sending just the file names is enough"),
    ],
    correct: [0],
    explanation: t(
      "Každý model má limit kontextu. Pri väčšom objeme pomáha delenie na časti, zhrnutia alebo vyhľadávanie relevantných pasáží (RAG).",
      "Every model has a context limit. For larger volumes, chunking, summaries or retrieving relevant passages (RAG) help.",
    ),
  },
];

export const chapter: Chapter = {
  id: "ch3",
  domain: D,
  title: t("Výber produktov a modelov", "Choosing products and models"),
  lessons: [
    {
      id: "ch3-l1",
      title: t("Modely Claude a ich kompromisy", "Claude models and their trade-offs"),
      minutes: 4,
      theory: [
        t(
          "Claude existuje v rodinách s rôznym pomerom výkonu, rýchlosti a ceny: Haiku (rýchly a lacný), Sonnet (vyvážený), Opus (najvýkonnejší). Konkrétne verzie sa menia – vždy si over aktuálnu ponuku.",
          "Claude comes in families with different balances of capability, speed and cost: Haiku (fast, low cost), Sonnet (balanced), Opus (most capable). Specific versions change – always check the current line-up.",
        ),
      ],
      items: ["mo-01", "mo-02", "mo-05", "mo-06"],
    },
    {
      id: "ch3-l2",
      title: t("Produkty: aplikácie, API, Claude Code", "Products: apps, API, Claude Code"),
      minutes: 3,
      theory: [
        t(
          "Aplikácie Claude slúžia na prácu ľudí, API na integráciu do systémov, Claude Code na agentickú prácu s kódom.",
          "The Claude apps are for people's day-to-day work, the API is for system integration, Claude Code is for agentic work on code.",
        ),
      ],
      items: ["mo-03", "mo-04", "mo-01"],
    },
  ],
};
