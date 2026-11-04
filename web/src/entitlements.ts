import type { Track } from "./types";

/** What the current user may use. With billing disabled (self-hosted, dev) everything is open. */
export interface Entitlements {
  billing: boolean;
  premium: boolean;
}

export const OPEN: Entitlements = { billing: false, premium: true };

const hasPremium = (e: Entitlements) => !e.billing || e.premium;

export const chapterAllowed = (e: Entitlements, track: Track, chapterIndex: number) => hasPremium(e) || chapterIndex < track.freeChapters;

/** Exam simulator, AI Lab missions and simulations are PREMIUM features (section 12). */
export const examAllowed = (e: Entitlements) => hasPremium(e);
export const labAllowed = (e: Entitlements) => hasPremium(e);
