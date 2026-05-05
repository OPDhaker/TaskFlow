import * as React from "react";

import { cn } from "../../lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-[1.1rem] border border-white/14 bg-white/6 px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/80 backdrop-blur-md focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
