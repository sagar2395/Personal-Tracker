import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-600",
    ghost: "hover:bg-slate-800 active:bg-slate-700 text-slate-300",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    outline: "border border-slate-700 text-slate-300 hover:bg-slate-800 active:bg-slate-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
    warn: "bg-amber-500 text-slate-900 hover:bg-amber-600 active:bg-amber-700",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10",
  },
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 touch-manipulation select-none",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
