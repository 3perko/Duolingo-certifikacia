import { ITEMS } from "../content";
import { labAllowed } from "../entitlements";
import { useStore } from "../store";
import type { Item } from "../types";
import type { Session } from "./Player";

const GROUPS: { kind: Item["kind"]; icon: string; key: "labAgents" | "labSims" | "labPrompts" }[] = [
  { kind: "agent", icon: "🤖", key: "labAgents" },
  { kind: "simulation", icon: "🧪", key: "labSims" },
  { kind: "prompt", icon: "✍️", key: "labPrompts" },
];

/** Section 15 of the proposal: AI LAB MODE – free practice with every practical task, across tracks. */
export function Lab({ onStart, onPremium }: { onStart: (s: Session) => void; onPremium: () => void }) {
  const { progress, ent, lang, qLang, t } = useStore();

  const title = (i: Item) => (i.kind === "agent" ? i.mission[qLang].split(".")[0] : i.concept[qLang]);

  return (
    <div className="screen">
      <section className="card">
        <h2>🧪 {t("labTitle")}</h2>
        <p className="muted">{t("labIntro")}</p>
      </section>
      {GROUPS.map((g) => (
        <section key={g.kind} className="card">
          <h3>{g.icon} {t(g.key)}</h3>
          <ul className="lessons">
            {ITEMS.filter((i) => i.kind === g.kind).map((i) => {
              const card = progress.cards[i.id];
              const free = g.kind === "prompt";
              const allowed = free || labAllowed(ent);
              return (
                <li key={i.id}>
                  <button
                    className={`lesson ${card?.lastCorrect ? "done" : ""}`}
                    onClick={() =>
                      allowed ? onStart({ kind: "lab", title: i.concept, itemIds: [i.id] }) : onPremium()
                    }
                  >
                    <span>{card?.lastCorrect ? "✅" : allowed ? "▶️" : "💎"}</span>
                    <span className="grow">{title(i)}</span>
                    <span className="muted small">{i.concept[lang] === title(i) ? "" : i.concept[lang]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
