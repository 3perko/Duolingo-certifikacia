import { describe, expect, it } from "vitest";
import { CHAPTERS, CHOICE_ITEMS, ITEMS, ITEM_BY_ID } from "../content";
import { DOMAINS } from "../content/certifications";
import type { PromptItem, SimulationItem } from "../types";
import { allocate, buildExam, isCorrect, scoreExam, seeded } from "./exam";
import { intervalDays, retrievability, review } from "./fsrs";
import {
  addXp,
  chapterUnlocked,
  completeLesson,
  emptyProgress,
  levelFromXp,
  liveStreak,
  readiness,
  recordAnswer,
  weakestDomain,
} from "./progress";
import { gradeOffline } from "./promptGrader";
import { simulate, simulationScore } from "./simulation";

const DAY = 86_400_000;
const T0 = new Date(2026, 10, 4, 9).getTime();

describe("content integrity", () => {
  it("has unique ids and every lesson references existing items", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const ch of CHAPTERS) for (const l of ch.lessons) for (const id of l.items) expect(ITEM_BY_ID[id], id).toBeDefined();
  });

  it("choice items have valid answers and both languages", () => {
    for (const i of CHOICE_ITEMS) {
      expect(i.correct.length, i.id).toBeGreaterThan(0);
      for (const c of i.correct) expect(c, i.id).toBeLessThan(i.options.length);
      for (const o of i.options) expect(o.sk && o.en, i.id).toBeTruthy();
      expect(i.question.sk && i.question.en && i.explanation.sk && i.explanation.en, i.id).toBeTruthy();
    }
  });

  it("has enough questions for a full 60-question mock exam weighted by domain", () => {
    const available = Object.fromEntries(DOMAINS.map((d) => [d.id, CHOICE_ITEMS.filter((i) => i.domain === d.id).length])) as never;
    const counts = allocate(60, available);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(60);
    expect(counts).toEqual({ evaluation: 13, workflow: 10, safety: 9, prompting: 8, models: 7, knowledge: 7, troubleshooting: 6 });
  });

  it("every simulation has a reachable best path that meets its targets", () => {
    for (const s of ITEMS.filter((i): i is SimulationItem => i.kind === "simulation")) {
      const best = s.steps.map((st) => st.options.findIndex((o) => o.best));
      expect(best.every((b) => b >= 0), s.id).toBe(true);
      expect(simulationScore(s, best), s.id).toBe(100);
    }
  });
});

describe("FSRS", () => {
  it("pushes correct answers out and brings mistakes back soon", () => {
    const good = review(undefined, 3, T0);
    const again = review(undefined, 1, T0);
    expect(good.due - T0).toBeGreaterThanOrEqual(DAY);
    expect(again.due - T0).toBeLessThan(DAY);
    const second = review(good, 3, good.due);
    expect(second.stability).toBeGreaterThan(good.stability);
    const lapse = review(second, 1, second.due);
    expect(lapse.stability).toBeLessThan(second.stability);
    expect(lapse.lapses).toBe(1);
  });

  it("interval equals stability at 90 % retention", () => {
    expect(intervalDays(10)).toBeCloseTo(10, 5);
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 5);
  });
});

describe("progress", () => {
  it("levels up and never subtracts XP", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(1850).level).toBe(9);
    const p = addXp(emptyProgress(), -50, T0);
    expect(p.xp).toBe(0);
  });

  it("counts consecutive days and resets after a gap", () => {
    let p = addXp(emptyProgress(), 10, T0);
    p = addXp(p, 10, T0 + DAY);
    p = addXp(p, 10, T0 + DAY + 1000);
    expect(p.streak.count).toBe(2);
    expect(liveStreak(p, T0 + 2 * DAY)).toBe(2);
    expect(liveStreak(p, T0 + 4 * DAY)).toBe(0);
    p = addXp(p, 10, T0 + 4 * DAY);
    expect(p.streak.count).toBe(1);
    expect(p.streak.best).toBe(2);
  });

  it("unlocks the next chapter only after the boss fight", () => {
    let p = emptyProgress();
    expect(chapterUnlocked(p, 1)).toBe(false);
    p = completeLesson(p, "ch1-boss", 75, T0);
    expect(chapterUnlocked(p, 1)).toBe(false);
    p = completeLesson(p, "ch1-boss", 88, T0);
    expect(chapterUnlocked(p, 1)).toBe(true);
  });

  it("readiness grows with correct answers and tracks weak concepts", () => {
    let p = emptyProgress();
    expect(readiness(p, T0)).toBe(0);
    for (const i of CHOICE_ITEMS.filter((x) => x.domain === "evaluation")) p = recordAnswer(p, i.id, 3, T0);
    expect(readiness(p, T0)).toBe(21);
    p = recordAnswer(p, "pe-02", 1, T0);
    expect(p.weakConcepts["Context window"]).toBe(1);
  });
});

describe("exam", () => {
  it("builds a reproducible 60-question exam and scores per domain", () => {
    const a = buildExam(60, seeded(7));
    const b = buildExam(60, seeded(7));
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
    expect(new Set(a.map((i) => i.id)).size).toBe(60);
    const answers = Object.fromEntries(a.map((i) => [i.id, i.domain === "evaluation" ? [] : i.correct]));
    const r = scoreExam(a, answers);
    expect(r.byDomain.evaluation).toEqual({ correct: 0, total: 13 });
    expect(r.correct).toBe(47);
    expect(weakestDomain(r.byDomain)).toBe("evaluation");
  });

  it("multi-select needs exactly the right set", () => {
    const item = CHOICE_ITEMS.find((i) => i.correct.length === 2)!;
    expect(isCorrect(item, item.correct)).toBe(true);
    expect(isCorrect(item, [item.correct[0]])).toBe(false);
    expect(isCorrect(item, [...item.correct, 99])).toBe(false);
  });
});

describe("practical tasks", () => {
  it("simulation outcome is deterministic", () => {
    const s = ITEM_BY_ID["wf-s1"] as SimulationItem;
    const best = s.steps.map((st) => st.options.findIndex((o) => o.best));
    expect(simulate(s, best)).toEqual({ accuracy: 94, latencySec: 2, costPerDay: 8, risk: 5 });
  });

  it("offline grader rewards a well-specified prompt", () => {
    const item = ITEM_BY_ID["pe-p1"] as PromptItem;
    expect(gradeOffline(item, item.brokenPrompt.sk, "sk").score).toBeLessThan(50);
    expect(gradeOffline(item, item.sample.sk, "sk").score).toBeGreaterThanOrEqual(90);
    expect(gradeOffline(item, item.sample.en, "en").score).toBeGreaterThanOrEqual(90);
  });

  it("offline grader flags personal data", () => {
    const item = ITEM_BY_ID["sa-p1"] as PromptItem;
    const broken = gradeOffline(item, item.brokenPrompt.sk, "sk");
    expect(broken.criteria.find((c) => c.id === "nopii")!.status).toBe("missing");
    const good = gradeOffline(item, item.sample.sk, "sk");
    expect(good.criteria.find((c) => c.id === "nopii")!.status).toBe("met");
    expect(good.score).toBeGreaterThanOrEqual(90);
  });
});
