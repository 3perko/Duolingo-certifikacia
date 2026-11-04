import { useEffect, useState } from "react";
import { type LeagueStanding, getLeague } from "../account";
import { useStore } from "../store";

export const TIERS = [
  { icon: "🥉", sk: "Bronzová liga", en: "Bronze league" },
  { icon: "🥈", sk: "Strieborná liga", en: "Silver league" },
  { icon: "🥇", sk: "Zlatá liga", en: "Gold league" },
  { icon: "💠", sk: "Platinová liga", en: "Platinum league" },
  { icon: "💎", sk: "Diamantová liga", en: "Diamond league" },
];

/** Section 9: weekly leagues. Competition is based on XP, i.e. progress and regularity. */
export function League({ onAccount }: { onAccount: () => void }) {
  const { me, health, progress, lang, t } = useStore();
  const [data, setData] = useState<LeagueStanding | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    let alive = true;
    getLeague()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
    // refresh when local XP changes (after sync)
  }, [me, progress.xp]);

  if (!health || health.auth === "none" || !me) {
    return (
      <div className="screen">
        <section className="card">
          <h2>🏆 {t("leagues")}</h2>
          <p className="muted">{t("leagueIntro")}</p>
          {health && health.auth !== "none" ? (
            <button className="btn primary wide" onClick={onAccount}>{t("signInToCompete")}</button>
          ) : (
            <p className="muted small">{t("offlineMode")}</p>
          )}
        </section>
      </div>
    );
  }

  if (error) return <div className="screen"><section className="card"><p className="bad-text">{error}</p></section></div>;
  if (!data) return <div className="screen"><section className="card"><p className="muted">…</p></section></div>;

  if (!data.opted_in) {
    return (
      <div className="screen">
        <section className="card">
          <h2>🏆 {t("leagues")}</h2>
          <p className="muted">{t("leagueOptedOut")}</p>
          <button className="btn ghost" onClick={onAccount}>{t("account")}</button>
        </section>
      </div>
    );
  }

  const tier = TIERS[data.tier] ?? TIERS[0];
  const n = data.members.length;
  const days = data.ends_at ? Math.max(0, Math.ceil((new Date(data.ends_at).getTime() - Date.now()) / 86_400_000)) : null;

  return (
    <div className="screen">
      <section className="card hero">
        <div className="big-emoji center">{tier.icon}</div>
        <h2 className="center">{tier[lang]}</h2>
        <p className="muted small center">
          {days !== null && t("leagueEnds", { n: days })} · {t("leagueRules", { up: data.promote ?? 0, down: data.demote ?? 0 })}
        </p>
      </section>
      <section className="card">
        <ol className="leaderboard">
          {data.members.map((m) => {
            const zone = m.rank <= (data.promote ?? 0) ? "up" : data.demote && m.rank > n - data.demote ? "down" : "";
            return (
              <li key={m.rank} className={`${m.me ? "me" : ""} ${zone}`}>
                <span className="rank">{m.rank}</span>
                <span className="grow">{m.name}{m.me ? ` (${t("you")})` : ""}</span>
                <span className="strong">{m.xp} XP</span>
              </li>
            );
          })}
        </ol>
        <p className="muted small">{t("leagueFair")}</p>
      </section>
    </div>
  );
}
