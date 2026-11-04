/** Client for accounts, sync, leagues, billing and organisations. */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const AUTH_KEY = "ai-quest-auth";

export interface Health {
  status: string;
  ai: boolean;
  auth: "supabase" | "dev" | "none";
  billing: boolean;
  payments: boolean;
}

export interface Me {
  id: string;
  email: string | null;
  name: string;
  plan: "free" | "premium";
  premium: boolean;
  league_opt_in: boolean;
  league_tier: number;
  org: { id: string; name: string; role: "owner" | "admin" | "member"; plan: string; seats: number; join_code?: string } | null;
  ai: { used: number; limit: number };
}

interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number; // epoch seconds
  provider: "dev" | "supabase";
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: unknown) {
    super(message);
  }
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export const isSignedIn = () => readSession() !== null;
export const signOut = () => writeSession(null);
export const supabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

async function supabaseAuth(path: string, body: unknown): Promise<Session> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new ApiError(503, "Supabase is not configured in the app (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error_description || data.msg || data.message || `HTTP ${res.status}`);
  if (!data.access_token) throw new ApiError(202, "confirm-email");
  const s: Session = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at, provider: "supabase" };
  writeSession(s);
  return s;
}

export const signInWithPassword = (email: string, password: string) => supabaseAuth("token?grant_type=password", { email, password });
export const signUpWithPassword = (email: string, password: string, name: string) =>
  supabaseAuth("signup", { email, password, data: { name } });

async function validToken(): Promise<string | null> {
  const s = readSession();
  if (!s) return null;
  if (s.provider === "supabase" && s.refresh_token && s.expires_at && s.expires_at - 60 < Date.now() / 1000) {
    try {
      return (await supabaseAuth("token?grant_type=refresh_token", { refresh_token: s.refresh_token })).access_token;
    } catch {
      writeSession(null);
      return null;
    }
  }
  return s.access_token;
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await validToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) writeSession(null);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = data?.detail;
    throw new ApiError(res.status, typeof detail === "string" ? detail : `HTTP ${res.status}`, detail);
  }
  return res.json() as Promise<T>;
}

export const getHealth = () => request<Health>("GET", "/api/health");

export async function devLogin(email: string, name: string) {
  const r = await request<{ access_token: string }>("POST", "/api/auth/dev-login", { email, name });
  writeSession({ access_token: r.access_token, provider: "dev" });
}

export const getMe = () => request<Me>("GET", "/api/me");
export const patchMe = (body: { name?: string; league_opt_in?: boolean }) => request<Me>("PATCH", "/api/me", body);
export const deleteMe = () => request<{ deleted: boolean }>("DELETE", "/api/me");

export const getRemoteProgress = () => request<{ data: unknown; updated_at: number }>("GET", "/api/progress");
export const putRemoteProgress = (data: unknown, summary: unknown, base: number) =>
  request<{ updated_at: number }>("PUT", "/api/progress", { data, summary, base_updated_at: base });

export interface LeagueStanding {
  week: string;
  opted_in: boolean;
  tier: number;
  ends_at?: string;
  promote?: number;
  demote?: number;
  members: { rank: number; name: string; xp: number; me: boolean }[];
}
export const getLeague = () => request<LeagueStanding>("GET", "/api/league");

export const checkout = (plan: "premium" | "business", seats?: number) => request<{ url: string }>("POST", "/api/billing/checkout", { plan, seats });
export const billingPortal = () => request<{ url: string }>("POST", "/api/billing/portal");
export const devSetPlan = (plan: "free" | "premium") => request<{ plan: string }>("POST", "/api/dev/plan", { plan });

export interface Dashboard {
  org: { id: string; name: string; plan: string; seats: number; join_code: string };
  members: {
    user_id: string;
    name: string;
    email: string | null;
    role: string;
    xp: number;
    level: number;
    streak: number;
    lessons: number;
    readiness: Record<string, number>;
    last_study_at: number | null;
  }[];
}
export const createOrg = (name: string) => request<{ id: string; join_code: string }>("POST", "/api/orgs", { name });
export const joinOrg = (code: string) => request<{ id: string; name: string }>("POST", "/api/orgs/join", { code });
export const leaveOrg = () => request("POST", "/api/orgs/leave");
export const deleteOrg = () => request("DELETE", "/api/orgs");
export const getDashboard = () => request<Dashboard>("GET", "/api/orgs/dashboard");
export const removeMember = (userId: string) => request("DELETE", `/api/orgs/members/${encodeURIComponent(userId)}`);
