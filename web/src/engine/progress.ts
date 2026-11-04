import { CHOICE_ITEMS, ITEM_BY_ID, bossId, trackChoiceItems } from "../content";
import type { DomainId, Lang, Track } from "../types";
import { type CardState, type Grade, currentRetrievability, review } from "./fsrs";

export type StudyMode = "beginner" | "advanced" | "certification";

export interface ExamResult {
  at: number;
  trackId: string;
  correct: number;
  total: number;
  byDomain: Record<DomainId, { correct: number; total: number }>;
  durationSec: number;
}

/** Per-ISO-week counters: feed weekly challenges and leagues. */
export type WeekCounters = Omit<WeekStats, "claimed">;

/**
 * Per-device counters (a grow-only counter CRDT). Each device only increments
 * its own entry, so merging two devices takes the per-entry maximum and sums
 * across devices without losing concurrent work.
 */
export interface DeviceLedger {
  xpByDay: Record<string, number>;
  weeks: Record<string, WeekCounters>;
}

let DEVICE = "local";
/** Identifies this installation in the ledger; set once at start-up. */
export function setDeviceId(id: string) {
  DEVICE = id;
}

export interface WeekStats {
  xp: number;
  lessons: number;
  practical: number;
  reviews: number;
  perfect: number;
  claimed: string[];
}

export interface Progress {
  version: 2;
  xp: number;
  xpByDay: Record<string, number>;
  streak: { count: number; best: number; lastDay: string | null };
  lessons: Record<string, { best: number; completedAt: number }>;
  cards: Record<string, CardState>;
  achievements: Record<string, number>;
  exams: ExamResult[];
  /** Concept (sk label) -> number of mistakes; feeds the AI tutor. */
  weakConcepts: Record<string, number>;
  weeks: Record<string, WeekStats>;
  ledger: Record<string, DeviceLedger>;
  lastStudyAt: number | null;
  /** Bumped on every change; used to resolve sync conflicts. */
  updatedAt: number;
  settings: { mode: StudyMode; dailyGoal: number; trackId: string };
}

export const XP = { correct: 10, lessonBonus: 20, bossBonus: 50, practicalMax: 20, examBonus: 100, challenge: 50 };

export function emptyProgress(): Progress {
  return {
    version: 2,
    xp: 0,
    xpByDay: {},
    streak: { count: 0, best: 0, lastDay: null },
    lessons: {},
    cards: {},
    achievements: {},
    exams: [],
    weakConcepts: {},
    weeks: {},
    ledger: {},
    lastStudyAt: null,
    updatedAt: 0,
    settings: { mode: "beginner", dailyGoal: 50, trackId: "associate" },
  };
}

/** Upgrades stored progress from older versions. */
export function migrate(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const version = (raw as { version?: unknown }).version;
  if (version !== 1 && version !== 2) return base;
  const p = raw as Partial<Progress> & { settings?: Record<string, unknown> };
  const settings = { ...base.settings, ...(p.settings ?? {}) } as Progress["settings"] & { certId?: string };
  if (settings.certId && !p.settings?.trackId) settings.trackId = settings.certId;
  delete settings.certId;
  return {
    ...base,
    ...p,
    version: 2,
    weeks: p.weeks ?? {},
    ledger: p.ledger ?? legacyLedger(p.xpByDay ?? {}, p.weeks ?? {}),
    updatedAt: p.updatedAt ?? 0,
    exams: (p.exams ?? []).map((e) => ({ ...e, trackId: e.trackId ?? "associate" })),
    settings,
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

// ------------------------------------------------------------------ dates

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** ISO-8601 week key of the local date, e.g. "2026-W45". */
export function weekKey(ts: number): string {
  const d = new Date(ts);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const emptyWeek = (): WeekStats => ({ xp: 0, lessons: 0, practical: 0, reviews: 0, perfect: 0, claimed: [] });

const COUNTERS = ["xp", "lessons", "practical", "reviews", "perfect"] as const;

function legacyLedger(xpByDay: Record<string, number>, weeks: Record<string, WeekStats>): Record<string, DeviceLedger> {
  if (!Object.keys(xpByDay).length && !Object.keys(weeks).length) return {};
  const w: Record<string, WeekCounters> = {};
  for (const [k, v] of Object.entries(weeks)) w[k] = { xp: v.xp, lessons: v.lessons, practical: v.practical, reviews: v.reviews, perfect: v.perfect };
  return { legacy: { xpByDay: { ...xpByDay }, weeks: w } };
}

/** Recomputes the summed views (xpByDay, weeks, xp) from the ledger. */
export function deriveTotals(p: Progress): Progress {
  const xpByDay: Record<string, number> = {};
  const weeks: Record<string, WeekStats> = {};
  for (const dev of Object.values(p.ledger)) {
    for (const [d, v] of Object.entries(dev.xpByDay)) xpByDay[d] = (xpByDay[d] ?? 0) + v;
    for (const [k, c] of Object.entries(dev.weeks)) {
      const w = (weeks[k] ??= { ...emptyWeek(), claimed: p.weeks[k]?.claimed ?? [] });
      for (const f of COUNTERS) w[f] += c[f];
    }
  }
  for (const [k, w] of Object.entries(p.weeks)) if (!weeks[k] && w.claimed.length) weeks[k] = { ...emptyWeek(), claimed: w.claimed };
  return { ...p, xpByDay, weeks, xp: Object.values(xpByDay).reduce((a, b) => a + b, 0) };
}

function bumpWeek(p: Progress, now: number, delta: Partial<WeekCounters>, xpToday = 0): Progress {
  const key = weekKey(now);
  const today = dayKey(now);
  const dev = p.ledger[DEVICE] ?? { xpByDay: {}, weeks: {} };
  const w = dev.weeks[key] ?? { xp: 0, lessons: 0, practical: 0, reviews: 0, perfect: 0 };
  const nextW = { ...w };
  for (const f of COUNTERS) nextW[f] += delta[f] ?? 0;
  const nextDev: DeviceLedger = {
    xpByDay: xpToday ? { ...dev.xpByDay, [today]: (dev.xpByDay[today] ?? 0) + xpToday } : dev.xpByDay,
    weeks: { ...dev.weeks, [key]: nextW },
  };
  return deriveTotals({ ...p, ledger: { ...p.ledger, [DEVICE]: nextDev } });
}

// ------------------------------------------------------------------ xp, levels, streak

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
  const next: Progress = { ...p, streak: { count, best, lastDay }, lastStudyAt: now, updatedAt: now };
  return bumpWeek(next, now, { xp: gain }, gain);
}

// ------------------------------------------------------------------ answers

export type SessionKind = "lesson" | "boss" | "review" | "lab";

export function recordAnswer(p: Progress, itemId: string, grade: Grade, now: number, kind: SessionKind = "lesson"): Progress {
  const card = review(p.cards[itemId], grade, now);
  let next: Progress = { ...p, cards: { ...p.cards, [itemId]: card }, updatedAt: now };
  if (grade === 1) {
    const concept = ITEM_BY_ID[itemId]?.concept.sk;
    if (concept) next.weakConcepts = { ...p.weakConcepts, [concept]: (p.weakConcepts[concept] ?? 0) + 1 };
  }
  const practical = ITEM_BY_ID[itemId]?.kind !== "choice";
  next = bumpWeek(next, now, { practical: practical ? 1 : 0, reviews: kind === "review" ? 1 : 0 });
  return next;
}

export function completeLesson(p: Progress, lessonId: string, score: number, now: number): Progress {
  const prev = p.lessons[lessonId];
  const next: Progress = {
    ...p,
    lessons: { ...p.lessons, [lessonId]: { best: Math.max(prev?.best ?? 0, score), completedAt: prev?.completedAt ?? now } },
    updatedAt: now,
  };
  return bumpWeek(next, now, { lessons: 1, perfect: score === 100 ? 1 : 0 });
}

// ------------------------------------------------------------------ path & unlocking

export function isLessonDone(p: Progress, lessonId: string): boolean {
  return lessonId in p.lessons;
}

export function isBossPassed(p: Progress, chapterId: string): boolean {
  return (p.lessons[bossId(chapterId)]?.best ?? 0) >= 80;
}

export function chapterUnlocked(p: Progress, track: Track, index: number): boolean {
  return index === 0 || isBossPassed(p, track.chapters[index - 1].id);
}

/** Lessons unlock in order; the boss fight unlocks after all lessons of the chapter. */
export function lessonUnlocked(p: Progress, track: Track, chapterIndex: number, lessonIndex: number): boolean {
  if (!chapterUnlocked(p, track, chapterIndex)) return false;
  return track.chapters[chapterIndex].lessons.slice(0, lessonIndex).every((l) => isLessonDone(p, l.id));
}

export function chapterProgress(p: Progress, track: Track, chapterIndex: number): number {
  const ch = track.chapters[chapterIndex];
  const steps = ch.lessons.length + 1;
  const done = ch.lessons.filter((l) => isLessonDone(p, l.id)).length + (isBossPassed(p, ch.id) ? 1 : 0);
  return Math.round((100 * done) / steps);
}

/** First unfinished step on the path, for the "continue" button. */
export function nextStep(p: Progress, track: Track): { chapterIndex: number; lessonIndex: number | "boss" } | null {
  for (let c = 0; c < track.chapters.length; c++) {
    if (!chapterUnlocked(p, track, c)) return null;
    const ch = track.chapters[c];
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

/** Exam readiness in percent, weighted by the track's domain weights. */
export function readiness(p: Progress, track: Track, now: number): number {
  const total = track.domains.reduce((a, d) => a + d.weight, 0);
  const score = track.domains.reduce((a, d) => a + d.weight * domainMastery(p, d.id, now), 0);
  return Math.round((100 * score) / total);
}

export interface DomainStat {
  domain: DomainId;
  successRate: number | null; // % of attempts answered correctly
  nextDue: number | null;
  seen: number;
  total: number;
}

export function domainStats(p: Progress, track: Track): DomainStat[] {
  return track.domains.map((d) => {
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

/** Items due for review across all tracks, most overdue first. Only multiple-choice items are reviewed. */
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

export function weakestDomain(track: Track, byDomain: Record<string, { correct: number; total: number }>): DomainId | null {
  let worst: DomainId | null = null;
  let worstRate = Infinity;
  for (const d of track.domains) {
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

/** The exam simulator unlocks once at least half of the track's lessons are complete. */
export function examUnlocked(p: Progress, track: Track): boolean {
  const all = track.chapters.flatMap((c) => c.lessons);
  return all.filter((l) => isLessonDone(p, l.id)).length >= Math.ceil(all.length / 2);
}

export function trackHasEnoughQuestions(track: Track): boolean {
  return trackChoiceItems(track).length >= track.exam.questions;
}

// ------------------------------------------------------------------ weekly challenges

export interface Challenge {
  id: string;
  icon: string;
  title: { sk: string; en: string };
  target: number;
  progress: (w: WeekStats, p: Progress, week: string) => number;
}

const studyDaysInWeek = (p: Progress, week: string) =>
  Object.keys(p.xpByDay).filter((d) => {
    const [y, m, dd] = d.split("-").map(Number);
    return p.xpByDay[d] > 0 && weekKey(new Date(y, m - 1, dd, 12).getTime()) === week;
  }).length;

export const CHALLENGE_POOL: Challenge[] = [
  { id: "xp300", icon: "💎", title: { sk: "Získaj 300 XP", en: "Earn 300 XP" }, target: 300, progress: (w) => w.xp },
  { id: "lessons5", icon: "📘", title: { sk: "Dokonči 5 lekcií", en: "Complete 5 lessons" }, target: 5, progress: (w) => w.lessons },
  { id: "practical3", icon: "🧪", title: { sk: "Vyrieš 3 praktické úlohy", en: "Solve 3 practical tasks" }, target: 3, progress: (w) => w.practical },
  { id: "reviews20", icon: "🔁", title: { sk: "Zopakuj 20 otázok", en: "Review 20 questions" }, target: 20, progress: (w) => w.reviews },
  { id: "perfect1", icon: "💯", title: { sk: "Dokonči lekciu bez chyby", en: "Finish a lesson with no mistakes" }, target: 1, progress: (w) => w.perfect },
  { id: "days5", icon: "📅", title: { sk: "Uč sa 5 rôznych dní", en: "Study on 5 different days" }, target: 5, progress: (_w, p, week) => studyDaysInWeek(p, week) },
];

/** Three challenges per week, chosen deterministically from the week key so everyone gets the same set. */
export function weeklyChallenges(week: string): Challenge[] {
  let h = 0;
  for (const ch of week) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pool = [...CHALLENGE_POOL];
  const out: Challenge[] = [];
  for (let i = 0; i < 3; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(pool.splice(h % pool.length, 1)[0]);
  }
  return out;
}

export function challengeStatus(p: Progress, now: number) {
  const week = weekKey(now);
  const w = p.weeks[week] ?? emptyWeek();
  return weeklyChallenges(week).map((c) => {
    const value = Math.min(c.target, c.progress(w, p, week));
    return { challenge: c, value, done: value >= c.target, claimed: w.claimed.includes(c.id) };
  });
}

export function claimChallenge(p: Progress, challengeId: string, now: number): Progress {
  const status = challengeStatus(p, now).find((s) => s.challenge.id === challengeId);
  if (!status || !status.done || status.claimed) return p;
  const key = weekKey(now);
  const w = p.weeks[key] ?? emptyWeek();
  const next = { ...p, weeks: { ...p.weeks, [key]: { ...w, claimed: [...w.claimed, challengeId] } } };
  return addXp(next, XP.challenge, now);
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
  { id: "boss", icon: "🐉", title: { sk: "Porazený boss", en: "Boss defeated" }, test: (p) => Object.keys(p.lessons).some((id) => id.endsWith("-boss") && p.lessons[id].best >= 80) },
  { id: "prompt-master", icon: "✍️", title: { sk: "Majster promptov (90+)", en: "Prompt master (90+)" }, test: (p) => (p.achievements["prompt-90"] ?? 0) > 0 },
  { id: "agent-builder", icon: "🤖", title: { sk: "Prvý funkčný agent", en: "First working agent" }, test: (p) => (p.achievements["agent-100"] ?? 0) > 0 },
  { id: "exam", icon: "📝", title: { sk: "Prvá simulácia skúšky", en: "First mock exam" }, test: (p) => p.exams.length > 0 },
  { id: "challenge", icon: "🏅", title: { sk: "Splnená týždenná výzva", en: "Weekly challenge done" }, test: (p) => Object.values(p.weeks).some((w) => w.claimed.length > 0) },
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
