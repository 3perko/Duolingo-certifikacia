import { CHAPTERS, CHOICE_ITEMS, ITEM_BY_ID, bossId } from "../content";
import { DOMAINS } from "../content/certifications";
import type { DomainId, Lang } from "../types";
import { type CardState, type Grade, currentRetrievability, review } from "./fsrs";

export type StudyMode = "beginner" | "advanced" | "certification";

export interface ExamResult {
  at: number;
  correct: number;
  total: number;
  byDomain: Record<DomainId, { correct: number; total: number }>;
  durationSec: number;
}

export interface Progress {
  version: 1;
  xp: number;
  xpByDay: Record<string, number>;
  streak: { count: number; best: number; lastDay: string | null };
  lessons: Record<string, { best: number; completedAt: number }>;
  cards: Record<string, CardState>;
  achievements: Record<string, number>;
  exams: ExamResult[];
  /** Concept (sk label) -> number of mistakes; feeds the AI tutor. */
  weakConcepts: Record<string, number>;
  lastStudyAt: number | null;
  settings: { mode: StudyMode; dailyGoal: number; certId: string };
}

export const XP = { correct: 10, lessonBonus: 20, bossBonus: 50, practicalMax: 20, examBonus: 100 };

export function emptyProgress(): Progress {
  return {
    version: 1,
    xp: 0,
    xpByDay: {},
    streak: { count: 0, best: 0, lastDay: null },
    lessons: {},
    cards: {},
    achievements: {},
    exams: [],
    weakConcepts: {},
    lastStudyAt: null,
    settings: { mode: "beginner", dailyGoal: 50, certId: "associate" },
  };
}

// ------------------------------------------------------------------ language

/** Section 8 of the proposal: three language modes. */
export function langs(mode: StudyMode): { explain: Lang; question: Lang } {
  switch (mode) {
    case "beginner":
      return { explain: "sk", question: "sk" };
    case "advanced":
      return { explain: "sk", question: "en" };
    case "certification":
      return { explain: "en", question: "en" };
  }
}

// ------------------------------------------------------------------ dates, xp, levels, streak

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Cumulative XP needed to reach `level` (level 1 = 0 XP). */
export const xpForLevel = (level: number) => 25 * level * (level - 1);

export function levelFromXp(xp: number): { level: number; into: number; span: number } {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const start = xpForLevel(level);
  return { level, into: xp - start, span: xpForLevel(level + 1) - start };
}

/** Streak as shown today: it is kept if the learner studied today or yesterday. */
export function liveStreak(p: Progress, now: number): number {
  if (!p.streak.lastDay) return 0;
  return daysBetween(p.streak.lastDay, dayKey(now)) <= 1 ? p.streak.count : 0;
}

/** Records study activity and XP (never negative – no penalties for mistakes). */
export function addXp(p: Progress, amount: number, now: number): Progress {
  const today = dayKey(now);
  let { count, best, lastDay } = p.streak;
  if (lastDay !== today) {
    count = lastDay && daysBetween(lastDay, today) === 1 ? count + 1 : 1;
    lastDay = today;
    best = Math.max(best, count);
  }
  const gain = Math.max(0, Math.round(amount));
  return {
    ...p,
    xp: p.xp + gain,
    xpByDay: { ...p.xpByDay, [today]: (p.xpByDay[today] ?? 0) + gain },
    streak: { count, best, lastDay },
    lastStudyAt: now,
  };
}

// ------------------------------------------------------------------ answers

export function recordAnswer(p: Progress, itemId: string, grade: Grade, now: number): Progress {
  const card = review(p.cards[itemId], grade, now);
  const next = { ...p, cards: { ...p.cards, [itemId]: card } };
  if (grade === 1) {
    const concept = ITEM_BY_ID[itemId]?.concept.sk;
    if (concept) next.weakConcepts = { ...p.weakConcepts, [concept]: (p.weakConcepts[concept] ?? 0) + 1 };
  }
  return next;
}

export function completeLesson(p: Progress, lessonId: string, score: number, now: number): Progress {
  const prev = p.lessons[lessonId];
  return {
    ...p,
    lessons: { ...p.lessons, [lessonId]: { best: Math.max(prev?.best ?? 0, score), completedAt: prev?.completedAt ?? now } },
  };
}

// ------------------------------------------------------------------ path & unlocking

export function isLessonDone(p: Progress, lessonId: string): boolean {
  return lessonId in p.lessons;
}

export function isBossPassed(p: Progress, chapterId: string): boolean {
  return (p.lessons[bossId(chapterId)]?.best ?? 0) >= 80;
}

export function chapterUnlocked(p: Progress, index: number): boolean {
  return index === 0 || isBossPassed(p, CHAPTERS[index - 1].id);
}

/** Lessons unlock in order; the boss fight unlocks after all lessons of the chapter. */
export function lessonUnlocked(p: Progress, chapterIndex: number, lessonIndex: number): boolean {
  if (!chapterUnlocked(p, chapterIndex)) return false;
  const lessons = CHAPTERS[chapterIndex].lessons;
  return lessons.slice(0, lessonIndex).every((l) => isLessonDone(p, l.id));
}

export function chapterProgress(p: Progress, chapterIndex: number): number {
  const ch = CHAPTERS[chapterIndex];
  const steps = ch.lessons.length + 1;
  const done = ch.lessons.filter((l) => isLessonDone(p, l.id)).length + (isBossPassed(p, ch.id) ? 1 : 0);
  return Math.round((100 * done) / steps);
}

/** First unfinished step on the path, for the "continue" button. */
export function nextStep(p: Progress): { chapterIndex: number; lessonIndex: number | "boss" } | null {
  for (let c = 0; c < CHAPTERS.length; c++) {
    if (!chapterUnlocked(p, c)) return null;
    const ch = CHAPTERS[c];
    const l = ch.lessons.findIndex((x) => !isLessonDone(p, x.id));
    if (l >= 0) return { chapterIndex: c, lessonIndex: l };
    if (!isBossPassed(p, ch.id)) return { chapterIndex: c, lessonIndex: "boss" };
  }
  return null;
}

// ------------------------------------------------------------------ readiness & review

/** Mastery of a domain, 0..1: mean recall probability of correctly answered questions. */
export function domainMastery(p: Progress, domain: DomainId, now: number): number {
  const items = CHOICE_ITEMS.filter((i) => i.domain === domain);
  if (!items.length) return 0;
  const sum = items.reduce((acc, i) => {
    const card = p.cards[i.id];
    return acc + (card && card.lastCorrect ? currentRetrievability(card, now) : 0);
  }, 0);
  return sum / items.length;
}

/** Exam readiness in percent, weighted by official domain weights. */
export function readiness(p: Progress, now: number): number {
  const total = DOMAINS.reduce((a, d) => a + d.weight, 0);
  const score = DOMAINS.reduce((a, d) => a + d.weight * domainMastery(p, d.id, now), 0);
  return Math.round((100 * score) / total);
}

export interface DomainStat {
  domain: DomainId;
  successRate: number | null; // % of attempts answered correctly
  nextDue: number | null;
  seen: number;
  total: number;
}

export function domainStats(p: Progress): DomainStat[] {
  return DOMAINS.map((d) => {
    const items = CHOICE_ITEMS.filter((i) => i.domain === d.id);
    const cards = items.map((i) => p.cards[i.id]).filter((c): c is CardState => !!c);
    const attempts = cards.reduce((a, c) => a + c.attempts, 0);
    const correct = cards.reduce((a, c) => a + c.correct, 0);
    return {
      domain: d.id,
      successRate: attempts ? Math.round((100 * correct) / attempts) : null,
      nextDue: cards.length ? Math.min(...cards.map((c) => c.due)) : null,
      seen: cards.length,
      total: items.length,
    };
  });
}

/** Items due for review, most overdue first. Only multiple-choice items are reviewed. */
export function dueItems(p: Progress, now: number, limit = 10): string[] {
  return Object.entries(p.cards)
    .filter(([id, c]) => c.due <= now && ITEM_BY_ID[id]?.kind === "choice")
    .sort((a, b) => a[1].due - b[1].due)
    .slice(0, limit)
    .map(([id]) => id);
}

/** Targeted practice for one domain: wrong and weak items first, then unseen ones. */
export function targetedItems(p: Progress, domain: DomainId, now: number, limit = 8): string[] {
  const items = CHOICE_ITEMS.filter((i) => i.domain === domain);
  const score = (id: string) => {
    const c = p.cards[id];
    if (!c) return 0.5;
    return c.lastCorrect ? currentRetrievability(c, now) : -1;
  };
  return items
    .map((i) => i.id)
    .sort((a, b) => score(a) - score(b))
    .slice(0, limit);
}

export function weakestDomain(byDomain: Record<string, { correct: number; total: number }>): DomainId | null {
  let worst: DomainId | null = null;
  let worstRate = Infinity;
  for (const d of DOMAINS) {
    const r = byDomain[d.id];
    if (!r || !r.total) continue;
    const rate = r.correct / r.total;
    if (rate < worstRate) {
      worstRate = rate;
      worst = d.id;
    }
  }
  return worst;
}

/** The exam simulator unlocks once at least half of the lessons are complete. */
export function examUnlocked(p: Progress): boolean {
  const all = CHAPTERS.flatMap((c) => c.lessons);
  return all.filter((l) => isLessonDone(p, l.id)).length >= Math.ceil(all.length / 2);
}

// ------------------------------------------------------------------ achievements

export interface Achievement {
  id: string;
  icon: string;
  title: { sk: string; en: string };
  test: (p: Progress) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-lesson", icon: "🎯", title: { sk: "Prvá lekcia", en: "First lesson" }, test: (p) => Object.keys(p.lessons).length >= 1 },
  { id: "streak-3", icon: "🔥", title: { sk: "3 dni v rade", en: "3-day streak" }, test: (p) => p.streak.best >= 3 },
  { id: "streak-7", icon: "🔥", title: { sk: "Týždeň v rade", en: "7-day streak" }, test: (p) => p.streak.best >= 7 },
  { id: "perfect", icon: "💯", title: { sk: "Bezchybná lekcia", en: "Perfect lesson" }, test: (p) => Object.values(p.lessons).some((l) => l.best === 100) },
  { id: "boss", icon: "🐉", title: { sk: "Porazený boss", en: "Boss defeated" }, test: (p) => CHAPTERS.some((c) => isBossPassed(p, c.id)) },
  { id: "prompt-master", icon: "✍️", title: { sk: "Majster promptov (90+)", en: "Prompt master (90+)" }, test: (p) => (p.achievements["prompt-90"] ?? 0) > 0 },
  { id: "exam", icon: "📝", title: { sk: "Prvá simulácia skúšky", en: "First mock exam" }, test: (p) => p.exams.length > 0 },
  { id: "xp-1000", icon: "💎", title: { sk: "1 000 XP", en: "1,000 XP" }, test: (p) => p.xp >= 1000 },
];

/** Unlocks newly earned achievements; returns the updated progress and the new ones. */
export function checkAchievements(p: Progress, now: number): { progress: Progress; unlocked: Achievement[] } {
  const unlocked = ACHIEVEMENTS.filter((a) => !p.achievements[a.id] && a.test(p));
  if (!unlocked.length) return { progress: p, unlocked };
  const achievements = { ...p.achievements };
  for (const a of unlocked) achievements[a.id] = now;
  return { progress: { ...p, achievements }, unlocked };
}
