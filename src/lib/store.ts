import { useSyncExternalStore } from "react";
import type { DB } from "./types";

const KEY = "tft:v1";

export const DEFAULT_CHECKLIST = [
  "Direction confirmed",
  "Entry defined",
  "Stop Loss defined",
  "Take Profit defined",
  "Risk calculated",
  "Position size calculated",
  "Risk/Reward checked",
  "Setup identified",
  "Trade thesis written",
  "Risk acceptable",
];

export const CURRENCIES = ["USD", "EUR", "GBP", "IDR", "JPY", "AUD", "CAD", "SGD"];

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function emptyDB(): DB {
  return {
    settings: {
      theme: "system",
      defaultAccountId: "",
      defaultCurrency: "USD",
      defaultRiskPct: 1,
      defaultRR: 2,
      precision: 2,
    },
    accounts: [],
    trades: [],
    strategies: [],
    checklist: DEFAULT_CHECKLIST.map((label) => ({ id: uid(), label, checked: false })),
  };
}

let state: DB = emptyDB();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isValidDB(data: unknown): data is DB {
  if (!data || typeof data !== "object") return false;
  const d = data as Partial<DB>;
  return (
    !!d.settings &&
    typeof d.settings === "object" &&
    Array.isArray(d.accounts) &&
    Array.isArray(d.trades) &&
    Array.isArray(d.strategies) &&
    Array.isArray(d.checklist)
  );
}

export function hydrate() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidDB(parsed)) {
        const base = emptyDB();
        state = { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings } };
      }
    }
  } catch {
    /* corrupt data: keep defaults */
  }
  emit();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable */
  }
}

export function setDB(next: DB) {
  state = next;
  persist();
  emit();
}

export function update(fn: (db: DB) => DB) {
  setDB(fn(state));
}

export function getDB() {
  return state;
}

export function useDB(): DB {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function resetAll() {
  setDB(emptyDB());
}
