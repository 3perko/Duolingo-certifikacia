import { CHAPTERS, bossId } from "../content";
import { CERTIFICATIONS } from "../content/certifications";
import { buildBoss } from "../engine/exam";
import {
  chapterProgress,
  chapterUnlocked,
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

export function Home({ onStart }: { onStart: (s: Session) => void }) {
  const { progress, lang, t } = useStore();
  const now = Date.now();
  const cert = CERTIFICATIONS.find((c) => c.id === progress.settings.certId) ?? CERTIFICATIONS[0];
  const { level, into, span } = levelFromXp(progress.xp);
  const todayXp = progress.xpByDay[dayKey(now)] ?? 0;
  const goal = progress.settings.dailyGoal;
  const next = nextStep(progress);

  const lessonSession = (c: number, l: number): Session => {
    const lesson = CHAPTERS[c].lessons[l];
    return { kind: "lesson", title: lesson.title, theory: lesson.theory, itemIds: lesson.items, lessonId: lesson.id };
  };
  const bossSession = (c: number): Session => ({
    kind: "boss",
    title: { sk: `${CHAPTERS[c].title.sk} – Boss Fight`, en: `${CHAPTERS[c].title.en} – Boss Fight` },
    itemIds: buildBoss(CHAPTERS[c].id).map((i) => i.id),
    lessonId: bossId(CHAPTERS[c].id),
  });

  return (
    <div className="screen">
      <section className="card hero">
        <div className="muted small">🎓 {t("yourCert")}</div>
        <div className="strong">{cert.name}</div>
        <div className="stats">
          <div className="stat"><div className="stat-value">🔥 {liveStreak(progress, now)}</div><div className="muted small">{t("streak")}</div></div>
          <div className="stat"><div className="stat-value">⭐ {level}</div><div className="muted small">{t("level")}</div></div>
          <div className="stat"><div className="stat-value">💎 {progress.xp.toLocaleString(lang)}</div><div className="muted small">{t("xp")}</div></div>
          <div className="stat"><div className="stat-value">📊 {readiness(progress, now)}&nbsp;%</div><div className="muted small">{t("readiness")}</div></div>
        </div>
        <div className="small">{t("level")} {level} → {level + 1}</div>
        <div className="bar"><div style={{ width: `${(100 * into) / span}%` }} /></div>
        <div className="small">{t("dailyGoal")}: {Math.min(todayXp, goal)}/{goal} XP</div>
        <div className="bar goal"><div style={{ width: `${Math.min(100, (100 * todayXp) / goal)}%` }} /></div>
        {next ? (
          <button
            className="btn primary wide"
            onClick={() => onStart(next.lessonIndex === "boss" ? bossSession(next.chapterIndex) : lessonSession(next.chapterIndex, next.lessonIndex))}
          >
            ▶ {t("continue")}
          </button>
        ) : (
          <p className="small">{t("allDone")}</p>
        )}
      </section>

      <section className="path">
        {CHAPTERS.map((ch, c) => {
          const unlocked = chapterUnlocked(progress, c);
          const pct = chapterProgress(progress, c);
          const dot = !unlocked ? "🔒" : pct === 100 ? "🟢" : "🟡";
          return (
            <div key={ch.id} className={`card chapter ${unlocked ? "" : "locked"}`}>
              <div className="row spread">
                <div>
                  <span>{dot} </span>
                  <strong>{t("chapter")} {c + 1} – {ch.title[lang]}</strong>
                </div>
                {unlocked && <span className="muted small">{pct}&nbsp;%</span>}
              </div>
              {unlocked && (
                <ul className="lessons">
                  {ch.lessons.map((l, i) => {
                    const done = isLessonDone(progress, l.id);
                    const open = lessonUnlocked(progress, c, i);
                    return (
                      <li key={l.id}>
                        <button className={`lesson ${done ? "done" : ""}`} disabled={!open} onClick={() => onStart(lessonSession(c, i))}>
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
                      disabled={!lessonUnlocked(progress, c, ch.lessons.length)}
                      onClick={() => onStart(bossSession(c))}
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
