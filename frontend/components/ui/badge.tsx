import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-cyan-400/24 bg-cyan-500/14 text-cyan-100",
        secondary: "bg-slate-800/70 text-slate-100",
        outline: "border border-white/14 bg-white/5 text-foreground",
        subtle: "border border-cyan-400/18 bg-cyan-500/14 text-cyan-100 backdrop-blur-md",
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
