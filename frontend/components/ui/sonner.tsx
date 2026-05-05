"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        className: "border border-white/12 bg-slate-950/95 text-foreground",
      }}
    />
  );
}
