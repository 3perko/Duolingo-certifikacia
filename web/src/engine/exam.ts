import { BOSS_SIZE, CHOICE_ITEMS } from "../content";
import type { ChoiceItem, Domain, DomainId, Track } from "../types";

export type Rng = () => number;

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministic PRNG (mulberry32) so a mock exam can be reproduced from its seed. */
export function seeded(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Splits `total` questions across domains in proportion to their exam weights
 * (largest-remainder method), capped by how many questions each domain has.
 */
export function allocate(domains: Domain[], total: number, available: Record<DomainId, number>): Record<DomainId, number> {
  const weightSum = domains.reduce((a, d) => a + d.weight, 0);
  const raw = domains.map((d) => ({ id: d.id, exact: (total * d.weight) / weightSum }));
  const out = Object.fromEntries(raw.map((r) => [r.id, Math.min(Math.floor(r.exact), available[r.id])])) as Record<DomainId, number>;
  let left = total - Object.values(out).reduce((a, b) => a + b, 0);
  // Largest remainders first.
  for (const r of [...raw].sort((a, b) => (b.exact % 1) - (a.exact % 1))) {
    if (left > 0 && out[r.id] < available[r.id]) {
      out[r.id]++;
      left--;
    }
  }
  // If a domain ran short of questions, fill from the heaviest domains with spares.
  const byWeight = [...raw].sort((a, b) => b.exact - a.exact);
  while (left > 0) {
    const r = byWeight.find((x) => out[x.id] < available[x.id]);
    if (!r) break;
    out[r.id]++;
    left--;
  }
  return out;
}

/** Builds a mock exam weighted by the track's domain weights. */
export function buildExam(track: Track, total = track.exam.questions, rng: Rng = Math.random): ChoiceItem[] {
  const DOMAINS = track.domains;
  const available = Object.fromEntries(DOMAINS.map((d) => [d.id, CHOICE_ITEMS.filter((i) => i.domain === d.id).length])) as Record<DomainId, number>;
  const counts = allocate(DOMAINS, total, available);
  const picked = DOMAINS.flatMap((d) => shuffle(CHOICE_ITEMS.filter((i) => i.domain === d.id), rng).slice(0, counts[d.id]));
  return shuffle(picked, rng);
}

/** Boss fight: a random selection of the chapter's questions, including exam-only ones. */
export function buildBoss(track: Track, chapterId: string, rng: Rng = Math.random): ChoiceItem[] {
  const ch = track.chapters.find((c) => c.id === chapterId);
  if (!ch) return [];
  return shuffle(CHOICE_ITEMS.filter((i) => i.domain === ch.domain), rng).slice(0, BOSS_SIZE);
}

export function isCorrect(item: ChoiceItem, selected: number[]): boolean {
  if (selected.length !== item.correct.length) return false;
  const s = new Set(selected);
  return item.correct.every((c) => s.has(c));
}

export function scoreExam(track: Track, items: ChoiceItem[], answers: Record<string, number[]>) {
  const byDomain = Object.fromEntries(track.domains.map((d) => [d.id, { correct: 0, total: 0 }])) as Record<DomainId, { correct: number; total: number }>;
  let correct = 0;
  for (const item of items) {
    const ok = isCorrect(item, answers[item.id] ?? []);
    byDomain[item.domain].total++;
    if (ok) {
      byDomain[item.domain].correct++;
      correct++;
    }
  }
  return { correct, total: items.length, byDomain };
}

/**
 * Our own readiness band. It deliberately does NOT map to the official scaled
 * score (100–1000, pass 720): we cannot know how Anthropic scales answers.
 */
export function readinessBand(percent: number): "not-ready" | "close" | "ready" {
  if (percent < 60) return "not-ready";
  if (percent < 80) return "close";
  return "ready";
}
