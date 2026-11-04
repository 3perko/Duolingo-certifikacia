import type { SimMetrics, SimulationItem } from "../types";

/**
 * Task type 4. Outcomes come from a fixed, documented model of each scenario
 * (base metrics + the effect of every decision), never from an AI guess, so
 * the same decisions always produce the same numbers.
 */
export function simulate(item: SimulationItem, choices: number[]): SimMetrics {
  const m = { ...item.base };
  item.steps.forEach((step, i) => {
    const opt = step.options[choices[i]];
    if (!opt) return;
    for (const [k, v] of Object.entries(opt.effect) as [keyof SimMetrics, number][]) m[k] += v;
  });
  return {
    accuracy: Math.min(99, Math.max(0, m.accuracy)),
    latencySec: Math.max(0.5, m.latencySec),
    costPerDay: Math.max(0, m.costPerDay),
    risk: Math.min(100, Math.max(0, m.risk)),
  };
}

export function targetsMet(item: SimulationItem, m: SimMetrics) {
  return {
    accuracy: m.accuracy >= item.targets.minAccuracy,
    cost: m.costPerDay <= item.targets.maxCostPerDay,
    risk: m.risk <= item.targets.maxRisk,
  };
}

/** 60 % for expert-level decisions, 40 % for meeting the scenario's targets. */
export function simulationScore(item: SimulationItem, choices: number[]): number {
  const best = item.steps.filter((s, i) => s.options[choices[i]]?.best).length / item.steps.length;
  const met = Object.values(targetsMet(item, simulate(item, choices))).filter(Boolean).length / 3;
  return Math.round(100 * (0.6 * best + 0.4 * met));
}
