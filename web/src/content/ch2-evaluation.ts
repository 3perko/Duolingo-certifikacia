import type { Chapter, Item } from "../types";
import { t } from "./certifications";

const D = "evaluation" as const;

export const items: Item[] = [
  {
    id: "ev-01", kind: "choice", domain: D,
    concept: t("Overovanie faktov", "Fact checking"),
    question: t(
      "AI ti pripravila prehľad trhu s konkrétnymi číslami. Čo urobíš pred tým, ako ho pošleš vedeniu?",
      "The AI prepared a market overview with specific figures. What do you do before sending it to management?",
    ),
    options: [
      t("Nič – AI pracuje s presnými dátami", "Nothing – the AI works with exact data"),
      t("Overím kľúčové čísla a tvrdenia v dôveryhodných primárnych zdrojoch", "Verify key figures and claims against trustworthy primary sources"),
      t("Opýtam sa AI, či si je istá, a ak áno, pošlem to", "Ask the AI whether it is sure, and send it if it says yes"),
      t("Zaokrúhlim čísla, aby chyby neboli vidieť", "Round the numbers so errors are less visible"),
    ],
    correct: [1],
    explanation: t(
      "Za výstup zodpovedá človek. Model môže čísla vymyslieť alebo mať zastarané údaje; jeho vlastné uistenie („som si istý“) nie je overenie.",
      "A human is accountable for the output. The model may invent figures or use outdated data, and its own assurance (“I'm sure”) is not verification.",
    ),
  },
  {
    id: "ev-02", kind: "choice", domain: D,
    concept: t("Vymyslené údaje vo výstupe", "Fabricated data in outputs"),
    question: t("Čo by si mal urobiť pred použitím tejto analýzy?", "What should you do before using this analysis?"),
    artifact: {
      title: t("Odpoveď AI: finančná analýza", "AI answer: financial analysis"),
      body: t(
        "Spoločnosť Novatech s.r.o. dosiahla v roku 2025 tržby 48,3 mil. € (+17 %), EBITDA maržu 21,4 % a podľa štúdie Európskej asociácie výrobcov z marca 2026 má 12 % podiel na trhu. Odporúčame investíciu.",
        "Novatech Ltd. reached 2025 revenue of €48.3M (+17%), an EBITDA margin of 21.4% and, according to a March 2026 study by the European Manufacturers' Association, a 12% market share. We recommend investing.",
      ),
    },
    options: [
      t("Použiť ju, čísla sú veľmi konkrétne, takže budú správne", "Use it – the numbers are very specific, so they must be right"),
      t("Overiť čísla vo výročnej správe či registri a dohľadať, či citovaná štúdia vôbec existuje", "Check the figures in the annual report or registry and find out whether the cited study exists at all"),
      t("Požiadať AI o dlhšiu verziu analýzy", "Ask the AI for a longer version of the analysis"),
      t("Odstrániť odporúčanie a zvyšok použiť", "Delete the recommendation and use the rest"),
    ],
    correct: [1],
    explanation: t(
      "Presné čísla a menovitý zdroj pôsobia dôveryhodne, ale model ich mohol vymyslieť. Ak AI nemala prístup k reálnym údajom, finančné čísla aj citácie treba overiť v primárnych zdrojoch.",
      "Precise numbers and a named source look credible but may be invented. If the AI had no access to real data, both figures and citations must be checked against primary sources.",
    ),
  },
  {
    id: "ev-03", kind: "choice", domain: D,
    concept: t("Vernosť zhrnutia zdroju", "Summary faithfulness"),
    question: t("Aký je problém tohto zhrnutia?", "What is wrong with this summary?"),
    artifact: {
      title: t("Pôvodný e-mail a zhrnutie od AI", "Original e-mail and AI summary"),
      body: t(
        "E-mail: „Dodávku presúvame na 14. marca. Cena zostáva rovnaká.“\n\nZhrnutie AI: „Dodávateľ presúva dodávku na 14. marca a ponúka 10 % zľavu ako kompenzáciu.“",
        "E-mail: “We are moving the delivery to 14 March. The price stays the same.”\n\nAI summary: “The supplier moves the delivery to 14 March and offers a 10% discount as compensation.”",
      ),
    },
    options: [
      t("Je príliš krátke", "It is too short"),
      t("Obsahuje tvrdenie (zľavu), ktoré v pôvodnom texte nie je", "It contains a claim (the discount) that is not in the original"),
      t("Nesprávne uvádza dátum", "It gets the date wrong"),
      t("Nie je napísané formálne", "It is not formal enough"),
    ],
    correct: [1],
    explanation: t(
      "Zhrnutie musí byť verné zdroju. Pridaná zľava je halucinácia, ktorá môže viesť k zlým rozhodnutiam – pri zhrnutiach porovnaj kľúčové tvrdenia s originálom.",
      "A summary must be faithful to its source. The added discount is a hallucination that could lead to bad decisions – compare key claims with the original.",
    ),
  },
  {
    id: "ev-04", kind: "choice", domain: D,
    concept: t("Vymyslené citácie", "Fabricated citations"),
    question: t(
      "AI v odpovedi uvádza odkazy na odborné články. Ako s nimi naložíš?",
      "The AI's answer lists references to academic papers. How do you treat them?",
    ),
    options: [
      t("Skontrolujem, či články existujú a či naozaj tvrdia to, čo im AI pripisuje", "Check that the papers exist and really say what the AI attributes to them"),
      t("Odkazy sú vždy správne, AI ich má v databáze", "References are always right – the AI has them in a database"),
      t("Odkazy vymažem, nie sú dôležité", "Delete them, they don't matter"),
      t("Pridám ďalšie odkazy, aby text pôsobil dôveryhodnejšie", "Add more references to make it look more credible"),
    ],
    correct: [0],
    explanation: t(
      "Bez vyhľadávania či priložených dokumentov môže model vytvoriť citáciu, ktorá vyzerá reálne, no neexistuje alebo tvrdí niečo iné.",
      "Without search or provided documents the model can produce a citation that looks real but does not exist or says something else.",
    ),
  },
  {
    id: "ev-05", kind: "choice", domain: D,
    concept: t("Varovné signály vo výstupe", "Red flags in outputs"),
    question: t("Ktoré situácie si vyžadujú dôkladné overenie výstupu? (vyber 2)", "Which situations call for careful verification of the output? (choose 2)"),
    options: [
      t("Výstup obsahuje presné čísla, dátumy alebo citácie", "The output contains exact numbers, dates or quotes"),
      t("Výstup je napísaný gramaticky správne", "The output is grammatically correct"),
      t("Výstup sa použije na právne, finančné alebo zdravotné rozhodnutie", "The output will be used for a legal, financial or medical decision"),
      t("Výstup má príjemný tón", "The output has a pleasant tone"),
    ],
    correct: [0, 2],
    explanation: t(
      "Overovanie zameraj tam, kde je chyba pravdepodobná (konkrétne fakty) a kde je drahá (vysoké riziko). Gramatika a tón o pravdivosti nič nehovoria.",
      "Focus verification where errors are likely (specific facts) and where they are costly (high stakes). Grammar and tone say nothing about accuracy.",
    ),
  },
  {
    id: "ev-06", kind: "choice", domain: D,
    concept: t("Hodnotiaca rubrika", "Evaluation rubric"),
    question: t("Čo je hodnotiaca rubrika pri posudzovaní výstupov AI?", "What is an evaluation rubric for AI outputs?"),
    options: [
      t("Zoznam konkrétnych kritérií, podľa ktorých sa výstup hodnotí rovnako zakaždým", "A list of concrete criteria for judging outputs the same way every time"),
      t("Tlačidlo na hodnotenie odpovede palcom hore", "A thumbs-up button"),
      t("Technický limit dĺžky odpovede", "A technical limit on answer length"),
      t("Typ AI modelu určený na hodnotenie", "A type of AI model built for grading"),
    ],
    correct: [0],
    explanation: t(
      "Rubrika (napr. presnosť, úplnosť, tón, formát) robí hodnotenie konzistentným a porovnateľným – medzi ľuďmi, medzi verziami promptu aj v čase.",
      "A rubric (e.g. accuracy, completeness, tone, format) makes evaluation consistent and comparable – across people, prompt versions and time.",
    ),
  },
  {
    id: "ev-07", kind: "choice", domain: D,
    concept: t("Testovacia sada", "Test set"),
    question: t(
      "Tím chce AI denne používať na kategorizáciu požiadaviek. Ako najlepšie zistí, či funguje spoľahlivo?",
      "A team wants to use AI daily to categorise requests. What is the best way to find out whether it is reliable?",
    ),
    options: [
      t("Vyskúša ju na dvoch požiadavkách", "Try it on two requests"),
      t("Pripraví sadu reálnych príkladov so správnymi odpoveďami od ľudí a zmeria zhodu", "Build a set of real examples with human-labelled answers and measure agreement"),
      t("Spýta sa AI, aká je jej presnosť", "Ask the AI how accurate it is"),
      t("Spolieha sa na marketingové materiály", "Rely on marketing material"),
    ],
    correct: [1],
    explanation: t(
      "Reprezentatívna testovacia sada so správnymi odpoveďami (tzv. golden set) umožní merať presnosť a porovnávať zmeny promptu či modelu.",
      "A representative test set with correct answers (a golden set) lets you measure accuracy and compare prompt or model changes.",
    ),
  },
  {
    id: "ev-08", kind: "choice", domain: D,
    concept: t("AI ako hodnotiteľ", "LLM as a judge"),
    question: t(
      "Chceš, aby jeden model hodnotil výstupy iného. Čo je dobrá prax?",
      "You want one model to grade another model's outputs. What is good practice?",
    ),
    options: [
      t("Dať hodnotiacemu modelu jasnú rubriku a jeho hodnotenia priebežne kontrolovať na vzorke ľuďmi", "Give the grader a clear rubric and regularly check its grades against human judgement on a sample"),
      t("Nechať ho hodnotiť bez kritérií, je predsa inteligentný", "Let it grade without criteria – it is intelligent"),
      t("Hodnotenia AI nikdy nekontrolovať", "Never check the AI's grades"),
      t("Používať ho len na výstupy, ktoré už skontroloval človek", "Only use it on outputs a human has already checked"),
    ],
    correct: [0],
    explanation: t(
      "AI hodnotiteľ škáluje kontrolu, ale aj on sa mýli. Rubrika a pravidelné porovnanie s ľudským hodnotením udržia jeho výsledky dôveryhodné.",
      "An AI grader scales review, but it also makes mistakes. A rubric and regular comparison with human grading keep its results trustworthy.",
    ),
  },
  {
    id: "ev-09", kind: "choice", domain: D,
    concept: t("Kontrola prekladu", "Checking translations"),
    question: t("Čo je na tomto preklade kritické?", "What is critical about this translation?"),
    artifact: {
      title: t("Zmluva – originál a preklad od AI", "Contract – original and AI translation"),
      body: t(
        "Originál (EN): “Payment is due within 30 days of delivery. Late payments incur a 0.05% daily penalty.”\n\nPreklad AI: „Platba je splatná do 30 dní od podpisu zmluvy. Pri omeškaní sa účtuje pokuta 0,5 % denne.“",
        "Original (SK): „Platba je splatná do 30 dní od dodania. Pri omeškaní sa účtuje pokuta 0,05 % denne.“\n\nAI translation: “Payment is due within 30 days of signing the contract. Late payments incur a 0.5% daily penalty.”",
      ),
    },
    options: [
      t("Preklad je príliš doslovný", "The translation is too literal"),
      t("Zmenil sa začiatok lehoty aj výška pokuty – právne podstatné údaje", "Both the start of the payment period and the penalty rate changed – legally essential facts"),
      t("Chýba podpis", "The signature is missing"),
      t("Nič, význam je zachovaný", "Nothing, the meaning is preserved"),
    ],
    correct: [1],
    explanation: t(
      "Pri právnych a finančných textoch kontroluj čísla, dátumy, lehoty a zmluvné strany riadok po riadku. Plynulý preklad môže meniť podstatné detaily.",
      "In legal and financial texts check numbers, dates, deadlines and parties line by line. A fluent translation can still change essential details.",
    ),
  },
  {
    id: "ev-10", kind: "choice", domain: D,
    concept: t("Konzistentnosť výstupov", "Output consistency"),
    question: t(
      "Ako zistíš, či je prompt spoľahlivý a nedáva zakaždým výrazne iný výsledok?",
      "How do you find out whether a prompt is reliable and does not give very different results each time?",
    ),
    options: [
      t("Spustím ho viackrát na tých istých aj rôznych vstupoch a porovnám výsledky", "Run it several times on the same and on different inputs and compare the results"),
      t("Spustím ho raz – AI je deterministická", "Run it once – AI is deterministic"),
      t("Opýtam sa AI, či bude odpovedať vždy rovnako", "Ask the AI whether it will always answer the same way"),
      t("Nedá sa to zistiť", "It cannot be determined"),
    ],
    correct: [0],
    explanation: t(
      "Výstupy jazykových modelov sa môžu medzi behmi líšiť. Opakované testovanie odhalí nestabilitu, ktorú potom riešiš jasnejšími pokynmi či príkladmi.",
      "Language model outputs can vary between runs. Repeated testing reveals instability, which you then fix with clearer instructions or examples.",
    ),
  },
  {
    id: "ev-11", kind: "choice", domain: D, examOnly: true,
    concept: t("Zaujatosť vo výstupoch", "Bias in outputs"),
    question: t(
      "AI pomáha predtriediť životopisy. Čo je dôležité pravidelne kontrolovať?",
      "AI helps pre-screen CVs. What should be checked regularly?",
    ),
    options: [
      t("Či výsledky systematicky neznevýhodňujú niektoré skupiny uchádzačov", "Whether results systematically disadvantage some groups of applicants"),
      t("Iba rýchlosť spracovania", "Only processing speed"),
      t("Či AI používa spisovný jazyk", "Whether the AI uses formal language"),
      t("Nič, AI je objektívna", "Nothing – AI is objective"),
    ],
    correct: [0],
    explanation: t(
      "Modely môžu preberať skreslenia z dát. Pri rozhodnutiach o ľuďoch treba sledovať rozdiely vo výsledkoch medzi skupinami a ponechať rozhodnutie človeku.",
      "Models can carry biases from their data. For decisions about people, monitor outcome differences between groups and keep a human in charge of the decision.",
    ),
  },
  {
    id: "ev-12", kind: "choice", domain: D, examOnly: true,
    concept: t("Ľudská kontrola pri vysokom riziku", "Human review for high stakes"),
    question: t(
      "Kedy je ľudská kontrola výstupu AI pred použitím nevyhnutná?",
      "When is human review of an AI output before use essential?",
    ),
    options: [
      t("Pri návrhoch nadpisov pre interný blog", "For headline ideas for an internal blog"),
      t("Pri odpovediach, ktoré ovplyvnia zdravie, peniaze alebo práva ľudí", "For answers that affect people's health, money or rights"),
      t("Pri brainstormingu názvov produktu", "When brainstorming product names"),
      t("Nikdy", "Never"),
    ],
    correct: [1],
    explanation: t(
      "Miera kontroly má zodpovedať riziku. Kreatívne návrhy znesú omyl, rozhodnutia s dopadom na ľudí nie.",
      "The level of review should match the risk. Creative drafts tolerate mistakes; decisions affecting people do not.",
    ),
  },
  {
    id: "ev-13", kind: "choice", domain: D, examOnly: true,
    concept: t("Meranie presnosti klasifikácie", "Measuring classification accuracy"),
    question: t(
      "AI zatriedila 200 tiketov a človek nezávisle tých istých 200. V 184 prípadoch sa zhodli. Aká je zhoda?",
      "The AI categorised 200 tickets and a human independently did the same 200. They agreed on 184. What is the agreement rate?",
    ),
    options: [t("84 %", "84%"), t("92 %", "92%"), t("96 %", "96%"), t("Nedá sa vypočítať", "It cannot be calculated")],
    correct: [1],
    explanation: t(
      "184 / 200 = 0,92, teda 92 %. Pozri sa aj na to, v ktorých kategóriách sú nezhody – tam ladiš prompt.",
      "184 / 200 = 0.92, i.e. 92%. Also look at which categories the disagreements fall in – that is where you tune the prompt.",
    ),
  },
  {
    id: "ev-14", kind: "choice", domain: D, examOnly: true,
    concept: t("Neoverené tvrdenia", "Unsupported claims"),
    question: t("Ako najlepšie zareaguješ na túto odpoveď?", "What is the best response to this answer?"),
    artifact: {
      title: t("Odpoveď AI", "AI answer"),
      body: t(
        "Podľa rozsiahlej štúdie Harvardskej univerzity z roku 2024 zvyšuje štvordňový pracovný týždeň produktivitu presne o 37 %.",
        "According to a large 2024 Harvard University study, a four-day work week increases productivity by exactly 37%.",
      ),
    },
    options: [
      t("Citovať to v prezentácii – Harvard je dôveryhodný", "Quote it in a presentation – Harvard is credible"),
      t("Dohľadať konkrétnu štúdiu a overiť, či existuje a čo naozaj uvádza", "Look up the specific study and check that it exists and what it actually says"),
      t("Zmeniť číslo na „približne 40 %“", "Change it to “about 40%”"),
      t("Odstrániť slovo „presne“", "Remove the word “exactly”"),
    ],
    correct: [1],
    explanation: t(
      "Odvolávka na prestížnu inštitúciu nie je dôkaz. Bez odkazu na konkrétny, dohľadateľný zdroj takéto tvrdenie nepoužívaj.",
      "Naming a prestigious institution is not evidence. Without a specific, traceable source, do not use such a claim.",
    ),
  },
];

export const chapter: Chapter = {
  id: "ch2",
  domain: D,
  title: t("Hodnotenie výstupov", "Evaluating outputs"),
  lessons: [
    {
      id: "ch2-l1",
      title: t("Prečo a kedy overovať", "Why and when to verify"),
      minutes: 5,
      theory: [
        t(
          "AI píše plynule a sebavedome aj vtedy, keď sa mýli. Plynulosť nie je dôkaz správnosti.",
          "AI writes fluently and confidently even when it is wrong. Fluency is not evidence of correctness.",
        ),
        t(
          "Najčastejšie chyby: vymyslené čísla a zdroje, pridané tvrdenia v zhrnutí, zmenené detaily v preklade, zastarané informácie.",
          "Most common errors: invented numbers and sources, added claims in summaries, changed details in translations, outdated information.",
        ),
      ],
      items: ["ev-01", "ev-02", "ev-03", "ev-04", "ev-05"],
    },
    {
      id: "ch2-l2",
      title: t("Rubriky, testovacie sady a konzistentnosť", "Rubrics, test sets and consistency"),
      minutes: 5,
      theory: [
        t(
          "Pri opakovaných úlohách nehodnoť „od oka“. Priprav rubriku a sadu reálnych príkladov so správnymi odpoveďami a meraj.",
          "For repeated tasks, don't judge by eye. Prepare a rubric and a set of real examples with correct answers, and measure.",
        ),
      ],
      items: ["ev-06", "ev-07", "ev-08", "ev-09", "ev-10"],
    },
  ],
};
