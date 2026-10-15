import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#030712] py-12 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="MSTC Logo"
            className="h-5 w-auto object-contain opacity-80"
          />
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <p className="font-mono text-xs font-bold text-white">API BLITZ 2026</p>
            <p className="text-[11px] text-slate-500">Organized by MSTC, Dhirubhai Ambani University</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
          <Link href="/showcase" className="hover:text-cyan-400 transition-colors">
            Showcase
          </Link>
          <a href="/api-blitz-spec.pdf" target="_blank" className="hover:text-cyan-400 transition-colors">
            Rulebook
          </a>
          <Link href="/login" className="hover:text-cyan-400 transition-colors">
            Sign In
          </Link>
        </div>

        <p className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
          Engineered for <span className="text-slate-400">@dau.ac.in</span> hackers
        </p>
      </div>
    </footer>
  );
}
