import { useEffect, useState } from "react";
import { dueItems, levelFromXp, liveStreak } from "./engine/progress";
import { Exam } from "./screens/Exam";
import { Home } from "./screens/Home";
import { Lab } from "./screens/Lab";
import { League } from "./screens/League";
import { Player, type Session } from "./screens/Player";
import { Premium } from "./screens/Premium";
import { Profile } from "./screens/Profile";
import { Review } from "./screens/Review";
import { Team } from "./screens/Team";
import { useStore } from "./store";

type Tab = "home" | "review" | "lab" | "league" | "exam" | "profile" | "premium" | "team";

export function App() {
  const { progress, me, refreshAccount, t } = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const now = Date.now();
  const due = dueItems(progress, now).length;

  // Return from Stripe Checkout (read once, so React StrictMode's double effect run still sees it).
  const [checkoutStatus] = useState(() => new URLSearchParams(window.location.search).get("checkout"));
  useEffect(() => {
    if (!checkoutStatus) return;
    window.history.replaceState(null, "", window.location.pathname);
    if (checkoutStatus === "success") {
      setNotice(t("checkoutSuccess"));
      // Stripe confirms the payment to our server by webhook, which can take a few seconds.
      let tries = 0;
      const poll = async () => {
        await refreshAccount();
        if (++tries < 6) timer = setTimeout(poll, 3000);
      };
      let timer = setTimeout(poll, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutStatus]);

  if (session) {
    return (
      <main className="app">
        <Player session={session} onExit={() => setSession(null)} />
      </main>
    );
  }

  const go = (x: Tab) => () => {
    setTab(x);
    window.scrollTo(0, 0);
  };

  const tabs: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: "home", icon: "🏠", label: t("home") },
    { id: "review", icon: "🔁", label: t("review"), badge: due },
    { id: "lab", icon: "🧪", label: t("lab") },
    { id: "league", icon: "🏆", label: t("league") },
    { id: "exam", icon: "📝", label: t("exam") },
    { id: "profile", icon: "👤", label: t("profile") },
  ];

  return (
    <main className="app">
      <header className="topbar">
        <h1 className="logo">AI QUEST</h1>
        <div className="row gap small">
          <span title={t("streak")}>🔥 {liveStreak(progress, now)}</span>
          <span title={t("level")}>⭐ {levelFromXp(progress.xp).level}</span>
          <span title={t("xp")}>💎 {progress.xp}</span>
          {me?.premium && me.plan !== "free" && <span title="Premium">👑</span>}
        </div>
      </header>
      {notice && (
        <div className="notice" role="status">
          {notice} <button className="btn ghost small" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}
      {tab === "home" && <Home onStart={setSession} onPremium={go("premium")} />}
      {tab === "review" && <Review onStart={setSession} />}
      {tab === "lab" && <Lab onStart={setSession} onPremium={go("premium")} />}
      {tab === "league" && <League onAccount={go("profile")} />}
      {tab === "exam" && <Exam onStart={setSession} onPremium={go("premium")} />}
      {tab === "profile" && <Profile onPremium={go("premium")} onTeam={go("team")} />}
      {tab === "premium" && <Premium onBack={go("profile")} onAccount={go("profile")} onTeam={go("team")} />}
      {tab === "team" && <Team onBack={go("profile")} onAccount={go("profile")} />}
      <nav className="tabbar">
        {tabs.map((x) => (
          <button key={x.id} className={tab === x.id ? "active" : ""} onClick={go(x.id)} aria-current={tab === x.id}>
            <span className="tab-icon">{x.icon}{x.badge ? <span className="dot">{x.badge}</span> : null}</span>
            <span className="tab-label">{x.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
