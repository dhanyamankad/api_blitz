export default function AdminLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      {/* Admin Header Skeleton */}
      <div className="border-b border-slate-800 bg-slate-950/90 h-16 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-slate-800/60 rounded animate-pulse" />
          <div className="h-4 w-px bg-slate-800" />
          <div className="h-5 w-28 bg-purple-500/10 rounded border border-purple-500/20 animate-pulse" />
        </div>
        <div className="h-8 w-44 bg-slate-800/60 rounded-lg animate-pulse" />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-900/60 rounded-xl border border-slate-800 p-4 animate-pulse space-y-2"
            >
              <div className="h-3 w-16 bg-slate-800/80 rounded" />
              <div className="h-6 w-12 bg-slate-800/90 rounded" />
            </div>
          ))}
        </div>

        {/* Tab Bar Skeleton */}
        <div className="h-12 border-b border-slate-800 flex gap-4">
          <div className="h-8 w-28 bg-slate-800/60 rounded animate-pulse" />
          <div className="h-8 w-36 bg-slate-800/40 rounded animate-pulse" />
          <div className="h-8 w-32 bg-slate-800/40 rounded animate-pulse" />
        </div>

        {/* Body Skeleton */}
        <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col items-center justify-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          <span className="font-mono text-xs text-slate-400">Loading Admin Control Suite...</span>
        </div>
      </main>
    </div>
  );
}
