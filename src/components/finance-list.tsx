"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteFinanceSnapshot } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Allocation {
  id: number;
  snapshotId: number;
  assetClass: string;
  targetPercent: number;
  actualAmount: number;
  notes: string | null;
}

interface Snapshot {
  id: number;
  month: string;
  totalIncome: number;
  notes: string | null;
  createdAt: string;
}

interface SnapshotWithAllocations {
  snapshot: Snapshot;
  allocations: Allocation[];
}

interface FinanceListProps {
  snapshots: SnapshotWithAllocations[];
}

export function FinanceList({ snapshots }: FinanceListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<number | null>(
    snapshots.length > 0 ? snapshots[0].snapshot.id : null
  );

  function handleDelete(snapshotId: number) {
    if (!confirm("Delete this snapshot?")) return;
    startTransition(async () => {
      await deleteFinanceSnapshot(snapshotId);
      router.refresh();
    });
  }

  if (snapshots.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-400 mb-1">No finance snapshots yet</p>
        <p className="text-sm text-slate-500">
          Create your first monthly snapshot to start tracking allocations.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {snapshots.map(({ snapshot, allocations }) => {
        const isExpanded = expanded === snapshot.id;
        const totalAllocated = allocations.reduce(
          (sum, a) => sum + a.actualAmount,
          0
        );
        const totalTargetPct = allocations.reduce(
          (sum, a) => sum + a.targetPercent,
          0
        );

        return (
          <Card key={snapshot.id} className="overflow-hidden">
            <button
              onClick={() =>
                setExpanded(isExpanded ? null : snapshot.id)
              }
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-medium">{snapshot.month}</p>
                <p className="text-xs text-slate-500">
                  Income: {snapshot.totalIncome.toLocaleString()} | Allocated:{" "}
                  {totalAllocated.toLocaleString()}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
                {allocations.length > 0 && (
                  <div className="space-y-2">
                    {allocations.map((alloc) => {
                      const targetAmount =
                        (alloc.targetPercent / 100) * snapshot.totalIncome;
                      const delta = alloc.actualAmount - targetAmount;
                      return (
                        <div
                          key={alloc.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span>{alloc.assetClass}</span>
                            <span className="text-xs text-slate-500">
                              ({alloc.targetPercent}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>
                              {alloc.actualAmount.toLocaleString()}
                            </span>
                            <Badge
                              variant={delta >= 0 ? "build" : "limit"}
                              className="text-[9px]"
                            >
                              {delta >= 0 ? "+" : ""}
                              {delta.toLocaleString()}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Remaining</span>
                  <span
                    className={cn(
                      snapshot.totalIncome - totalAllocated < 0
                        ? "text-amber-400"
                        : "text-emerald-400"
                    )}
                  >
                    {(
                      snapshot.totalIncome - totalAllocated
                    ).toLocaleString()}
                  </span>
                </div>

                {snapshot.notes && (
                  <p className="text-xs text-slate-500">{snapshot.notes}</p>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(snapshot.id)}
                  disabled={isPending}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
