export default function GlobalLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="relative flex flex-col items-center">
        {/* Glowing backdrop blur */}
        <div className="absolute -inset-4 rounded-full bg-sky-500/10 blur-xl animate-pulse" />

        {/* MSTC Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="MSTC Logo"
          className="h-10 w-auto object-contain relative z-10 animate-pulse"
        />

        {/* Loading Spinner & Status */}
        <div className="mt-6 flex flex-col items-center gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>

          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
            Loading API Blitz...
          </span>

          <span className="font-mono text-[10px] text-slate-600">
            Microsoft Student Technical Club · DAU
          </span>
        </div>
      </div>
    </div>
  );
}
