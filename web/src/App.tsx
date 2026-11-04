import { useState } from "react";
import { dueItems, levelFromXp, liveStreak } from "./engine/progress";
import { Exam } from "./screens/Exam";
import { Home } from "./screens/Home";
import { Player, type Session } from "./screens/Player";
import { Profile } from "./screens/Profile";
import { Review } from "./screens/Review";
import { useStore } from "./store";

type Tab = "home" | "review" | "exam" | "profile";

export function App() {
  const { progress, t } = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [session, setSession] = useState<Session | null>(null);
  const now = Date.now();
  const due = dueItems(progress, now).length;

  if (session) {
    return (
      <main className="app">
        <Player session={session} onExit={() => setSession(null)} />
      </main>
    );
  }

  const tabs: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: "home", icon: "🏠", label: t("home") },
    { id: "review", icon: "🔁", label: t("review"), badge: due },
    { id: "exam", icon: "📝", label: t("exam") },
    { id: "profile", icon: "👤", label: t("profile") },
  ];

  return (
    <main className="app">
      <header className="topbar">
        <div className="logo">AI QUEST</div>
        <div className="row gap small">
          <span title={t("streak")}>🔥 {liveStreak(progress, now)}</span>
          <span title={t("level")}>⭐ {levelFromXp(progress.xp).level}</span>
          <span title={t("xp")}>💎 {progress.xp}</span>
        </div>
      </header>
      {tab === "home" && <Home onStart={setSession} />}
      {tab === "review" && <Review onStart={setSession} />}
      {tab === "exam" && <Exam onStart={setSession} />}
      {tab === "profile" && <Profile />}
      <nav className="tabbar">
        {tabs.map((x) => (
          <button key={x.id} className={tab === x.id ? "active" : ""} onClick={() => setTab(x.id)} aria-current={tab === x.id}>
            <span className="tab-icon">{x.icon}{x.badge ? <span className="dot">{x.badge}</span> : null}</span>
            <span className="small">{x.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
