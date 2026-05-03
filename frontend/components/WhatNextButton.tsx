"use client";

export function WhatNextButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-glow" onClick={onClick}>
      What should I do next?
    </button>
  );
}
