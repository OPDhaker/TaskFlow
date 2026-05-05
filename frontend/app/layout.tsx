import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { NavDirectionReset } from "../components/nav-direction-reset";
import { Toaster } from "../components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskFlow SaaS",
  description: "College OOP task manager demo built with Next.js and C++",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <NavDirectionReset />
        <div className="surface-page">
          <div className="surface-shell">
            <header className="surface-header">
              <h1 className="text-xl font-display font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">TaskFlow</h1>
            </header>
            <div className="surface-main">{children}</div>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
