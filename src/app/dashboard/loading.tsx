export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      {/* Skeleton Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 h-16 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 bg-slate-800/60 rounded-md animate-pulse" />
          <div className="h-4 w-px bg-slate-800" />
          <div className="h-5 w-16 bg-slate-800/40 rounded animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-slate-800/60 rounded-lg animate-pulse" />
      </div>

      {/* Main Skeleton */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Squad Header Skeleton */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-5 w-28 bg-emerald-500/10 rounded-full border border-emerald-500/20 animate-pulse" />
                <div className="h-5 w-28 bg-sky-500/10 rounded-full border border-sky-500/20 animate-pulse" />
              </div>
              <div className="h-8 w-48 bg-slate-800/70 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-slate-800/60 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
            <div className="h-12 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
            <div className="h-12 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
            <div className="h-12 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
          </div>
        </div>

        {/* API Stack Skeleton */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="h-6 w-44 bg-slate-800/70 rounded animate-pulse" />
            <div className="h-5 w-24 bg-slate-800/50 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-24 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
            <div className="h-24 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
            <div className="h-24 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
            <div className="h-24 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Submissions Skeleton */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
          <div className="h-6 w-40 bg-slate-800/70 rounded animate-pulse" />
          <div className="h-16 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse" />
        </div>
      </main>
    </div>
  );
}
