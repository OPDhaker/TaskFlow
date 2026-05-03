"use client";

export function UndoRedoBar({ onUndo, onRedo }: { onUndo: () => void; onRedo: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3 rounded-full border border-line bg-panel/95 px-4 py-3 shadow-2xl backdrop-blur">
      <button className="rounded-full border border-line px-4 py-2 text-sm" onClick={onUndo}>
        Undo
      </button>
      <button className="rounded-full border border-line px-4 py-2 text-sm" onClick={onRedo}>
        Redo
      </button>
    </div>
  );
}
