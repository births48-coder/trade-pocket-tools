import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, DirectionToggle, Field, NumInput, Stat } from "@/components/kit";
import { PageHeader } from "@/components/PageHeader";
import { useDB } from "@/lib/store";
import {
  averageEntry,
  breakeven,
  div,
  grossPnl,
  num,
  partialExits,
  pctChange,
  positionSize,
  riskAmount,
  riskReward,
  safe,
  stopDistance,
  stopFromPct,
  tpFromRR,
} from "@/lib/calc";
import { fmtMoney, fmtNum, fmtPct } from "@/lib/format";
import type { Direction } from "@/lib/types";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Calculators — Traders Fundamentals Tools" },
      {
        name: "description",
        content:
          "Position size, risk, risk/reward, profit/loss, breakeven, averaging and partial exit calculators.",
      },
      { property: "og:title", content: "Calculators — Traders Fundamentals Tools" },
      { property: "og:description", content: "Eight offline trading calculators in your pocket." },
    ],
  }),
  component: Tools,
});

function ToolCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Card className="scroll-mt-4 space-y-3">
      <h2 id={id} className="text-sm font-bold">
        {title}
      </h2>
      {children}
    </Card>
  );
}

function Tools() {
  const db = useDB();
  const p = db.settings.precision;
  const account =
    db.accounts.find((a) => a.id === db.settings.defaultAccountId) ?? db.accounts[0] ?? null;
  const cur = account?.currency ?? db.settings.defaultCurrency;

  return (
    <div className="space-y-4 pt-3">
      <PageHeader title="Calculators" subtitle="Everything offline, nothing tracked" />
      <PositionSize currency={cur} precision={p} balance={account?.currentBalance ?? 0} />
      <RiskTool currency={cur} precision={p} />
      <RRTool precision={p} />
      <PnlTool currency={cur} precision={p} />
      <BreakevenTool currency={cur} precision={p} />
      <AverageTool precision={p} />
      <PartialTool currency={cur} precision={p} />
      <PctTool precision={p} />
    </div>
  );
}

function PositionSize({
  currency,
  precision,
  balance,
}: {
  currency: string;
  precision: number;
  balance: number;
}) {
  const [bal, setBal] = useState(String(balance || ""));
  const [risk, setRisk] = useState("1");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [mult, setMult] = useState("1");

  const r = riskAmount(safe(num(bal)), safe(num(risk)));
  const dist = stopDistance(num(entry), num(sl));
  const m = safe(num(mult)) || 1;
  const size = positionSize(r, dist, m);

  return (
    <ToolCard id="position-size" title="Position Size Calculator">
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Balance (${currency})`}>
          <NumInput value={bal} onChange={setBal} />
        </Field>
        <Field label="Risk %">
          <NumInput value={risk} onChange={setRisk} />
        </Field>
        <Field label="Entry">
          <NumInput value={entry} onChange={setEntry} />
        </Field>
        <Field label="Stop Loss">
          <NumInput value={sl} onChange={setSl} />
        </Field>
        <Field label="Multiplier">
          <NumInput value={mult} onChange={setMult} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Risk amount" value={fmtMoney(r, currency, precision)} />
        <Stat label="Stop distance" value={fmtNum(dist, precision)} />
        <Stat label="Position size" value={fmtNum(size, precision)} />
        <Stat label="Position value" value={fmtMoney(safe(num(entry)) * size * m, currency, precision)} tone="muted" />
      </div>
    </ToolCard>
  );
}

function RiskTool({ currency, precision }: { currency: string; precision: number }) {
  const [dir, setDir] = useState<Direction>("LONG");
  const [bal, setBal] = useState("");
  const [risk, setRisk] = useState("1");
  const [entry, setEntry] = useState("");
  const [pct, setPct] = useState("2");

  const amount = riskAmount(safe(num(bal)), safe(num(risk)));
  const stop = stopFromPct(dir, safe(num(entry)), safe(num(pct)));

  return (
    <ToolCard id="risk" title="Risk Calculator">
      <DirectionToggle value={dir} onChange={setDir} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Balance (${currency})`}>
          <NumInput value={bal} onChange={setBal} />
        </Field>
        <Field label="Risk % of account">
          <NumInput value={risk} onChange={setRisk} />
        </Field>
        <Field label="Entry">
          <NumInput value={entry} onChange={setEntry} />
        </Field>
        <Field label="Stop distance %">
          <NumInput value={pct} onChange={setPct} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Risk amount" value={fmtMoney(amount, currency, precision)} tone="loss" />
        <Stat label="Stop price" value={fmtNum(stop, precision)} />
      </div>
    </ToolCard>
  );
}

function RRTool({ precision }: { precision: number }) {
  const [dir, setDir] = useState<Direction>("LONG");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [rr, setRr] = useState("2");

  const { risk, reward, ratio } = riskReward(dir, safe(num(entry)), safe(num(sl)), safe(num(tp)));
  const target = tpFromRR(dir, safe(num(entry)), safe(num(sl)), safe(num(rr)));

  return (
    <ToolCard id="rr" title="Risk / Reward Calculator">
      <DirectionToggle value={dir} onChange={setDir} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Entry">
          <NumInput value={entry} onChange={setEntry} />
        </Field>
        <Field label="Stop Loss">
          <NumInput value={sl} onChange={setSl} />
        </Field>
        <Field label="Take Profit">
          <NumInput value={tp} onChange={setTp} />
        </Field>
        <Field label="Desired R:R">
          <NumInput value={rr} onChange={setRr} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Risk per unit" value={fmtNum(risk, precision)} tone="loss" />
        <Stat label="Reward per unit" value={fmtNum(reward, precision)} tone="profit" />
        <Stat label="Ratio" value={ratio > 0 ? `1 : ${fmtNum(ratio, 2)}` : "—"} />
        <Stat label={`TP for ${fmtNum(safe(num(rr)), 1)}R`} value={fmtNum(target, precision)} />
      </div>
    </ToolCard>
  );
}

function PnlTool({ currency, precision }: { currency: string; precision: number }) {
  const [dir, setDir] = useState<Direction>("LONG");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [size, setSize] = useState("");
  const [mult, setMult] = useState("1");
  const [fees, setFees] = useState("");

  const m = safe(num(mult)) || 1;
  const gross = grossPnl(dir, safe(num(entry)), safe(num(exit)), safe(num(size)), m);
  const net = gross - safe(num(fees));
  const cost = safe(num(entry)) * safe(num(size)) * m;

  return (
    <ToolCard id="pnl" title="Profit / Loss Calculator">
      <DirectionToggle value={dir} onChange={setDir} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Entry">
          <NumInput value={entry} onChange={setEntry} />
        </Field>
        <Field label="Exit">
          <NumInput value={exit} onChange={setExit} />
        </Field>
        <Field label="Size">
          <NumInput value={size} onChange={setSize} />
        </Field>
        <Field label="Multiplier">
          <NumInput value={mult} onChange={setMult} />
        </Field>
        <Field label="Fees">
          <NumInput value={fees} onChange={setFees} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Gross P/L" value={fmtMoney(gross, currency, precision)} tone={gross >= 0 ? "profit" : "loss"} />
        <Stat label="Net P/L" value={fmtMoney(net, currency, precision)} tone={net >= 0 ? "profit" : "loss"} />
        <Stat label="Return %" value={fmtPct(div(net, Math.abs(cost)) * 100, 2)} />
        <Stat label="Position value" value={fmtMoney(cost, currency, precision)} tone="muted" />
      </div>
    </ToolCard>
  );
}

function BreakevenTool({ currency, precision }: { currency: string; precision: number }) {
  const [dir, setDir] = useState<Direction>("LONG");
  const [entry, setEntry] = useState("");
  const [size, setSize] = useState("");
  const [fees, setFees] = useState("");
  const [mult, setMult] = useState("1");

  const be = breakeven(dir, safe(num(entry)), safe(num(size)), safe(num(fees)), safe(num(mult)) || 1);

  return (
    <ToolCard id="breakeven" title="Breakeven Calculator">
      <DirectionToggle value={dir} onChange={setDir} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Entry">
          <NumInput value={entry} onChange={setEntry} />
        </Field>
        <Field label="Size">
          <NumInput value={size} onChange={setSize} />
        </Field>
        <Field label={`Total fees (${currency})`}>
          <NumInput value={fees} onChange={setFees} />
        </Field>
        <Field label="Multiplier">
          <NumInput value={mult} onChange={setMult} />
        </Field>
      </div>
      <Stat label="Breakeven price" value={fmtNum(be, precision)} />
    </ToolCard>
  );
}

function AverageTool({ precision }: { precision: number }) {
  const [rows, setRows] = useState([
    { price: "", qty: "" },
    { price: "", qty: "" },
  ]);
  const res = averageEntry(rows.map((r) => ({ price: safe(num(r.price)), qty: safe(num(r.qty)) })));

  return (
    <ToolCard id="average" title="Average Entry Calculator">
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <Field label={`Price ${i + 1}`}>
              <NumInput
                value={r.price}
                onChange={(v) => setRows((p) => p.map((x, j) => (j === i ? { ...x, price: v } : x)))}
              />
            </Field>
            <Field label={`Quantity ${i + 1}`}>
              <NumInput
                value={r.qty}
                onChange={(v) => setRows((p) => p.map((x, j) => (j === i ? { ...x, qty: v } : x)))}
              />
            </Field>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => setRows((p) => [...p, { price: "", qty: "" }])}>
          Add entry
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRows((p) => (p.length > 2 ? p.slice(0, -1) : p))}
        >
          Remove last
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Total quantity" value={fmtNum(res.totalQty, precision)} />
        <Stat label="Average price" value={fmtNum(res.average, precision)} />
      </div>
    </ToolCard>
  );
}

function PartialTool({ currency, precision }: { currency: string; precision: number }) {
  const [dir, setDir] = useState<Direction>("LONG");
  const [entry, setEntry] = useState("");
  const [size, setSize] = useState("");
  const [mult, setMult] = useState("1");
  const [legs, setLegs] = useState([
    { price: "", pct: "50" },
    { price: "", pct: "50" },
  ]);

  const res = partialExits(
    dir,
    safe(num(entry)),
    safe(num(size)),
    safe(num(mult)) || 1,
    legs.map((l) => ({ price: safe(num(l.price)), pct: safe(num(l.pct)) })),
  );

  return (
    <ToolCard id="partials" title="Partial Exit Calculator">
      <DirectionToggle value={dir} onChange={setDir} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Entry">
          <NumInput value={entry} onChange={setEntry} />
        </Field>
        <Field label="Total size">
          <NumInput value={size} onChange={setSize} />
        </Field>
        <Field label="Multiplier">
          <NumInput value={mult} onChange={setMult} />
        </Field>
      </div>
      {legs.map((l, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <Field label={`Exit ${i + 1} price`}>
            <NumInput
              value={l.price}
              onChange={(v) => setLegs((p) => p.map((x, j) => (j === i ? { ...x, price: v } : x)))}
            />
          </Field>
          <Field label={`Exit ${i + 1} % of size`}>
            <NumInput
              value={l.pct}
              onChange={(v) => setLegs((p) => p.map((x, j) => (j === i ? { ...x, pct: v } : x)))}
            />
          </Field>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => setLegs((p) => [...p, { price: "", pct: "" }])}>
          Add exit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setLegs((p) => (p.length > 1 ? p.slice(0, -1) : p))}>
          Remove last
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Closed quantity" value={fmtNum(res.soldQty, precision)} />
        <Stat label="Remaining" value={fmtNum(res.remaining, precision)} />
        <Stat label="Average exit" value={fmtNum(res.avgExit, precision)} />
        <Stat
          label="Realised P/L"
          value={fmtMoney(res.pnl, currency, precision)}
          tone={res.pnl >= 0 ? "profit" : "loss"}
        />
      </div>
    </ToolCard>
  );
}

function PctTool({ precision }: { precision: number }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const change = pctChange(safe(num(start)), safe(num(end)));

  return (
    <ToolCard id="percent" title="Percentage Change Calculator">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start price">
          <NumInput value={start} onChange={setStart} />
        </Field>
        <Field label="End price">
          <NumInput value={end} onChange={setEnd} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Change" value={fmtNum(safe(num(end)) - safe(num(start)), precision)} />
        <Stat label="Change %" value={fmtPct(change, 2)} tone={change >= 0 ? "profit" : "loss"} />
      </div>
    </ToolCard>
  );
}
