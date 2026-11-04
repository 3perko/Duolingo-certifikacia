import type { Chapter, Item } from "../types";
import { t } from "./certifications";

const D = "prompting" as const;

export const items: Item[] = [
  {
    id: "pe-01", kind: "choice", domain: D,
    concept: t("Prompt", "Prompt"),
    question: t("Čo je prompt?", "What is a prompt?"),
    options: [
      t("Vstup, ktorým AI modelu zadávaš úlohu, kontext a údaje", "The input that gives an AI model its task, context and data"),
      t("Nastavenie, ktoré zvýši rýchlosť modelu", "A setting that makes the model faster"),
      t("Databáza, z ktorej sa model učí počas konverzácie", "A database the model learns from during the conversation"),
      t("Názov konkrétneho modelu Claude", "The name of a specific Claude model"),
    ],
    correct: [0],
    explanation: t(
      "Prompt je všetko, čo modelu pošleš: pokyny, kontext, príklady aj údaje. Kvalita výstupu silne závisí od toho, aký jasný a úplný je prompt.",
      "A prompt is everything you send to the model: instructions, context, examples and data. Output quality depends heavily on how clear and complete it is.",
    ),
  },
  {
    id: "pe-02", kind: "choice", domain: D,
    concept: t("Context window", "Context window"),
    question: t("Čo označuje pojem context window?", "What does the term context window mean?"),
    options: [
      t("Okno aplikácie, v ktorom píšeš správy", "The app window where you type messages"),
      t("Maximálne množstvo textu (tokenov), ktoré model naraz spracuje – vrátane konverzácie a príloh", "The maximum amount of text (tokens) a model processes at once, including the conversation and attachments"),
      t("Čas, počas ktorého si model pamätá konverzáciu", "How long the model remembers a conversation"),
      t("Počet používateľov, ktorí môžu model používať súčasne", "How many users can use the model at the same time"),
    ],
    correct: [1],
    explanation: t(
      "Context window je pracovná pamäť modelu meraná v tokenoch. Patrí do nej prompt, celá doterajšia konverzácia, priložené dokumenty aj odpoveď.",
      "The context window is the model's working memory, measured in tokens. It holds the prompt, the conversation so far, attached documents and the answer.",
    ),
  },
  {
    id: "pe-03", kind: "choice", domain: D,
    concept: t("Kontext v prompte", "Context in a prompt"),
    question: t(
      "Prečo sa oplatí v prompte uviesť, pre koho je výstup a na čo sa použije?",
      "Why is it worth stating in the prompt who the output is for and how it will be used?",
    ),
    options: [
      t("Model potom odpovedá rýchlejšie", "The model then answers faster"),
      t("Model môže prispôsobiť obsah, úroveň detailu aj tón skutočnej potrebe", "The model can tailor content, level of detail and tone to the real need"),
      t("Bez toho model odmietne odpovedať", "Without it the model refuses to answer"),
      t("Zníži sa tým cena za tokeny", "It lowers the token price"),
    ],
    correct: [1],
    explanation: t(
      "Model nevie, čo máš v hlave. Publikum a účel mu povedia, čo je dôležité – rovnaká téma sa inak vysvetľuje študentovi a inak finančnému riaditeľovi.",
      "The model cannot read your mind. Audience and purpose tell it what matters – the same topic is explained differently to a student and to a CFO.",
    ),
  },
  {
    id: "pe-04", kind: "choice", domain: D,
    concept: t("Halucinácie", "Hallucinations"),
    question: t("Čo v kontexte AI znamená „halucinácia“?", "In AI, what is a “hallucination”?"),
    options: [
      t("Keď model odmietne odpovedať", "When the model refuses to answer"),
      t("Keď model vygeneruje presvedčivo znejúcu, ale nepravdivú alebo vymyslenú informáciu", "When the model produces plausible-sounding but false or made-up information"),
      t("Keď model odpovie v inom jazyku", "When the model answers in another language"),
      t("Keď model generuje obrázky", "When the model generates images"),
    ],
    correct: [1],
    explanation: t(
      "Jazykové modely generujú pravdepodobný text, nie overené fakty. Preto môžu vymyslieť čísla, citácie či zdroje, ktoré znejú dôveryhodne.",
      "Language models generate likely text, not verified facts, so they can invent numbers, quotes or sources that sound credible.",
    ),
  },
  {
    id: "pe-p1", kind: "prompt", domain: D,
    concept: t("Formulovanie požiadavky", "Writing a clear request"),
    goal: t(
      "Chceš od AI krátke vysvetlenie, ako funguje generatívna AI, pre úplného začiatočníka.",
      "You want a short explanation of how generative AI works, for a complete beginner.",
    ),
    brokenPrompt: t("Napíš mi niečo o umelej inteligencii.", "Write me something about artificial intelligence."),
    rubric: [
      { id: "task", label: t("Definovanie úlohy", "Task definition"), description: t("Je jasné, čo presne má AI urobiť a o akej téme.", "It is clear what exactly the AI should do and on which topic."), weight: 2, hints: ["vysvetli", "explain", "popíš", "describe", "ako funguje", "how .* works", "generatívn", "generative"] },
      { id: "audience", label: t("Definovanie publika", "Audience"), description: t("Prompt hovorí, pre koho je text určený.", "The prompt says who the text is for."), weight: 1, hints: ["začiatočn", "beginner", "laik", "layperson", "študent", "student", "publikum", "audience", "pre (koho|deti|seniorov)"] },
      { id: "format", label: t("Požadovaný formát", "Format"), description: t("Prompt určuje štruktúru alebo podobu výstupu.", "The prompt specifies the structure or shape of the output."), weight: 1, hints: ["odsek", "paragraph", "bod", "bullet", "zoznam", "list", "príklad", "example", "nadpis", "heading", "tabuľ", "table"] },
      { id: "constraints", label: t("Obmedzenia", "Constraints"), description: t("Prompt stanovuje rozsah alebo iné hranice.", "The prompt sets length or other limits."), weight: 1, hints: ["slov", "words", "max", "najviac", "at most", "krátk", "short", "viet", "sentences", "bez (odborn|žargón)", "no jargon"] },
    ],
    sample: t(
      "Vysvetli mi, ako funguje generatívna AI. Text je určený začiatočníkovi bez technického vzdelania. Použi dva jednoduché príklady z bežného života, rozdeľ text do krátkych odsekov a nepresiahni 300 slov.",
      "Explain how generative AI works. The text is for a beginner with no technical background. Use two simple everyday examples, split the text into short paragraphs and stay under 300 words.",
    ),
  },
  {
    id: "pe-05", kind: "choice", domain: D,
    concept: t("Few-shot prompting", "Few-shot prompting"),
    question: t("Čo je hlavnou výhodou few-shot promptingu?", "What is the main benefit of few-shot prompting?"),
    options: [
      t("Znižuje veľkosť AI modelu", "It reduces the size of the AI model"),
      t("Poskytuje modelu príklady požadovaného správania", "It gives the model examples of the desired behaviour"),
      t("Zabezpečuje, že AI nikdy neurobí chybu", "It guarantees the AI never makes a mistake"),
      t("Umožňuje používať AI bez internetu", "It lets you use AI without the internet"),
    ],
    correct: [1],
    explanation: t(
      "Niekoľko ukážkových vstupov a výstupov („shots“) modelu ukáže formát, štýl a úroveň detailu lepšie než dlhý opis. Chyby však úplne neodstráni.",
      "A few example inputs and outputs (“shots”) show the format, style and level of detail better than a long description. They do not eliminate errors.",
    ),
  },
  {
    id: "pe-06", kind: "choice", domain: D,
    concept: t("System prompt vs. user prompt", "System prompt vs. user prompt"),
    question: t("Na čo sa typicky používa system prompt?", "What is a system prompt typically used for?"),
    options: [
      t("Na trvalé nastavenie roly, pravidiel a kontextu, ktoré platia pre celú konverzáciu", "To set a role, rules and context that apply to the whole conversation"),
      t("Na odoslanie jednej konkrétnej otázky", "To send one specific question"),
      t("Na zmenu jazyka rozhrania aplikácie", "To change the app's interface language"),
      t("Na reštart modelu", "To restart the model"),
    ],
    correct: [0],
    explanation: t(
      "System prompt nastavuje rámec (rola, tón, pravidlá, znalosti). User prompt nesie konkrétnu požiadavku v danom kroku konverzácie.",
      "The system prompt sets the frame (role, tone, rules, knowledge). The user prompt carries the specific request at each turn.",
    ),
  },
  {
    id: "pe-07", kind: "choice", domain: D,
    concept: t("XML značky v promptoch", "XML tags in prompts"),
    question: t("Prečo sa v promptoch pre Claude odporúčajú XML značky, napr. <dokument>…</dokument>?", "Why are XML tags such as <document>…</document> recommended in prompts for Claude?"),
    options: [
      t("Claude inak nevie čítať text", "Claude cannot read text otherwise"),
      t("Jasne oddelia pokyny od údajov a jednotlivé časti promptu od seba", "They clearly separate instructions from data and the parts of a prompt from each other"),
      t("Zašifrujú citlivé údaje", "They encrypt sensitive data"),
      t("Sú povinné pri každom prompte", "They are mandatory in every prompt"),
    ],
    correct: [1],
    explanation: t(
      "Značky nie sú povinné, ale pomáhajú: model presne vie, kde začína a končí vložený dokument, príklad či pokyn, a ty sa na ne vieš odvolať („zhrň text v <email>“).",
      "Tags are optional but helpful: the model knows exactly where a document, example or instruction begins and ends, and you can refer to them (“summarise the text in <email>”).",
    ),
  },
  {
    id: "pe-08", kind: "choice", domain: D,
    concept: t("Štruktúrované výstupy", "Structured outputs"),
    question: t(
      "Potrebuješ, aby AI vracala údaje z faktúr vždy v rovnakom tvare na ďalšie spracovanie. Čo pomôže najviac?",
      "You need the AI to always return invoice data in the same shape for further processing. What helps most?",
    ),
    options: [
      t("Napísať „buď presný“", "Write “be precise”"),
      t("Presne definovať výstupnú štruktúru (napr. JSON s pomenovanými poľami) a ukázať príklad", "Define the output structure exactly (e.g. JSON with named fields) and show an example"),
      t("Poslať každú faktúru dvakrát", "Send every invoice twice"),
      t("Použiť čo najkratší prompt", "Use the shortest possible prompt"),
    ],
    correct: [1],
    explanation: t(
      "Keď výstup spracúva program, formát musí byť jednoznačný. Pomenované polia, príklad a pri API aj funkcia štruktúrovaných výstupov zaručia konzistentný tvar.",
      "When a program consumes the output, the format must be unambiguous. Named fields, an example and – via the API – structured outputs keep the shape consistent.",
    ),
  },
  {
    id: "pe-p2", kind: "prompt", domain: D,
    concept: t("Zhrnutie s jasným cieľom", "Summaries with a clear goal"),
    goal: t(
      "Dlhý e-mail od klienta treba zhrnúť pre manažéra, ktorý potrebuje rýchlo vedieť, čo klient chce a čo treba urobiť.",
      "A long client e-mail must be summarised for a manager who needs to know quickly what the client wants and what needs to be done.",
    ),
    brokenPrompt: t("Zhrň tento e-mail.", "Summarise this e-mail."),
    rubric: [
      { id: "task", label: t("Úloha a cieľ", "Task and goal"), description: t("Zhrnutie aj vytiahnutie požiadaviek či ďalších krokov.", "Summarise and extract requests or next steps."), weight: 2, hints: ["zhr", "summar", "úloh", "action", "krok", "step", "požiadav", "request", "čo treba", "what needs"] },
      { id: "audience", label: t("Publikum", "Audience"), description: t("Je jasné, že čitateľ je manažér.", "The reader (a manager) is stated."), weight: 1, hints: ["manažér", "manager", "vedúc", "nadriaden", "šéf", "boss"] },
      { id: "format", label: t("Formát", "Format"), description: t("Určená štruktúra, napr. odrážky.", "A structure is specified, e.g. bullet points."), weight: 1, hints: ["bod", "odrážk", "bullet", "zoznam", "list", "tabuľ", "table", "nadpis", "heading"] },
      { id: "delimiters", label: t("Oddelenie vstupu", "Delimited input"), description: t("E-mail je jasne oddelený, napr. značkami <email>.", "The e-mail is clearly delimited, e.g. with <email> tags."), weight: 1, hints: ["<email", "<e-mail", "<text", "\"\"\"", "---", "nižšie", "below", "značk", "tags"] },
      { id: "constraints", label: t("Rozsah", "Length"), description: t("Obmedzený rozsah zhrnutia.", "The summary length is limited."), weight: 1, hints: ["max", "slov", "words", "viet", "sentences", "najviac", "at most", "\\d+ (bod|bullet)"] },
    ],
    sample: t(
      "Zhrň e-mail od klienta v značkách <email> pre môjho manažéra. Uveď: 1) čo klient chce, 2) termíny, 3) úlohy pre náš tím. Použi najviac 5 odrážok.\n<email>…</email>",
      "Summarise the client e-mail in the <email> tags for my manager. Include: 1) what the client wants, 2) deadlines, 3) actions for our team. Use at most 5 bullet points.\n<email>…</email>",
    ),
  },
  {
    id: "pe-09", kind: "choice", domain: D,
    concept: t("Minimalizácia halucinácií", "Reducing hallucinations"),
    question: t(
      "Ktorý pokyn najviac zníži riziko vymyslených odpovedí pri otázkach nad interným dokumentom?",
      "Which instruction most reduces the risk of made-up answers to questions about an internal document?",
    ),
    options: [
      t("„Odpovedaj sebavedome.“", "“Answer confidently.”"),
      t("„Odpovedaj iba na základe priloženého dokumentu, cituj príslušnú pasáž a ak odpoveď v dokumente nie je, povedz to.“", "“Answer only from the attached document, quote the relevant passage, and say so if the answer is not in it.”"),
      t("„Odpovedz čo najdlhšie.“", "“Answer at length.”"),
      t("„Nepoužívaj dokument, odpovedaj zo svojich znalostí.“", "“Ignore the document and answer from your own knowledge.”"),
    ],
    correct: [1],
    explanation: t(
      "Ukotvenie v zdroji, požiadavka na citáciu a výslovné povolenie povedať „neviem“ sú najúčinnejšie jednoduché techniky proti halucináciám.",
      "Grounding in a source, asking for quotes and explicitly allowing “I don't know” are the most effective simple techniques against hallucinations.",
    ),
  },
  {
    id: "pe-10", kind: "choice", domain: D, examOnly: true,
    concept: t("Premýšľanie krok za krokom", "Step-by-step reasoning"),
    question: t(
      "Pri zložitej úlohe s viacerými výpočtami dáva model nesprávne výsledky. Čo je vhodný prvý krok?",
      "On a complex task with several calculations the model gives wrong results. What is a good first step?",
    ),
    options: [
      t("Požiadať model, aby postupoval krok za krokom a uviedol medzivýsledky", "Ask the model to work step by step and show intermediate results"),
      t("Skrátiť prompt na jednu vetu", "Shorten the prompt to one sentence"),
      t("Prestať AI na túto úlohu používať", "Stop using AI for this task"),
      t("Opakovať tú istú otázku, kým nevyjde správny výsledok", "Repeat the question until the right result appears"),
    ],
    correct: [0],
    explanation: t(
      "Rozpísanie postupu dáva modelu priestor na uvažovanie a tebe možnosť skontrolovať každý krok. Výsledky výpočtov aj tak over.",
      "Laying out the steps gives the model room to reason and lets you check each step. Still verify the calculations.",
    ),
  },
  {
    id: "pe-11", kind: "choice", domain: D, examOnly: true,
    concept: t("Jasné zadanie", "Clear instructions"),
    question: t("Ktoré dve úpravy najviac zlepšia nejasný prompt? (vyber 2)", "Which two changes most improve a vague prompt? (choose 2)"),
    options: [
      t("Doplniť účel a cieľové publikum", "Add the purpose and target audience"),
      t("Pridať viac výkričníkov", "Add more exclamation marks"),
      t("Určiť požadovaný formát a rozsah", "Specify the required format and length"),
      t("Napísať prompt výhradne veľkými písmenami", "Write the prompt in capital letters"),
    ],
    correct: [0, 2],
    explanation: t(
      "Účel, publikum, formát a rozsah sú konkrétne informácie, ktoré modelu chýbajú. Zdôrazňovanie výkričníkmi či veľkými písmenami zadanie nespresní.",
      "Purpose, audience, format and length are concrete information the model lacks. Emphasis via exclamation marks or capitals does not make the request clearer.",
    ),
  },
];

export const chapter: Chapter = {
  id: "ch1",
  domain: D,
  title: t("Základy AI a prompt engineering", "AI basics and prompt engineering"),
  lessons: [
    {
      id: "ch1-l1",
      title: t("Čo je prompt a prečo záleží na kontexte", "What a prompt is and why context matters"),
      minutes: 4,
      theory: [
        t(
          "Jazykový model ako Claude číta text po tokenoch (kúskoch slov) a generuje najpravdepodobnejšie pokračovanie. Nemá prístup k tvojim myšlienkam – vie len to, čo je v prompte a v konverzácii.",
          "A language model such as Claude reads text as tokens (pieces of words) and generates the most likely continuation. It cannot see your thoughts – only what is in the prompt and the conversation.",
        ),
        t(
          "Dobrý prompt obsahuje: úlohu (čo urobiť), kontext (prečo a pre koho), vstupné údaje a očakávaný formát výstupu.",
          "A good prompt contains: the task (what to do), context (why and for whom), the input data and the expected output format.",
        ),
      ],
      items: ["pe-01", "pe-02", "pe-03", "pe-04", "pe-p1"],
    },
    {
      id: "ch1-l2",
      title: t("Few-shot, system prompt a štruktúra", "Few-shot, system prompts and structure"),
      minutes: 5,
      theory: [
        t(
          "Few-shot prompting = niekoľko ukážok vstupu a správneho výstupu priamo v prompte. Model z nich odvodí formát aj štýl.",
          "Few-shot prompting = a few examples of input and correct output inside the prompt. The model infers format and style from them.",
        ),
        t(
          "XML značky (<email>, <pokyny>, <príklad>) oddeľujú časti promptu. Pri strojovom spracovaní si vypýtaj presne definovaný formát, napr. JSON.",
          "XML tags (<email>, <instructions>, <example>) separate the parts of a prompt. For machine processing, ask for an exactly defined format such as JSON.",
        ),
      ],
      items: ["pe-05", "pe-06", "pe-07", "pe-08", "pe-p2"],
    },
    {
      id: "ch1-l3",
      title: t("Ako minimalizovať halucinácie", "How to minimise hallucinations"),
      minutes: 3,
      theory: [
        t(
          "Halucinácie obmedzíš tak, že model ukotvíš v zdroji („odpovedaj len z dokumentu“), vypýtaš si citácie a výslovne mu dovolíš povedať „neviem“.",
          "You reduce hallucinations by grounding the model in a source (“answer only from the document”), asking for quotes and explicitly allowing it to say “I don't know”.",
        ),
      ],
      items: ["pe-09", "pe-04", "pe-02"],
    },
  ],
};
