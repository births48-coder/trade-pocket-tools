import type { DB, Trade } from "./types";
import { tradeResult } from "./calc";

export function download(filename: string, content: string, mime: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function cell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEADERS = [
  "Date",
  "Exit Date",
  "Instrument",
  "Direction",
  "Entry",
  "Stop Loss",
  "Take Profit",
  "Exit",
  "Size",
  "Multiplier",
  "Fees",
  "Status",
  "Net P/L",
  "R",
  "Return %",
  "Strategy",
  "Setup",
  "Emotion",
  "Tags",
  "Notes",
];

export function tradesToCsv(trades: Trade[]): string {
  const rows = trades.map((t) => {
    const r = tradeResult(t);
    return [
      t.entryDate,
      t.exitDate,
      t.instrument,
      t.direction,
      t.entry,
      t.stopLoss,
      t.takeProfit,
      t.exitPrice ?? "",
      t.size,
      t.multiplier,
      t.fees,
      t.status,
      r ? r.net.toFixed(2) : "",
      r ? r.r.toFixed(2) : "",
      r ? r.returnPct.toFixed(2) : "",
      t.strategy,
      t.setup,
      t.emotion,
      t.tags.join(" "),
      t.notes,
    ].map(cell).join(",");
  });
  return [HEADERS.join(","), ...rows].join("\n");
}

export function exportTradesCsv(trades: Trade[]) {
  download(`tft-trades-${new Date().toISOString().slice(0, 10)}.csv`, tradesToCsv(trades), "text/csv");
}

export function exportBackup(db: DB) {
  download(
    `tft-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(db, null, 2),
    "application/json",
  );
}
