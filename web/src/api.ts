import { request } from "./account";
import { type GradeResult, gradeOffline } from "./engine/promptGrader";
import type { ChoiceItem, Lang, PromptItem } from "./types";

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
  return request<TutorAnswer>("POST", "/api/tutor/explain", {
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
    const r = await request<{ score: number; criteria: GradeResult["criteria"]; tips: string[]; improved_prompt: string }>("POST", "/api/grade/prompt", {
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

/**
 * Section 6: a new scenario testing the same knowledge, so review is not just
 * memorising answers. The variant keeps the original id, so spaced repetition
 * keeps scheduling the underlying concept. Returns null when AI is unavailable.
 */
export async function generateVariant(item: ChoiceItem, lang: Lang): Promise<ChoiceItem | null> {
  try {
    const v = await request<{ question: string; options: string[]; correct: number[]; explanation: string }>("POST", "/api/questions/variant", {
      concept: item.concept[lang],
      question: item.question[lang],
      options: item.options.map((o) => o[lang]),
      correct: item.correct,
      explanation: item.explanation[lang],
      lang,
    });
    const l = (s: string) => ({ sk: s, en: s });
    return {
      ...item,
      artifact: undefined,
      question: l(v.question),
      options: v.options.map(l),
      correct: v.correct,
      explanation: l(v.explanation),
      meta: { source: `AI variant of ${item.id}`, docVersion: item.meta?.docVersion ?? "", reviewed: false },
    };
  } catch {
    return null;
  }
}
