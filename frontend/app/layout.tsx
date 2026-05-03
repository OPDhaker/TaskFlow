import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import { NavDirectionReset } from "../components/nav-direction-reset";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskFlow SaaS",
  description: "College OOP task manager demo built with Next.js and C++",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <NavDirectionReset />
          <div className="surface-page">
            <div className="surface-shell">
              <header className="surface-header" style={{ viewTransitionName: "persistent-header" }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default">TaskFlow</Badge>
                      <Badge variant="subtle">Arctic minimalist</Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="eyebrow">Task operations</p>
                      <h1 className="text-xl font-display font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">Structured workspace. Low visual drag.</h1>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/">Dashboard</Link>
                    </Button>
                    <Badge variant="outline">Next + C++</Badge>
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <div className="surface-main">{children}</div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
