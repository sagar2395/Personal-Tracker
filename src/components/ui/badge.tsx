import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-slate-800 text-slate-300",
  build: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
  limit: "bg-amber-900/50 text-amber-400 border-amber-800",
  success: "bg-emerald-900/50 text-emerald-400",
  warn: "bg-amber-900/50 text-amber-400",
  muted: "bg-slate-800/50 text-slate-500",
  streak: "bg-indigo-900/50 text-indigo-400 border-indigo-800",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
