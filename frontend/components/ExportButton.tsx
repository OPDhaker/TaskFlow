"use client";

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="rounded-full border border-line px-5 py-3 text-sm text-slate-100 transition hover:border-glow hover:text-white" onClick={onClick}>
      Export CSV
    </button>
  );
}
