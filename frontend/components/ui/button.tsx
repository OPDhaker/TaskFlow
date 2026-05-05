import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium tracking-[-0.01em] transition-[background-color,color,border-color,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-[linear-gradient(180deg,hsl(var(--primary-container)),hsl(var(--primary)))] text-primary-foreground shadow-[0_18px_44px_-20px_hsl(var(--primary)/0.55)] hover:-translate-y-0.5 hover:shadow-[0_22px_54px_-22px_hsl(var(--primary)/0.62)]",
        secondary: "border-white/10 bg-white/10 text-foreground backdrop-blur-xl hover:bg-white/15",
        outline: "border-white/14 bg-white/6 text-foreground backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/10",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-white/8",
        destructive: "border-slate-500/30 bg-slate-700 text-white hover:-translate-y-0.5 hover:bg-slate-800",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-5",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
