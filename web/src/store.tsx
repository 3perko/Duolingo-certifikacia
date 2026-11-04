import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Progress, emptyProgress, langs } from "./engine/progress";
import type { Lang } from "./types";
import { type StringKey, tr } from "./i18n";

const KEY = "ai-quest-progress-v1";

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Progress;
      if (parsed.version === 1) return { ...emptyProgress(), ...parsed, settings: { ...emptyProgress().settings, ...parsed.settings } };
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return emptyProgress();
}

interface Store {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  reset: () => void;
  /** Language for UI and explanations. */
  lang: Lang;
  /** Language for questions and options. */
  qLang: Lang;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* ignore quota / private mode */
    }
  }, [progress]);

  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  const reset = useCallback(() => setProgress(emptyProgress()), []);

  const value = useMemo<Store>(() => {
    const { explain, question } = langs(progress.settings.mode);
    return { progress, update, reset, lang: explain, qLang: question, t: (k, v) => tr(explain, k, v) };
  }, [progress, update, reset]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
