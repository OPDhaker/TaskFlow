export default function LoadingTaskDetail() {
  return (
    <main id="main-content" className="workspace-main">
      <div className="animate-pulse">
        <div className="glass-panel p-8">
          <div className="h-4 w-28 rounded-full bg-muted" />
          <div className="mt-5 h-14 w-3/4 rounded-[1.2rem] bg-muted" />
          <div className="mt-4 h-24 rounded-[1.2rem] bg-muted" />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.72fr)]">
          <div className="glass-panel p-6">
            <div className="h-8 w-40 rounded-full bg-muted" />
            <div className="mt-4 flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 rounded-[1rem] bg-muted" />
              ))}
            </div>
          </div>
          <div className="glass-panel p-6">
            <div className="h-8 w-32 rounded-full bg-muted" />
            <div className="mt-4 h-56 rounded-[1rem] bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
