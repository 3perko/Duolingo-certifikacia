import { useState } from "react";
import { generateVariant } from "../api";
import { ITEM_BY_ID, domainName } from "../content";
import type { ChoiceItem } from "../types";
import { domainStats, dueItems, targetedItems } from "../engine/progress";
import { useStore } from "../store";
import type { Session } from "./Player";

const DAY = 86_400_000;

/** Section 6 of the proposal: spaced repetition overview and review sessions. */
export function Review({ onStart }: { onStart: (s: Session) => void }) {
  const { progress, track, health, ent, lang, qLang, t } = useStore();
  const [preparing, setPreparing] = useState(false);
  const aiVariants = Boolean(health?.ai) && (!ent.billing || ent.premium);

  /** Section 6: half of the due questions come back as new AI-written scenarios (when AI is available). */
  async function startReview(ids: string[]) {
    let overrides: Record<string, ChoiceItem> | undefined;
    if (aiVariants) {
      setPreparing(true);
      const picks = ids.filter((_, i) => i % 2 === 0).slice(0, 4);
      const timeout = new Promise<null>((r) => setTimeout(() => r(null), 15_000));
      const results = await Promise.all(picks.map((id) => Promise.race([generateVariant(ITEM_BY_ID[id] as ChoiceItem, qLang), timeout])));
      overrides = Object.fromEntries(results.filter((v): v is ChoiceItem => !!v).map((v) => [v.id, v]));
      setPreparing(false);
    }
    onStart({ kind: "review", title: { sk: "Opakovanie", en: "Review" }, itemIds: ids, overrides });
  }
  const now = Date.now();
  const due = dueItems(progress, now);
  const stats = domainStats(progress, track);

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
        {aiVariants && <p className="muted small">✨ {t("variantsOn")}</p>}
        {due.length ? (
          <button className="btn primary wide" disabled={preparing} onClick={() => void startReview(due)}>
            {preparing ? t("preparingVariants") : t("startReview")}
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
                <td>{domainName(track, s.domain)[lang]}<div className="muted small">{s.seen}/{s.total}</div></td>
                <td>{s.successRate === null ? t("notStarted") : `${s.successRate}\u00a0%`}</td>
                <td>{when(s.nextDue)}</td>
                <td>
                  <button
                    className="btn ghost small"
                    onClick={() => onStart({ kind: "review", title: domainName(track, s.domain), itemIds: targetedItems(progress, s.domain, now) })}
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
