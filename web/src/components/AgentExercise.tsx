import { useState } from "react";
import { type AgentRunResult, runAgentTests } from "../engine/agent";
import { useStore } from "../store";
import type { AgentItem, AgentTestCategory } from "../types";

const CAT_ICON: Record<AgentTestCategory, string> = { functionality: "⚙️", safety: "🛡️", reliability: "🔁" };

/** AI Lab mission: assemble an agent from blocks, configure it and run the automated tests. */
export function AgentExercise({ item, onDone }: { item: AgentItem; onDone: (score: number) => void }) {
  const { lang, qLang, t } = useStore();
  const [blocks, setBlocks] = useState<string[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [run, setRun] = useState<AgentRunResult | null>(null);
  const [best, setBest] = useState(0);

  const label = (id: string) => item.blocks.find((b) => b.id === id)!.label[qLang];
  const allSet = item.settings.every((s) => settings[s.id]);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
    setRun(null);
  }

  function test() {
    const r = runAgentTests(item, { blocks, settings });
    setRun(r);
    setBest(Math.max(best, r.score));
  }

  return (
    <div className="exercise">
      <div className="tag">🤖 {t("agentLab")}</div>
      <div className="artifact">
        <p>{item.mission[qLang]}</p>
      </div>

      <h2>{t("palette")}</h2>
      <div className="palette">
        {item.blocks.filter((b) => !blocks.includes(b.id)).map((b) => (
          <button key={b.id} className="block" title={b.description[qLang]} onClick={() => { setBlocks([...blocks, b.id]); setRun(null); }}>
            ＋ {b.label[qLang]}
            <span className="muted small">{b.description[qLang]}</span>
          </button>
        ))}
      </div>

      <h2>{t("pipeline")}</h2>
      {blocks.length === 0 && <p className="muted small">{t("pipelineEmpty")}</p>}
      <ol className="pipeline">
        {blocks.map((id, i) => (
          <li key={id}>
            <span className="grow">{label(id)}</span>
            <button className="btn ghost small" aria-label="up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button className="btn ghost small" aria-label="down" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button className="btn ghost small" aria-label="remove" onClick={() => { setBlocks(blocks.filter((b) => b !== id)); setRun(null); }}>✕</button>
          </li>
        ))}
      </ol>

      <h2>{t("agentSettings")}</h2>
      {item.settings.map((s) => (
        <fieldset key={s.id} className="field">
          <legend className="small strong">{s.label[qLang]}</legend>
          <div className="row gap">
            {s.options.map((o) => (
              <button
                key={o.id}
                className={`btn small ${settings[s.id] === o.id ? "primary" : "ghost"}`}
                onClick={() => { setSettings({ ...settings, [s.id]: o.id }); setRun(null); }}
              >
                {o.label[qLang]}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {run && (
        <div className="feedback neutral" role="status" aria-live="polite">
          <div className="row spread">
            <strong>{t("score")}: {run.score}/100</strong>
            <span className="small muted">{t("deterministicTests")}</span>
          </div>
          <div className="metrics">
            {(Object.keys(run.byCategory) as AgentTestCategory[]).map((c) => (
              <div key={c} className={`metric ${run.byCategory[c].passed === run.byCategory[c].total ? "ok" : "bad"}`}>
                <div className="muted small">{CAT_ICON[c]} {t(`cat_${c}`)}</div>
                <div className="metric-value">{run.byCategory[c].passed}/{run.byCategory[c].total}</div>
              </div>
            ))}
          </div>
          <ul className="criteria">
            {item.tests.map((tc) => {
              const passed = run.results.find((r) => r.id === tc.id)!.passed;
              return (
                <li key={tc.id}>
                  {passed ? "✅" : "❌"} <strong>{tc.title[qLang]}</strong>
                  <div className="muted small">{(passed ? tc.passMessage : tc.failMessage)[lang]}</div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="actions">
        <button className="btn ghost" disabled={!blocks.length || !allSet} onClick={test}>▶ {t("runTests")}</button>
        <button className="btn primary" disabled={!run} onClick={() => onDone(best)}>{t("finishMission")}</button>
      </div>
    </div>
  );
}
