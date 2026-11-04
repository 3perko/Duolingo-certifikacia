import type { Chapter, Item } from "../types";
import { t } from "./certifications";

const D = "knowledge" as const;

export const items: Item[] = [
  {
    id: "kn-01", kind: "choice", domain: D,
    concept: t("Projekty v Claude", "Claude Projects"),
    question: t(
      "Tím opakovane pracuje s tými istými smernicami a šablónami. Čo v aplikácii Claude pomôže najviac?",
      "A team repeatedly works with the same guidelines and templates. What helps most in the Claude app?",
    ),
    options: [
      t("Projekt so zdieľanými znalosťami (dokumentmi) a vlastnými pokynmi", "A Project with shared knowledge (documents) and custom instructions"),
      t("Vkladať dokumenty znova do každej konverzácie", "Paste the documents into every conversation again"),
      t("Pamätať si obsah dokumentov a písať ho z hlavy", "Memorise the documents and type them from memory"),
      t("Poslať dokumenty e-mailom kolegom", "E-mail the documents to colleagues"),
    ],
    correct: [0],
    explanation: t(
      "Projekty zoskupujú konverzácie so spoločnými znalosťami a pokynmi, takže kontext netreba stále opakovať a tím pracuje konzistentne.",
      "Projects group conversations with shared knowledge and instructions, so context need not be repeated and the team works consistently.",
    ),
  },
  {
    id: "kn-02", kind: "choice", domain: D,
    concept: t("Vlastné pokyny", "Custom instructions"),
    question: t(
      "Čo patrí do vlastných pokynov (custom instructions) projektu?",
      "What belongs in a project's custom instructions?",
    ),
    options: [
      t("Trvalé pravidlá: rola, tón, formát odpovedí a ako postupovať, keď informácia chýba", "Standing rules: role, tone, answer format and what to do when information is missing"),
      t("Jednorazová otázka, ktorú chceš práve položiť", "A one-off question you want to ask right now"),
      t("Heslá a prístupové údaje", "Passwords and credentials"),
      t("Celá história všetkých konverzácií", "The entire history of every conversation"),
    ],
    correct: [0],
    explanation: t(
      "Pokyny platia pre každú konverzáciu v projekte, preto do nich patrí to, čo sa nemení. Konkrétne otázky patria do správ, citlivé údaje nikam.",
      "Instructions apply to every conversation in the project, so they hold what doesn't change. Specific questions go in messages; secrets go nowhere.",
    ),
  },
  {
    id: "kn-03", kind: "choice", domain: D,
    concept: t("Kvalita znalostnej bázy", "Knowledge base quality"),
    question: t(
      "Ktoré dokumenty patria do znalostnej bázy asistenta pre zamestnancov?",
      "Which documents belong in an employee assistant's knowledge base?",
    ),
    options: [
      t("Aktuálne, schválené a relevantné dokumenty; staré verzie odstránené", "Current, approved and relevant documents, with old versions removed"),
      t("Všetko, čo firma kedy vytvorila, vrátane starých verzií", "Everything the company ever produced, including old versions"),
      t("Iba názvy dokumentov", "Only document titles"),
      t("Náhodný výber, aby to bolo rýchlejšie", "A random selection to make it faster"),
    ],
    correct: [0],
    explanation: t(
      "Zastarané alebo protichodné dokumenty vedú k nesprávnym odpovediam. Kvalita a aktuálnosť zdrojov je dôležitejšia ako ich množstvo.",
      "Outdated or conflicting documents lead to wrong answers. Source quality and freshness matter more than volume.",
    ),
  },
  {
    id: "kn-04", kind: "choice", domain: D,
    concept: t("Dôverné údaje v znalostiach", "Confidential data in knowledge"),
    question: t(
      "Kolega chce do zdieľaného projektu nahrať súbor s platmi všetkých zamestnancov. Ako postupovať?",
      "A colleague wants to upload a file with every employee's salary to a shared project. What should happen?",
    ),
    options: [
      t("Nenahrávať ho bez súhlasu podľa firemných pravidiel a prístupových práv", "Do not upload it without approval under company policy and access rights"),
      t("Nahrať, AI to aj tak nikomu nepovie", "Upload it – the AI won't tell anyone"),
      t("Nahrať a premenovať súbor", "Upload it and rename the file"),
      t("Nahrať iba polovicu súboru", "Upload half of the file"),
    ],
    correct: [0],
    explanation: t(
      "Obsah projektu môžu vidieť všetci jeho členovia a asistent ho môže použiť v odpovediach. Citlivé údaje patria len tam, kde to pravidlá výslovne dovoľujú.",
      "All project members can see its content and the assistant may use it in answers. Sensitive data belongs only where policy explicitly allows it.",
    ),
  },
  {
    id: "kn-05", kind: "choice", domain: D,
    concept: t("Správa dlhých konverzácií", "Managing long conversations"),
    question: t(
      "Konverzácia je veľmi dlhá a AI začína zabúdať skoršie dohody. Čo pomôže?",
      "A conversation is very long and the AI starts forgetting earlier agreements. What helps?",
    ),
    options: [
      t("Nechať AI zhrnúť dôležité rozhodnutia a pokračovať v novej konverzácii so zhrnutím", "Have the AI summarise key decisions and continue in a new conversation with that summary"),
      t("Písať rýchlejšie", "Type faster"),
      t("Opakovať tú istú otázku", "Repeat the same question"),
      t("Prepnúť jazyk rozhrania", "Switch the interface language"),
    ],
    correct: [0],
    explanation: t(
      "Dlhá história zaberá context window a dôležité informácie sa v nej strácajú. Stručné zhrnutie v novej konverzácii udrží podstatné veci v popredí.",
      "Long history fills the context window and key information gets lost. A concise summary in a fresh conversation keeps what matters in focus.",
    ),
  },
  {
    id: "kn-06", kind: "choice", domain: D,
    concept: t("RAG – vyhľadávanie v znalostiach", "RAG – retrieval-augmented generation"),
    question: t("Čo je princípom RAG (retrieval-augmented generation)?", "What is the idea behind RAG (retrieval-augmented generation)?"),
    options: [
      t("Pred odpoveďou sa vyhľadajú relevantné úryvky z dokumentov a pošlú sa modelu ako kontext", "Before answering, relevant passages are retrieved from documents and given to the model as context"),
      t("Model sa pri každej otázke nanovo trénuje", "The model is retrained for every question"),
      t("Odpovede sa generujú náhodne", "Answers are generated randomly"),
      t("Model si sám stiahne celý internet", "The model downloads the whole internet"),
    ],
    correct: [0],
    explanation: t(
      "RAG spája vyhľadávanie a generovanie: model dostane len relevantné časti veľkej znalostnej bázy a odpovedá na ich základe, ideálne s odkazom na zdroj.",
      "RAG combines search and generation: the model receives only the relevant parts of a large knowledge base and answers from them, ideally citing the source.",
    ),
  },
  {
    id: "kn-p1", kind: "prompt", domain: D,
    concept: t("Pokyny pre asistenta", "Writing assistant instructions"),
    goal: t(
      "Napíš vlastné pokyny pre interného HR asistenta, ktorý odpovedá zamestnancom na otázky o dovolenke a benefitoch podľa priložených smerníc.",
      "Write custom instructions for an internal HR assistant that answers employees' questions about leave and benefits based on the attached policies.",
    ),
    brokenPrompt: t("Si HR asistent. Odpovedaj na otázky.", "You are an HR assistant. Answer questions."),
    rubric: [
      { id: "role", label: t("Rola a účel", "Role and purpose"), description: t("Komu asistent pomáha a s čím.", "Whom the assistant helps and with what."), weight: 1, hints: ["zamestnanc", "employee", "dovolenk", "leave", "benefit", "účel", "purpose"] },
      { id: "sources", label: t("Zdroje znalostí", "Knowledge sources"), description: t("Odpovedať len zo schválených smerníc, ideálne s odkazom.", "Answer only from approved policies, ideally with a reference."), weight: 2, hints: ["smernic", "policy", "policies", "dokument", "document", "iba", "only", "výlučne", "cit", "odkaz", "reference"] },
      { id: "unknown", label: t("Keď odpoveď chýba", "When the answer is missing"), description: t("Čo robiť, ak odpoveď v zdrojoch nie je (priznať, presmerovať na HR).", "What to do when the sources lack the answer (admit it, refer to HR)."), weight: 2, hints: ["neviem", "nevieš", "don't know", "not sure", "nie je v", "not in", "presmeruj", "refer", "kontakt", "contact", "hr oddel", "hr team", "eskal", "escalat"] },
      { id: "style", label: t("Tón a formát", "Tone and format"), description: t("Určený tón a podoba odpovedí.", "Tone and answer format are specified."), weight: 1, hints: ["tón", "tone", "stručn", "concise", "priateľ", "friendly", "zdvoril", "polite", "bod", "bullet", "krátk", "short"] },
    ],
    sample: t(
      "Si interný HR asistent pre zamestnancov firmy. Odpovedáš na otázky o dovolenke a benefitoch výlučne podľa priložených smerníc a pri každej odpovedi uvedieš názov smernice a článok. Ak odpoveď v smerniciach nie je, povedz to a odporuč kontaktovať HR oddelenie (hr@firma.sk). Píš stručne, priateľsky a v bodoch.",
      "You are an internal HR assistant for the company's employees. You answer questions about leave and benefits strictly from the attached policies and cite the policy name and section in every answer. If the policies don't contain the answer, say so and suggest contacting the HR team (hr@company.com). Be concise, friendly and use bullet points.",
    ),
  },
  {
    id: "kn-07", kind: "choice", domain: D, examOnly: true,
    concept: t("Model Context Protocol (MCP)", "Model Context Protocol (MCP)"),
    question: t("Čo je Model Context Protocol (MCP)?", "What is the Model Context Protocol (MCP)?"),
    options: [
      t("Otvorený štandard na prepojenie AI aplikácií s externými nástrojmi a zdrojmi dát", "An open standard for connecting AI applications to external tools and data sources"),
      t("Spôsob kompresie promptov", "A way to compress prompts"),
      t("Certifikácia pre správcov modelov", "A certification for model administrators"),
      t("Formát obrázkov pre AI", "An image format for AI"),
    ],
    correct: [0],
    explanation: t(
      "MCP definuje jednotný spôsob, ako môže AI aplikácia (napr. Claude) pristupovať k nástrojom a dátam – databázam, súborom či firemným systémom.",
      "MCP defines a common way for an AI application (such as Claude) to access tools and data – databases, files or business systems.",
    ),
  },
  {
    id: "kn-08", kind: "choice", domain: D, examOnly: true,
    concept: t("Aktualizácia znalostí", "Keeping knowledge current"),
    question: t(
      "Firma zmenila cestovnú smernicu. Čo treba urobiť so znalostnou bázou AI asistenta?",
      "The company changed its travel policy. What should happen to the AI assistant's knowledge base?",
    ),
    options: [
      t("Nahradiť starú verziu novou a overiť odpovede asistenta na typické otázky", "Replace the old version with the new one and check the assistant's answers to typical questions"),
      t("Pridať novú verziu a starú tam nechať", "Add the new version and keep the old one"),
      t("Nič, asistent si zmenu zistí sám", "Nothing – the assistant will find out by itself"),
      t("Vymazať celú znalostnú bázu", "Delete the whole knowledge base"),
    ],
    correct: [0],
    explanation: t(
      "Dve protichodné verzie zmätú model aj ľudí. Po zmene zdroja treba znalosti aktualizovať a odpovede znovu overiť.",
      "Two conflicting versions confuse both the model and people. After a source changes, update the knowledge and re-check the answers.",
    ),
  },
];

export const chapter: Chapter = {
  id: "ch4",
  domain: D,
  title: t("Konfigurácia a správa znalostí", "Configuration and knowledge"),
  lessons: [
    {
      id: "ch4-l1",
      title: t("Projekty, pokyny a znalosti", "Projects, instructions and knowledge"),
      minutes: 5,
      theory: [
        t(
          "Opakovaný kontext patrí do projektu: dokumenty ako znalosti a pravidlá ako vlastné pokyny. Kvalitná a aktuálna znalostná báza je základ dobrých odpovedí.",
          "Recurring context belongs in a Project: documents as knowledge and rules as custom instructions. A high-quality, current knowledge base is the foundation of good answers.",
        ),
      ],
      items: ["kn-01", "kn-02", "kn-03", "kn-04", "kn-p1"],
    },
    {
      id: "ch4-l2",
      title: t("Kontext, RAG a dlhé konverzácie", "Context, RAG and long conversations"),
      minutes: 3,
      theory: [
        t(
          "Keď sa znalosti nezmestia do kontextu, vyhľadávajú sa relevantné úryvky (RAG). Dlhé konverzácie zhrň a pokračuj v novej.",
          "When knowledge doesn't fit in the context, relevant passages are retrieved (RAG). Summarise long conversations and continue in a new one.",
        ),
      ],
      items: ["kn-05", "kn-06", "kn-03"],
    },
  ],
};
