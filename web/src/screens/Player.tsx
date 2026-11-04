import { useRef, useState } from "react";
import { ChoiceExercise } from "../components/ChoiceExercise";
import { PromptExercise } from "../components/PromptExercise";
import { SimulationExercise } from "../components/SimulationExercise";
import { BOSS_PASS, ITEM_BY_ID } from "../content";
import { gradeFromScore } from "../engine/fsrs";
import { ACHIEVEMENTS, XP, addXp, checkAchievements, completeLesson, recordAnswer } from "../engine/progress";
import { useStore } from "../store";
import type { L10n } from "../types";

export interface Session {
  kind: "lesson" | "boss" | "review";
  title: L10n;
  itemIds: string[];
  theory?: L10n[];
  lessonId?: string;
}

/** Runs a lesson, boss fight or review session item by item. */
export function Player({ session, onExit }: { session: Session; onExit: () => void }) {
  const { progress, update, lang, t } = useStore();
  const [phase, setPhase] = useState<"theory" | "items" | "done">(session.theory?.length ? "theory" : "items");
  const [theoryIdx, setTheoryIdx] = useState(0);
  const [idx, setIdx] = useState(0);
  const scores = useRef<number[]>([]);
  const xpGained = useRef(0);
  const [summary, setSummary] = useState<{ score: number; xp: number } | null>(null);
  const badgesAtStart = useRef(new Set(Object.keys(progress.achievements)));

  const total = session.itemIds.length;

  function finishItem(itemId: string, score: number, xp: number) {
    const now = Date.now();
    scores.current.push(score);
    xpGained.current += xp;
    update((p) => {
      let next = recordAnswer(p, itemId, gradeFromScore(score), now);
      next = addXp(next, xp, now);
      if (ITEM_BY_ID[itemId]?.kind === "prompt" && score >= 90) next = { ...next, achievements: { ...next.achievements, "prompt-90": now } };
      return next;
    });
    if (idx + 1 < total) setIdx(idx + 1);
    else finishSession();
  }

  function finishSession() {
    const now = Date.now();
    const score = Math.round(scores.current.reduce((a, b) => a + b, 0) / Math.max(1, scores.current.length));
    let bonus = 0;
    if (session.kind === "lesson") bonus = XP.lessonBonus;
    if (session.kind === "boss" && score >= BOSS_PASS * 100) bonus = XP.bossBonus;
    xpGained.current += bonus;
    update((p) => {
      let next = addXp(p, bonus, now);
      if (session.lessonId) next = completeLesson(next, session.lessonId, score, now);
      return checkAchievements(next, now).progress;
    });
    setSummary({ score, xp: xpGained.current });
    setPhase("done");
  }

  const header = (
    <div className="player-head">
      <button className="btn ghost small" onClick={onExit} aria-label={t("quit")}>✕</button>
      <div className="bar"><div style={{ width: `${phase === "done" ? 100 : (100 * idx) / total}%` }} /></div>
      <span className="muted small">{Math.min(idx + 1, total)}/{total}</span>
    </div>
  );

  if (phase === "theory" && session.theory) {
    return (
      <div className="screen">
        {header}
        <div className="exercise">
          <div className="tag">📘 {t("theory")}</div>
          <h2>{session.title[lang]}</h2>
          <p className="theory">{session.theory[theoryIdx][lang]}</p>
          <div className="actions">
            <button
              className="btn primary"
              onClick={() => (theoryIdx + 1 < session.theory!.length ? setTheoryIdx(theoryIdx + 1) : setPhase("items"))}
            >
              {t("understood")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const passedBoss = session.kind === "boss" && (summary?.score ?? 0) >= BOSS_PASS * 100;
    return (
      <div className="screen">
        <div className="exercise center">
          <div className="big-emoji">{session.kind === "boss" ? (passedBoss ? "🏆" : "💪") : "🎉"}</div>
          <h2>{session.kind === "boss" ? (passedBoss ? t("bossWon") : t("bossLost")) : t("lessonDone")}</h2>
          {summary && (
            <>
              <div className="stats">
                <div className="stat"><div className="stat-value">{summary.score}&nbsp;%</div><div className="muted small">{t("score")}</div></div>
                <div className="stat"><div className="stat-value">+{summary.xp}</div><div className="muted small">{t("xpGained")}</div></div>
              </div>
              {ACHIEVEMENTS.filter((a) => progress.achievements[a.id] && !badgesAtStart.current.has(a.id)).map((a) => (
                <div key={a.id} className="badge-new">{a.icon} {t("newAchievement")}: <strong>{a.title[lang]}</strong></div>
              ))}
            </>
          )}
          <div className="actions">
            <button className="btn primary" onClick={onExit}>{t("backHome")}</button>
          </div>
        </div>
      </div>
    );
  }

  const item = ITEM_BY_ID[session.itemIds[idx]];
  return (
    <div className="screen">
      {header}
      {item.kind === "choice" && (
        <ChoiceExercise key={item.id} item={item} onDone={(ok) => finishItem(item.id, ok ? 100 : 0, ok ? XP.correct : 0)} />
      )}
      {item.kind === "prompt" && (
        <PromptExercise key={item.id} item={item} onDone={(s) => finishItem(item.id, s, Math.round((s / 100) * XP.practicalMax))} />
      )}
      {item.kind === "simulation" && (
        <SimulationExercise key={item.id} item={item} onDone={(s) => finishItem(item.id, s, Math.round((s / 100) * XP.practicalMax))} />
      )}
    </div>
  );
}
