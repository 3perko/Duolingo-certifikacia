/**
 * Spaced repetition based on FSRS-4.5 (Free Spaced Repetition Scheduler) with
 * its published default parameters. Each exercise is a "card"; a correct answer
 * pushes its next review further out, a mistake brings it back soon.
 */

export type Grade = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface CardState {
  stability: number; // days until recall probability falls to 90 %
  difficulty: number; // 1 (easy) .. 10 (hard)
  lastReview: number; // epoch ms
  due: number; // epoch ms
  reps: number;
  lapses: number;
  lastCorrect: boolean;
  correct: number;
  attempts: number;
}

const W = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072,
  0.0793, 0.3246, 1.587, 0.2272, 2.8755,
];
const DECAY = -0.5;
const FACTOR = 19 / 81;
export const DESIRED_RETENTION = 0.9;
const DAY = 86_400_000;
const RELEARN_MS = 10 * 60_000;

const clampD = (d: number) => Math.min(10, Math.max(1, d));

/** Probability of recalling a card `elapsedDays` after its last review. */
export function retrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

export function intervalDays(stability: number, retention = DESIRED_RETENTION): number {
  return (stability / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
}

const initDifficulty = (g: Grade) => clampD(W[4] - (g - 3) * W[5]);

function nextDifficulty(d: number, g: Grade): number {
  const next = d - W[6] * (g - 3);
  return clampD(W[7] * initDifficulty(3) + (1 - W[7]) * next);
}

function stabilityAfterSuccess(d: number, s: number, r: number, g: Grade): number {
  const hard = g === 2 ? W[15] : 1;
  const easy = g === 4 ? W[16] : 1;
  return s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy + 1);
}

function stabilityAfterLapse(d: number, s: number, r: number): number {
  const next = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
  return Math.min(next, s);
}

/** Schedules the card after an answer graded `g` at time `now`. */
export function review(card: CardState | undefined, g: Grade, now: number): CardState {
  let stability: number;
  let difficulty: number;
  let lapses = card?.lapses ?? 0;

  if (!card) {
    stability = W[g - 1];
    difficulty = initDifficulty(g);
  } else {
    const r = retrievability((now - card.lastReview) / DAY, card.stability);
    difficulty = nextDifficulty(card.difficulty, g);
    if (g === 1) {
      stability = stabilityAfterLapse(card.difficulty, card.stability, r);
      lapses += 1;
    } else {
      stability = stabilityAfterSuccess(card.difficulty, card.stability, r, g);
    }
  }

  const due = g === 1 ? now + RELEARN_MS : now + Math.max(1, Math.round(intervalDays(stability))) * DAY;
  return {
    stability,
    difficulty,
    lastReview: now,
    due,
    reps: (card?.reps ?? 0) + 1,
    lapses,
    lastCorrect: g > 1,
    correct: (card?.correct ?? 0) + (g > 1 ? 1 : 0),
    attempts: (card?.attempts ?? 0) + 1,
  };
}

/** Maps a 0-100 score from practical tasks to an FSRS grade. */
export function gradeFromScore(score: number): Grade {
  if (score < 50) return 1;
  if (score < 75) return 2;
  if (score < 90) return 3;
  return 4;
}

export function currentRetrievability(card: CardState, now: number): number {
  return retrievability((now - card.lastReview) / DAY, card.stability);
}
