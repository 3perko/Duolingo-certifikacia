import type { AgentItem, AgentRule, AgentTestCategory } from "../types";

export interface AgentDesign {
  blocks: string[];
  settings: Record<string, string>;
}

export function evaluateRule(rule: AgentRule, d: AgentDesign): boolean {
  if ("has" in rule) return d.blocks.includes(rule.has);
  if ("before" in rule) {
    const a = d.blocks.indexOf(rule.before[0]);
    const b = d.blocks.indexOf(rule.before[1]);
    return a >= 0 && b >= 0 && a < b;
  }
  if ("setting" in rule) return d.settings[rule.setting] === rule.equals;
  if ("not" in rule) return !evaluateRule(rule.not, d);
  if ("all" in rule) return rule.all.every((r) => evaluateRule(r, d));
  return rule.any.some((r) => evaluateRule(r, d));
}

export interface AgentRunResult {
  results: { id: string; category: AgentTestCategory; passed: boolean }[];
  byCategory: Record<AgentTestCategory, { passed: number; total: number }>;
  score: number;
}

/** Runs the mission's automated test suite against a design. Fully deterministic. */
export function runAgentTests(item: AgentItem, d: AgentDesign): AgentRunResult {
  const byCategory: AgentRunResult["byCategory"] = {
    functionality: { passed: 0, total: 0 },
    safety: { passed: 0, total: 0 },
    reliability: { passed: 0, total: 0 },
  };
  const results = item.tests.map((test) => {
    const passed = evaluateRule(test.pass, d);
    byCategory[test.category].total++;
    if (passed) byCategory[test.category].passed++;
    return { id: test.id, category: test.category, passed };
  });
  const cats = Object.values(byCategory).filter((c) => c.total > 0);
  const score = Math.round((100 * cats.reduce((a, c) => a + c.passed / c.total, 0)) / cats.length);
  return { results, byCategory, score };
}
