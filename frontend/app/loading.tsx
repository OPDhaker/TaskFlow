export default function Loading() {
  return (
    <main id="main-content" className="workspace-main">
      <div className="animate-pulse">
        <section className="workspace-intro">
          <div className="h-3 w-28 rounded-full bg-muted" />
          <div className="h-16 w-full max-w-4xl rounded-[2rem] bg-muted" />
          <div className="h-5 w-full max-w-2xl rounded-full bg-muted" />
        </section>
        <section className="mt-6 glass-panel p-6">
          <div className="grid gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-11 rounded-full bg-muted/80" />
            ))}
          </div>
        </section>
        <section className="mt-6 summary-strip">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="metric-strip">
              <div className="h-3 w-20 rounded-full bg-muted" />
              <div className="mt-4 h-10 w-16 rounded-full bg-muted" />
              <div className="mt-3 h-4 w-24 rounded-full bg-muted" />
            </div>
          ))}
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.62fr)]">
          <div className="glass-panel p-6">
            <div className="h-6 w-40 rounded-full bg-muted" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 rounded-[1.4rem] bg-muted/80" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="glass-panel h-48 p-6">
                <div className="h-5 w-32 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
