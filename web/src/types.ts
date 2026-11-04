/** A text in both supported languages. */
export interface L10n {
  sk: string;
  en: string;
}

export type Lang = "sk" | "en";

/** Domain ids are unique across all tracks (e.g. "evaluation", "fl-delegation", "dev-tools"). */
export type DomainId = string;

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

/** Declarative test conditions over an agent design (block order + settings). */
export type AgentRule =
  | { has: string }
  | { before: [string, string] }
  | { setting: string; equals: string }
  | { not: AgentRule }
  | { all: AgentRule[] }
  | { any: AgentRule[] };

export type AgentTestCategory = "functionality" | "safety" | "reliability";

export interface AgentTest {
  id: string;
  category: AgentTestCategory;
  title: L10n;
  pass: AgentRule;
  passMessage: L10n;
  failMessage: L10n;
}

export interface AgentSetting {
  id: string;
  label: L10n;
  options: { id: string; label: L10n }[];
}

/** AI Lab mission (section 14): assemble an agent from blocks and run automated tests. */
export interface AgentItem extends ItemBase {
  kind: "agent";
  mission: L10n;
  blocks: { id: string; label: L10n; description: L10n }[];
  settings: AgentSetting[];
  tests: AgentTest[];
  /** A design that passes every test; used by content tests. */
  reference: { blocks: string[]; settings: Record<string, string> };
}

export type Item = ChoiceItem | PromptItem | SimulationItem | AgentItem;

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

/**
 * A self-contained learning package (section 10 of the proposal): one
 * certification or course with its domains, chapters and mock exam.
 */
export interface Track {
  id: string;
  name: string;
  short: L10n;
  focus: L10n;
  /** true when chapters and weights follow a published official outline. */
  official: boolean;
  /** Our own curriculum without an official outline behind it (shown as "preliminary"). */
  preliminary?: boolean;
  /** Shown when the curriculum is our own preliminary structure. */
  note?: L10n;
  domains: Domain[];
  chapters: Chapter[];
  exam: { minutes: number; questions: number; official?: { passScaled: number; scale: [number, number] } };
  /** Chapters (by index) available on the FREE plan when billing is enabled. */
  freeChapters: number;
  /** Optional link to an official course or exam page. */
  officialUrl?: string;
}

export interface Certification {
  id: string;
  name: string;
  focus: L10n;
  priceUsd: number;
  available: boolean;
  exam?: { minutes: number; questions: number; passScaled: number; scale: [number, number] };
}
