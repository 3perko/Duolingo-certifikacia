import { DOMAIN_BY_ID } from "../content/certifications";
import { domainStats, dueItems, targetedItems } from "../engine/progress";
import { useStore } from "../store";
import type { Session } from "./Player";

const DAY = 86_400_000;

/** Section 6 of the proposal: spaced repetition overview and review sessions. */
export function Review({ onStart }: { onStart: (s: Session) => void }) {
  const { progress, lang, t } = useStore();
  const now = Date.now();
  const due = dueItems(progress, now);
  const stats = domainStats(progress);

  const when = (ts: number | null) => {
    if (ts === null) return t("notStarted");
    const days = Math.ceil((ts - now) / DAY);
    if (days <= 0) return t("today");
    if (days === 1) return t("tomorrow");
    return t("inDays", { n: days });
  };

  return (
    <div className="screen">
      <section className="card">
        <h2>🔁 {t("reviewTitle")}</h2>
        <p>{t("dueNow")}: <strong>{due.length}</strong></p>
        {due.length ? (
          <button className="btn primary wide" onClick={() => onStart({ kind: "review", title: { sk: "Opakovanie", en: "Review" }, itemIds: due })}>
            {t("startReview")}
          </button>
        ) : (
          <p className="muted">{t("nothingDue")}</p>
        )}
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr><th>{t("topic")}</th><th>{t("success")}</th><th>{t("nextReview")}</th><th /></tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.domain}>
                <td>{DOMAIN_BY_ID[s.domain].name[lang]}<div className="muted small">{s.seen}/{s.total}</div></td>
                <td>{s.successRate === null ? t("notStarted") : `${s.successRate}\u00a0%`}</td>
                <td>{when(s.nextDue)}</td>
                <td>
                  <button
                    className="btn ghost small"
                    onClick={() => onStart({ kind: "review", title: DOMAIN_BY_ID[s.domain].name, itemIds: targetedItems(progress, s.domain, now) })}
                  >
                    {t("practice")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
