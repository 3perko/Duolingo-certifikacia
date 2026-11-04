import { useState } from "react";
import { TRACKS, bossId } from "../content";
import { chapterAllowed } from "../entitlements";
import { buildBoss } from "../engine/exam";
import {
  XP,
  challengeStatus,
  chapterProgress,
  chapterUnlocked,
  checkAchievements,
  claimChallenge,
  dayKey,
  isBossPassed,
  isLessonDone,
  lessonUnlocked,
  levelFromXp,
  liveStreak,
  nextStep,
  readiness,
} from "../engine/progress";
import { useStore } from "../store";
import type { Session } from "./Player";

export function Home({ onStart, onPremium }: { onStart: (s: Session) => void; onPremium: () => void }) {
  const { progress, update, track, ent, lang, t } = useStore();
  const [picking, setPicking] = useState(false);
  const now = Date.now();
  const { level, into, span } = levelFromXp(progress.xp);
  const todayXp = progress.xpByDay[dayKey(now)] ?? 0;
  const goal = progress.settings.dailyGoal;
  const next = nextStep(progress, track);
  const challenges = challengeStatus(progress, now);

  const lessonSession = (c: number, l: number): Session => {
    const lesson = track.chapters[c].lessons[l];
    return { kind: "lesson", title: lesson.title, theory: lesson.theory, itemIds: lesson.items, lessonId: lesson.id };
  };
  const bossSession = (c: number): Session => ({
    kind: "boss",
    title: { sk: `${track.chapters[c].title.sk} – Boss Fight`, en: `${track.chapters[c].title.en} – Boss Fight` },
    itemIds: buildBoss(track, track.chapters[c].id).map((i) => i.id),
    lessonId: bossId(track.chapters[c].id),
  });
  const start = (c: number, s: Session) => (chapterAllowed(ent, track, c) ? onStart(s) : onPremium());

  return (
    <div className="screen">
      <section className="card hero">
        <div className="row spread">
          <div className="muted small">🎓 {t("yourCert")}</div>
          <button className="btn ghost small" onClick={() => setPicking(!picking)}>{t("switchTrack")}</button>
        </div>
        <div className="strong">{track.name}</div>
        {picking && (
          <div className="tracks">
            {TRACKS.map((tr) => (
              <button
                key={tr.id}
                className={`track ${tr.id === track.id ? "active" : ""}`}
                onClick={() => {
                  update((p) => ({ ...p, settings: { ...p.settings, trackId: tr.id }, updatedAt: Date.now() }));
                  setPicking(false);
                }}
              >
                <strong>{tr.short[lang]}</strong>
                <span className="muted small">{tr.focus[lang]}</span>
                {tr.preliminary && <span className="small pill">{t("preliminary")}</span>}
              </button>
            ))}
          </div>
        )}
        {track.note && <p className="muted small">ℹ️ {track.note[lang]}</p>}
        <div className="stats">
          <div className="stat"><div className="stat-value">🔥 {liveStreak(progress, now)}</div><div className="muted small">{t("streak")}</div></div>
          <div className="stat"><div className="stat-value">⭐ {level}</div><div className="muted small">{t("level")}</div></div>
          <div className="stat"><div className="stat-value">💎 {progress.xp.toLocaleString(lang)}</div><div className="muted small">{t("xp")}</div></div>
          <div className="stat"><div className="stat-value">📊 {readiness(progress, track, now)}&nbsp;%</div><div className="muted small">{t("readiness")}</div></div>
        </div>
        <div className="small">{t("level")} {level} → {level + 1}</div>
        <div className="bar"><div style={{ width: `${(100 * into) / span}%` }} /></div>
        <div className="small">{t("dailyGoal")}: {Math.min(todayXp, goal)}/{goal} XP</div>
        <div className="bar goal"><div style={{ width: `${Math.min(100, (100 * todayXp) / goal)}%` }} /></div>
        {next ? (
          <button
            className="btn primary wide"
            onClick={() => start(next.chapterIndex, next.lessonIndex === "boss" ? bossSession(next.chapterIndex) : lessonSession(next.chapterIndex, next.lessonIndex))}
          >
            ▶ {t("continue")}
          </button>
        ) : (
          <p className="small">{t("allDone")}</p>
        )}
      </section>

      <section className="card">
        <h3>🏅 {t("weeklyChallenges")}</h3>
        <ul className="plain">
          {challenges.map(({ challenge: c, value, done, claimed }) => (
            <li key={c.id} className="challenge">
              <span>{c.icon}</span>
              <div className="grow">
                <div className="small strong">{c.title[lang]}</div>
                <div className="bar goal"><div style={{ width: `${(100 * value) / c.target}%` }} /></div>
              </div>
              {claimed ? (
                <span className="small muted">✅</span>
              ) : (
                <button
                  className="btn small primary"
                  disabled={!done}
                  onClick={() => update((p) => checkAchievements(claimChallenge(p, c.id, Date.now()), Date.now()).progress)}
                >
                  {done ? `+${XP.challenge} XP` : `${value}/${c.target}`}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="path">
        {track.chapters.map((ch, c) => {
          const unlocked = chapterUnlocked(progress, track, c);
          const allowed = chapterAllowed(ent, track, c);
          const pct = chapterProgress(progress, track, c);
          const dot = !unlocked ? "🔒" : pct === 100 ? "🟢" : "🟡";
          return (
            <div key={ch.id} className={`card chapter ${unlocked ? "" : "locked"}`}>
              <div className="row spread">
                <div>
                  <span>{dot} </span>
                  <strong>{t("chapter")} {c + 1} – {ch.title[lang]}</strong>
                  {!allowed && <span className="pill small"> 💎 Premium</span>}
                </div>
                {unlocked && <span className="muted small">{pct}&nbsp;%</span>}
              </div>
              {unlocked && (
                <ul className="lessons">
                  {ch.lessons.map((l, i) => {
                    const done = isLessonDone(progress, l.id);
                    const open = lessonUnlocked(progress, track, c, i);
                    return (
                      <li key={l.id}>
                        <button className={`lesson ${done ? "done" : ""}`} disabled={!open} onClick={() => start(c, lessonSession(c, i))}>
                          <span>{done ? "✅" : open ? "▶️" : "🔒"}</span>
                          <span className="grow">{l.title[lang]}</span>
                          <span className="muted small">{l.minutes} {t("min")}</span>
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      className={`lesson boss ${isBossPassed(progress, ch.id) ? "done" : ""}`}
                      disabled={!lessonUnlocked(progress, track, c, ch.lessons.length)}
                      onClick={() => start(c, bossSession(c))}
                      title={t("bossDesc")}
                    >
                      <span>{isBossPassed(progress, ch.id) ? "🏆" : "🐉"}</span>
                      <span className="grow">{t("boss")}</span>
                      {progress.lessons[bossId(ch.id)] && <span className="muted small">{progress.lessons[bossId(ch.id)].best}&nbsp;%</span>}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
