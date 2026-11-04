import { useState } from "react";
import { gradePrompt } from "../api";
import type { GradeResult } from "../engine/promptGrader";
import { useStore } from "../store";
import type { PromptItem } from "../types";

const ICON = { met: "✅", partial: "🟡", missing: "❌" } as const;

/** Task type 2: rewrite a weak prompt; graded by the AI grader (or offline heuristic). */
export function PromptExercise({ item, onDone }: { item: PromptItem; onDone: (score: number) => void }) {
  const { lang, qLang, t } = useStore();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);

  async function submit() {
    setBusy(true);
    const { result } = await gradePrompt(item, text, lang);
    setResult(result);
    setBusy(false);
  }

  return (
    <div className="exercise">
      <div className="tag">✍️ {t("fixPrompt")}</div>
      <p><strong>{t("goal")}:</strong> {item.goal[qLang]}</p>
      <div className="artifact">
        <div className="artifact-title">{t("weakPrompt")}</div>
        <pre>{item.brokenPrompt[qLang]}</pre>
      </div>
      <label className="small strong" htmlFor={`p-${item.id}`}>{t("yourPrompt")}</label>
      <textarea id={`p-${item.id}`} rows={6} value={text} onChange={(e) => setText(e.target.value)} disabled={!!result || busy} maxLength={4000} />

      {result && (
        <div className="feedback neutral">
          <div className="row spread">
            <strong>{t("score")}: {result.score}/100</strong>
            <span className="muted small">{result.source === "ai" ? t("aiGraded") : t("offlineGraded")}</span>
          </div>
          <ul className="criteria">
            {result.criteria.map((c) => (
              <li key={c.id}>
                {ICON[c.status]} <strong>{c.label}</strong>: {t(c.status)}
                {c.comment && <div className="muted small">{c.comment}</div>}
              </li>
            ))}
          </ul>
          {result.tips.length > 0 && (
            <>
              <p className="small strong">{t("tips")}</p>
              <ul>{result.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
            </>
          )}
          <p className="small strong">{t("improved")}</p>
          <pre className="sample">{result.improvedPrompt || item.sample[lang]}</pre>
        </div>
      )}

      <div className="actions">
        {!result ? (
          <button className="btn primary" disabled={text.trim().length < 10 || busy} onClick={submit}>
            {busy ? t("evaluating") : t("evaluate")}
          </button>
        ) : (
          <button className="btn primary" onClick={() => onDone(result.score)}>{t("next")}</button>
        )}
      </div>
    </div>
  );
}
