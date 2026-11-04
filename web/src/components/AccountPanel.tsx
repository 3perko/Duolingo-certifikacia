import { useState } from "react";
import { ApiError, deleteMe, devLogin, patchMe, signInWithPassword, signUpWithPassword, supabaseConfigured } from "../account";
import { useStore } from "../store";

/** Sign-in (Supabase e-mail + password, or dev login) and account settings. */
export function AccountPanel({ onPremium, onTeam }: { onPremium: () => void; onTeam: () => void }) {
  const { health, me, sync, refreshAccount, signOut, t } = useStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!health) {
    return (
      <section className="card">
        <h2>👤 {t("account")}</h2>
        <p className="muted small">{t("offlineMode")}</p>
      </section>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (health!.auth === "supabase") {
        if (mode === "in") await signInWithPassword(email, password);
        else await signUpWithPassword(email, password, name || email.split("@")[0]);
      } else {
        await devLogin(email, name || email.split("@")[0]);
      }
      await refreshAccount();
    } catch (err) {
      setMsg(err instanceof ApiError && err.message === "confirm-email" ? t("confirmEmail") : err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!me) {
    if (health.auth === "none") {
      return (
        <section className="card">
          <h2>👤 {t("account")}</h2>
          <p className="muted small">{t("accountsDisabled")}</p>
        </section>
      );
    }
    const supa = health.auth === "supabase";
    return (
      <section className="card">
        <h2>👤 {t("account")}</h2>
        <p className="muted small">{t("accountWhy")}</p>
        {supa && !supabaseConfigured() && <p className="locked-note small">{t("supabaseMissing")}</p>}
        <form className="form" onSubmit={submit}>
          {(!supa || mode === "up") && (
            <input aria-label={t("nameLabel")} placeholder={t("nameLabel")} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="nickname" />
          )}
          <input type="email" required aria-label="e-mail" placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {supa && (
            <input type="password" required minLength={8} aria-label={t("password")} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          )}
          <button className="btn primary" disabled={busy}>{supa ? (mode === "in" ? t("signIn") : t("signUp")) : t("signIn")}</button>
          {supa && (
            <button type="button" className="btn ghost small" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? t("noAccount") : t("haveAccount")}
            </button>
          )}
          {!supa && <p className="muted small">⚠️ {t("devLoginNote")}</p>}
          {msg && <p className="small bad-text">{msg}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>👤 {t("account")}</h2>
      <div className="row spread">
        <div>
          <div className="strong">{me.name}</div>
          <div className="muted small">{me.email}</div>
        </div>
        <span className="pill small">{me.premium ? "💎 Premium" : "FREE"}</span>
      </div>
      <p className="small">
        {t("syncStatus")}: {sync === "synced" ? "✅" : sync === "syncing" ? "⏳" : sync === "error" ? "⚠️" : "—"} · {t("aiToday")}: {me.ai.used}/{me.ai.limit}
      </p>
      <label className="radio">
        <input
          type="checkbox"
          checked={me.league_opt_in}
          onChange={async (e) => {
            await patchMe({ league_opt_in: e.target.checked });
            await refreshAccount();
          }}
        />
        {t("leagueOptIn")}
      </label>
      <div className="row gap">
        {health.billing && <button className="btn small primary" onClick={onPremium}>💎 {t("premium")}</button>}
        <button className="btn small ghost" onClick={onTeam}>🏢 {t("team")}</button>
        <button className="btn small ghost" onClick={signOut}>{t("signOut")}</button>
        <button
          className="btn small danger"
          onClick={async () => {
            if (!window.confirm(t("deleteAccountConfirm"))) return;
            try {
              await deleteMe();
              signOut();
            } catch (err) {
              setMsg(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          {t("deleteAccount")}
        </button>
      </div>
      {msg && <p className="small bad-text">{msg}</p>}
    </section>
  );
}
