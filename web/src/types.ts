/** A text in both supported languages. */
export interface L10n {
  sk: string;
  en: string;
}

export type Lang = "sk" | "en";

/** The seven scored domains of Claude Certified Associate. */
export type DomainId =
  | "evaluation"
  | "workflow"
  | "safety"
  | "prompting"
  | "models"
  | "knowledge"
  | "troubleshooting";

/**
 * Provenance of every content item (section 11 of the proposal): which official
 * source it was derived from, the version of that source, and whether a human
 * expert has approved it. Content in this repo is original and unreviewed.
 */
export interface ContentMeta {
  source: string;
  docVersion: string;
  reviewed: boolean;
}

interface ItemBase {
  id: string;
  domain: DomainId;
  /** The concept tested; used by the AI tutor and the weak-spot tracker. */
  concept: L10n;
  meta?: ContentMeta;
}

/** Task types 1 (pick the answer) and 3 (find the problem in an AI answer). */
export interface ChoiceItem extends ItemBase {
  kind: "choice";
  question: L10n;
  /** An AI output the learner must inspect (task type 3). */
  artifact?: { title: L10n; body: L10n };
  options: L10n[];
  /** Indices of correct options; more than one makes it multi-select. */
  correct: number[];
  explanation: L10n;
  /** Only used in boss fights and the exam simulator, never in regular lessons. */
  examOnly?: boolean;
}

export interface RubricCriterion {
  id: string;
  label: L10n;
  description: L10n;
  weight: number;
  /** Case-insensitive regular expressions used by the offline grader. */
  hints: string[];
  /** "present" (default): met when a hint matches. "absent": met when none does. */
  mode?: "present" | "absent";
}

/** Task type 2: rewrite a weak prompt. */
export interface PromptItem extends ItemBase {
  kind: "prompt";
  goal: L10n;
  brokenPrompt: L10n;
  rubric: RubricCriterion[];
  sample: L10n;
}

export interface SimMetrics {
  accuracy: number; // %
  latencySec: number;
  costPerDay: number; // USD
  risk: number; // 0-100, lower is better
}

export interface SimOption {
  label: L10n;
  effect: Partial<SimMetrics>;
  feedback: L10n;
  /** Marks the option an expert would pick; used for scoring. */
  best?: boolean;
}

export interface SimStep {
  question: L10n;
  options: SimOption[];
}

/** Task type 4: a deterministic scenario simulation. */
export interface SimulationItem extends ItemBase {
  kind: "simulation";
  scenario: L10n;
  base: SimMetrics;
  steps: SimStep[];
  targets: { minAccuracy: number; maxCostPerDay: number; maxRisk: number };
}

export type Item = ChoiceItem | PromptItem | SimulationItem;

export interface Lesson {
  id: string;
  title: L10n;
  minutes: number;
  /** Short theory cards shown before the exercises. */
  theory: L10n[];
  items: string[];
}

export interface Chapter {
  id: string;
  domain: DomainId;
  title: L10n;
  lessons: Lesson[];
}

export interface Domain {
  id: DomainId;
  name: L10n;
  /** Weight in the official exam, in percent. */
  weight: number;
}

export interface Certification {
  id: string;
  name: string;
  focus: L10n;
  priceUsd: number;
  available: boolean;
  exam?: { minutes: number; questions: number; passScaled: number; scale: [number, number] };
}
