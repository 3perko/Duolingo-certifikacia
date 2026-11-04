import { useState } from "react";
import { type TutorAnswer, askTutor } from "../api";
import { levelFromXp } from "../engine/progress";
import { useStore } from "../store";
import type { L10n } from "../types";

/** Section 5 of the proposal: a personal AI tutor that knows the learner's progress. */
export function Tutor({ concept, context, fallback }: { concept: L10n; context?: string; fallback: L10n }) {
  const { progress, lang, t } = useStore();
  const [answer, setAnswer] = useState<TutorAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  async function ask(mode: "explain" | "simpler") {
    setLoading(true);
    setPicked(null);
    try {
      const weak = Object.entries(progress.weakConcepts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([c]) => c);
      const res = await askTutor({
        concept: concept[lang],
        questionContext: context,
        mode,
        lang,
        learner: {
          level: levelFromXp(progress.xp).level,
          completed_lessons: Object.keys(progress.lessons).length,
          weak_concepts: weak,
          days_since_last_study: progress.lastStudyAt ? Math.floor((Date.now() - progress.lastStudyAt) / 86_400_000) : null,
        },
      });
      setAnswer(res);
      setOffline(false);
    } catch {
      setOffline(true);
      setAnswer(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tutor">
      <div className="row gap">
        <button className="btn ghost small" onClick={() => ask("explain")} disabled={loading}>
          {t("explainIt")}
        </button>
        {(answer || offline) && (
          <button className="btn ghost small" onClick={() => ask("simpler")} disabled={loading}>
            {t("explainSimpler")}
          </button>
        )}
      </div>
      {loading && <p className="muted">{t("tutorThinking")}</p>}
      {offline && !loading && (
        <div className="tutor-box">
          <p className="muted small">{t("tutorOffline")}</p>
          <p>{fallback[lang]}</p>
        </div>
      )}
      {answer && !loading && (
        <div className="tutor-box">
          <div className="tutor-head">🎓 {t("tutor")}</div>
          <p>{answer.explanation}</p>
          {answer.analogy && <p className="analogy">💡 {answer.analogy}</p>}
          <p className="small strong">{t("checkUnderstanding")}</p>
          <p>{answer.check_question.question}</p>
          <div className="options">
            {answer.check_question.options.map((o, i) => {
              const state =
                picked === null ? "" : i === answer.check_question.correct_index ? "right" : i === picked ? "wrong" : "";
              return (
                <button key={i} className={`option ${state}`} disabled={picked !== null} onClick={() => setPicked(i)}>
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null && <p className="small">{answer.check_question.explanation}</p>}
        </div>
      )}
    </div>
  );
}
