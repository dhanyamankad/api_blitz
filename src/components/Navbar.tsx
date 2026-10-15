import Link from "next/link";
import { Users, ShieldAlert, LogIn, ExternalLink } from "lucide-react";
import { auth } from "@/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

        {/* Center / Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#about"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/#timeline"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Timeline
          </Link>
          <Link
            href="/rulebook"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Rulebook
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            session.user.role === "admin" ? (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-lg bg-purple-500 hover:bg-purple-400 px-4 py-2 text-xs font-mono font-semibold text-slate-950 transition-colors shadow-sm"
              >
                <span>Admin Console</span>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-mono font-semibold text-slate-950 transition-colors shadow-sm"
              >
                <span>Go to Dashboard</span>
              </Link>
            )
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-mono font-semibold text-slate-950 transition-colors shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>DAU Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
