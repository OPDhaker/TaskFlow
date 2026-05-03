import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-cyan-300/70 bg-cyan-100 text-cyan-900 dark:border-cyan-400/24 dark:bg-cyan-500/14 dark:text-cyan-100",
        secondary: "bg-slate-200/90 text-slate-700 dark:bg-slate-800/70 dark:text-slate-100",
        outline: "border border-slate-300/80 bg-white/82 text-foreground dark:border-white/14 dark:bg-white/5",
        subtle: "border border-cyan-200/90 bg-cyan-50 text-slate-700 backdrop-blur-md dark:border-cyan-400/18 dark:bg-cyan-500/14 dark:text-cyan-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
