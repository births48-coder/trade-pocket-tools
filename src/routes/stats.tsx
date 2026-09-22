import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, Empty, Segmented, Stat } from "@/components/kit";
import { PageHeader } from "@/components/PageHeader";
import { useDB } from "@/lib/store";
import { stats, tradeResult } from "@/lib/calc";
import { fmtMoney, fmtNum, fmtPct, fmtSigned } from "@/lib/format";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistics — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Win rate, profit factor, average R, streaks and equity curve from your own trades.",
      },
      { property: "og:title", content: "Statistics — Traders Fundamentals Tools" },
      { property: "og:description", content: "Review win rate, profit factor and equity curve." },
    ],
  }),
  component: StatsPage,
});

type Range = "all" | "30" | "7";

function StatsPage() {
  const db = useDB();
  const precision = db.settings.precision;
  const account =
    db.accounts.find((a) => a.id === db.settings.defaultAccountId) ?? db.accounts[0] ?? null;
  const currency = account?.currency ?? db.settings.defaultCurrency;
  const [range, setRange] = useState<Range>("all");

  const trades = useMemo(() => {
    if (range === "all") return db.trades;
    const days = Number(range);
    const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    return db.trades.filter((t) => (t.exitDate || t.entryDate) >= from);
  }, [db.trades, range]);

  const s = stats(trades);

  const curve = useMemo(() => {
    const closed = trades
      .filter((t) => t.status === "Closed" && t.exitPrice !== null)
      .sort((a, b) => (a.exitDate || a.entryDate).localeCompare(b.exitDate || b.entryDate));
    let run = 0;
    return closed.map((t) => {
      run += tradeResult(t)?.net ?? 0;
      return run;
    });
  }, [trades]);

  const maxAbs = Math.max(1, ...curve.map((v) => Math.abs(v)));

  return (
    <div className="space-y-4 pt-3">
      <PageHeader title="Statistics" subtitle={`${s.total} closed trades`} />

      <Segmented<Range>
        value={range}
        onChange={setRange}
        options={[
          { value: "7", label: "7 days" },
          { value: "30", label: "30 days" },
          { value: "all", label: "All time" },
        ]}
      />

      {s.total === 0 ? (
        <Empty title="No closed trades" message="Close a trade in your journal to build statistics." />
      ) : (
        <>
          <Card>
            <div className="text-xs text-muted-foreground">Net P/L</div>
            <div
              className={`font-mono text-3xl font-extrabold ${s.netPnl > 0 ? "text-profit" : s.netPnl < 0 ? "text-loss" : ""}`}
            >
              {fmtSigned(s.netPnl, currency, precision)}
            </div>
          </Card>

          <Card className="grid grid-cols-2 gap-2">
            <Stat label="Win rate" value={fmtPct(s.winRate, 1)} />
            <Stat label="Profit factor" value={fmtNum(s.profitFactor, 2)} />
            <Stat label="Wins" value={String(s.wins)} tone="profit" />
            <Stat label="Losses" value={String(s.losses)} tone="loss" />
            <Stat label="Breakeven" value={String(s.evens)} tone="muted" />
            <Stat label="Average R" value={`${fmtNum(s.avgR, 2)}R`} />
            <Stat label="Avg win" value={fmtMoney(s.avgWin, currency, precision)} tone="profit" />
            <Stat label="Avg loss" value={fmtMoney(s.avgLoss, currency, precision)} tone="loss" />
            <Stat label="Largest win" value={fmtMoney(s.largestWin, currency, precision)} tone="profit" />
            <Stat label="Largest loss" value={fmtMoney(s.largestLoss, currency, precision)} tone="loss" />
            <Stat label="Win streak" value={String(s.winStreak)} />
            <Stat label="Loss streak" value={String(s.lossStreak)} />
          </Card>

          <Card>
            <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
              Equity curve
            </div>
            <div className="flex h-28 items-end gap-[3px]">
              {curve.map((v, i) => (
                <div
                  key={i}
                  className={`min-w-[3px] flex-1 rounded-sm ${v >= 0 ? "bg-profit" : "bg-loss"}`}
                  style={{ height: `${Math.max(4, (Math.abs(v) / maxAbs) * 100)}%` }}
                />
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
