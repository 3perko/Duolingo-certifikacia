import { useState } from "react";
import { simulate, simulationScore, targetsMet } from "../engine/simulation";
import { useStore } from "../store";
import type { SimulationItem } from "../types";

/** Task type 4: step-by-step decisions with a deterministic outcome. */
export function SimulationExercise({ item, onDone }: { item: SimulationItem; onDone: (score: number) => void }) {
  const { lang, qLang, t } = useStore();
  const [choices, setChoices] = useState<number[]>([]);
  const [pending, setPending] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const stepIdx = choices.length;
  const finished = stepIdx === item.steps.length;

  if (finished) {
    const m = simulate(item, choices);
    const met = targetsMet(item, m);
    const score = simulationScore(item, choices);
    const fmtLatency = m.latencySec >= 120 ? `${Math.round(m.latencySec / 60)} min` : `${m.latencySec} s`;
    return (
      <div className="exercise">
        <div className="tag">🧪 {t("simulation")}</div>
        <h2>{t("result")}</h2>
        <div className="metrics">
          <Metric label={t("accuracy")} value={`${m.accuracy}\u00a0%`} ok={met.accuracy} hint={`${t("target")} ≥ ${item.targets.minAccuracy}\u00a0%`} />
          <Metric label={t("latency")} value={fmtLatency} />
          <Metric label={t("cost")} value={`${m.costPerDay} ${t("perDay")}`} ok={met.cost} hint={`${t("target")} ≤ ${item.targets.maxCostPerDay}`} />
          <Metric label={t("risk")} value={`${m.risk}/100`} ok={met.risk} hint={`${t("target")} ≤ ${item.targets.maxRisk}`} />
        </div>
        <p className="muted small">{t("simNote")}</p>
        <ol className="sim-review">
          {item.steps.map((s, i) => {
            const o = s.options[choices[i]];
            return (
              <li key={i}>
                <strong>{s.question[qLang]}</strong> {o.best ? "✅" : "⚠️"} {o.label[qLang]}
                <div className="muted small">{o.feedback[lang]}</div>
              </li>
            );
          })}
        </ol>
        <div className="feedback neutral"><strong>{t("score")}: {score}/100</strong></div>
        <div className="actions">
          <button className="btn primary" onClick={() => onDone(score)}>{t("next")}</button>
        </div>
      </div>
    );
  }

  const step = item.steps[stepIdx];
  return (
    <div className="exercise">
      <div className="tag">🧪 {t("simulation")}</div>
      {stepIdx === 0 && (
        <div className="artifact">
          <div className="artifact-title">{t("situation")}</div>
          <p>{item.scenario[qLang]}</p>
        </div>
      )}
      <p className="muted small">{t("step")} {stepIdx + 1} / {item.steps.length}</p>
      <h2 className="question">{step.question[qLang]}</h2>
      <div className="options">
        {step.options.map((o, i) => (
          <button key={i} className={`option ${pending === i ? "selected" : ""}`} disabled={showFeedback} onClick={() => setPending(i)}>
            {o.label[qLang]}
          </button>
        ))}
      </div>
      {showFeedback && pending !== null && <div className="feedback neutral"><p>{step.options[pending].feedback[lang]}</p></div>}
      <div className="actions">
        {!showFeedback ? (
          <button className="btn primary" disabled={pending === null} onClick={() => setShowFeedback(true)}>{t("check")}</button>
        ) : (
          <button
            className="btn primary"
            onClick={() => {
              setChoices([...choices, pending!]);
              setPending(null);
              setShowFeedback(false);
            }}
          >
            {t("next")}
          </button>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, ok, hint }: { label: string; value: string; ok?: boolean; hint?: string }) {
  return (
    <div className={`metric ${ok === undefined ? "" : ok ? "ok" : "bad"}`}>
      <div className="muted small">{label}</div>
      <div className="metric-value">{value}</div>
      {hint && <div className="small">{ok ? "✅" : "❌"} {hint}</div>}
    </div>
  );
}
