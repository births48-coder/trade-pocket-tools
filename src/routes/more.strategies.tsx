import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, Empty, Field, NumInput, Sheet, TextArea, TextInput } from "@/components/kit";
import { uid, update, useDB } from "@/lib/store";
import { num } from "@/lib/calc";
import type { Strategy } from "@/lib/types";

export const Route = createFileRoute("/more/strategies")({
  head: () => ({
    meta: [
      { title: "Strategy Templates — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Save reusable entry, stop loss and take profit rules with default risk and R:R.",
      },
      { property: "og:title", content: "Strategy Templates — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "Reusable trading rules with default risk and risk/reward.",
      },
    ],
  }),
  component: Strategies;
});

type Draft = Omit<Strategy, "riskPct" | "defaultRR"> & { riskPct: string; defaultRR: string };

function Strategies() {
  const db = useDB();
  const [draft, setDraft] = useState<Draft | null>(null);
  const set = (k: keyof Draft, v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  function blank(): Draft {
    return {
      id: "",
      name: "",
      entryRules: "",
      stopRules: "",
      takeProfitRules: "",
      riskPct: String(db.settings.defaultRiskPct),
      defaultRR: String(db.settings.defaultRR),
      notes: "",
    };
  }

  function save() {
    if (!draft) return;
    const s: Strategy = {
      ...draft,
      id: draft.id || uid(),
      name: draft.name.trim() || "Untitled strategy",
      riskPct: num(draft.riskPct),
      defaultRR: num(draft.defaultRR),
    };
    update((d) => ({
      ...d,
      strategies: d.strategies.some((x) => x.id === s.id)
        ? d.strategies.map((x) => (x.id === s.id ? s : x))
        : [...d.strategies, s],
    }));
    setDraft(null);
  }

  function remove(id: string) {
    if (!window.confirm("Delete this strategy template?")) return;
    update((d) => ({ ...d, strategies: d.strategies.filter((s) => s.id !== id) }));
  }

  return (
    <div className="space-y-4 pt-3">
      <Link to="/more" className="inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> More
      </Link>
      <PageHeader
        title="Strategy templates"
        subtitle="Your rules, ready to reuse"
        action={
          <Button size="sm" onClick={() => setDraft(blank())}>
            Add
          </Button>
        }
      />

      {db.strategies.length === 0 ? (
        <Empty
          title="No templates yet"
          message="Write down your entry, stop and target rules so every trade follows the same plan."
          action={<Button onClick={() => setDraft(blank())}>Add template</Button>}
        />
      ) : (
        <div className="space-y-2">
          {db.strategies.map((s) => (
            <Card key={s.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{s.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    risk {s.riskPct}% · target {s.defaultRR}R
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setDraft({
                        ...s,
                        riskPct: String(s.riskPct),
                        defaultRR: String(s.defaultRR),
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {s.entryRules ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Entry: </span>
                  {s.entryRules}
                </p>
              ) : null}
              {s.stopRules ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Stop: </span>
                  {s.stopRules}
                </p>
              ) : null}
              {s.takeProfitRules ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Target: </span>
                  {s.takeProfitRules}
                </p>
              ) : null}
              {s.notes ? <p className="text-xs text-muted-foreground">{s.notes}</p> : null}
            </Card>
          ))}
        </div>
      )}

      <Sheet
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit template" : "New template"}
      >
        {draft ? (
          <div className="space-y-3">
            <Field label="Name">
              <TextInput
                value={draft.name}
                onChange={(v) => set("name", v)}
                placeholder="Breakout retest"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Risk %">
                <NumInput value={draft.riskPct} onChange={(v) => set("riskPct", v)} />
              </Field>
              <Field label="Default R:R">
                <NumInput value={draft.defaultRR} onChange={(v) => set("defaultRR", v)} />
              </Field>
            </div>
            <Field label="Entry rules">
              <TextArea value={draft.entryRules} onChange={(v) => set("entryRules", v)} />
            </Field>
            <Field label="Stop loss rules">
              <TextArea value={draft.stopRules} onChange={(v) => set("stopRules", v)} />
            </Field>
            <Field label="Take profit rules">
              <TextArea value={draft.takeProfitRules} onChange={(v) => set("takeProfitRules", v)} />
            </Field>
            <Field label="Notes">
              <TextArea value={draft.notes} onChange={(v) => set("notes", v)} rows={2} />
            </Field>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
