import type { Chapter, Domain, Item } from "../types";
import { mc, t } from "./helpers";

/**
 * AI Fluency path for complete beginners. Structured around the 4D framework
 * (Delegation, Description, Discernment, Diligence) taught in Anthropic's free
 * course "AI Fluency: Framework & Foundations". It prepares for that course;
 * the official certificate of completion is earned on Anthropic's platform.
 */

export const domains: Domain[] = [
  { id: "fl-delegation", name: t("Delegovanie", "Delegation"), weight: 25 },
  { id: "fl-description", name: t("Opisovanie", "Description"), weight: 25 },
  { id: "fl-discernment", name: t("Rozlišovanie", "Discernment"), weight: 25 },
  { id: "fl-diligence", name: t("Dôslednosť", "Diligence"), weight: 25 },
];

const DE = "fl-delegation";
const DS = "fl-description";
const DI = "fl-discernment";
const DG = "fl-diligence";

export const items: Item[] = [
  // ------------------------------------------------------------ Delegation
  mc("fl-01", DE, ["AI fluency", "AI fluency"],
    ["Čo znamená byť „AI fluent“?", "What does it mean to be “AI fluent”?"],
    [
      ["Vedieť s AI efektívne, efektívne a zodpovedne spolupracovať – vrátane toho, kedy ju nepoužiť", "Being able to work with AI effectively, efficiently and responsibly – including knowing when not to use it"],
      ["Vedieť programovať neurónové siete", "Being able to program neural networks"],
      ["Poznať naspamäť všetky AI nástroje na trhu", "Knowing every AI tool on the market by heart"],
      ["Používať AI na všetko", "Using AI for everything"],
    ], 0,
    ["AI fluency nie je o technických znalostiach, ale o schopnosti spolupracovať s AI premyslene: vedieť, na čo sa hodí, ako ju viesť a ako posúdiť výsledok.", "AI fluency is not about technical skills but about collaborating with AI thoughtfully: knowing what it suits, how to guide it and how to judge the result."]),
  mc("fl-02", DE, ["Režimy spolupráce s AI", "Modes of working with AI"],
    ["Pri ktorom režime spolupráce AI samostatne vykoná celú vopred definovanú úlohu?", "In which mode of interaction does AI carry out an entire predefined task on its own?"],
    [["Automatizácia", "Automation"], ["Augmentácia", "Augmentation"], ["Ručná práca", "Manual work"], ["Žiadny", "None"]], 0,
    ["Rozlišujeme automatizáciu (AI vykoná zadanú úlohu), augmentáciu (človek a AI spolu premýšľajú a tvoria) a agentickosť (AI samostatne koná v mene človeka v rámci nastavených hraníc).", "We distinguish automation (AI performs a specified task), augmentation (human and AI think and create together) and agency (AI acts independently on someone's behalf within set boundaries)."]),
  mc("fl-03", DE, ["Augmentácia", "Augmentation"],
    ["Brainstorming nápadov na kampaň spolu s AI, keď ty vyberáš a rozvíjaš návrhy, je príklad…", "Brainstorming campaign ideas with AI while you pick and develop the suggestions is an example of…"],
    [["augmentácie", "augmentation"], ["plnej automatizácie", "full automation"], ["zákazu AI", "banning AI"], ["strojového učenia", "machine learning"]], 0,
    ["Pri augmentácii AI rozširuje tvoje myslenie a tvorivosť, ale ty zostávaš v procese a rozhoduješ.", "In augmentation, AI extends your thinking and creativity while you stay in the loop and decide."]),
  mc("fl-04", DE, ["Uvedomenie si problému", "Problem awareness"],
    ["Čo by si mal ujasniť ešte predtým, ako úlohu zveríš AI?", "What should you clarify before handing a task to AI?"],
    [
      ["Aký je cieľ, ako vyzerá dobrý výsledok a ktoré časti práce chceš nechať na sebe", "What the goal is, what a good result looks like and which parts of the work you want to keep"],
      ["Ktorá farba rozhrania je najkrajšia", "Which interface colour is nicest"],
      ["Nič – AI si to zistí", "Nothing – the AI will figure it out"],
      ["Koľko stojí počítač", "How much the computer costs"],
    ], 0,
    ["Delegovanie začína pochopením vlastnej úlohy. Bez jasného cieľa nevieš AI dobre zadať prácu ani posúdiť výsledok.", "Delegation starts with understanding your own task. Without a clear goal you can neither brief the AI well nor judge the result."]),
  mc("fl-05", DE, ["Poznanie platformy", "Platform awareness"],
    ["Prečo je dobré poznať možnosti a obmedzenia konkrétneho AI nástroja?", "Why is it good to know the capabilities and limits of a specific AI tool?"],
    [
      ["Aby si mu zveril úlohy, ktoré zvláda, a vedel, kde môže zlyhať (napr. aktuálne údaje, výpočty)", "So you give it tasks it handles well and know where it may fail (e.g. current data, calculations)"],
      ["Nie je to dôležité, všetky nástroje sú rovnaké", "It doesn't matter – all tools are the same"],
      ["Aby si ho mohol obísť", "So you can bypass it"],
      ["Iba kvôli cene", "Only because of price"],
    ], 0,
    ["Nástroje sa líšia – niektoré vedia vyhľadávať na webe, pracovať so súbormi alebo spúšťať kód, iné nie. Dobré delegovanie s tým počíta.", "Tools differ – some can search the web, work with files or run code, others can't. Good delegation takes that into account."]),
  mc("fl-06", DE, ["Kedy AI nepoužiť", "When not to use AI"],
    ["V ktorej situácii je najrozumnejšie AI vôbec nepoužiť?", "In which situation is it wisest not to use AI at all?"],
    [
      ["Keď ide o osobné ospravedlnenie blízkemu človeku, kde záleží na tvojich vlastných slovách", "A personal apology to someone close, where your own words matter"],
      ["Pri návrhu osnovy prezentácie", "Drafting a presentation outline"],
      ["Pri preformulovaní technického textu jednoduchšie", "Rephrasing a technical text more simply"],
      ["Pri hľadaní synoným", "Finding synonyms"],
    ], 0, ["Niektoré úlohy majú hodnotu práve v tom, že ich robíš sám. AI fluency zahŕňa aj rozhodnutie AI nepoužiť.", "Some tasks are valuable precisely because you do them yourself. AI fluency includes deciding not to use AI."],
    { examOnly: true }),

  // ------------------------------------------------------------ Description
  mc("fl-07", DS, ["Opis produktu", "Product description"],
    ["Čo patrí do „opisu produktu“ pri zadaní pre AI?", "What belongs in a “product description” when briefing AI?"],
    [
      ["Aký výstup chceš: formát, rozsah, publikum, štýl", "What output you want: format, length, audience, style"],
      ["Cena licencie", "The licence price"],
      ["Tvoje heslo", "Your password"],
      ["Názov modelu", "The model's name"],
    ], 0,
    ["Opis produktu hovorí, ČO má vzniknúť. Čím konkrétnejší, tým menej musí AI hádať.", "The product description says WHAT should be produced. The more concrete it is, the less the AI has to guess."]),
  mc("fl-08", DS, ["Opis procesu", "Process description"],
    ["Čo je „opis procesu“?", "What is a “process description”?"],
    [
      ["Ako má AI k úlohe pristupovať – kroky, postup, na čo sa zamerať", "How the AI should approach the task – steps, method, what to focus on"],
      ["Popis toho, ako funguje procesor", "A description of how the processor works"],
      ["Zoznam chýb AI", "A list of AI mistakes"],
      ["Čas odoslania správy", "When the message was sent"],
    ], 0,
    ["Napríklad: „najprv zhrň argumenty oboch strán, potom ich porovnaj a nakoniec odporuč riešenie“.", "For example: “first summarise both sides' arguments, then compare them, and finally recommend a solution”."]),
  mc("fl-09", DS, ["Opis správania", "Performance description"],
    ["Pokyn „Buď kritický, upozorni ma na slabé miesta v mojom pláne a nezdvorilosti si nevšímaj“ je príklad…", "The instruction “Be critical, point out weaknesses in my plan and don't worry about politeness” is an example of…"],
    [["opisu správania AI počas spolupráce", "describing the AI's behaviour during the collaboration"], ["opisu produktu", "a product description"], ["automatizácie", "automation"], ["chyby v prompte", "a prompt error"]], 0,
    ["Opis správania určuje, ako sa má AI v interakcii správať – napr. kriticky, stručne, ako tútor, ktorý sa pýta otázky.", "A performance description sets how the AI should behave in the interaction – e.g. critical, brief, like a tutor who asks questions."]),
  mc("fl-10", DS, ["Príklady v zadaní", "Examples in a brief"],
    ["Ako najjednoduchšie ukážeš AI štýl, aký chceš?", "What is the simplest way to show the AI the style you want?"],
    [["Pridáš ukážku textu v požadovanom štýle", "Add a sample text in the desired style"], ["Napíšeš „píš pekne“", "Write “write nicely”"], ["Zopakuješ otázku", "Repeat the question"], ["Nijako", "You can't"]], 0,
    ["Príklad je často jasnejší než opis. Model z neho odvodí tón, dĺžku aj štruktúru.", "An example is often clearer than a description. The model infers tone, length and structure from it."]),
  mc("fl-11", DS, ["Iterácia", "Iteration"],
    ["Prvá odpoveď AI nie je presne to, čo si chcel. Čo je najlepší ďalší krok?", "The AI's first answer isn't quite what you wanted. What's the best next step?"],
    [["Spresniť, čo konkrétne zmeniť, a pokračovať v dialógu", "Say specifically what to change and continue the dialogue"], ["Vzdať to", "Give up"], ["Napísať rovnaký prompt znova", "Send the same prompt again"], ["Začať nadávať", "Start insulting it"]], 0,
    ["Spolupráca s AI je iteratívna. Konkrétna spätná väzba („kratšie, pridaj príklad z praxe“) rýchlo zlepší výsledok.", "Working with AI is iterative. Specific feedback (“shorter, add a real-world example”) quickly improves the result."]),
  {
    id: "fl-p1", kind: "prompt", domain: DS,
    concept: t("Dobré zadanie pre AI", "A good AI brief"),
    goal: t("Chceš pomoc s prípravou na pracovný pohovor na pozíciu účtovníka.", "You want help preparing for a job interview for an accountant position."),
    brokenPrompt: t("Pomôž mi s pohovorom.", "Help me with an interview."),
    rubric: [
      { id: "product", label: t("Opis výstupu", "Product"), description: t("Čo presne má vzniknúť (napr. 10 otázok s ukážkovými odpoveďami).", "What exactly should be produced (e.g. 10 questions with sample answers)."), weight: 2, hints: ["otáz", "question", "odpove", "answer", "zoznam", "list", "\\d+"] },
      { id: "context", label: t("Kontext", "Context"), description: t("Pozícia, tvoje skúsenosti, typ firmy.", "The role, your experience, the kind of company."), weight: 2, hints: ["účtovn", "account", "pozíci", "position", "role", "skúsenos", "experience", "rok", "year", "firm", "company"] },
      { id: "process", label: t("Postup alebo správanie", "Process or behaviour"), description: t("Ako má AI postupovať (napr. simulovať pohovor, dávať spätnú väzbu).", "How the AI should work (e.g. simulate the interview, give feedback)."), weight: 1, hints: ["simul", "spätn", "feedback", "postup", "step", "krok", "ako personalist", "as an interviewer", "jednu po jednej", "one at a time"] },
    ],
    sample: t(
      "Pripravujem sa na pohovor na pozíciu samostatného účtovníka v strednej výrobnej firme. Mám 3 roky praxe v podvojnom účtovníctve. Simuluj pohovor: polož mi 8 otázok jednu po jednej a po každej mojej odpovedi daj stručnú spätnú väzbu.",
      "I'm preparing for an interview for a senior accountant role at a mid-sized manufacturing company. I have 3 years of double-entry bookkeeping experience. Simulate the interview: ask me 8 questions one at a time and give brief feedback after each of my answers.",
    ),
  },
  mc("fl-12", DS, ["Rola pre AI", "Giving the AI a role"],
    ["Na čo slúži pokyn typu „Správaj sa ako skúsený editor“?", "What is an instruction like “Act as an experienced editor” for?"],
    [["Nastaví perspektívu a štandard, z ktorého má AI pristupovať k úlohe", "It sets the perspective and standard from which the AI approaches the task"], ["Zmení model na iný", "It switches to a different model"], ["Nemá žiadny účinok", "It has no effect"], ["Odomkne platené funkcie", "It unlocks paid features"]], 0,
    ["Rola je súčasťou opisu – pomáha modelu zvoliť vhodnú úroveň detailu, terminológiu a kritériá kvality.", "A role is part of the description – it helps the model choose the right level of detail, terminology and quality bar."],
    { examOnly: true }),

  // ------------------------------------------------------------ Discernment
  mc("fl-13", DI, ["Posúdenie výstupu", "Product discernment"],
    ["Čo znamená posúdiť „produkt“ – výstup AI?", "What does judging the “product” – the AI's output – mean?"],
    [["Overiť, či je správny, úplný, vhodný pre publikum a použiteľný", "Checking that it's accurate, complete, suited to the audience and usable"], ["Spočítať slová", "Counting the words"], ["Pozrieť, či má pekné formátovanie", "Checking whether it's nicely formatted"], ["Nič, AI výstup je vždy hotový", "Nothing – AI output is always final"]], 0,
    ["Rozlišovanie je kritické hodnotenie: fakty, logika, vhodnosť. Formátovanie o kvalite obsahu nič nehovorí.", "Discernment is critical evaluation: facts, logic, fitness for purpose. Formatting says nothing about content quality."]),
  mc("fl-14", DI, ["Posúdenie postupu", "Process discernment"],
    ["AI ti dala správny záver, ale jej zdôvodnenie obsahuje logický skok. Čo s tým?", "The AI gave a correct conclusion but its reasoning contains a logical leap. What do you do?"],
    [["Nespolieham sa na záver, kým neoverím postup – správny výsledok mohol byť náhoda", "Don't rely on the conclusion until the reasoning is checked – the right result may be luck"], ["Nevadí, výsledok je správny", "Doesn't matter, the result is right"], ["Odstránim zdôvodnenie", "Delete the reasoning"], ["Požiadam o dlhší text", "Ask for a longer text"]], 0,
    ["Posudzuj nielen výsledok, ale aj cestu k nemu. Chybný postup znamená, že pri inom vstupe môže výsledok zlyhať.", "Judge not only the result but the path to it. Faulty reasoning means it can fail on a different input."]),
  mc("fl-15", DI, ["Posúdenie správania", "Performance discernment"],
    ["Požiadal si AI, aby bola kritická, no ona len chváli tvoj plán. Čo je správna reakcia?", "You asked the AI to be critical, but it only praises your plan. What is the right response?"],
    [["Všimnúť si, že sa nesprávala podľa zadania, a výslovne si vyžiadať slabé miesta", "Notice it didn't behave as asked and explicitly request the weaknesses"], ["Tešiť sa, plán je určite dokonalý", "Be happy – the plan must be perfect"], ["Prestať používať AI", "Stop using AI"], ["Zmeniť jazyk", "Switch language"]], 0,
    ["Rozlišovanie zahŕňa aj to, ako sa AI v spolupráci správa – či plní dohodnutú rolu a nie je len zhovievavá.", "Discernment also covers how the AI behaves in the collaboration – whether it plays the agreed role rather than simply agreeing."]),
  mc("fl-16", DI, ["Sebavedomý tón", "Confident tone"],
    ["Prečo nemožno usudzovať o správnosti odpovede podľa toho, aká sebavedomá znie?", "Why can't you judge an answer's accuracy by how confident it sounds?"],
    [["Model píše plynulo a isto aj vtedy, keď sa mýli", "Models write fluently and confidently even when they're wrong"], ["Sebavedomé odpovede sú vždy nesprávne", "Confident answers are always wrong"], ["AI nikdy neznie sebavedomo", "AI never sounds confident"], ["Je to len otázka štýlu písma", "It's only about the font"]], 0,
    ["Tón a správnosť spolu nesúvisia. Dôležité tvrdenia over v nezávislom zdroji.", "Tone and accuracy are unrelated. Verify important claims in an independent source."]),
  mc("fl-17", DI, ["Rozpoznanie halucinácie", "Spotting a hallucination"],
    ["Čo je na tejto odpovedi podozrivé?", "What is suspicious about this answer?"],
    [["Presná citácia a stránka z knihy, ktorú si si nemohol overiť", "An exact quote and page number from a book you couldn't verify"], ["Je napísaná po slovensky", "It is written in Slovak"], ["Má tri odseky", "It has three paragraphs"], ["Nič", "Nothing"]], 0,
    ["Presné citácie, čísla strán a dátumy, ktoré AI uvádza bez prístupu k zdroju, sú typickým miestom halucinácií.", "Exact quotes, page numbers and dates given without access to the source are a typical place for hallucinations."],
    { artifact: { title: ["Odpoveď AI", "AI answer"], body: ["Ako píše autor na strane 147 svojej knihy z roku 2019: „Produktivita bez oddychu je ilúzia.“ Tento citát je dnes základom moderného manažmentu.", "As the author writes on page 147 of their 2019 book: “Productivity without rest is an illusion.” This quote is now the basis of modern management."] } }),
  mc("fl-18", DI, ["Kritické hodnotenie argumentov", "Weighing arguments"],
    ["AI ti predloží iba argumenty pre jedno riešenie. Ako postupuješ?", "The AI gives you only arguments for one option. What do you do?"],
    [["Vyžiadam si aj protiargumenty a riziká a porovnám ich", "Ask for counter-arguments and risks too and compare"], ["Rozhodnem sa podľa nej", "Decide based on it"], ["Ignorujem celú odpoveď", "Ignore the whole answer"], ["Opýtam sa, či je si istá", "Ask whether it's sure"]], 0,
    ["Jednostranný pohľad je signál na doplnenie. Dobré rozhodnutie potrebuje vyvážený obraz.", "A one-sided view is a cue to fill in the gaps. Good decisions need a balanced picture."],
    { examOnly: true }),

  // ------------------------------------------------------------ Diligence
  mc("fl-19", DG, ["Zodpovednosť za výstup", "Accountability"],
    ["Kto zodpovedá za text, ktorý si s pomocou AI napísal a odoslal klientovi?", "Who is responsible for a text you wrote with AI and sent to a client?"],
    [["Ty", "You"], ["AI", "The AI"], ["Výrobca AI", "The AI vendor"], ["Nikto", "Nobody"]], 0,
    ["Dôslednosť znamená prevziať zodpovednosť: čo s pomocou AI vytvoríš a použiješ, je tvoja práca.", "Diligence means taking responsibility: what you create and use with AI is your work."]),
  mc("fl-20", DG, ["Transparentnosť", "Transparency"],
    ["Učiteľ povolil AI pri písaní eseje s podmienkou, že to študenti uvedú. Čo je dôsledné?", "A teacher allows AI for essays as long as students disclose it. What is diligent?"],
    [["Uviesť, ako a na čo si AI použil", "State how and for what you used AI"], ["Neuviesť nič, nikto to nespozná", "Say nothing – nobody will notice"], ["Uviesť, že si AI nepoužil", "Say you didn't use AI"], ["Prepísať text, aby nebolo poznať AI", "Rewrite it so AI is undetectable"]], 0,
    ["Transparentnosť buduje dôveru. Kde to pravidlá alebo očakávania vyžadujú, priznaj podiel AI.", "Transparency builds trust. Where rules or expectations require it, disclose AI's part."]),
  mc("fl-21", DG, ["Dôslednosť pri tvorbe", "Creation diligence"],
    ["Ktorý návyk patrí k dôslednej práci s AI?", "Which habit belongs to diligent work with AI?"],
    [["Premyslieť si, aké údaje AI zdieľam a či môžem", "Think about what data I share with AI and whether I'm allowed to"], ["Vkladať do AI všetko, čo mám", "Paste everything I have into AI"], ["Nečítať výstup", "Not reading the output"], ["Používať čo najviac nástrojov naraz", "Using as many tools as possible at once"]], 0,
    ["Dôslednosť začína už pri tvorbe: výber vhodného nástroja, ochrana údajov a vedomé rozhodovanie, čo AI zveriť.", "Diligence starts at creation: choosing an appropriate tool, protecting data and consciously deciding what to entrust to AI."]),
  mc("fl-22", DG, ["Dôslednosť pri nasadení", "Deployment diligence"],
    ["Pred zverejnením textu vytvoreného s AI by si mal…", "Before publishing a text created with AI you should…"],
    [["overiť fakty a uistiť sa, že ho môžeš s čistým svedomím podpísať", "verify the facts and make sure you can stand behind it"], ["ho len rýchlo prebehnúť", "just skim it"], ["ho publikovať bez úprav", "publish it unchanged"], ["pridať náhodné emoji", "add random emojis"]], 0,
    ["Pri nasadení – zverejnení či odoslaní – preberáš zodpovednosť za dopad textu na ostatných.", "When deploying – publishing or sending – you take responsibility for the text's impact on others."]),
  mc("fl-23", DG, ["Etika a hranice", "Ethics and boundaries"],
    ["Ktoré použitie AI je v rozpore s dôslednosťou?", "Which use of AI goes against diligence?"],
    [["Vydávať AI výstup za vlastnú odbornú expertízu v oblasti, ktorej nerozumieš, bez kontroly", "Presenting AI output as your own expert advice in a field you don't understand, without checking"], ["Nechať AI navrhnúť osnovu, ktorú upravíš", "Letting AI draft an outline you then edit"], ["Overovať fakty z AI vo zdrojoch", "Verifying AI facts in sources"], ["Uviesť použitie AI", "Disclosing AI use"]], 0,
    ["Ak nevieš posúdiť správnosť, nemôžeš za výstup ručiť. Vtedy potrebuješ odborníka alebo dôkladné overenie.", "If you can't judge correctness, you can't vouch for the output. Then you need an expert or thorough verification."]),
  mc("fl-24", DG, ["4D rámec", "The 4D framework"],
    ["Ktoré štyri kompetencie tvoria rámec AI fluency (4D)?", "Which four competencies make up the AI fluency (4D) framework?"],
    [
      ["Delegovanie, opisovanie, rozlišovanie, dôslednosť", "Delegation, description, discernment, diligence"],
      ["Dáta, dizajn, dokumentácia, distribúcia", "Data, design, documentation, distribution"],
      ["Debugovanie, deployment, databázy, DevOps", "Debugging, deployment, databases, DevOps"],
      ["Diskusia, dohoda, dôvera, dialóg", "Discussion, deal, dependability, dialogue"],
    ], 0,
    ["Delegation – čo a ako zveriť AI; Description – ako jasne komunikovať; Discernment – ako posúdiť výsledok a správanie; Diligence – ako konať zodpovedne.", "Delegation – what and how to hand to AI; Description – how to communicate clearly; Discernment – how to judge results and behaviour; Diligence – how to act responsibly."],
    { examOnly: true }),
];

export const chapters: Chapter[] = [
  {
    id: "fl1", domain: DE, title: t("Delegovanie: čo zveriť AI", "Delegation: what to hand to AI"),
    lessons: [
      { id: "fl1-l1", title: t("Čo je AI fluency a režimy spolupráce", "AI fluency and modes of collaboration"), minutes: 4,
        theory: [
          t("AI fluency je schopnosť spolupracovať s AI efektívne, efektívne a zodpovedne. Stojí na štyroch kompetenciách – 4D: delegovanie, opisovanie, rozlišovanie a dôslednosť.", "AI fluency is the ability to work with AI effectively, efficiently and responsibly. It rests on four competencies – the 4Ds: delegation, description, discernment and diligence."),
          t("Spolupráca má tri režimy: automatizácia (AI vykoná zadanú úlohu), augmentácia (tvoríte spolu) a agentickosť (AI koná samostatne v nastavených hraniciach).", "Collaboration has three modes: automation (AI performs a set task), augmentation (you create together) and agency (AI acts independently within set boundaries)."),
        ],
        items: ["fl-01", "fl-02", "fl-03"] },
      { id: "fl1-l2", title: t("Ako rozhodnúť, čo delegovať", "Deciding what to delegate"), minutes: 3,
        theory: [t("Pred delegovaním si ujasni cieľ, poznaj silné a slabé stránky nástroja a rozhodni, ktoré časti práce si necháš.", "Before delegating, clarify the goal, know the tool's strengths and weaknesses and decide which parts of the work you keep.")],
        items: ["fl-04", "fl-05"] },
    ],
  },
  {
    id: "fl2", domain: DS, title: t("Opisovanie: ako zadať úlohu", "Description: how to brief AI"),
    lessons: [
      { id: "fl2-l1", title: t("Produkt, proces a správanie", "Product, process and performance"), minutes: 4,
        theory: [t("Dobrý opis má tri vrstvy: čo má vzniknúť (produkt), ako k tomu dospieť (proces) a ako sa má AI správať (správanie).", "A good description has three layers: what to produce (product), how to get there (process) and how the AI should behave (performance).")],
        items: ["fl-07", "fl-08", "fl-09"] },
      { id: "fl2-l2", title: t("Príklady, iterácia a praktické zadanie", "Examples, iteration and a practical brief"), minutes: 5,
        theory: [t("Ukážka je často lepšia ako opis a prvá odpoveď nemusí byť posledná – spresňuj v dialógu.", "An example often beats a description, and the first answer needn't be the last – refine in dialogue.")],
        items: ["fl-10", "fl-11", "fl-p1"] },
    ],
  },
  {
    id: "fl3", domain: DI, title: t("Rozlišovanie: ako posúdiť výsledok", "Discernment: judging the result"),
    lessons: [
      { id: "fl3-l1", title: t("Výstup, postup a správanie AI", "Output, reasoning and behaviour"), minutes: 4,
        theory: [t("Posudzuj tri veci: či je výstup správny a použiteľný, či je postup logický a či sa AI správala tak, ako si ju požiadal.", "Judge three things: whether the output is correct and usable, whether the reasoning holds and whether the AI behaved as you asked.")],
        items: ["fl-13", "fl-14", "fl-15", "fl-16", "fl-17"] },
    ],
  },
  {
    id: "fl4", domain: DG, title: t("Dôslednosť: zodpovedné používanie", "Diligence: using AI responsibly"),
    lessons: [
      { id: "fl4-l1", title: t("Tvorba, transparentnosť, nasadenie", "Creation, transparency, deployment"), minutes: 4,
        theory: [t("Za výsledok zodpovedáš ty: vyber vhodný nástroj, chráň údaje, buď transparentný a pred zverejnením výstup over.", "You are accountable for the result: pick an appropriate tool, protect data, be transparent and verify before publishing.")],
        items: ["fl-19", "fl-20", "fl-21", "fl-22", "fl-23"] },
    ],
  },
];
