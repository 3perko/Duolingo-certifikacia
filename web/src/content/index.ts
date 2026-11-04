import type { Chapter, ChoiceItem, ContentMeta, DomainId, Item } from "../types";
import * as ch1 from "./ch1-prompting";
import * as ch2 from "./ch2-evaluation";
import * as ch3 from "./ch3-models";
import * as ch4 from "./ch4-knowledge";
import * as ch5 from "./ch5-workflow";
import * as ch6 from "./ch6-safety";
import * as ch7 from "./ch7-troubleshooting";

const modules = [ch1, ch2, ch3, ch4, ch5, ch6, ch7];

/** Default provenance: original content written against the public exam guide, not yet expert-reviewed. */
const DEFAULT_META: ContentMeta = {
  source: "Claude Certified Associate – Foundations: exam content outline",
  docVersion: "2026-10",
  reviewed: false,
};

export const CHAPTERS: Chapter[] = modules.map((m) => m.chapter);

export const ITEMS: Item[] = modules.flatMap((m) => m.items).map((i) => ({ ...i, meta: i.meta ?? DEFAULT_META }));

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const CHOICE_ITEMS = ITEMS.filter((i): i is ChoiceItem => i.kind === "choice");

export function choiceItemsFor(domain: DomainId): ChoiceItem[] {
  return CHOICE_ITEMS.filter((i) => i.domain === domain);
}

export const BOSS_SIZE = 8;
export const BOSS_PASS = 0.8;
export const bossId = (chapterId: string) => `${chapterId}-boss`;
