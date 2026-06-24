"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFinanceSnapshot } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

const DEFAULT_ASSET_CLASSES = [
  "Equity",
  "Debt",
  "Gold",
  "Cash",
  "Real Estate",
  "Crypto",
];

interface Allocation {
  assetClass: string;
  targetPercent: string;
  actualAmount: string;
  notes: string;
}

export function FinanceSnapshotForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth);
  const [totalIncome, setTotalIncome] = useState("");
  const [notes, setNotes] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>(
    DEFAULT_ASSET_CLASSES.map((ac) => ({
      assetClass: ac,
      targetPercent: "",
      actualAmount: "",
      notes: "",
    }))
  );

  function updateAllocation(
    index: number,
    field: keyof Allocation,
    value: string
  ) {
    setAllocations((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  function addAllocation() {
    setAllocations((prev) => [
      ...prev,
      { assetClass: "", targetPercent: "", actualAmount: "", notes: "" },
    ]);
  }

  function removeAllocation(index: number) {
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const income = parseFloat(totalIncome);
    if (!month || isNaN(income) || income <= 0) return;

    const validAllocations = allocations
      .filter((a) => a.assetClass && a.targetPercent)
      .map((a) => ({
        assetClass: a.assetClass,
        targetPercent: parseFloat(a.targetPercent) || 0,
        actualAmount: parseFloat(a.actualAmount) || 0,
        notes: a.notes || undefined,
      }));

    startTransition(async () => {
      const result = await createFinanceSnapshot({
        month,
        totalIncome: income,
        notes: notes || undefined,
        allocations: validAllocations,
      });
      if (result.success) {
        router.push("/finance");
        router.refresh();
      }
    });
  }

  const totalTargetPct = allocations.reduce(
    (sum, a) => sum + (parseFloat(a.targetPercent) || 0),
    0
  );
  const totalActual = allocations.reduce(
    (sum, a) => sum + (parseFloat(a.actualAmount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Month & Income */}
      <section className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Month</label>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Total income</label>
          <Input
            type="number"
            value={totalIncome}
            onChange={(e) => setTotalIncome(e.target.value)}
            placeholder="Monthly income..."
            min={0}
          />
        </div>
      </section>

      {/* Allocations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Allocations
          </h2>
          <span className="text-xs text-slate-500">
            Target: {totalTargetPct.toFixed(0)}%
            {totalTargetPct !== 100 && totalTargetPct > 0 && (
              <span className="text-amber-400 ml-1">
                ({totalTargetPct < 100 ? "under" : "over"} 100%)
              </span>
            )}
          </span>
        </div>

        {allocations.map((alloc, i) => (
          <Card key={i} className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={alloc.assetClass}
                onChange={(e) => updateAllocation(i, "assetClass", e.target.value)}
                placeholder="Asset class"
                className="flex-1"
              />
              <button
                onClick={() => removeAllocation(i)}
                className="text-slate-600 hover:text-slate-400 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500">Target %</label>
                <Input
                  type="number"
                  value={alloc.targetPercent}
                  onChange={(e) =>
                    updateAllocation(i, "targetPercent", e.target.value)
                  }
                  placeholder="0"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">
                  Actual amount
                </label>
                <Input
                  type="number"
                  value={alloc.actualAmount}
                  onChange={(e) =>
                    updateAllocation(i, "actualAmount", e.target.value)
                  }
                  placeholder="0"
                  min={0}
                />
              </div>
            </div>
          </Card>
        ))}

        <Button variant="ghost" onClick={addAllocation} className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add asset class
        </Button>
      </section>

      {/* Summary */}
      {totalIncome && parseFloat(totalIncome) > 0 && (
        <Card className="p-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Total allocated</span>
            <span>
              {totalActual.toLocaleString()} /{" "}
              {parseFloat(totalIncome).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-400">Remaining</span>
            <span
              className={
                parseFloat(totalIncome) - totalActual < 0
                  ? "text-amber-400"
                  : "text-emerald-400"
              }
            >
              {(parseFloat(totalIncome) - totalActual).toLocaleString()}
            </span>
          </div>
        </Card>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm text-slate-300">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Monthly notes, observations..."
          rows={3}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={
          !month ||
          !totalIncome ||
          parseFloat(totalIncome) <= 0 ||
          isPending
        }
        className="w-full"
      >
        {isPending ? "Saving..." : "Save snapshot"}
      </Button>
    </div>
  );
}
