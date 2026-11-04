import type { Lang, PromptItem } from "../types";

export type CriterionStatus = "met" | "partial" | "missing";

export interface GradeResult {
  score: number;
  criteria: { id: string; label: string; status: CriterionStatus; comment: string }[];
  tips: string[];
  improvedPrompt: string;
  source: "ai" | "offline";
}

const POINTS: Record<CriterionStatus, number> = { met: 1, partial: 0.5, missing: 0 };

export function weightedScore(item: PromptItem, statuses: Record<string, CriterionStatus>): number {
  const total = item.rubric.reduce((a, c) => a + c.weight, 0);
  const got = item.rubric.reduce((a, c) => a + c.weight * POINTS[statuses[c.id] ?? "missing"], 0);
  return Math.round((100 * got) / total);
}

const matches = (text: string, pattern: string) => {
  try {
    return new RegExp(pattern, "i").test(text);
  } catch {
    return text.toLowerCase().includes(pattern.toLowerCase());
  }
};

/**
 * Offline fallback used when the AI grader is unavailable: keyword heuristics
 * per rubric criterion. It is a rough estimate and the UI labels it as such.
 */
export function gradeOffline(item: PromptItem, prompt: string, lang: Lang): GradeResult {
  const text = prompt.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const tooShort = words < 6;

  const criteria = item.rubric.map((c) => {
    const hits = c.hints.filter((h) => matches(text, h)).length;
    let status: CriterionStatus;
    if (c.mode === "absent") status = tooShort ? "missing" : hits === 0 ? "met" : "missing";
    else status = hits >= 2 ? "met" : hits === 1 ? (tooShort ? "partial" : "met") : "missing";
    const comment =
      status === "met"
        ? lang === "sk" ? "Zdá sa, že je splnené." : "Looks addressed."
        : status === "partial"
          ? lang === "sk" ? "Naznačené, ale stručne." : "Hinted at, but thin."
          : c.description[lang];
    return { id: c.id, label: c.label[lang], status, comment };
  });

  const statuses = Object.fromEntries(criteria.map((c) => [c.id, c.status]));
  const tips = criteria.filter((c) => c.status !== "met").map((c) => item.rubric.find((r) => r.id === c.id)!.description[lang]).slice(0, 3);

  return { score: weightedScore(item, statuses), criteria, tips, improvedPrompt: item.sample[lang], source: "offline" };
}
