import type { Lang, PromptItem } from "./types";
import { type GradeResult, gradeOffline } from "./engine/promptGrader";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().then((d) => d?.detail, () => null);
    throw new Error(typeof detail === "string" ? detail : `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface TutorAnswer {
  explanation: string;
  analogy: string | null;
  check_question: { question: string; options: string[]; correct_index: number; explanation: string };
}

export interface LearnerContext {
  level: number;
  completed_lessons: number;
  weak_concepts: string[];
  days_since_last_study: number | null;
}

export function askTutor(args: {
  concept: string;
  questionContext?: string;
  mode: "explain" | "simpler";
  lang: Lang;
  learner: LearnerContext;
}): Promise<TutorAnswer> {
  return post<TutorAnswer>("/api/tutor/explain", {
    concept: args.concept,
    question_context: args.questionContext,
    mode: args.mode,
    lang: args.lang,
    learner: args.learner,
  });
}

/** Grades with the AI grader; falls back to the offline heuristic if the API is unreachable. */
export async function gradePrompt(item: PromptItem, userPrompt: string, lang: Lang): Promise<{ result: GradeResult; error?: string }> {
  try {
    const r = await post<{ score: number; criteria: GradeResult["criteria"]; tips: string[]; improved_prompt: string }>("/api/grade/prompt", {
      goal: item.goal[lang],
      broken_prompt: item.brokenPrompt[lang],
      user_prompt: userPrompt,
      rubric: item.rubric.map((c) => ({ id: c.id, label: c.label[lang], description: c.description[lang], weight: c.weight })),
      lang,
    });
    return { result: { score: r.score, criteria: r.criteria, tips: r.tips, improvedPrompt: r.improved_prompt, source: "ai" } };
  } catch (e) {
    return { result: gradeOffline(item, userPrompt, lang), error: e instanceof Error ? e.message : String(e) };
  }
}
