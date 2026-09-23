import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet,
  NotebookPen,
  ListChecks,
  Settings as SettingsIcon,
  Database,
  Info,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/kit";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/more/")({
  head: () => ({
    meta: [
      { title: "More — Traders Fundamentals Tools" },
      {
        name: "description",
        content:
          "Manage accounts, strategy templates, checklist, backup and import, settings and app info.",
      },
      { property: "og:title", content: "More — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "Accounts, strategies, backup, settings and disclaimer.",
      },
    ],
  }),
  component: MoreIndex,
});

function Row({
  to,
  label,
  hint,
  Icon,
}: {
  to: string;
  label: string;
  hint?: string;
  Icon: typeof Wallet;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{label}</span>
        {hint ? (
          <span className="block truncate text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function MoreIndex() {
  const db = useDB();
  const done = db.checklist.filter((c) => c.checked).length;

  return (
    <div className="space-y-4 pt-3">
      <PageHeader title="More" subtitle="Accounts, data and settings" />

      <Card className="bg-primary text-primary-foreground">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[11px] opacity-80">Accounts</div>
            <div className="font-mono text-lg font-bold">{db.accounts.length}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-80">Trades</div>
            <div className="font-mono text-lg font-bold">{db.trades.length}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-80">Strategies</div>
            <div className="font-mono text-lg font-bold">{db.strategies.length}</div>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Row
          to="/more/accounts"
          label="Accounts"
          hint="Balances, currency and default risk"
          Icon={Wallet}
        />
        <Row
          to="/more/strategies"
          label="Strategy templates"
          hint="Reusable entry, stop and target rules"
          Icon={NotebookPen}
        />
        <Row
          to="/checklist"
          label="Pre-trade checklist"
          hint={`${done}/${db.checklist.length} checked`}
          Icon={ListChecks}
        />
        <Row to="/stats" label="Statistics" hint="Performance review" Icon={BarChart3} />
        <Row
          to="/more/data"
          label="Backup & export"
          hint="JSON backup, import and CSV export"
          Icon={Database}
        />
        <Row
          to="/more/settings"
          label="Settings"
          hint="Theme, currency, default risk"
          Icon={SettingsIcon}
        />
        <Row to="/more/about" label="About & disclaimer" hint="Offline app, no advice" Icon={Info} />
      </div>
    </div>
  );
}
