import { useCallback, useEffect, useState } from "react";
import { type Dashboard, checkout, createOrg, deleteOrg, getDashboard, joinOrg, leaveOrg, removeMember } from "../account";
import { TRACKS } from "../content";
import { useStore } from "../store";

/** Section 12 BUSINESS: the employer sees how prepared each team member is. */
export function Team({ onBack, onAccount }: { onBack: () => void; onAccount: () => void }) {
  const { me, health, refreshAccount, lang, t } = useStore();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [seats, setSeats] = useState(5);
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const admin = me?.org && (me.org.role === "owner" || me.org.role === "admin");

  const load = useCallback(async () => {
    if (!admin) return setDash(null);
    try {
      setDash(await getDashboard());
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }, [admin]);

  useEffect(() => {
    void load();
  }, [load, me?.org?.id]);

  async function run(fn: () => Promise<unknown>) {
    setMsg(null);
    try {
      await fn();
      await refreshAccount();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const back = <button className="btn ghost small back" onClick={onBack}>← {t("prev")}</button>;

  if (!me) {
    return (
      <div className="screen">
        {back}
        <section className="card">
          <h2>🏢 {t("team")}</h2>
          <p className="muted">{t("teamIntro")}</p>
          <button className="btn primary wide" onClick={onAccount}>{t("signInFirst")}</button>
        </section>
      </div>
    );
  }

  if (!me.org) {
    return (
      <div className="screen">
        {back}
        <section className="card">
          <h2>🏢 {t("team")}</h2>
          <p className="muted">{t("teamIntro")}</p>
          <form className="form" onSubmit={(e) => { e.preventDefault(); void run(() => createOrg(name)); }}>
            <input placeholder={t("orgName")} value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={120} required />
            <button className="btn primary">{t("createOrg")}</button>
          </form>
        </section>
        <section className="card">
          <h3>{t("joinOrg")}</h3>
          <p className="muted small">{t("joinConsent")}</p>
          <form className="form" onSubmit={(e) => { e.preventDefault(); void run(() => joinOrg(code)); }}>
            <input placeholder={t("joinCode")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required minLength={4} maxLength={16} />
            <button className="btn ghost">{t("join")}</button>
          </form>
        </section>
        {msg && <p className="bad-text small">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="screen">
      {back}
      <section className="card">
        <h2>🏢 {me.org.name}</h2>
        <p className="small">
          {t("role")}: <strong>{me.org.role}</strong> · {t("licence")}: <strong>{me.org.plan === "business" ? `BUSINESS (${me.org.seats})` : "—"}</strong>
        </p>
        {me.org.join_code && (
          <p className="small">{t("inviteCode")}: <code className="code">{me.org.join_code}</code></p>
        )}
        {me.org.role === "owner" && health?.payments && me.org.plan !== "business" && (
          <div className="row gap">
            <input type="number" min={1} max={10000} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="seats" aria-label={t("seats")} />
            <button className="btn primary small" onClick={() => run(async () => { window.location.href = (await checkout("business", seats)).url; })}>{t("buyBusiness")}</button>
          </div>
        )}
        <div className="row gap">
          {me.org.role !== "owner" && <button className="btn ghost small" onClick={() => run(leaveOrg)}>{t("leaveOrg")}</button>}
          {me.org.role === "owner" && (
            <button className="btn danger small" onClick={() => window.confirm(t("deleteOrgConfirm")) && run(deleteOrg)}>{t("deleteOrg")}</button>
          )}
        </div>
      </section>

      {admin && dash && (
        <section className="card">
          <h3>📊 {t("teamReadiness")}</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("member")}</th>
                  <th>XP</th>
                  <th>🔥</th>
                  {TRACKS.map((tr) => <th key={tr.id}>{tr.short[lang]}</th>)}
                  <th>{t("lastActivity")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {dash.members.map((m) => (
                  <tr key={m.user_id}>
                    <td>{m.name}<div className="muted small">{m.role}</div></td>
                    <td>{m.xp}</td>
                    <td>{m.streak}</td>
                    {TRACKS.map((tr) => <td key={tr.id}>{m.readiness?.[tr.id] ?? 0}&nbsp;%</td>)}
                    <td className="small">{m.last_study_at ? new Date(m.last_study_at).toLocaleDateString(lang) : "—"}</td>
                    <td>
                      {m.role !== "owner" && (
                        <button className="btn ghost small" aria-label={t("remove")} onClick={() => run(async () => { await removeMember(m.user_id); await load(); })}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {msg && <p className="bad-text small">{msg}</p>}
    </div>
  );
}
