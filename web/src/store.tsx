import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ApiError,
  type Health,
  type Me,
  getHealth,
  getMe,
  getRemoteProgress,
  isSignedIn,
  putRemoteProgress,
  signOut as clearSession,
} from "./account";
import { getTrack } from "./content";
import { type Entitlements, OPEN } from "./entitlements";
import { type Progress, emptyProgress, langs, migrate, setDeviceId } from "./engine/progress";
import { buildSummary, mergeProgress } from "./engine/sync";
import { type StringKey, tr } from "./i18n";
import type { Lang, Track } from "./types";

const KEY = "ai-quest-progress-v1";
const SYNC_KEY = "ai-quest-sync-base";
const SYNC_DELAY_MS = 2500;

/** A random id per installation, used by the per-device counters in progress. */
(function initDevice() {
  try {
    let id = localStorage.getItem("ai-quest-device");
    if (!id) {
      id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem("ai-quest-device", id);
    }
    setDeviceId(id);
  } catch {
    setDeviceId("local");
  }
})();

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return emptyProgress();
}

const readBase = () => {
  try {
    return Number(localStorage.getItem(SYNC_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
};
const writeBase = (v: number) => {
  try {
    localStorage.setItem(SYNC_KEY, String(v));
  } catch {
    /* ignore */
  }
};

export type SyncState = "off" | "syncing" | "synced" | "error";

interface Store {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  reset: () => void;
  /** The learning track (certification package) the learner is following. */
  track: Track;
  ent: Entitlements;
  health: Health | null;
  me: Me | null;
  sync: SyncState;
  /** Call after signing in/out or after a plan change. */
  refreshAccount: () => Promise<void>;
  signOut: () => void;
  /** Language for UI and explanations. */
  lang: Lang;
  /** Language for questions and options. */
  qLang: Lang;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(load);
  const [health, setHealth] = useState<Health | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [sync, setSync] = useState<SyncState>("off");
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushing = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* ignore quota / private mode */
    }
  }, [progress]);

  /** Pushes local progress; on a conflict merges the server copy and retries once. */
  const push = useCallback(async () => {
    if (!isSignedIn() || pushing.current) return;
    pushing.current = true;
    setSync("syncing");
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const p = progressRef.current;
        try {
          const r = await putRemoteProgress(p, buildSummary(p, Date.now()), readBase());
          writeBase(r.updated_at);
          setSync("synced");
          return;
        } catch (e) {
          if (e instanceof ApiError && e.status === 409 && e.detail && typeof e.detail === "object") {
            const d = e.detail as { data: Progress; updated_at: number };
            const merged = mergeProgress(progressRef.current, d.data);
            progressRef.current = merged;
            setProgress(merged);
            writeBase(d.updated_at);
            continue;
          }
          throw e;
        }
      }
      setSync("error");
    } catch {
      setSync("error");
    } finally {
      pushing.current = false;
    }
  }, []);

  /** Full sync after sign-in: pull, merge, push. */
  const pullAndMerge = useCallback(async () => {
    const remote = await getRemoteProgress();
    if (remote.data) {
      const merged = mergeProgress(progressRef.current, remote.data as Progress);
      progressRef.current = merged;
      setProgress(merged);
    }
    writeBase(remote.updated_at);
    await push();
  }, [push]);

  const refreshAccount = useCallback(async () => {
    try {
      setHealth(await getHealth());
    } catch {
      setHealth(null);
    }
    if (!isSignedIn()) {
      setMe(null);
      setSync("off");
      return;
    }
    try {
      setMe(await getMe());
      await pullAndMerge();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clearSession();
        setMe(null);
        setSync("off");
      } else setSync("error");
    }
  }, [pullAndMerge]);

  useEffect(() => {
    void refreshAccount();
  }, [refreshAccount]);

  // Debounced push whenever progress changes while signed in.
  useEffect(() => {
    if (!me) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void push(), SYNC_DELAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [progress, me, push]);

  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  const reset = useCallback(() => setProgress({ ...emptyProgress(), updatedAt: Date.now() }), []);
  const signOut = useCallback(() => {
    clearSession();
    writeBase(0);
    setMe(null);
    setSync("off");
  }, []);

  const value = useMemo<Store>(() => {
    const { explain, question } = langs(progress.settings.mode);
    const ent: Entitlements = health?.billing ? { billing: true, premium: Boolean(me?.premium) } : OPEN;
    return {
      progress,
      update,
      reset,
      track: getTrack(progress.settings.trackId),
      ent,
      health,
      me,
      sync,
      refreshAccount,
      signOut,
      lang: explain,
      qLang: question,
      t: (k, v) => tr(explain, k, v),
    };
  }, [progress, update, reset, health, me, sync, refreshAccount, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
