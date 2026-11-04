import type { Certification, Domain, L10n } from "../types";

export const t = (sk: string, en: string): L10n => ({ sk, en });

/**
 * Certification catalogue as described in the product proposal (October 2026).
 * Prices and exam parameters must be re-checked against Anthropic's official
 * pages before each release; the professional exams are currently available
 * only to members of the Claude Partner Network.
 */
export const CERTIFICATIONS: Certification[] = [
  {
    id: "associate",
    name: "Claude Certified Associate – Foundations",
    focus: t("Praktické používanie AI", "Practical use of AI"),
    priceUsd: 99,
    available: true,
    exam: { minutes: 120, questions: 60, passScaled: 720, scale: [100, 1000] },
  },
  {
    id: "developer",
    name: "Claude Certified Developer – Foundations",
    focus: t("Vývoj AI aplikácií a agentov", "Building AI applications and agents"),
    priceUsd: 125,
    available: false,
  },
  {
    id: "architect",
    name: "Claude Certified Architect – Foundations",
    focus: t("Návrh AI riešení a agentických systémov", "Designing AI solutions and agentic systems"),
    priceUsd: 125,
    available: false,
  },
  {
    id: "architect-pro",
    name: "Claude Certified Architect – Professional",
    focus: t("Podnikové AI architektúry", "Enterprise AI architectures"),
    priceUsd: 175,
    available: false,
  },
];

/** Scored domains of Claude Certified Associate with their exam weights. */
export const DOMAINS: Domain[] = [
  { id: "evaluation", name: t("Hodnotenie a overovanie AI výstupov", "Evaluating and verifying AI outputs"), weight: 21 },
  { id: "workflow", name: t("Integrácia AI do pracovných procesov", "Integrating AI into workflows"), weight: 16 },
  { id: "safety", name: t("Bezpečnosť, riadenie rizík a zodpovedné AI", "Safety, risk management and responsible AI"), weight: 15 },
  { id: "prompting", name: t("Prompt engineering a vykonávanie úloh", "Prompt engineering and task execution"), weight: 14 },
  { id: "models", name: t("Výber produktov a modelov", "Product and model selection"), weight: 12 },
  { id: "knowledge", name: t("Konfigurácia a správa znalostí", "Configuration and knowledge management"), weight: 12 },
  { id: "troubleshooting", name: t("Riešenie problémov a optimalizácia", "Troubleshooting and optimization"), weight: 10 },
];

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<Domain["id"], Domain>;
