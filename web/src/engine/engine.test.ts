import { describe, expect, it } from "vitest";
import { ALL_CHAPTERS, CHOICE_ITEMS, ITEMS, ITEM_BY_ID, TRACKS, getTrack, trackChoiceItems } from "../content";
import type { AgentItem, PromptItem, SimulationItem } from "../types";
import { runAgentTests } from "./agent";
import { allocate, buildExam, isCorrect, scoreExam, seeded } from "./exam";
import { intervalDays, retrievability, review } from "./fsrs";
import {
  CHALLENGE_POOL,
  addXp,
  challengeStatus,
  claimChallenge,
  completeLesson as complete,
  migrate,
  weekKey,
  weeklyChallenges,
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
const ASSOC = getTrack("associate");
const T0 = new Date(2026, 10, 4, 9).getTime();

describe("content integrity", () => {
  it("has unique ids and every lesson references existing items", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const ch of ALL_CHAPTERS) for (const l of ch.lessons) for (const id of l.items) expect(ITEM_BY_ID[id], id).toBeDefined();
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
    const DOMAINS = ASSOC.domains;
    const available = Object.fromEntries(DOMAINS.map((d) => [d.id, CHOICE_ITEMS.filter((i) => i.domain === d.id).length])) as never;
    const counts = allocate(DOMAINS, 60, available);
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
    expect(chapterUnlocked(p, ASSOC, 1)).toBe(false);
    p = completeLesson(p, "ch1-boss", 75, T0);
    expect(chapterUnlocked(p, ASSOC, 1)).toBe(false);
    p = completeLesson(p, "ch1-boss", 88, T0);
    expect(chapterUnlocked(p, ASSOC, 1)).toBe(true);
  });

  it("readiness grows with correct answers and tracks weak concepts", () => {
    let p = emptyProgress();
    expect(readiness(p, ASSOC, T0)).toBe(0);
    for (const i of CHOICE_ITEMS.filter((x) => x.domain === "evaluation")) p = recordAnswer(p, i.id, 3, T0);
    expect(readiness(p, ASSOC, T0)).toBe(21);
    p = recordAnswer(p, "pe-02", 1, T0);
    expect(p.weakConcepts["Context window"]).toBe(1);
  });
});

describe("exam", () => {
  it("builds a reproducible 60-question exam and scores per domain", () => {
    const a = buildExam(ASSOC, 60, seeded(7));
    const b = buildExam(ASSOC, 60, seeded(7));
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
    expect(new Set(a.map((i) => i.id)).size).toBe(60);
    const answers = Object.fromEntries(a.map((i) => [i.id, i.domain === "evaluation" ? [] : i.correct]));
    const r = scoreExam(ASSOC, a, answers);
    expect(r.byDomain.evaluation).toEqual({ correct: 0, total: 13 });
    expect(r.correct).toBe(47);
    expect(weakestDomain(ASSOC, r.byDomain)).toBe("evaluation");
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

describe("tracks", () => {
  it("every track has enough questions for its mock exam and valid chapters", () => {
    for (const tr of TRACKS) {
      const pool = trackChoiceItems(tr);
      expect(pool.length, tr.id).toBeGreaterThanOrEqual(tr.exam.questions);
      const exam = buildExam(tr, tr.exam.questions, seeded(1));
      expect(exam.length, tr.id).toBe(tr.exam.questions);
      for (const ch of tr.chapters) expect(tr.domains.some((d) => d.id === ch.domain), ch.id).toBe(true);
      expect(tr.domains.reduce((a, d) => a + d.weight, 0), tr.id).toBe(100);
    }
  });

  it("lesson and chapter ids are unique across tracks", () => {
    const lessonIds = ALL_CHAPTERS.flatMap((c) => c.lessons.map((l) => l.id));
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const chapterIds = ALL_CHAPTERS.map((c) => c.id);
    expect(new Set(chapterIds).size).toBe(chapterIds.length);
  });

  it("migrates v1 progress (certId) to v2 (trackId)", () => {
    const p = migrate({ version: 1, xp: 120, settings: { mode: "advanced", dailyGoal: 30, certId: "associate" }, exams: [{ at: 1, correct: 1, total: 2, byDomain: {}, durationSec: 5 }] });
    expect(p.version).toBe(2);
    expect(p.xp).toBe(120);
    expect(p.settings).toEqual({ mode: "advanced", dailyGoal: 30, trackId: "associate" });
    expect(p.exams[0].trackId).toBe("associate");
    expect(migrate("garbage").xp).toBe(0);
  });
});

describe("AI Lab agents", () => {
  const agents = ITEMS.filter((i): i is AgentItem => i.kind === "agent");

  it("reference designs pass every test and reference only existing blocks/settings", () => {
    expect(agents.length).toBeGreaterThan(0);
    for (const a of agents) {
      for (const b of a.reference.blocks) expect(a.blocks.some((x) => x.id === b), `${a.id}:${b}`).toBe(true);
      for (const [k, v] of Object.entries(a.reference.settings)) expect(a.settings.find((s) => s.id === k)?.options.some((o) => o.id === v), `${a.id}:${k}`).toBe(true);
      expect(runAgentTests(a, a.reference).score, a.id).toBe(100);
    }
  });

  it("an unsafe design fails safety tests", () => {
    const a = ITEM_BY_ID["lab-agent-1"] as AgentItem;
    const r = runAgentTests(a, { blocks: [...a.reference.blocks, "email"], settings: { ...a.reference.settings, docTrust: "instructions" } });
    expect(r.byCategory.safety.passed).toBeLessThan(r.byCategory.safety.total);
    expect(r.byCategory.functionality.passed).toBe(r.byCategory.functionality.total);
    expect(r.score).toBeLessThan(100);
  });
});

describe("weekly challenges", () => {
  it("picks 3 distinct challenges deterministically per week", () => {
    const a = weeklyChallenges("2026-W45").map((c) => c.id);
    expect(a).toEqual(weeklyChallenges("2026-W45").map((c) => c.id));
    expect(new Set(a).size).toBe(3);
    for (const id of a) expect(CHALLENGE_POOL.some((c) => c.id === id)).toBe(true);
  });

  it("uses ISO weeks", () => {
    expect(weekKey(new Date(2026, 0, 1, 12).getTime())).toBe("2026-W01");
    expect(weekKey(new Date(2027, 0, 1, 12).getTime())).toBe("2026-W53");
    expect(weekKey(T0)).toBe("2026-W45");
  });

  it("tracks progress and pays out once", () => {
    let p = emptyProgress();
    for (let i = 0; i < 6; i++) {
      p = complete(p, `x${i}`, 100, T0);
      p = recordAnswer(p, "pe-p1", 3, T0, "lesson");
      p = recordAnswer(p, "pe-01", 3, T0, "review");
    }
    p = addXp(p, 300, T0);
    const status = challengeStatus(p, T0);
    const doable = status.filter((s) => s.challenge.id !== "days5" && s.challenge.id !== "reviews20");
    for (const s of doable) expect(s.done, s.challenge.id).toBe(true);
    const id = doable[0].challenge.id;
    const before = p.xp;
    p = claimChallenge(p, id, T0);
    expect(p.xp).toBe(before + 50);
    p = claimChallenge(p, id, T0);
    expect(p.xp).toBe(before + 50);
  });
});

describe("sync merge", () => {
  it("combines work from two devices without losing anything", async () => {
    const { mergeProgress, buildSummary } = await import("./sync");
    const { setDeviceId } = await import("./progress");
    setDeviceId("phone");
    let a = emptyProgress();
    a = addXp(a, 30, T0);
    a = complete(a, "ch1-l1", 80, T0);
    a = recordAnswer(a, "pe-01", 3, T0);
    setDeviceId("laptop");
    let b = emptyProgress();
    b = addXp(b, 50, T0 + DAY);
    b = complete(b, "ch1-l1", 100, T0 + DAY);
    b = complete(b, "ch1-l2", 60, T0 + DAY);
    b = recordAnswer(b, "pe-01", 1, T0 + DAY);
    b = { ...b, settings: { ...b.settings, trackId: "developer" } };
    setDeviceId("local");

    const m = mergeProgress(a, b);
    expect(m.xp).toBe(80);
    expect(m.lessons["ch1-l1"]).toEqual({ best: 100, completedAt: T0 });
    expect(m.lessons["ch1-l2"].best).toBe(60);
    expect(m.cards["pe-01"].lastReview).toBe(T0 + DAY); // most recent review wins
    expect(m.settings.trackId).toBe("developer"); // newer device's settings
    expect(mergeProgress(m, m)).toEqual(m); // idempotent
    expect(mergeProgress(b, a).xp).toBe(m.xp); // order-independent totals

    const s = buildSummary(m, T0 + DAY);
    expect(s.xp).toBe(80);
    expect(s.lessons).toBe(2);
    expect(s.week).toBe("2026-W45");
    expect(s.week_xp).toBe(80); // concurrent work on two devices in the same week is summed
    expect(m.weeks["2026-W45"].lessons).toBe(3);
    expect(Object.keys(s.readiness)).toEqual(TRACKS.map((tr) => tr.id));
  });
});
