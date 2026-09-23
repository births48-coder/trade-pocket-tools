import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, Empty, Field, NumInput, Select, Sheet, TextInput } from "@/components/kit";
import { CURRENCIES, uid, update, useDB } from "@/lib/store";
import { num } from "@/lib/calc";
import { fmtMoney } from "@/lib/format";
import type { Account } from "@/lib/types";

export const Route = createFileRoute("/more/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Create and manage trading accounts with balance, currency and default risk.",
      },
      { property: "og:title", content: "Accounts — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "Manage trading account balances, currency and default risk.",
      },
    ],
  }),
  component: Accounts,
});

type Draft = {
  id: string;
  name: string;
  currency: string;
  startingBalance: string;
  currentBalance: string;
  defaultRiskPct: string;
};

function blank(currency: string, risk: number): Draft {
  return {
    id: "",
    name: "",
    currency,
    startingBalance: "",
    currentBalance: "",
    defaultRiskPct: String(risk),
  };
}

function Accounts() {
  const db = useDB();
  const [draft, setDraft] = useState<Draft | null>(null);
  const p = db.settings.precision;

  const set = (k: keyof Draft, v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  function save() {
    if (!draft) return;
    const name = draft.name.trim() || "Trading account";
    const start = num(draft.startingBalance);
    const account: Account = {
      id: draft.id || uid(),
      name,
      currency: draft.currency,
      startingBalance: start,
      currentBalance: draft.currentBalance === "" ? start : num(draft.currentBalance),
      defaultRiskPct: num(draft.defaultRiskPct) || db.settings.defaultRiskPct,
    };
    update((d) => {
      const exists = d.accounts.some((a) => a.id === account.id);
      return {
        ...d,
        accounts: exists
          ? d.accounts.map((a) => (a.id === account.id ? account : a))
          : [...d.accounts, account],
        settings: {
          ...d.settings,
          defaultAccountId: d.settings.defaultAccountId || account.id,
        },
      };
    });
    setDraft(null);
  }

  function remove(id: string) {
    if (!window.confirm("Delete this account? Its trades stay in the journal.")) return;
    update((d) => ({
      ...d,
      accounts: d.accounts.filter((a) => a.id !== id),
      settings: {
        ...d.settings,
        defaultAccountId:
          d.settings.defaultAccountId === id
            ? (d.accounts.find((a) => a.id !== id)?.id ?? "")
            : d.settings.defaultAccountId,
      },
    }));
  }

  function makeDefault(id: string) {
    update((d) => ({ ...d, settings: { ...d.settings, defaultAccountId: id } }));
  }

  return (
    <div className="space-y-4 pt-3">
      <Link to="/more" className="inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> More
      </Link>
      <PageHeader
        title="Accounts"
        subtitle="Used for balance and risk calculations"
        action={
          <Button
            size="sm"
            onClick={() => setDraft(blank(db.settings.defaultCurrency, db.settings.defaultRiskPct))}
          >
            Add
          </Button>
        }
      />

      {db.accounts.length === 0 ? (
        <Empty
          title="No accounts yet"
          message="Add a trading account to track balance, risk and position size."
          action={
            <Button
              onClick={() =>
                setDraft(blank(db.settings.defaultCurrency, db.settings.defaultRiskPct))
              }
            >
              Add account
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {db.accounts.map((a) => {
            const isDefault = db.settings.defaultAccountId === a.id;
            const change = a.currentBalance - a.startingBalance;
            return (
              <Card key={a.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">{a.name}</span>
                      {isDefault ? (
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          DEFAULT
                        </span>
                      ) : null}
                    </div>
                    <div className="font-mono text-xl font-extrabold">
                      {fmtMoney(a.currentBalance, a.currency, p)}
                    </div>
                    <div
                      className={
                        change >= 0
                          ? "font-mono text-xs text-profit"
                          : "font-mono text-xs text-loss"
                      }
                    >
                      {change >= 0 ? "+" : ""}
                      {fmtMoney(change, a.currency, p)} since start · risk {a.defaultRiskPct}%
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isDefault ? (
                    <Button size="sm" variant="outline" onClick={() => makeDefault(a.id)}>
                      <Check className="h-4 w-4" /> Default
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDraft({
                        id: a.id,
                        name: a.name,
                        currency: a.currency,
                        startingBalance: String(a.startingBalance),
                        currentBalance: String(a.currentBalance),
                        defaultRiskPct: String(a.defaultRiskPct),
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit account" : "New account"}
      >
        {draft ? (
          <div className="space-y-3">
            <Field label="Account name">
              <TextInput
                value={draft.name}
                onChange={(v) => set("name", v)}
                placeholder="Main account"
              />
            </Field>
            <Field label="Currency">
              <Select
                value={draft.currency}
                onChange={(v) => set("currency", v)}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starting balance">
                <NumInput
                  value={draft.startingBalance}
                  onChange={(v) => set("startingBalance", v)}
                />
              </Field>
              <Field label="Current balance" hint="Leave empty to match start">
                <NumInput value={draft.currentBalance} onChange={(v) => set("currentBalance", v)} />
              </Field>
            </div>
            <Field label="Default risk %">
              <NumInput value={draft.defaultRiskPct} onChange={(v) => set("defaultRiskPct", v)} />
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
