import { cn } from "@/lib/utils";
import { fmtDate, fmtNum, fmtSigned } from "@/lib/format";
import { tradeResult } from "@/lib/calc";
import type { Trade } from "@/lib/types";

export function TradeCard({
  trade,
  currency,
  precision,
  onClick,
}: {
  trade: Trade;
  currency: string;
  precision: number;
  onClick?: () => void;
}) {
  const res = tradeResult(trade);
  const tone = !res ? "" : res.net > 0 ? "text-profit" : res.net < 0 ? "text-loss" : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-colors hover:bg-muted/40"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-bold">{trade.instrument || "Untitled"}</span>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white",
                trade.direction === "LONG" ? "bg-profit" : "bg-loss",
              )}
            >
              {trade.direction}
            </span>
          </div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {fmtNum(trade.entry, precision)} → {trade.exitPrice !== null ? fmtNum(trade.exitPrice, precision) : "open"}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("font-mono text-sm font-bold", tone)}>
            {res ? fmtSigned(res.net, currency, precision) : "—"}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {res ? `${fmtNum(res.r, 2)}R` : trade.status}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{fmtDate(trade.exitDate || trade.entryDate)}</span>
        <span>{trade.status}</span>
      </div>
    </button>
  );
}
