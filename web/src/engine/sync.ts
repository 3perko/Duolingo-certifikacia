import { TRACKS } from "../content";
import type { CardState } from "./fsrs";
import { type Progress, type WeekStats, deriveTotals, levelFromXp, liveStreak, migrate, readiness, weekKey } from "./progress";

const maxRecord = (a: Record<string, number>, b: Record<string, number>) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};

/**
 * Merges progress from two devices without losing work: per-day XP, lessons,
 * reviews and badges are combined; for each question the most recent review wins.
 */
export function mergeProgress(aRaw: Progress, bRaw: Progress): Progress {
  const a = migrate(aRaw);
  const b = migrate(bRaw);
  const newer = a.updatedAt >= b.updatedAt ? a : b;

  // Grow-only counters: per device, per entry maximum.
  const ledger: Progress["ledger"] = { ...a.ledger };
  for (const [dev, l] of Object.entries(b.ledger)) {
    const x = ledger[dev];
    if (!x) {
      ledger[dev] = l;
      continue;
    }
    const weeks = { ...x.weeks };
    for (const [k, c] of Object.entries(l.weeks)) {
      const y = weeks[k];
      weeks[k] = y
        ? { xp: Math.max(y.xp, c.xp), lessons: Math.max(y.lessons, c.lessons), practical: Math.max(y.practical, c.practical), reviews: Math.max(y.reviews, c.reviews), perfect: Math.max(y.perfect, c.perfect) }
        : c;
    }
    ledger[dev] = { xpByDay: maxRecord(x.xpByDay, l.xpByDay), weeks };
  }

  const lessons: Progress["lessons"] = { ...a.lessons };
  for (const [id, l] of Object.entries(b.lessons)) {
    const x = lessons[id];
    lessons[id] = x ? { best: Math.max(x.best, l.best), completedAt: Math.min(x.completedAt, l.completedAt) } : l;
  }

  const cards: Record<string, CardState> = { ...a.cards };
  for (const [id, c] of Object.entries(b.cards)) if (!cards[id] || c.lastReview > cards[id].lastReview) cards[id] = c;

  const achievements = { ...a.achievements };
  for (const [id, ts] of Object.entries(b.achievements)) achievements[id] = achievements[id] ? Math.min(achievements[id], ts) : ts;

  const exams = [...a.exams];
  for (const e of b.exams) if (!exams.some((x) => x.at === e.at)) exams.push(e);
  exams.sort((x, y) => x.at - y.at);

  const claimed: Record<string, WeekStats> = {};
  for (const [k, w] of [...Object.entries(a.weeks), ...Object.entries(b.weeks)]) {
    const c = (claimed[k] ??= { xp: 0, lessons: 0, practical: 0, reviews: 0, perfect: 0, claimed: [] });
    c.claimed = [...new Set([...c.claimed, ...w.claimed])];
  }

  const streak =
    (a.streak.lastDay ?? "") > (b.streak.lastDay ?? "") || ((a.streak.lastDay ?? "") === (b.streak.lastDay ?? "") && a.streak.count >= b.streak.count)
      ? { ...a.streak, best: Math.max(a.streak.best, b.streak.best) }
      : { ...b.streak, best: Math.max(a.streak.best, b.streak.best) };

  return deriveTotals({
    version: 2,
    xp: 0,
    xpByDay: {},
    streak,
    lessons,
    cards,
    achievements,
    exams,
    weakConcepts: maxRecord(a.weakConcepts, b.weakConcepts),
    weeks: claimed,
    ledger,
    lastStudyAt: Math.max(a.lastStudyAt ?? 0, b.lastStudyAt ?? 0) || null,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
    settings: newer.settings,
  });
}

/** Small, non-sensitive summary stored next to the progress: leagues and team dashboards read it. */
export function buildSummary(p: Progress, now: number) {
  const week = weekKey(now);
  return {
    level: levelFromXp(p.xp).level,
    xp: p.xp,
    streak: liveStreak(p, now),
    lessons: Object.keys(p.lessons).length,
    readiness: Object.fromEntries(TRACKS.map((t) => [t.id, readiness(p, t, now)])),
    last_study_at: p.lastStudyAt,
    week,
    week_xp: p.weeks[week]?.xp ?? 0,
    track: p.settings.trackId,
  };
}
