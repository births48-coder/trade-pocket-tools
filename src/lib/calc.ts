import type { Direction, Trade } from "./types";

/** Parse any user input into a number; returns NaN when unusable. */
export function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  const s = String(v ?? "").trim().replace(/,/g, ".");
  if (!s) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/** Never let NaN / Infinity reach the UI. */
export function safe(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function div(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return 0;
  return a / b;
}

export function riskAmount(balance: number, riskPct: number): number {
  return safe(balance) * (safe(riskPct) / 100);
}

export function stopDistance(entry: number, stop: number): number {
  return Math.abs(safe(entry) - safe(stop));
}

export function positionSize(risk: number, distance: number, multiplier: number): number {
  return div(safe(risk), safe(distance) * (safe(multiplier) || 1));
}

export function grossPnl(
  direction: Direction,
  entry: number,
  exit: number,
  size: number,
  multiplier: number,
): number {
  const diff = direction === "LONG" ? safe(exit) - safe(entry) : safe(entry) - safe(exit);
  return diff * safe(size) * (safe(multiplier) || 1);
}

export function riskReward(direction: Direction, entry: number, sl: number, tp: number) {
  const risk = direction === "LONG" ? safe(entry) - safe(sl) : safe(sl) - safe(entry);
  const reward = direction === "LONG" ? safe(tp) - safe(entry) : safe(entry) - safe(tp);
  return { risk, reward, ratio: div(reward, risk) };
}

export function stopFromPct(direction: Direction, entry: number, pct: number): number {
  const p = safe(pct) / 100;
  return direction === "LONG" ? safe(entry) * (1 - p) : safe(entry) * (1 + p);
}

export function tpFromRR(direction: Direction, entry: number, sl: number, rr: number): number {
  const dist = stopDistance(entry, sl);
  return direction === "LONG" ? safe(entry) + dist * safe(rr) : safe(entry) - dist * safe(rr);
}

export function breakeven(
  direction: Direction,
  entry: number,
  size: number,
  fees: number,
  multiplier: number,
): number {
  const perUnit = div(safe(fees), safe(size) * (safe(multiplier) || 1));
  return direction === "LONG" ? safe(entry) + perUnit : safe(entry) - perUnit;
}

export function averageEntry(rows: { price: number; qty: number }[]) {
  let value = 0;
  let qty = 0;
  for (const r of rows) {
    const p = safe(r.price);
    const q = safe(r.qty);
    if (q <= 0) continue;
    value += p * q;
    qty += q;
  }
  return { totalQty: qty, totalValue: value, average: div(value, qty) };
}

export function pctChange(start: number, end: number): number {
  return div(safe(end) - safe(start), Math.abs(safe(start))) * 100;
}

export function partialExits(
  direction: Direction,
  entry: number,
  size: number,
  multiplier: number,
  legs: { price: number; pct: number }[],
) {
  let soldQty = 0;
  let soldValue = 0;
  let pnl = 0;
  for (const leg of legs) {
    const qty = safe(size) * (safe(leg.pct) / 100);
    if (qty <= 0) continue;
    soldQty += qty;
    soldValue += qty * safe(leg.price);
    pnl += grossPnl(direction, entry, safe(leg.price), qty, multiplier);
  }
  return {
    soldQty,
    remaining: Math.max(safe(size) - soldQty, 0),
    avgExit: div(soldValue, soldQty),
    pnl,
  };
}

/** Maximum risk in currency for a trade (entry -> stop). */
export function tradeMaxRisk(t: Trade): number {
  return stopDistance(t.entry, t.stopLoss) * safe(t.size) * (safe(t.multiplier) || 1);
}

export function tradeResult(t: Trade) {
  if (t.status !== "Closed" || t.exitPrice === null) return null;
  const gross = grossPnl(t.direction, t.entry, t.exitPrice, t.size, t.multiplier);
  const net = gross - safe(t.fees);
  const cost = safe(t.entry) * safe(t.size) * (safe(t.multiplier) || 1);
  const maxRisk = tradeMaxRisk(t);
  return {
    gross,
    fees: safe(t.fees),
    net,
    returnPct: div(net, Math.abs(cost)) * 100,
    r: div(net, maxRisk),
    outcome: net > 0 ? "Win" : net < 0 ? "Loss" : "Breakeven",
  };
}

export function stats(trades: Trade[]) {
  const closed = trades
    .filter((t) => t.status === "Closed" && t.exitPrice !== null)
    .sort((a, b) => (a.exitDate || a.entryDate).localeCompare(b.exitDate || b.entryDate));
  const results = closed.map((t) => tradeResult(t)!).filter(Boolean);
  const wins = results.filter((r) => r.net > 0);
  const losses = results.filter((r) => r.net < 0);
  const evens = results.filter((r) => r.net === 0);
  const grossWin = wins.reduce((s, r) => s + r.net, 0);
  const grossLoss = Math.abs(losses.reduce((s, r) => s + r.net, 0));

  let winStreak = 0;
  let lossStreak = 0;
  let cw = 0;
  let cl = 0;
  for (const r of results) {
    if (r.net > 0) {
      cw += 1;
      cl = 0;
    } else if (r.net < 0) {
      cl += 1;
      cw = 0;
    } else {
      cw = 0;
      cl = 0;
    }
    winStreak = Math.max(winStreak, cw);
    lossStreak = Math.max(lossStreak, cl);
  }

  return {
    total: results.length,
    wins: wins.length,
    losses: losses.length,
    evens: evens.length,
    winRate: div(wins.length, results.length) * 100,
    netPnl: results.reduce((s, r) => s + r.net, 0),
    avgWin: div(grossWin, wins.length),
    avgLoss: div(-grossLoss, losses.length),
    largestWin: wins.length ? Math.max(...wins.map((r) => r.net)) : 0,
    largestLoss: losses.length ? Math.min(...losses.map((r) => r.net)) : 0,
    avgR: div(
      results.reduce((s, r) => s + r.r, 0),
      results.length,
    ),
    profitFactor: div(grossWin, grossLoss),
    winStreak,
    lossStreak,
  };
}

export function validatePrices(direction: Direction, entry: number, sl: number, tp: number) {
  const msgs: string[] = [];
  if (!Number.isFinite(entry) || entry <= 0) msgs.push("Entry price must be greater than 0.");
  if (Number.isFinite(sl) && sl <= 0) msgs.push("Stop loss must be greater than 0.");
  if (Number.isFinite(entry) && Number.isFinite(sl) && entry > 0 && sl > 0) {
    if (direction === "LONG" && sl >= entry) msgs.push("For a LONG, stop loss should be below entry.");
    if (direction === "SHORT" && sl <= entry) msgs.push("For a SHORT, stop loss should be above entry.");
  }
  if (Number.isFinite(entry) && Number.isFinite(tp) && tp > 0) {
    if (direction === "LONG" && tp <= entry) msgs.push("For a LONG, take profit should be above entry.");
    if (direction === "SHORT" && tp >= entry) msgs.push("For a SHORT, take profit should be below entry.");
  }
  return msgs;
}
