"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function NavDirectionReset() {
  const pathname = usePathname();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      delete document.documentElement.dataset.navDirection;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
