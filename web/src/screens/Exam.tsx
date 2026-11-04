import { useEffect, useMemo, useState } from "react";
import { ChoiceBody, shuffledOrder, toggle } from "../components/ChoiceExercise";
import { domainName } from "../content";
import { examAllowed } from "../entitlements";
import { buildExam, readinessBand, scoreExam } from "../engine/exam";
import { type ExamResult, XP, addXp, checkAchievements, examUnlocked, targetedItems, weakestDomain } from "../engine/progress";
import { useStore } from "../store";
import type { ChoiceItem } from "../types";
import type { Session } from "./Player";

/** Section 7 of the proposal: timed mock exam with a per-domain breakdown. */
export function Exam({ onStart, onPremium }: { onStart: (s: Session) => void; onPremium: () => void }) {
  const { progress, update, track, ent, lang, qLang, t } = useStore();
  const exam = track.exam;
  const [items, setItems] = useState<ChoiceItem[] | null>(null);
  const [orders, setOrders] = useState<Record<string, number[]>>({});
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [idx, setIdx] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<ExamResult | null>(null);

  const deadline = startedAt + exam.minutes * 60_000;
  const remaining = Math.max(0, deadline - now);

  useEffect(() => {
    if (!items || result) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [items, result]);

  function start() {
    const built = buildExam(track);
    setItems(built);
    setOrders(Object.fromEntries(built.map((i) => [i.id, shuffledOrder(i)])));
    setAnswers({});
    setIdx(0);
    setResult(null);
    setStartedAt(Date.now());
    setNow(Date.now());
  }

  function submit() {
    if (!items) return;
    const end = Date.now();
    const s = scoreExam(track, items, answers);
    const r: ExamResult = { at: end, trackId: track.id, ...s, durationSec: Math.round((end - startedAt) / 1000) };
    setResult(r);
    update((p) => checkAchievements(addXp({ ...p, exams: [...p.exams, r] }, XP.examBonus, end), end).progress);
  }

  useEffect(() => {
    if (items && !result && remaining === 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const answeredCount = useMemo(() => (items ? items.filter((i) => answers[i.id]?.length).length : 0), [items, answers]);

  if (result) {
    const pct = Math.round((100 * result.correct) / result.total);
    const band = readinessBand(pct);
    const weakest = weakestDomain(track, result.byDomain);
    const rows = track.domains.filter((d) => result.byDomain[d.id].total).sort(
      (a, b) => result.byDomain[b.id].correct / result.byDomain[b.id].total - result.byDomain[a.id].correct / result.byDomain[a.id].total,
    );
    return (
      <div className="screen">
        <section className="card">
          <h2>📝 {t("examResult")}</h2>
          <div className="stats">
            <div className="stat"><div className="stat-value">{pct}&nbsp;%</div><div className="muted small">{result.correct}/{result.total}</div></div>
            <div className="stat"><div className="stat-value">{Math.round(result.durationSec / 60)} {t("min")}</div><div className="muted small">{t("time")}</div></div>
          </div>
          <p className="strong">{t(band === "ready" ? "band_ready" : band === "close" ? "band_close" : "band_notready")}</p>
          <table className="table">
            <thead><tr><th>{t("area")}</th><th>{t("score")}</th></tr></thead>
            <tbody>
              {rows.map((d) => {
                const r = result.byDomain[d.id];
                return <tr key={d.id}><td>{d.name[lang]}</td><td>{Math.round((100 * r.correct) / r.total)}&nbsp;%</td></tr>;
              })}
            </tbody>
          </table>
          <p className="muted small">{track.exam.official ? t("examDisclaimer") : t("examDisclaimerPrelim")}</p>
        </section>
        {weakest && (
          <section className="card">
            <h3>🎓 {t("tutorAdvice")}</h3>
            <p>„{t("weakest", { d: domainName(track, weakest)[lang] })}“</p>
            <button
              className="btn primary wide"
              onClick={() => onStart({ kind: "review", title: domainName(track, weakest), itemIds: targetedItems(progress, weakest, Date.now()) })}
            >
              {t("startTargeted")}
            </button>
          </section>
        )}
        <button className="btn ghost wide" onClick={() => { setItems(null); setResult(null); }}>{t("prev")}</button>
      </div>
    );
  }

  if (items) {
    const item = items[idx];
    const mm = Math.floor(remaining / 60_000);
    const ss = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0");
    return (
      <div className="screen">
        <div className="player-head">
          <span className="strong">⏱ {mm}:{ss}</span>
          <div className="bar"><div style={{ width: `${(100 * answeredCount) / items.length}%` }} /></div>
          <span className="muted small">{t("question")} {idx + 1}/{items.length}</span>
        </div>
        <div className="exercise">
          <ChoiceBody
            item={item}
            lang={qLang}
            selected={answers[item.id] ?? []}
            onToggle={(i) => setAnswers({ ...answers, [item.id]: toggle(answers[item.id] ?? [], i, item.correct.length > 1) })}
            reveal={false}
            order={orders[item.id]}
          />
          <div className="actions row spread">
            <button className="btn ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>{t("prev")}</button>
            {idx + 1 < items.length ? (
              <button className="btn primary" onClick={() => setIdx(idx + 1)}>{t("next")}</button>
            ) : (
              <button
                className="btn primary"
                onClick={() => {
                  const left = items.length - answeredCount;
                  if (!left || window.confirm(t("unanswered", { n: left }))) submit();
                }}
              >
                {t("finishExam")}
              </button>
            )}
          </div>
          <div className="qgrid">
            {items.map((q, i) => (
              <button key={q.id} className={`qdot ${i === idx ? "current" : ""} ${answers[q.id]?.length ? "answered" : ""}`} onClick={() => setIdx(i)}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlocked = examUnlocked(progress, track);
  return (
    <div className="screen">
      <section className="card">
        <h2>📝 {t("examSim")}</h2>
        <p className="strong">{track.name}</p>
        <ul className="plain">
          <li>⏱ {t("time")}: {exam.minutes} {t("min")}</li>
          <li>📝 {t("questions")}: {exam.questions}</li>
          <li>🎯 {t("qTypes")}</li>
        </ul>
        <p className="muted small">{track.exam.official ? t("examDisclaimer") : t("examDisclaimerPrelim")}</p>
        {!unlocked ? null : examAllowed(ent) ? (
          <button className="btn primary wide" onClick={start}>{t("startExam")}</button>
        ) : (
          <button className="btn primary wide" onClick={onPremium}>💎 {t("premiumFeature")}</button>
        )}
        {unlocked ? null : (
          <p className="locked-note">🔒 {t("examLocked")}</p>
        )}
      </section>
      {progress.exams.some((e) => e.trackId === track.id) && (
        <section className="card">
          <h3>{t("history")}</h3>
          <ul className="plain">
            {progress.exams.filter((e) => e.trackId === track.id).reverse().slice(0, 5).map((e) => (
              <li key={e.at}>{new Date(e.at).toLocaleDateString(lang)} — {Math.round((100 * e.correct) / e.total)}&nbsp;% ({e.correct}/{e.total})</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
