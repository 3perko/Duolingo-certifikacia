import type { ChoiceItem, L10n } from "../types";

export const t = (sk: string, en: string): L10n => ({ sk, en });

type Pair = [string, string];

/** Compact constructor for multiple-choice items: every text is a [sk, en] pair. */
export function mc(
  id: string,
  domain: string,
  concept: Pair,
  question: Pair,
  options: Pair[],
  correct: number | number[],
  explanation: Pair,
  extra: { examOnly?: boolean; artifact?: { title: Pair; body: Pair } } = {},
): ChoiceItem {
  return {
    id,
    kind: "choice",
    domain,
    concept: t(...concept),
    question: t(...question),
    options: options.map((o) => t(...o)),
    correct: Array.isArray(correct) ? correct : [correct],
    explanation: t(...explanation),
    examOnly: extra.examOnly,
    artifact: extra.artifact ? { title: t(...extra.artifact.title), body: t(...extra.artifact.body) } : undefined,
  };
}
