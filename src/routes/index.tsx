import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Calculator, Scale, Ruler } from "lucide-react";
import { useDB } from "@/lib/store";
import { stats, tradeResult } from "@/lib/calc";
import { fmtMoney, fmtPct, fmtSigned, isToday } from "@/lib/format";
import { Card, Empty, Button, SectionTitle } from "@/components/kit";
import { TradeCard } from "@/components/TradeCard";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Your offline trading dashboard: balance, today's P/L, win rate and recent trades.",
      },
      { property: "og:title", content: "Dashboard — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "Offline trading dashboard with balance, P/L, win rate and recent trades.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const db = useDB();
  const navigate = useNavigate();
  const precision = db.settings.precision;
  const account =
    db.accounts.find((a) => a.id === db.settings.defaultAccountId) ?? db.accounts[0] ?? null;
  const currency = account?.currency ?? db.settings.defaultCurrency;

  const trades = account ? db.trades.filter((t) => t.accountId === account.id) : db.trades;
  const s = stats(trades);
  const todayPnl = trades
    .filter((t) => t.status === "Closed" && isToday(t.exitDate))
    .reduce((sum, t) => sum + (tradeResult(t)?.net ?? 0), 0);

  const recent = [...trades]
    .sort((a, b) => (b.exitDate || b.entryDate).localeCompare(a.exitDate || a.entryDate))
    .slice(0, 5);

  return (
    <div className="space-y-4 pt-3">
      <PageHeader title="Traders Fundamentals Tools" subtitle="Plan · Calculate · Journal · Review" />

      <Card className="bg-primary text-primary-foreground">
        <div className="text-xs opacity-80">{account ? account.name : "No account selected"}</div>
        <div className="mt-1 font-mono text-3xl font-extrabold">
          {fmtMoney(account?.currentBalance ?? 0, currency, precision)}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[11px] opacity-80">Today P/L</div>
            <div className="font-mono text-sm font-bold">{fmtSigned(todayPnl, currency, precision)}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-80">Trades</div>
            <div className="font-mono text-sm font-bold">{trades.length}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-80">Win rate</div>
            <div className="font-mono text-sm font-bold">{s.total ? fmtPct(s.winRate, 0) : "—"}</div>
          </div>
        </div>
        {!account ? (
          <Link
            to="/more/accounts"
            className="mt-3 block rounded-xl bg-white/15 py-2 text-center text-xs font-semibold"
          >
            Create a trading account
          </Link>
        ) : null}
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => navigate({ to: "/plan" })}>
          <Plus className="h-4 w-4" /> New Trade
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/tools", hash: "position-size" })}>
          <Scale className="h-4 w-4" /> Position Size
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/tools", hash: "risk" })}>
          <Calculator className="h-4 w-4" /> Risk
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/tools", hash: "rr" })}>
          <Ruler className="h-4 w-4" /> Risk/Reward
        </Button>
      </div>

      <section>
        <SectionTitle
          action={
            <Link to="/journal" className="text-xs font-semibold text-primary">
              View all
            </Link>
          }
        >
          Recent trades
        </SectionTitle>
        {recent.length === 0 ? (
          <Empty
            title="No trades yet"
            message="Create your first trade to start building your journal."
            action={<Button onClick={() => navigate({ to: "/plan" })}>New Trade</Button>}
          />
        ) : (
          <div className="space-y-2">
            {recent.map((t) => (
              <TradeCard
                key={t.id}
                trade={t}
                currency={currency}
                precision={precision}
                onClick={() => navigate({ to: "/journal" })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
