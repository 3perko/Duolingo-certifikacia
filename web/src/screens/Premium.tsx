import { useState } from "react";
import { billingPortal, checkout, devSetPlan } from "../account";
import { useStore } from "../store";

/** Section 12: FREE / PREMIUM / BUSINESS. */
export function Premium({ onBack, onAccount, onTeam }: { onBack: () => void; onAccount: () => void; onTeam: () => void }) {
  const { me, health, refreshAccount, lang, t } = useStore();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go(fn: () => Promise<{ url: string }>) {
    setBusy(true);
    setMsg(null);
    try {
      window.location.href = (await fn()).url;
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  const plans = [
    {
      id: "free",
      title: "FREE",
      price: t("priceFree"),
      features: lang === "sk"
        ? ["Úvodné kapitoly každej cesty a celá cesta AI Fluency", "Dielňa promptov", "Obmedzený počet AI úloh denne", "Sledovanie pokroku a denné opakovanie", "Týždenné výzvy a ligy"]
        : ["Opening chapters of every path and the full AI Fluency path", "Prompt workshop", "Limited AI tasks per day", "Progress tracking and daily review", "Weekly challenges and leagues"],
    },
    {
      id: "premium",
      title: "💎 PREMIUM",
      price: t("pricePremium"),
      features: lang === "sk"
        ? ["Všetky lekcie a certifikácie", "Simulátor certifikačnej skúšky", "Praktické AI simulácie a AI Lab misie", "AI učiteľ a hodnotenie s vyššími limitmi", "AI varianty otázok pri opakovaní"]
        : ["All lessons and certifications", "Certification exam simulator", "Practical AI simulations and AI Lab missions", "AI tutor and grading with higher limits", "AI question variants in review"],
    },
    {
      id: "business",
      title: "🏢 BUSINESS",
      price: t("priceBusiness"),
      features: lang === "sk"
        ? ["Premium pre každého člena tímu", "Prehľad pripravenosti zamestnancov", "Pozývací kód a správa členov"]
        : ["Premium for every team member", "Team readiness dashboard", "Invite code and member management"],
    },
  ];

  return (
    <div className="screen">
      <button className="btn ghost small back" onClick={onBack}>← {t("prev")}</button>
      <section className="card">
        <h2>💎 {t("premium")}</h2>
        {me?.premium && <p className="strong">✅ {t("youArePremium")}</p>}
        {!health?.payments && <p className="muted small">{t("paymentsOff")}</p>}
      </section>
      {plans.map((p) => (
        <section key={p.id} className={`card plan ${p.id === "premium" ? "featured" : ""}`}>
          <div className="row spread">
            <h3>{p.title}</h3>
            <span className="strong">{p.price}</span>
          </div>
          <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
          {p.id === "premium" && !me?.premium && (
            !me ? (
              <button className="btn primary wide" onClick={onAccount}>{t("signInFirst")}</button>
            ) : health?.payments ? (
              <button className="btn primary wide" disabled={busy} onClick={() => go(() => checkout("premium"))}>{t("buyPremium")}</button>
            ) : health?.auth === "dev" ? (
              <button className="btn primary wide" onClick={async () => { await devSetPlan("premium"); await refreshAccount(); }}>{t("devUpgrade")}</button>
            ) : null
          )}
          {p.id === "premium" && me?.plan === "premium" && health?.payments && (
            <button className="btn ghost wide" disabled={busy} onClick={() => go(billingPortal)}>{t("manageSubscription")}</button>
          )}
          {p.id === "premium" && me?.plan === "premium" && !health?.payments && health?.auth === "dev" && (
            <button className="btn ghost wide" onClick={async () => { await devSetPlan("free"); await refreshAccount(); }}>{t("devDowngrade")}</button>
          )}
          {p.id === "business" && <button className="btn ghost wide" onClick={onTeam}>{t("team")}</button>}
        </section>
      ))}
      {msg && <p className="bad-text small">{msg}</p>}
    </div>
  );
}
