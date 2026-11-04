import type { Chapter, ChoiceItem, ContentMeta, Item, Track } from "../types";
import * as architect from "./architect";
import * as ch1 from "./ch1-prompting";
import * as ch2 from "./ch2-evaluation";
import * as ch3 from "./ch3-models";
import * as ch4 from "./ch4-knowledge";
import * as ch5 from "./ch5-workflow";
import * as ch6 from "./ch6-safety";
import * as ch7 from "./ch7-troubleshooting";
import { DOMAINS } from "./certifications";
import * as developer from "./developer";
import * as fluency from "./fluency";
import { t } from "./helpers";
import * as lab from "./lab";

const associateModules = [ch1, ch2, ch3, ch4, ch5, ch6, ch7];

const OFFICIAL_ASSOCIATE: ContentMeta = {
  source: "Claude Certified Associate – Foundations: exam content outline",
  docVersion: "2026-10",
  reviewed: false,
};
const FLUENCY_META: ContentMeta = { source: "AI Fluency: Framework & Foundations (Anthropic course)", docVersion: "2026-10", reviewed: false };
const PRELIMINARY: ContentMeta = { source: "AI QUEST preliminary curriculum (no official outline)", docVersion: "2026-10", reviewed: false };

const withMeta = (items: Item[], meta: ContentMeta) => items.map((i) => ({ ...i, meta: i.meta ?? meta }));

/** Expert-approved questions from the content pipeline (section 11). */
const approvedModules = import.meta.glob<{ default: ChoiceItem[] }>("./approved/*.json", { eager: true });
const APPROVED: ChoiceItem[] = Object.values(approvedModules)
  .flatMap((m) => m.default)
  .filter((i) => i.kind === "choice" && i.meta?.reviewed === true);

export const ITEMS: Item[] = [
  ...withMeta(associateModules.flatMap((m) => m.items), OFFICIAL_ASSOCIATE),
  ...APPROVED,
  ...withMeta(fluency.items, FLUENCY_META),
  ...withMeta(developer.items, PRELIMINARY),
  ...withMeta(architect.items, PRELIMINARY),
  ...withMeta(lab.items, PRELIMINARY),
];

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const CHOICE_ITEMS = ITEMS.filter((i): i is ChoiceItem => i.kind === "choice");

const PRELIM_NOTE = t(
  "Predbežné osnovy AI QUEST – oficiálny obsah skúšky zatiaľ nie je verejne dostupný. Váhy oblastí nie sú oficiálne.",
  "Preliminary AI QUEST curriculum – the official exam outline is not publicly available yet. Domain weights are not official.",
);

export const TRACKS: Track[] = [
  {
    id: "associate",
    name: "Claude Certified Associate – Foundations",
    short: t("Associate", "Associate"),
    focus: t("Praktické používanie AI", "Practical use of AI"),
    official: true,
    domains: DOMAINS,
    chapters: associateModules.map((m) => m.chapter),
    exam: { minutes: 120, questions: 60, official: { passScaled: 720, scale: [100, 1000] } },
    freeChapters: 2,
  },
  {
    id: "ai-fluency",
    name: "AI Fluency",
    short: t("AI Fluency", "AI Fluency"),
    focus: t("Pre úplných začiatočníkov – príprava na kurz AI Fluency: Framework & Foundations", "For complete beginners – prep for the AI Fluency: Framework & Foundations course"),
    official: false,
    note: t(
      "Príprava na bezplatný kurz Anthropic. Oficiálny certifikát o absolvovaní získaš priamo na platforme Anthropic.",
      "Preparation for Anthropic's free course. The official certificate of completion is earned on Anthropic's platform.",
    ),
    domains: fluency.domains,
    chapters: fluency.chapters,
    exam: { minutes: 30, questions: 20 },
    freeChapters: fluency.chapters.length,
  },
  {
    id: "developer",
    name: "Claude Certified Developer – Foundations",
    short: t("Developer", "Developer"),
    focus: t("Vývoj AI aplikácií a agentov", "Building AI applications and agents"),
    official: false,
    preliminary: true,
    note: PRELIM_NOTE,
    domains: developer.domains,
    chapters: developer.chapters.map((c) => (c.id === "dv4" ? { ...c, lessons: [...c.lessons, lab.developerLabLesson] } : c)),
    exam: { minutes: 45, questions: 25 },
    freeChapters: 1,
  },
  {
    id: "architect",
    name: "Claude Certified Architect – Foundations",
    short: t("Architect", "Architect"),
    focus: t("Návrh AI riešení a agentických systémov", "Designing AI solutions and agentic systems"),
    official: false,
    preliminary: true,
    note: PRELIM_NOTE,
    domains: architect.domains,
    chapters: architect.chapters.map((c) => (c.id === "ar1" ? { ...c, lessons: [...c.lessons, lab.architectLabLesson] } : c)),
    exam: { minutes: 40, questions: 20 },
    freeChapters: 1,
  },
];

export const TRACK_BY_ID: Record<string, Track> = Object.fromEntries(TRACKS.map((tr) => [tr.id, tr]));

export const getTrack = (id: string): Track => TRACK_BY_ID[id] ?? TRACKS[0];

export const ALL_CHAPTERS: Chapter[] = TRACKS.flatMap((tr) => tr.chapters);

export function trackChoiceItems(track: Track): ChoiceItem[] {
  const ids = new Set(track.domains.map((d) => d.id));
  return CHOICE_ITEMS.filter((i) => ids.has(i.domain));
}

export function domainName(track: Track, domainId: string) {
  return track.domains.find((d) => d.id === domainId)?.name ?? t(domainId, domainId);
}

export const BOSS_SIZE = 8;
export const BOSS_PASS = 0.8;
export const bossId = (chapterId: string) => `${chapterId}-boss`;
