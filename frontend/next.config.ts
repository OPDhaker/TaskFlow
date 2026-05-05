import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfigFactory(phase: string): NextConfig {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    reactStrictMode: true,
    // Keep dev/prod artifacts isolated to prevent recurring chunk 404s
    // when switching between `next dev` and `next build`/`next start`.
    distDir: isDevServer ? ".next-dev" : ".next-prod",
  };
}
