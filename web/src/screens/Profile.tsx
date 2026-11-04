import { CERTIFICATIONS } from "../content/certifications";
import { ACHIEVEMENTS, type StudyMode } from "../engine/progress";
import { useStore } from "../store";

const MODES: StudyMode[] = ["beginner", "advanced", "certification"];
const GOALS = [30, 50, 100, 150];

export function Profile() {
  const { progress, update, reset, lang, t } = useStore();
  const setSettings = (patch: Partial<typeof progress.settings>) => update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));

  return (
    <div className="screen">
      <section className="card">
        <h2>⚙️ {t("settings")}</h2>
        <fieldset className="field">
          <legend className="strong">{t("mode")}</legend>
          {MODES.map((m) => (
            <label key={m} className="radio">
              <input type="radio" name="mode" checked={progress.settings.mode === m} onChange={() => setSettings({ mode: m })} />
              {t(`mode_${m}`)}
            </label>
          ))}
        </fieldset>
        <fieldset className="field">
          <legend className="strong">{t("dailyGoal")}</legend>
          <div className="row gap">
            {GOALS.map((g) => (
              <button key={g} className={`btn small ${progress.settings.dailyGoal === g ? "primary" : "ghost"}`} onClick={() => setSettings({ dailyGoal: g })}>
                {g} XP
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="card">
        <h2>🏅 {t("achievements")}</h2>
        <div className="badges">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} className={`badge ${progress.achievements[a.id] ? "" : "off"}`} title={a.title[lang]}>
              <div className="badge-icon">{a.icon}</div>
              <div className="small">{a.title[lang]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>🎓 {t("certs")}</h2>
        <table className="table">
          <tbody>
            {CERTIFICATIONS.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="strong">{c.name}</div>
                  <div className="muted small">{c.focus[lang]}</div>
                </td>
                <td>{c.priceUsd} USD</td>
                <td className="small">{c.available ? "✅" : t("soon")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted small">{t("partnerNote")}</p>
      </section>

      <section className="card">
        <p className="muted small">{t("about")}</p>
        <button className="btn danger small" onClick={() => window.confirm(t("resetConfirm")) && reset()}>{t("reset")}</button>
      </section>
    </div>
  );
}
