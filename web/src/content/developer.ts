import type { Chapter, Domain, Item } from "../types";
import { mc, t } from "./helpers";

/**
 * Claude Certified Developer – Foundations. Preliminary curriculum written by
 * us around core Claude API skills; replace domains and weights with the
 * official exam outline once it is available to the team.
 */

export const domains: Domain[] = [
  { id: "dev-api", name: t("Claude API – základy", "Claude API fundamentals"), weight: 20 },
  { id: "dev-tools", name: t("Nástroje a MCP", "Tool use and MCP"), weight: 20 },
  { id: "dev-rag", name: t("Práca so znalosťami (RAG)", "Knowledge and RAG"), weight: 20 },
  { id: "dev-agents", name: t("AI agenti", "AI agents"), weight: 20 },
  { id: "dev-ops", name: t("Prevádzka: náklady, chyby, výkon", "Operations: cost, errors, performance"), weight: 20 },
];

const A = "dev-api";
const T = "dev-tools";
const R = "dev-rag";
const G = "dev-agents";
const O = "dev-ops";

export const items: Item[] = [
  // ------------------------------------------------------------ API
  mc("dv-01", A, ["Bezstavové API", "Stateless API"],
    ["Ako si Messages API „pamätá“ predchádzajúce správy konverzácie?", "How does the Messages API “remember” earlier messages in a conversation?"],
    [["Nepamätá – aplikácia posiela celú relevantnú históriu v každej požiadavke", "It doesn't – the application sends the relevant history with every request"], ["Ukladá ich automaticky na serveri navždy", "It stores them on the server forever automatically"], ["Pamätá si len poslednú správu", "It remembers only the last message"], ["Podľa IP adresy", "By IP address"]], 0,
    ["Každá požiadavka je samostatná. Históriu správ (user/assistant) spravuje tvoja aplikácia.", "Every request stands alone. Your application manages the message history (user/assistant)."]),
  mc("dv-02", A, ["System prompt v API", "System prompt in the API"],
    ["Kam v požiadavke na Messages API patria trvalé pokyny o role a pravidlách?", "Where do standing instructions about role and rules go in a Messages API request?"],
    [["Do parametra system", "In the system parameter"], ["Do hlavičky HTTP", "In an HTTP header"], ["Do názvu modelu", "In the model name"], ["Do parametra max_tokens", "In max_tokens"]], 0,
    ["Parameter system nesie rámec pre celú konverzáciu; jednotlivé požiadavky idú v messages.", "The system parameter carries the frame for the whole conversation; individual requests go in messages."]),
  mc("dv-03", A, ["max_tokens", "max_tokens"],
    ["Odpoveď sa končí uprostred vety a stop_reason je \"max_tokens\". Čo to znamená?", "The answer stops mid-sentence and stop_reason is \"max_tokens\". What does it mean?"],
    [["Výstup narazil na nastavený limit tokenov – treba zvýšiť max_tokens alebo skrátiť požadovaný výstup", "The output hit the token limit – raise max_tokens or ask for shorter output"], ["Model odmietol odpovedať", "The model refused"], ["Vypršal API kľúč", "The API key expired"], ["Sieť zlyhala", "The network failed"]], 0,
    ["stop_reason vždy kontroluj – „max_tokens“ znamená orezaný výstup, „end_turn“ prirodzený koniec, „tool_use“ požiadavku na nástroj.", "Always check stop_reason – “max_tokens” means truncated output, “end_turn” a natural end, “tool_use” a tool request."]),
  mc("dv-04", A, ["Streaming", "Streaming"],
    ["Kedy sa oplatí streamovať odpoveď?", "When is streaming the response worthwhile?"],
    [["Pri dlhých odpovediach a v chatovom rozhraní, kde chce používateľ vidieť text priebežne", "For long answers and chat UIs where users want to see text as it arrives"], ["Nikdy, streaming je zastaraný", "Never – streaming is obsolete"], ["Iba pri obrázkoch", "Only for images"], ["Len pri chybách", "Only on errors"]], 0,
    ["Streaming skracuje čas do prvého zobrazeného textu a pri dlhých výstupoch predchádza vypršaniu HTTP spojenia.", "Streaming shortens time to first visible text and prevents HTTP timeouts on long outputs."]),
  mc("dv-05", A, ["Štruktúrované výstupy", "Structured outputs"],
    ["Ako zaručíš, že odpoveď modelu bude platný JSON podľa tvojej schémy?", "How do you guarantee the model's answer is valid JSON matching your schema?"],
    [["Použiješ štruktúrované výstupy s JSON schémou a výsledok aj tak zvaliduješ", "Use structured outputs with a JSON schema and still validate the result"], ["Napíšeš do promptu „vráť JSON prosím“ a ďalej nekontroluješ", "Write “return JSON please” and never check"], ["Použiješ regex na ľubovoľný text", "Use a regex on arbitrary text"], ["Nedá sa to", "It can't be done"]], 0,
    ["Štruktúrované výstupy obmedzia generovanie na schému; validácia v kóde je stále dobrá prax (napr. hodnoty mimo rozsahu).", "Structured outputs constrain generation to the schema; validating in code is still good practice (e.g. out-of-range values)."],
    { examOnly: true }),

  // ------------------------------------------------------------ Tools
  mc("dv-06", T, ["Tool use", "Tool use"],
    ["Ako prebieha volanie nástroja (tool use) v Messages API?", "How does a tool call work in the Messages API?"],
    [["Model vráti blok tool_use, tvoja aplikácia nástroj spustí a výsledok pošle späť ako tool_result", "The model returns a tool_use block, your app runs the tool and sends the result back as tool_result"], ["Model sám spustí kód na tvojom serveri", "The model runs code on your server itself"], ["Nástroje sa volajú cez e-mail", "Tools are called via e-mail"], ["Model iba popíše nástroj slovami", "The model only describes the tool in words"]], 0,
    ["Pri vlastných nástrojoch vykonávaš volanie ty – máš teda kontrolu nad tým, čo sa naozaj spustí.", "With your own tools you perform the call – so you control what actually runs."]),
  mc("dv-07", T, ["Popis nástroja", "Tool descriptions"],
    ["Čo najviac pomôže modelu správne použiť nástroj?", "What most helps the model use a tool correctly?"],
    [["Jasný názov, podrobný popis, kedy ho použiť, a presná schéma vstupov", "A clear name, a detailed description of when to use it and a precise input schema"], ["Čo najkratší popis", "The shortest possible description"], ["Náhodný názov", "A random name"], ["Žiadna schéma", "No schema"]], 0,
    ["Model sa rozhoduje podľa popisu. Popis je vlastne prompt – vysvetli účel, parametre a obmedzenia.", "The model decides based on the description. It is effectively a prompt – explain purpose, parameters and limits."]),
  mc("dv-08", T, ["Chyby nástrojov", "Tool errors"],
    ["Nástroj zlyhal (napr. databáza neodpovedá). Čo pošleš modelu?", "A tool failed (e.g. the database didn't respond). What do you send the model?"],
    [["tool_result s príznakom chyby a zrozumiteľnou správou", "A tool_result flagged as an error with a clear message"], ["Nič – volanie vynecháš", "Nothing – skip the call"], ["Vymyslené dáta", "Made-up data"], ["Prázdny reťazec bez vysvetlenia", "An empty string without explanation"]], 0,
    ["Model potom môže zareagovať – skúsiť iný postup alebo informovať používateľa – namiesto toho, aby hádal.", "The model can then react – try another approach or inform the user – instead of guessing."]),
  mc("dv-09", T, ["Model Context Protocol", "Model Context Protocol"],
    ["Čo môže MCP server sprístupniť AI aplikácii?", "What can an MCP server expose to an AI application?"],
    [["Nástroje, zdroje (dáta) a šablóny promptov", "Tools, resources (data) and prompt templates"], ["Iba obrázky", "Only images"], ["Nové váhy modelu", "New model weights"], ["Fakturačné údaje Anthropic", "Anthropic billing data"]], 0,
    ["MCP štandardizuje prepojenie aplikácií s externými systémami – jeden server môže slúžiť viacerým klientom.", "MCP standardises connecting applications to external systems – one server can serve many clients."]),
  mc("dv-10", T, ["Bezpečnosť nástrojov", "Tool safety"],
    ["Nástroj „delete_customer“ môže zmazať záznam zákazníka. Ako ho bezpečne sprístupniť agentovi?", "A “delete_customer” tool can delete a customer record. How do you expose it safely to an agent?"],
    [["Vyžadovať ľudské potvrdenie a overiť oprávnenia v kóde nástroja", "Require human confirmation and check permissions in the tool's code"], ["Spoľahnúť sa, že model ho nikdy nezavolá omylom", "Trust the model never to call it by mistake"], ["Skryť ho v popise", "Hide it in the description"], ["Povoliť ho bez obmedzení", "Allow it without limits"]], 0,
    ["Nezvratné akcie chráň mimo modelu: potvrdenie, oprávnenia, audit. Prompt nie je bezpečnostná hranica.", "Protect irreversible actions outside the model: confirmation, permissions, audit. A prompt is not a security boundary."],
    { examOnly: true }),

  // ------------------------------------------------------------ RAG
  mc("dv-11", R, ["RAG pipeline", "RAG pipeline"],
    ["Ktoré poradie krokov zodpovedá typickému RAG?", "Which order of steps matches a typical RAG pipeline?"],
    [["Rozdeliť dokumenty → indexovať → vyhľadať relevantné časti → vložiť do promptu → generovať odpoveď so zdrojmi", "Chunk documents → index → retrieve relevant chunks → put them in the prompt → generate an answer with sources"], ["Generovať → vyhľadať → zmazať", "Generate → retrieve → delete"], ["Pretrénovať model pri každej otázke", "Retrain the model for each question"], ["Poslať všetky dokumenty vždy celé", "Always send every document in full"]], 0,
    ["RAG dodá modelu len relevantný kontext, čím šetrí tokeny a znižuje halucinácie.", "RAG gives the model only relevant context, saving tokens and reducing hallucinations."]),
  mc("dv-12", R, ["Delenie na časti", "Chunking"],
    ["Prečo záleží na tom, ako dokumenty rozdelíš na časti (chunks)?", "Why does it matter how you split documents into chunks?"],
    [["Príliš malé časti strácajú kontext, príliš veľké zahlcujú prompt nepodstatným textom", "Chunks too small lose context; too large ones flood the prompt with irrelevant text"], ["Nezáleží na tom", "It doesn't matter"], ["Kvôli farbe textu", "Because of text colour"], ["Model číta iba prvé slovo časti", "The model reads only the first word"]], 0,
    ["Dobré delenie rešpektuje štruktúru dokumentu (sekcie, odseky) a často pridáva metadáta, napr. názov a sekciu.", "Good chunking respects document structure (sections, paragraphs) and often adds metadata such as title and section."]),
  mc("dv-13", R, ["Odpoveď mimo zdrojov", "Answers outside sources"],
    ["Vyhľadávanie nenašlo nič relevantné. Ako sa má RAG asistent zachovať?", "Retrieval found nothing relevant. How should a RAG assistant behave?"],
    [["Povedať, že odpoveď v dokumentoch nenašiel, a prípadne odporučiť ďalší krok", "Say it couldn't find the answer in the documents and suggest a next step"], ["Vymyslieť odpoveď", "Make up an answer"], ["Vrátiť náhodný dokument", "Return a random document"], ["Ticho zlyhať", "Fail silently"]], 0,
    ["Toto správanie treba výslovne uviesť v pokynoch a otestovať otázkami, na ktoré dokumenty odpoveď nemajú.", "State this behaviour explicitly in the instructions and test it with questions the documents can't answer."]),
  mc("dv-14", R, ["Citácie", "Citations"],
    ["Prečo má RAG asistent vracať aj zdroj odpovede?", "Why should a RAG assistant return the source of its answer?"],
    [["Používateľ si môže tvrdenie overiť a chyby sa ľahšie odhalia", "Users can verify claims and errors are easier to catch"], ["Kvôli SEO", "For SEO"], ["Zdroje zvyšujú cenu", "Sources raise the price"], ["Nie je to potrebné", "It's not needed"]], 0,
    ["Citácie budujú dôveru a umožňujú kontrolu. Claude API má na to aj vstavanú podporu citácií pri dokumentoch.", "Citations build trust and enable checking. The Claude API also has built-in citation support for documents."]),
  mc("dv-15", R, ["Hodnotenie RAG", "Evaluating RAG"],
    ["RAG asistent odpovedá zle. Ako zistíš, či je problém vo vyhľadávaní alebo v generovaní?", "A RAG assistant answers badly. How do you find out whether retrieval or generation is the problem?"],
    [["Hodnotiť zvlášť, či sa našli správne pasáže, a zvlášť, či odpoveď z nich verne vychádza", "Evaluate separately whether the right passages were retrieved and whether the answer faithfully uses them"], ["Vymeniť model", "Swap the model"], ["Zvýšiť max_tokens", "Raise max_tokens"], ["Nedá sa to zistiť", "It can't be determined"]], 0,
    ["Oddelené metriky (kvalita vyhľadania vs. vernosť odpovede) ukážu, ktorú časť pipeline treba opraviť.", "Separate metrics (retrieval quality vs. answer faithfulness) show which part of the pipeline to fix."],
    { examOnly: true }),

  // ------------------------------------------------------------ Agents
  mc("dv-16", G, ["Agentická slučka", "The agent loop"],
    ["Čo tvorí jadro AI agenta?", "What forms the core of an AI agent?"],
    [["Slučka: model sa rozhodne → zavolá nástroj → dostane výsledok → pokračuje, kým nie je úloha hotová", "A loop: the model decides → calls a tool → gets the result → continues until the task is done"], ["Jedna požiadavka bez nástrojov", "A single request without tools"], ["Databáza", "A database"], ["Grafické rozhranie", "A graphical interface"]], 0,
    ["Agent opakovane volá nástroje podľa priebežných výsledkov. Kód slučky musí mať limity (počet krokov, čas, rozpočet).", "An agent calls tools repeatedly based on intermediate results. The loop code needs limits (steps, time, budget)."]),
  mc("dv-17", G, ["Workflow vs. agent", "Workflow vs. agent"],
    ["Kedy stačí pevný workflow namiesto agenta?", "When is a fixed workflow enough instead of an agent?"],
    [["Keď sú kroky úlohy známe vopred a nemenia sa", "When the task's steps are known in advance and don't change"], ["Nikdy, agent je vždy lepší", "Never – an agent is always better"], ["Keď chceme vyššie náklady", "When we want higher costs"], ["Keď nemáme žiadne nástroje", "When we have no tools"]], 0,
    ["Začni najjednoduchším riešením. Agent sa oplatí pri otvorených úlohách, kde postup nevieš určiť vopred.", "Start with the simplest solution. An agent pays off for open-ended tasks whose steps can't be fixed in advance."]),
  mc("dv-18", G, ["Ochranné limity agenta", "Agent guardrails"],
    ["Agent sa zacyklil a opakovane volá ten istý nástroj. Čo malo zabrániť škodám?", "An agent got stuck calling the same tool repeatedly. What should have prevented damage?"],
    [["Limit počtu krokov a rozpočtu v slučke a monitorovanie", "A step and budget limit in the loop, plus monitoring"], ["Dlhší system prompt", "A longer system prompt"], ["Vyšší max_tokens", "A higher max_tokens"], ["Nič sa nedá robiť", "Nothing can be done"]], 0,
    ["Tvrdé limity v kóde sú poistka, ktorú nezávisí od správania modelu.", "Hard limits in code are a safeguard that doesn't depend on the model's behaviour."]),
  mc("dv-19", G, ["Testovanie agenta", "Testing an agent"],
    ["Ako overíš, že agent funguje spoľahlivo?", "How do you verify that an agent works reliably?"],
    [["Sadou testovacích scenárov vrátane hraničných a útočných prípadov, opakovane a s metrikami", "With a suite of test scenarios including edge and adversarial cases, run repeatedly with metrics"], ["Jedným úspešným pokusom", "With one successful run"], ["Opýtam sa agenta", "Ask the agent"], ["Netestujem, je to AI", "I don't test – it's AI"]], 0,
    ["Agent je nedeterministický a pracuje vo viacerých krokoch – potrebuje testy funkčnosti, bezpečnosti aj spoľahlivosti.", "Agents are non-deterministic and multi-step – they need tests for functionality, safety and reliability."]),
  mc("dv-20", G, ["Prompt injection v agentoch", "Prompt injection in agents"],
    ["Agent číta webové stránky a môže posielať e-maily. Aké je najväčšie riziko?", "An agent reads web pages and can send e-mails. What's the biggest risk?"],
    [["Pokyny ukryté na stránke ho zmanipulujú, aby poslal citlivé údaje", "Instructions hidden on a page manipulate it into sending sensitive data"], ["Stránky sa načítajú pomaly", "Pages load slowly"], ["E-maily budú príliš zdvorilé", "E-mails will be too polite"], ["Žiadne", "None"]], 0,
    ["Kombinácia nedôveryhodného vstupu a citlivých akcií je nebezpečná. Obmedz oprávnenia a citlivé kroky nechaj potvrdiť.", "Untrusted input combined with sensitive actions is dangerous. Limit permissions and require confirmation for sensitive steps."],
    { examOnly: true }),

  // ------------------------------------------------------------ Ops
  mc("dv-21", O, ["Rate limits", "Rate limits"],
    ["API vráti chybu 429. Ako ju správne ošetriť?", "The API returns a 429 error. How should it be handled?"],
    [["Počkať (podľa hlavičky retry-after) a opakovať s exponenciálnym odstupom", "Wait (per the retry-after header) and retry with exponential backoff"], ["Okamžite opakovať v nekonečnej slučke", "Retry immediately in an endless loop"], ["Zmeniť API kľúč", "Change the API key"], ["Ignorovať", "Ignore it"]], 0,
    ["429 znamená prekročený limit. Oficiálne SDK už niekoľko pokusov s odstupom robia samé.", "429 means a rate limit was hit. The official SDKs already retry a few times with backoff."]),
  mc("dv-22", O, ["Prompt caching", "Prompt caching"],
    ["Každá požiadavka začína rovnakým dlhým system promptom a dokumentom. Čo zníži cenu aj latenciu?", "Every request starts with the same long system prompt and document. What lowers cost and latency?"],
    [["Prompt caching – nemenný začiatok promptu sa načíta z cache", "Prompt caching – the unchanging prompt prefix is read from cache"], ["Posielať prompt dvakrát", "Send the prompt twice"], ["Meniť poradie textu pri každej požiadavke", "Shuffle the text order every request"], ["Pridať aktuálny čas na začiatok promptu", "Put the current time at the start of the prompt"]], 0,
    ["Cache funguje na zhodu začiatku (prefixu). Premenlivé údaje, napr. čas, patria až za stabilnú časť.", "Caching matches on the prefix. Variable data such as timestamps belong after the stable part."]),
  mc("dv-23", O, ["Batch spracovanie", "Batch processing"],
    ["Potrebuješ spracovať 50 000 dokumentov do zajtra a nezáleží na okamžitej odpovedi. Čo použiješ?", "You need to process 50,000 documents by tomorrow and immediate answers don't matter. What do you use?"],
    [["Message Batches API – asynchrónne a lacnejšie", "The Message Batches API – asynchronous and cheaper"], ["50 000 paralelných streamov", "50,000 parallel streams"], ["Ručné kopírovanie", "Manual copy-paste"], ["Najpomalší model", "The slowest model"]], 0,
    ["Dávky sú určené na neurgentné hromadné spracovanie za zvýhodnenú cenu.", "Batches are for non-urgent bulk processing at a discounted price."]),
  mc("dv-24", O, ["Kontrola stop_reason", "Checking stop_reason"],
    ["Prečo má kód pred čítaním odpovede kontrolovať stop_reason?", "Why should code check stop_reason before reading a response?"],
    [["Odhalí orezaný výstup, odmietnutie alebo požiadavku na nástroj, ktoré treba ošetriť inak", "It reveals truncation, a refusal or a tool request that must be handled differently"], ["Kvôli rýchlosti", "For speed"], ["Je to povinné pole formulára", "It's a mandatory form field"], ["Nie je to potrebné", "It isn't needed"]], 0,
    ["Robustná integrácia ošetruje každý dôvod ukončenia, nielen šťastný scenár.", "A robust integration handles every stop reason, not just the happy path."]),
  mc("dv-25", O, ["Monitorovanie", "Monitoring"],
    ["Čo by si mal v produkcii sledovať pri AI funkcii?", "What should you monitor in production for an AI feature?"],
    [["Spotrebu tokenov a náklady, latenciu, chybovosť a kvalitu na vzorke výstupov", "Token usage and cost, latency, error rate and quality on a sample of outputs"], ["Iba počet používateľov", "Only the number of users"], ["Nič, AI sa monitoruje sama", "Nothing – AI monitors itself"], ["Iba farbu tlačidiel", "Only button colours"]], 0,
    ["Bez metrík nevieš, kedy sa kvalita či náklady zhoršili – napr. po zmene promptu či modelu.", "Without metrics you can't tell when quality or cost degrades – e.g. after a prompt or model change."],
    { examOnly: true }),
];

export const chapters: Chapter[] = [
  { id: "dv1", domain: A, title: t("Claude API – základy", "Claude API fundamentals"), lessons: [
    { id: "dv1-l1", title: t("Messages API, system prompt a stop_reason", "Messages API, system prompt and stop_reason"), minutes: 5,
      theory: [t("Messages API je bezstavové: aplikácia posiela model, system prompt, históriu správ a max_tokens. Odpoveď obsahuje bloky obsahu a stop_reason.", "The Messages API is stateless: the app sends the model, a system prompt, message history and max_tokens. The response holds content blocks and a stop_reason.")],
      items: ["dv-01", "dv-02", "dv-03", "dv-04"] },
  ] },
  { id: "dv2", domain: T, title: t("Nástroje a MCP", "Tool use and MCP"), lessons: [
    { id: "dv2-l1", title: t("Ako model volá nástroje", "How the model calls tools"), minutes: 5,
      theory: [t("Nástroj definuješ názvom, popisom a JSON schémou vstupov. Model vráti tool_use, ty nástroj vykonáš a vrátiš tool_result. MCP je štandard, ako nástroje a dáta sprístupniť viacerým aplikáciám.", "You define a tool with a name, description and JSON input schema. The model returns tool_use, you execute it and return tool_result. MCP is a standard for exposing tools and data to many applications.")],
      items: ["dv-06", "dv-07", "dv-08", "dv-09"] },
  ] },
  { id: "dv3", domain: R, title: t("Práca so znalosťami (RAG)", "Knowledge and RAG"), lessons: [
    { id: "dv3-l1", title: t("Vyhľadávanie, kontext a citácie", "Retrieval, context and citations"), minutes: 5,
      theory: [t("RAG nájde v dokumentoch relevantné pasáže a vloží ich do promptu. Asistent má odpovedať len z nich, citovať zdroj a priznať, keď odpoveď nenašiel.", "RAG finds relevant passages and puts them in the prompt. The assistant should answer only from them, cite the source and admit when it found nothing.")],
      items: ["dv-11", "dv-12", "dv-13", "dv-14"] },
  ] },
  { id: "dv4", domain: G, title: t("AI agenti", "AI agents"), lessons: [
    { id: "dv4-l1", title: t("Agentická slučka a ochranné limity", "The agent loop and guardrails"), minutes: 5,
      theory: [t("Agent = model + nástroje + slučka. Začni workflowom, agenta nasaď tam, kde postup nevieš určiť vopred, a vždy mu nastav tvrdé limity.", "Agent = model + tools + loop. Start with a workflow, use an agent where steps can't be fixed in advance, and always set hard limits.")],
      items: ["dv-16", "dv-17", "dv-18", "dv-19"] },
  ] },
  { id: "dv5", domain: O, title: t("Prevádzka", "Operations"), lessons: [
    { id: "dv5-l1", title: t("Náklady, chyby a výkon", "Cost, errors and performance"), minutes: 5,
      theory: [t("Ošetri rate limity a stop_reason, šetri cez prompt caching a dávky a sleduj náklady, latenciu aj kvalitu.", "Handle rate limits and stop_reason, save with prompt caching and batches, and monitor cost, latency and quality.")],
      items: ["dv-21", "dv-22", "dv-23", "dv-24"] },
  ] },
];
