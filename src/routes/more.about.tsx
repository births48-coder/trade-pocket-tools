import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/kit";

export const Route = createFileRoute("/more/about")({
  head: () => ({
    meta: [
      { title: "About & Disclaimer — Traders Fundamentals Tools" },
      {
        name: "description",
        content:
          "About this offline trading toolbox and its risk disclaimer. Not financial advice.",
      },
      { property: "og:title", content: "About & Disclaimer — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "Offline trading toolbox. Educational use only, not financial advice.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="space-y-4 pt-3">
      <Link to="/more" className="inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> More
      </Link>
      <PageHeader title="About" subtitle="Traders Fundamentals Tools" />

      <Card className="space-y-2 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">A trader&apos;s pocket toolbox</p>
        <p>
          Plan trades, size positions, journal results and review your statistics. Everything runs
          offline and all data is stored on this device only — there is no account, no server and no
          market data feed.
        </p>
      </Card>

      <Card className="space-y-2 border-warning/40 bg-warning/10 text-sm">
        <p className="font-semibold text-foreground">Risk disclaimer</p>
        <p className="text-muted-foreground">
          This app is for education and personal record keeping only. It is not financial, trading
          or investment advice. Calculations are based on the numbers you enter and may not reflect
          your broker&apos;s fees, spreads, swaps or contract specifications — always verify before
          placing a trade.
        </p>
        <p className="text-muted-foreground">
          Trading involves substantial risk of loss. You are solely responsible for your decisions
          and results.
        </p>
      </Card>

      <Card className="space-y-1 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Keep your data safe</p>
        <p>
          Clearing the app storage or uninstalling removes everything. Export a backup regularly
          from Backup &amp; export.
        </p>
      </Card>

      <p className="pb-4 text-center text-[11px] text-muted-foreground">Version 1.0 · Offline</p>
    </div>
  );
}
