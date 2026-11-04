import type { Chapter, Item } from "../types";
import { t } from "./certifications";

const D = "troubleshooting" as const;

export const items: Item[] = [
  {
    id: "tr-01", kind: "choice", domain: D,
    concept: t("Príliš dlhé odpovede", "Answers that are too long"),
    question: t("Odpovede AI sú zbytočne dlhé. Čo je najúčinnejšia oprava?", "The AI's answers are needlessly long. What is the most effective fix?"),
    options: [
      t("V prompte určiť rozsah a formát, napr. „najviac 5 odrážok“", "Specify length and format in the prompt, e.g. “at most 5 bullet points”"),
      t("Prestať čítať odpovede do konca", "Stop reading answers to the end"),
      t("Zmeniť jazyk rozhrania", "Change the interface language"),
      t("Písať otázky veľkými písmenami", "Write questions in capital letters"),
    ],
    correct: [0],
    explanation: t(
      "Model nevie, aký rozsah očakávaš. Konkrétne obmedzenie (počet slov, viet, odrážok) je jasnejšie než „buď stručný“.",
      "The model doesn't know what length you expect. A concrete limit (words, sentences, bullet points) is clearer than “be brief”.",
    ),
  },
  {
    id: "tr-02", kind: "choice", domain: D,
    concept: t("Nekonzistentný formát", "Inconsistent format"),
    question: t(
      "AI vracia výstup zakaždým v trochu inom formáte, čo kazí ďalšie spracovanie. Čo pomôže?",
      "The AI returns output in a slightly different format each time, which breaks downstream processing. What helps?",
    ),
    options: [
      t("Presná šablóna alebo príklad výstupu, pri API štruktúrované výstupy (JSON schéma)", "An exact template or example of the output and, via the API, structured outputs (JSON schema)"),
      t("Viac zdvorilých fráz v prompte", "More polite phrases in the prompt"),
      t("Dlhšie čakanie na odpoveď", "Waiting longer for the answer"),
      t("Náhodné prepínanie modelov", "Switching models at random"),
    ],
    correct: [0],
    explanation: t(
      "Formát musí byť špecifikovaný jednoznačne. Príklad výstupu je najjednoduchšia cesta, štruktúrované výstupy cez API zaručia platnú štruktúru.",
      "The format must be specified unambiguously. An example output is the simplest route; structured outputs via the API guarantee a valid structure.",
    ),
  },
  {
    id: "tr-03", kind: "choice", domain: D,
    concept: t("Ignorované pokyny v dlhom prompte", "Ignored instructions in long prompts"),
    question: t(
      "V dlhom prompte AI občas prehliadne niektoré pokyny. Čo pomôže?",
      "In a long prompt the AI sometimes overlooks some instructions. What helps?",
    ),
    options: [
      t("Prehľadne štruktúrovať prompt (sekcie, XML značky, číslované pokyny) alebo úlohu rozdeliť", "Structure the prompt clearly (sections, XML tags, numbered instructions) or split the task"),
      t("Opakovať každý pokyn desaťkrát", "Repeat every instruction ten times"),
      t("Vymazať všetky pokyny", "Delete all instructions"),
      t("Pridať ďalšie nesúvisiace informácie", "Add more unrelated information"),
    ],
    correct: [0],
    explanation: t(
      "Prehľadná štruktúra zníži riziko, že sa pokyn stratí v texte. Ak je úloh priveľa naraz, rozdeľ ju na viac krokov.",
      "A clear structure reduces the chance an instruction gets lost. If there's too much at once, split the task into several steps.",
    ),
  },
  {
    id: "tr-04", kind: "choice", domain: D,
    concept: t("Znižovanie nákladov", "Reducing cost"),
    question: t("Náklady na AI v procese sú vysoké. Čo je rozumný prvý krok?", "AI costs in a process are high. What is a sensible first step?"),
    options: [
      t("Zistiť, ktoré kroky zvládne menší model, skrátiť zbytočný kontext a využiť caching či dávkové spracovanie", "Find which steps a smaller model can handle, trim unnecessary context and use caching or batch processing"),
      t("Prestať merať náklady", "Stop measuring costs"),
      t("Prejsť na najvýkonnejší model", "Switch to the most capable model"),
      t("Posielať každú požiadavku dvakrát", "Send every request twice"),
    ],
    correct: [0],
    explanation: t(
      "Cena závisí od modelu a počtu tokenov. Správny model pre každý krok, kratší kontext, prompt caching a batch spracovanie pri neurgentných úlohách ju výrazne znížia.",
      "Cost depends on the model and token count. The right model per step, shorter context, prompt caching and batch processing for non-urgent work reduce it significantly.",
    ),
  },
  {
    id: "tr-05", kind: "choice", domain: D,
    concept: t("Zastarané informácie", "Outdated information"),
    question: t("Prečo je odpoveď problematická a ako to riešiť?", "Why is this answer problematic and how do you fix it?"),
    artifact: {
      title: t("Otázka a odpoveď AI", "Question and AI answer"),
      body: t(
        "Otázka: „Aké sú aktuálne sadzby DPH na Slovensku?“\n\nAI: „Základná sadzba DPH je 20 %.“ (Model nemal prístup k internetu ani k aktuálnym dokumentom.)",
        "Question: “What are the current VAT rates in Slovakia?”\n\nAI: “The standard VAT rate is 20%.” (The model had no internet access and no current documents.)",
      ),
    },
    options: [
      t("Model môže vychádzať zo zastaraných znalostí – treba overiť v aktuálnom oficiálnom zdroji alebo mu ho poskytnúť", "The model may rely on outdated knowledge – verify against a current official source or provide one"),
      t("Odpoveď je určite správna, AI pozná všetky zákony", "The answer is certainly right – AI knows all laws"),
      t("Problém je iba v tom, že odpoveď je krátka", "The only problem is that it's short"),
      t("AI na takéto otázky nikdy nevie odpovedať", "AI can never answer such questions"),
    ],
    correct: [0],
    explanation: t(
      "Modely majú dátum, ku ktorému končia ich trénovacie znalosti (knowledge cutoff). Pri meniacich sa údajoch, ako sú sadzby či predpisy, im poskytni aktuálny zdroj alebo výsledok over.",
      "Models have a knowledge cutoff. For changing facts such as rates or regulations, give them a current source or verify the result.",
    ),
  },
  {
    id: "tr-06", kind: "choice", domain: D,
    concept: t("Odmietnutie a nejasný zámer", "Refusals and unclear intent"),
    question: t(
      "AI odmietla napísať text o liekoch pre lekárnikov. Čo pravdepodobne pomôže?",
      "The AI refused to write a text about medicines for pharmacists. What will probably help?",
    ),
    options: [
      t("Vysvetliť kontext: kto si, pre koho je text a na aký legitímny účel", "Explain the context: who you are, who the text is for and its legitimate purpose"),
      t("Skúsiť ten istý prompt v inom jazyku bez vysvetlenia", "Try the same prompt in another language without explanation"),
      t("Napísať, že ide o vtip", "Say it's a joke"),
      t("Vzdať to", "Give up"),
    ],
    correct: [0],
    explanation: t(
      "Kontext pomáha modelu správne posúdiť požiadavku. Pri legitímnych odborných úlohách často stačí jasne uviesť účel a publikum.",
      "Context helps the model judge the request correctly. For legitimate professional tasks, stating the purpose and audience is often enough.",
    ),
  },
  {
    id: "tr-s1", kind: "simulation", domain: D,
    concept: t("Optimalizácia AI procesu", "Optimising an AI pipeline"),
    scenario: t(
      "Firma denne sumarizuje 1 000 interných reportov najvýkonnejším modelom. Zhrnutia stačia ráno ďalší deň. Náklady sú 120 USD denne a vedenie ich chce znížiť bez straty kvality.",
      "A company summarises 1,000 internal reports a day with the most capable model. The summaries are needed by the next morning. Costs are 120 USD a day and management wants them down without losing quality.",
    ),
    base: { accuracy: 92, latencySec: 8, costPerDay: 120, risk: 20 },
    steps: [
      {
        question: t("Čo urobíš s výberom modelu?", "What do you do about the model choice?"),
        options: [
          { label: t("Ponechám najvýkonnejší model", "Keep the most capable model"), effect: {}, feedback: t("Kvalita zostáva, ale náklady sa nezmenia.", "Quality stays, but costs don't change.") },
          { label: t("Otestujem vyvážený model na 50 reportoch a prepnem, ak kvalita obstojí", "Test a balanced model on 50 reports and switch if quality holds"), effect: { costPerDay: -70, accuracy: -1, latencySec: -4 }, best: true, feedback: t("Rozhodnutie podložené testom: veľká úspora, minimálny pokles kvality.", "A test-backed decision: large savings, minimal quality loss.") },
          { label: t("Prepnem na najmenší model bez testovania", "Switch to the smallest model without testing"), effect: { costPerDay: -100, accuracy: -15, latencySec: -6, risk: 15 }, feedback: t("Lacné, ale kvalita zhrnutí výrazne klesla a nikto to nezmeral.", "Cheap, but summary quality dropped sharply and nobody measured it.") },
        ],
      },
      {
        question: t("Čo s promptom (3 000 tokenov pokynov s duplicitami)?", "What about the prompt (3,000 tokens of instructions with duplicates)?"),
        options: [
          { label: t("Nechám ho tak", "Leave it as is"), effect: {}, feedback: t("Platíš za opakované a zbytočné tokeny pri každom reporte.", "You pay for repeated, useless tokens on every report.") },
          { label: t("Odstránim duplicity a ponechám jeden dobrý príklad", "Remove duplicates and keep one good example"), effect: { costPerDay: -12 }, best: true, feedback: t("Kratší prompt s rovnakou informačnou hodnotou.", "A shorter prompt with the same information value.") },
          { label: t("Vymažem všetky pokyny aj príklady", "Delete all instructions and examples"), effect: { costPerDay: -18, accuracy: -10 }, feedback: t("Úspora tokenov za cenu horších a nekonzistentných zhrnutí.", "Token savings at the cost of worse, inconsistent summaries.") },
        ],
      },
      {
        question: t("Pokyny sú pre všetky reporty rovnaké. Využiješ prompt caching?", "The instructions are identical for every report. Will you use prompt caching?"),
        options: [
          { label: t("Áno, nacachujem spoločnú časť promptu", "Yes, cache the shared part of the prompt"), effect: { costPerDay: -10 }, best: true, feedback: t("Opakovaný začiatok promptu sa číta z cache výrazne lacnejšie.", "The repeated prompt prefix is read from cache at a much lower price.") },
          { label: t("Nie", "No"), effect: {}, feedback: t("Spoločné pokyny platíš pri každej požiadavke v plnej cene.", "You pay full price for the shared instructions on every request.") },
        ],
      },
      {
        question: t("Zhrnutia stačia ráno. Ako budeš požiadavky posielať?", "Summaries are needed by morning. How will you send the requests?"),
        options: [
          { label: t("Dávkovo (batch) cez noc", "As a batch overnight"), effect: { costPerDay: -14 }, best: true, feedback: t("Neurgentná práca v dávke je lacnejšia a výsledky sú hotové včas.", "Non-urgent work in a batch is cheaper and results are ready in time.") },
          { label: t("Každý report hneď v reálnom čase", "Each report immediately in real time"), effect: {}, feedback: t("Platíš za rýchlosť, ktorú nepotrebuješ.", "You pay for speed you don't need.") },
        ],
      },
    ],
    targets: { minAccuracy: 88, maxCostPerDay: 30, maxRisk: 30 },
  },
  {
    id: "tr-07", kind: "choice", domain: D, examOnly: true,
    concept: t("Systematické ladenie promptu", "Systematic prompt iteration"),
    question: t("Ako najlepšie ladiť prompt, ktorý nefunguje dobre?", "What's the best way to iterate on a prompt that doesn't work well?"),
    options: [
      t("Meniť jednu vec naraz a porovnávať výsledky na rovnakej sade testovacích príkladov", "Change one thing at a time and compare results on the same set of test examples"),
      t("Prepísať všetko naraz a skúsiť jeden príklad", "Rewrite everything at once and try one example"),
      t("Meniť prompt náhodne, kým to nezačne fungovať", "Change the prompt randomly until it works"),
      t("Nechať prompt tak a dúfať", "Leave it and hope"),
    ],
    correct: [0],
    explanation: t(
      "Keď meníš jednu premennú a meriaš na rovnakých dátach, vieš, čo zlepšenie spôsobilo. Inak len hádaš.",
      "Changing one variable and measuring on the same data tells you what caused an improvement. Otherwise you're guessing.",
    ),
  },
  {
    id: "tr-08", kind: "choice", domain: D, examOnly: true,
    concept: t("Zhoršená kvalita v dlhej konverzácii", "Quality degrading in long chats"),
    question: t(
      "Po hodinách práce v jednej konverzácii sú odpovede čoraz horšie a mätúce. Čo urobíš?",
      "After hours in one conversation, answers are getting worse and confused. What do you do?",
    ),
    options: [
      t("Začnem novú konverzáciu so stručným zhrnutím doterajších výsledkov", "Start a new conversation with a short summary of results so far"),
      t("Budem pokračovať, kým sa to nezlepší", "Keep going until it improves"),
      t("Odpovede budem ignorovať", "Ignore the answers"),
      t("Reštartujem počítač", "Restart the computer"),
    ],
    correct: [0],
    explanation: t(
      "Dlhá, zmätočná história zahlcuje kontext. Nová konverzácia so zhrnutím vráti modelu jasný rámec.",
      "A long, messy history clutters the context. A fresh conversation with a summary gives the model a clear frame again.",
    ),
  },
];

export const chapter: Chapter = {
  id: "ch7",
  domain: D,
  title: t("Riešenie problémov a optimalizácia", "Troubleshooting and optimisation"),
  lessons: [
    {
      id: "ch7-l1",
      title: t("Keď výstup nesedí", "When the output is off"),
      minutes: 4,
      theory: [
        t(
          "Väčšina problémov s výstupom má príčinu v zadaní: chýbajúci rozsah, nejasný formát, neprehľadný prompt alebo chýbajúci kontext.",
          "Most output problems come from the request: missing length, unclear format, an unstructured prompt or missing context.",
        ),
      ],
      items: ["tr-01", "tr-02", "tr-03", "tr-05", "tr-06"],
    },
    {
      id: "ch7-l2",
      title: t("Optimalizácia nákladov (simulácia)", "Cost optimisation (simulation)"),
      minutes: 5,
      theory: [
        t(
          "Náklady ovplyvňuje model, dĺžka promptu a spôsob volania. Každú zmenu over meraním kvality na testovacej sade.",
          "Cost is driven by the model, prompt length and how you call it. Verify every change by measuring quality on a test set.",
        ),
      ],
      items: ["tr-04", "tr-s1"],
    },
  ],
};
