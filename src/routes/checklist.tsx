import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button, Card, TextInput } from "@/components/kit";
import { PageHeader } from "@/components/PageHeader";
import { uid, update, useDB } from "@/lib/store";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Trade Checklist — Traders Fundamentals Tools" },
      {
        name: "description",
        content: "A pre-trade checklist to confirm direction, stop, target and risk before executing.",
      },
      { property: "og:title", content: "Trade Checklist — Traders Fundamentals Tools" },
      { property: "og:description", content: "Confirm your setup before you take the trade." },
    ],
  }),
  component: ChecklistPage,
});

function ChecklistPage() {
  const db = useDB();
  const [label, setLabel] = useState("");

  const done = db.checklist.filter((i) => i.checked).length;

  function toggle(id: string) {
    update((d) => ({
      ...d,
      checklist: d.checklist.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    }));
  }

  return (
    <div className="space-y-4 pt-3">
      <PageHeader title="Trade Checklist" subtitle={`${done} of ${db.checklist.length} confirmed`} />

      <Card className="space-y-1">
        {db.checklist.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.id)}
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
            />
            <span
              className={`min-w-0 flex-1 text-sm ${item.checked ? "text-muted-foreground line-through" : ""}`}
            >
              {item.label}
            </span>
            <button
              type="button"
              onClick={() =>
                update((d) => ({ ...d, checklist: d.checklist.filter((i) => i.id !== item.id) }))
              }
              className="shrink-0 text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </Card>

      <Card className="space-y-2">
        <TextInput value={label} onChange={setLabel} placeholder="Add custom checklist item" />
        <Button
          className="w-full"
          onClick={() => {
            if (!label.trim()) return;
            update((d) => ({
              ...d,
              checklist: [...d.checklist, { id: uid(), label: label.trim(), checked: false }],
            }));
            setLabel("");
          }}
        >
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          update((d) => ({ ...d, checklist: d.checklist.map((i) => ({ ...i, checked: false })) }))
        }
      >
        <RotateCcw className="h-4 w-4" /> Reset all
      </Button>
    </div>
  );
}
