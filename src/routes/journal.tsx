import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, Download, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  DirectionToggle,
  Empty,
  Field,
  NumInput,
  Segmented,
  Select,
  Sheet,
  TextArea,
  TextInput,
} from "@/components/kit";
import { PageHeader } from "@/components/PageHeader";
import { TradeCard } from "@/components/TradeCard";
import { uid, update, useDB } from "@/lib/store";
import { num, safe, tradeResult } from "@/lib/calc";
import { fmtDate, fmtNum, fmtSigned, todayISO } from "@/lib/format";
import { exportTradesCsv } from "@/lib/csv";
import type { Direction, Trade } from "@/lib/types";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Trading Journal — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Log, edit and close your trades offline with notes, tags, emotions and results.",
      },
      { property: "og:title", content: "Trading Journal — Traders Fundamentals Tools" },
      { property: "og:description", content: "Log, edit and review every trade you take." },
    ],
  }),
  component: Journal,
});

type Filter = "all" | "open" | "closed";

function blankTrade(accountId: string): Trade {
  return {
    id: uid(),
    instrument: "",
    accountId,
    direction: "LONG",
    entry: 0,
    stopLoss: 0,
    takeProfit: 0,
    size: 0,
    multiplier: 1,
    entryDate: todayISO(),
    exitPrice: null,
    exitDate: "",
    fees: 0,
    strategy: "",
    setup: "",
    emotion: "",
    notes: "",
    tags: [],
    status: "Open",
  };
}

function Journal() {
  const db = useDB();
  const precision = db.settings.precision;
  const account =
    db.accounts.find((a) => a.id === db.settings.defaultAccountId) ?? db.accounts[0] ?? null;
  const currency = account?.currency ?? db.settings.defaultCurrency;

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Trade | null>(null);
  const [isNew, setIsNew] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.trades
      .filter((t) => (filter === "all" ? true : filter === "open" ? t.status === "Open" : t.status === "Closed"))
      .filter((t) =>
        !q
          ? true
          : [t.instrument, t.strategy, t.setup, t.emotion, t.notes, t.tags.join(" ")]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => (b.exitDate || b.entryDate).localeCompare(a.exitDate || a.entryDate));
  }, [db.trades, filter, query]);

  function openNew() {
    setEditing(blankTrade(account?.id ?? ""));
    setIsNew(true);
  }

  function save(t: Trade) {
    update((d) => ({
      ...d,
      trades: isNew ? [t, ...d.trades] : d.trades.map((x) => (x.id === t.id ? t : x)),
    }));
    setEditing(null);
    setIsNew(false);
  }

  function remove(id: string) {
    update((d) => ({ ...d, trades: d.trades.filter((t) => t.id !== id) }));
    setEditing(null);
  }

  return (
    <div className="space-y-4 pt-3">
      <PageHeader
        title="Journal"
        subtitle={`${db.trades.length} trades logged`}
        action={
          <Link
            to="/stats"
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
          >
            <BarChart3 className="h-4 w-4" /> Stats
          </Link>
        }
      />

      <div className="space-y-2">
        <TextInput value={query} onChange={setQuery} placeholder="Search instrument, tag, note…" />
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add trade
        </Button>
        <Button variant="outline" onClick={() => exportTradesCsv(list)}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {list.length === 0 ? (
        <Empty
          title="No trades found"
          message="Add a trade manually or plan one in the Trade Planner."
          action={<Button onClick={openNew}>Add trade</Button>}
        />
      ) : (
        <div className="space-y-2">
          {list.map((t) => (
            <TradeCard
              key={t.id}
              trade={t}
              currency={currency}
              precision={precision}
              onClick={() => {
                setEditing(t);
                setIsNew(false);
              }}
            />
          ))}
        </div>
      )}

      {editing ? (
        <TradeEditor
          key={editing.id}
          trade={editing}
          accounts={db.accounts.map((a) => ({ value: a.id, label: a.name }))}
          strategies={db.strategies.map((s) => s.name)}
          precision={precision}
          currency={currency}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSave={save}
          onDelete={remove}
        />
      ) : null}
    </div>
  );
}

function TradeEditor({
  trade,
  accounts,
  strategies,
  precision,
  currency,
  isNew,
  onClose,
  onSave,
  onDelete,
}: {
  trade: Trade;
  accounts: { value: string; label: string }[];
  strategies: string[];
  precision: number;
  currency: string;
  isNew: boolean;
  onClose: () => void;
  onSave: (t: Trade) => void;
  onDelete: (id: string) => void;
}) {
  const [f, setF] = useState(() => ({
    instrument: trade.instrument,
    accountId: trade.accountId,
    direction: trade.direction as Direction,
    entry: String(trade.entry || ""),
    stopLoss: String(trade.stopLoss || ""),
    takeProfit: String(trade.takeProfit || ""),
    size: String(trade.size || ""),
    multiplier: String(trade.multiplier || 1),
    entryDate: trade.entryDate || todayISO(),
    exitPrice: trade.exitPrice === null ? "" : String(trade.exitPrice),
    exitDate: trade.exitDate,
    fees: String(trade.fees || ""),
    strategy: trade.strategy,
    setup: trade.setup,
    emotion: trade.emotion,
    notes: trade.notes,
    tags: trade.tags.join(", "),
  }));

  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  function build(close: boolean): Trade {
    const exit = num(f.exitPrice);
    const closing = close || (Number.isFinite(exit) && f.exitPrice !== "");
    return {
      ...trade,
      instrument: f.instrument || "Untitled",
      accountId: f.accountId,
      direction: f.direction,
      entry: safe(num(f.entry)),
      stopLoss: safe(num(f.stopLoss)),
      takeProfit: safe(num(f.takeProfit)),
      size: safe(num(f.size)),
      multiplier: safe(num(f.multiplier)) || 1,
      entryDate: f.entryDate || todayISO(),
      exitPrice: closing ? safe(exit) : null,
      exitDate: closing ? f.exitDate || todayISO() : "",
      fees: safe(num(f.fees)),
      strategy: f.strategy,
      setup: f.setup,
      emotion: f.emotion,
      notes: f.notes,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: closing ? "Closed" : "Open",
    };
  }

  const preview = tradeResult(build(false));

  return (
    <Sheet open onClose={onClose} title={isNew ? "Add trade" : "Edit trade"}>
      <div className="space-y-3">
        <DirectionToggle value={f.direction} onChange={(v) => setF((p) => ({ ...p, direction: v }))} />
        <Field label="Instrument">
          <TextInput value={f.instrument} onChange={set("instrument")} placeholder="e.g. XAUUSD" />
        </Field>
        {accounts.length > 0 ? (
          <Field label="Account">
            <Select
              value={f.accountId}
              onChange={set("accountId")}
              options={[{ value: "", label: "Unassigned" }, ...accounts]}
            />
          </Field>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Entry">
            <NumInput value={f.entry} onChange={set("entry")} />
          </Field>
          <Field label="Stop Loss">
            <NumInput value={f.stopLoss} onChange={set("stopLoss")} />
          </Field>
          <Field label="Take Profit">
            <NumInput value={f.takeProfit} onChange={set("takeProfit")} />
          </Field>
          <Field label="Size">
            <NumInput value={f.size} onChange={set("size")} />
          </Field>
          <Field label="Multiplier">
            <NumInput value={f.multiplier} onChange={set("multiplier")} />
          </Field>
          <Field label="Fees">
            <NumInput value={f.fees} onChange={set("fees")} />
          </Field>
          <Field label="Entry date">
            <TextInput value={f.entryDate} onChange={set("entryDate")} type="date" />
          </Field>
          <Field label="Exit date">
            <TextInput value={f.exitDate} onChange={set("exitDate")} type="date" />
          </Field>
        </div>
        <Field label="Exit price" hint="Fill this to close the trade">
          <NumInput value={f.exitPrice} onChange={set("exitPrice")} />
        </Field>
        <Field label="Strategy">
          {strategies.length ? (
            <Select
              value={f.strategy}
              onChange={set("strategy")}
              options={[{ value: "", label: "None" }, ...strategies.map((s) => ({ value: s, label: s }))]}
            />
          ) : (
            <TextInput value={f.strategy} onChange={set("strategy")} placeholder="e.g. Breakout" />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Setup">
            <TextInput value={f.setup} onChange={set("setup")} placeholder="e.g. Pullback" />
          </Field>
          <Field label="Emotion">
            <TextInput value={f.emotion} onChange={set("emotion")} placeholder="e.g. Calm" />
          </Field>
        </div>
        <Field label="Tags" hint="Comma separated">
          <TextInput value={f.tags} onChange={set("tags")} placeholder="london, news" />
        </Field>
        <Field label="Notes">
          <TextArea value={f.notes} onChange={set("notes")} rows={3} />
        </Field>

        {preview ? (
          <div className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Result: </span>
            <span className="font-mono font-semibold">
              {fmtSigned(preview.net, currency, precision)} · {fmtNum(preview.r, 2)}R
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onSave(build(false))}>
            Save
          </Button>
          <Button variant="profit" onClick={() => onSave(build(true))}>
            Save &amp; close trade
          </Button>
        </div>
        {!isNew ? (
          <>
            <Button variant="danger" className="w-full" onClick={() => onDelete(trade.id)}>
              <Trash2 className="h-4 w-4" /> Delete trade
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Created {fmtDate(trade.entryDate)}
            </p>
          </>
        ) : null}
      </div>
    </Sheet>
  );
}
