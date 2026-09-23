import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Download, FileUp, Sheet as SheetIcon, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, SectionTitle } from "@/components/kit";
import { exportBackup, exportTradesCsv } from "@/lib/csv";
import { isValidDB, resetAll, setDB, emptyDB, useDB } from "@/lib/store";
import type { DB } from "@/lib/types";

export const Route = createFileRoute("/more/data")({
  head: () => ({
    meta: [
      { title: "Backup & Export — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Export a JSON backup, import it back, export trades to CSV or reset all data.",
      },
      { property: "og:title", content: "Backup & Export — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "JSON backup, import, CSV export and full reset for your trading data.",
      },
    ],
  }),
  component: DataPage,
});

function DataPage() {
  const db = useDB();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function onFile(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidDB(parsed)) throw new Error("bad");
      if (!window.confirm("Import will replace all current data. Continue?")) return;
      const base = emptyDB();
      setDB({
        ...base,
        ...(parsed as DB),
        settings: { ...base.settings, ...(parsed as DB).settings },
      });
      setMsg({ tone: "ok", text: "Backup imported successfully." });
    } catch {
      setMsg({ tone: "err", text: "That file isn't a valid backup." });
    }
  }

  return (
    <div className="space-y-4 pt-3">
      <Link to="/more" className="inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> More
      </Link>
      <PageHeader title="Backup & export" subtitle="Everything stays on your device" />

      {msg ? (
        <div
          className={
            msg.tone === "ok"
              ? "rounded-xl border border-profit/40 bg-profit/10 p-3 text-xs text-foreground"
              : "rounded-xl border border-loss/40 bg-loss/10 p-3 text-xs text-foreground"
          }
        >
          {msg.text}
        </div>
      ) : null}

      <section>
        <SectionTitle>Export</SectionTitle>
        <Card className="space-y-2">
          <Button className="w-full" onClick={() => exportBackup(db)}>
            <Download className="h-4 w-4" /> Full backup (JSON)
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => exportTradesCsv(db.trades)}
            disabled={db.trades.length === 0}
          >
            <SheetIcon className="h-4 w-4" /> Trades (CSV)
          </Button>
          <p className="text-[11px] text-muted-foreground">
            {db.trades.length} trades · {db.accounts.length} accounts · {db.strategies.length}{" "}
            strategies
          </p>
        </Card>
      </section>

      <section>
        <SectionTitle>Import</SectionTitle>
        <Card className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = "";
            }}
          />
          <Button className="w-full" variant="outline" onClick={() => fileRef.current?.click()}>
            <FileUp className="h-4 w-4" /> Restore from backup file
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Importing replaces all data currently on this device.
          </p>
        </Card>
      </section>

      <section>
        <SectionTitle>Danger zone</SectionTitle>
        <Card className="space-y-2">
          <Button
            className="w-full"
            variant="danger"
            onClick={() => {
              if (!window.confirm("Erase all accounts, trades, strategies and settings?")) return;
              resetAll();
              setMsg({ tone: "ok", text: "All data erased." });
            }}
          >
            <Trash2 className="h-4 w-4" /> Erase all data
          </Button>
        </Card>
      </section>
    </div>
  );
}
