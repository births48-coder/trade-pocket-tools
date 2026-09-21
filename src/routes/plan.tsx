import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListChecks, Save } from "lucide-react";
import {
  Button,
  Card,
  DirectionToggle,
  Field,
  NumInput,
  Select,
  Stat,
  TextInput,
  Warnings,
} from "@/components/kit";
import { PageHeader } from "@/components/PageHeader";
import { uid, update, useDB } from "@/lib/store";
import {
  num,
  positionSize,
  riskAmount,
  riskReward,
  safe,
  stopDistance,
  validatePrices,
} from "@/lib/calc";
import { fmtMoney, fmtNum, todayISO } from "@/lib/format";
import type { Direction, Trade } from "@/lib/types";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Trade Planner — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Plan LONG and SHORT trades with instant risk, reward and position size figures.",
      },
      { property: "og:title", content: "Trade Planner — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "Plan trades with instant risk, reward and position sizing.",
      },
    ],
  }),
  component: Plan,
});

function Plan() {
  const db = useDB();
  const navigate = useNavigate();
  const precision = db.settings.precision;
  const defaultAccount =
    db.accounts.find((a) => a.id === db.settings.defaultAccountId) ?? db.accounts[0] ?? null;

  const [direction, setDirection] = useState<Direction>("LONG");
  const [instrument, setInstrument] = useState("");
  const [accountId, setAccountId] = useState(defaultAccount?.id ?? "");
  const [balance, setBalance] = useState(String(defaultAccount?.currentBalance ?? ""));
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [riskPct, setRiskPct] = useState(String(db.settings.defaultRiskPct || 1));
  const [size, setSize] = useState("");
  const [mult, setMult] = useState("1");
  const [saved, setSaved] = useState(false);

  const account = db.accounts.find((a) => a.id === accountId) ?? defaultAccount;
  const currency = account?.currency ?? db.settings.defaultCurrency;

  const c = useMemo(() => {
    const e = num(entry);
    const s = num(sl);
    const t = num(tp);
    const bal = safe(num(balance));
    const rp = safe(num(riskPct));
    const m = safe(num(mult)) || 1;
    const risk = riskAmount(bal, rp);
    const slDist = stopDistance(e, s);
    const tpDist = stopDistance(e, t);
    const suggested = positionSize(risk, slDist, m);
    const qty = num(size);
    const usedQty = Number.isFinite(qty) && qty > 0 ? qty : suggested;
    const potentialLoss = slDist * usedQty * m;
    const potentialProfit = tpDist * usedQty * m;
    const { ratio } = riskReward(direction, safe(e), safe(s), safe(t));
    return {
      risk,
      slDist,
      tpDist,
      suggested,
      usedQty,
      potentialLoss,
      potentialProfit,
      ratio: Math.max(ratio, 0),
      positionValue: safe(e) * usedQty * m,
      rMultiple: potentialLoss > 0 ? potentialProfit / potentialLoss : 0,
      warnings: validatePrices(direction, e, s, t),
    };
  }, [entry, sl, tp, balance, riskPct, size, mult, direction]);

  function saveTrade() {
    const trade: Trade = {
      id: uid(),
      instrument: instrument || "Untitled",
      accountId: account?.id ?? "",
      direction,
      entry: safe(num(entry)),
      stopLoss: safe(num(sl)),
      takeProfit: safe(num(tp)),
      size: safe(c.usedQty),
      multiplier: safe(num(mult)) || 1,
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
    update((d) => ({ ...d, trades: [trade, ...d.trades] }));
    setSaved(true);
    setTimeout(() => navigate({ to: "/journal" }), 400);
  }

  return (
    <div className="space-y-4 pt-3 pb-4">
      <PageHeader
        title="Trade Planner"
        subtitle="Risk-first planning"
        action={
          <Link
            to="/checklist"
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
          >
            <ListChecks className="h-4 w-4" /> Checklist
          </Link>
        }
      />

      <Card className="space-y-3">
        <DirectionToggle value={direction} onChange={setDirection} />
        <Field label="Instrument">
          <TextInput value={instrument} onChange={setInstrument} placeholder="e.g. BTCUSD" />
        </Field>
        {db.accounts.length > 0 ? (
          <Field label="Account">
            <Select
              value={account?.id ?? ""}
              onChange={(v) => {
                setAccountId(v);
                const acc = db.accounts.find((a) => a.id === v);
                if (acc) {
                  setBalance(String(acc.currentBalance));
                  setRiskPct(String(acc.defaultRiskPct));
                }
              }}
              options={db.accounts.map((a) => ({ value: a.id, label: a.name }))}
            />
          </Field>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Account Balance (${currency})`}>
            <NumInput value={balance} onChange={setBalance} />
          </Field>
          <Field label="Risk %">
            <NumInput value={riskPct} onChange={setRiskPct} />
          </Field>
          <Field label="Entry Price">
            <NumInput value={entry} onChange={setEntry} />
          </Field>
          <Field label="Stop Loss">
            <NumInput value={sl} onChange={setSl} />
          </Field>
          <Field label="Take Profit">
            <NumInput value={tp} onChange={setTp} />
          </Field>
          <Field label="Contract Multiplier">
            <NumInput value={mult} onChange={setMult} />
          </Field>
        </div>
        <Field label="Position Size" hint={`Suggested: ${fmtNum(c.suggested, precision)}`}>
          <NumInput value={size} onChange={setSize} placeholder={fmtNum(c.suggested, precision)} />
        </Field>
        <Warnings messages={c.warnings} />
      </Card>

      <Card className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Risk Amount" value={fmtMoney(c.risk, currency, precision)} />
          <Stat label="Position Size" value={fmtNum(c.usedQty, precision)} />
          <Stat label="Stop Distance" value={fmtNum(c.slDist, precision)} />
          <Stat label="Target Distance" value={fmtNum(c.tpDist, precision)} />
          <Stat label="Potential Loss" value={fmtMoney(-c.potentialLoss, currency, precision)} tone="loss" />
          <Stat label="Potential Profit" value={fmtMoney(c.potentialProfit, currency, precision)} tone="profit" />
          <Stat label="Risk / Reward" value={c.ratio > 0 ? `1 : ${fmtNum(c.ratio, 2)}` : "—"} />
          <Stat label="R Multiple" value={`${fmtNum(c.rMultiple, 2)}R`} />
        </div>
        <Stat label="Position Value" value={fmtMoney(c.positionValue, currency, precision)} tone="muted" />
      </Card>

      <Button className="w-full" onClick={saveTrade} disabled={saved}>
        <Save className="h-4 w-4" /> {saved ? "Saved to journal" : "Save Trade to Journal"}
      </Button>
    </div>
  );
}
