import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Field, NumInput, Segmented, Select } from "@/components/kit";
import { CURRENCIES, update, useDB } from "@/lib/store";
import { num } from "@/lib/calc";

export const Route = createFileRoute("/more/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "Theme, default account, currency, default risk, risk/reward and decimals.",
      },
      { property: "og:title", content: "Settings — Traders Fundamentals Tools" },
      {
        property: "og:description",
        content: "Set theme, currency, default risk and decimal precision.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const db = useDB();
  const s = db.settings;
  const patch = (p: Partial<typeof s>) =>
    update((d) => ({ ...d, settings: { ...d.settings, ...p } }));

  return (
    <div className="space-y-4 pt-3">
      <Link to="/more" className="inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> More
      </Link>
      <PageHeader title="Settings" subtitle="Saved on this device" />

      <Card className="space-y-4">
        <Field label="Theme">
          <Segmented
            value={s.theme}
            onChange={(v) => patch({ theme: v })}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </Field>

        <Field label="Default account">
          <Select
            value={s.defaultAccountId}
            onChange={(v) => patch({ defaultAccountId: v })}
            options={[
              { value: "", label: db.accounts.length ? "None selected" : "No accounts yet" },
              ...db.accounts.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
        </Field>

        <Field label="Default currency" hint="Used when no account is selected">
          <Select
            value={s.defaultCurrency}
            onChange={(v) => patch({ defaultCurrency: v })}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Default risk %">
            <NumInput
              value={String(s.defaultRiskPct)}
              onChange={(v) => patch({ defaultRiskPct: num(v) })}
            />
          </Field>
          <Field label="Default R:R">
            <NumInput value={String(s.defaultRR)} onChange={(v) => patch({ defaultRR: num(v) })} />
          </Field>
        </div>

        <Field label="Decimals" hint="Number of decimal places shown">
          <Segmented
            value={String(s.precision)}
            onChange={(v) => patch({ precision: Number(v) })}
            options={[
              { value: "0", label: "0" },
              { value: "2", label: "2" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
            ]}
          />
        </Field>
      </Card>
    </div>
  );
}
