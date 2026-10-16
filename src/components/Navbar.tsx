import Link from "next/link";
import { auth } from "@/auth";
import { NavbarClient } from "@/components/NavbarClient";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="MSTC Logo"
            className="h-7 w-auto object-contain"
          />
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-tight text-white group-hover:text-slate-200 transition-colors">
                API BLITZ
              </span>
              <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                2026
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-normal font-mono">
              DAU
            </span>
          </div>
        </Link>

        {/* Client Navigation & Mobile Menu */}
        <NavbarClient session={session} />
      </div>
    </header>
  );
}
