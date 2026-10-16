"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn, FileText, Calendar, Info, Shield, LayoutDashboard, ChevronRight } from "lucide-react";

interface NavbarClientProps {
  session: {
    user?: {
      email?: string | null;
      name?: string | null;
      role?: string;
    };
  } | null;
}

export function NavbarClient({ session }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/#about"
          className="text-sm font-mono text-slate-400 hover:text-white transition-colors"
        >
          About
        </Link>
        <Link
          href="/#timeline"
          className="text-sm font-mono text-slate-400 hover:text-white transition-colors"
        >
          Timeline
        </Link>
        <Link
          href="/rulebook"
          className="flex items-center gap-1.5 text-sm font-mono text-slate-400 hover:text-white transition-colors group"
        >
          <FileText className="h-3.5 w-3.5 text-sky-400 group-hover:text-sky-300" />
          <span>Rulebook</span>
          <span className="rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.2 text-[9px] font-mono text-sky-400">
            PDF
          </span>
        </Link>
      </nav>

      {/* Action Buttons (Desktop & Mobile) */}
      <div className="flex items-center gap-2.5">
        {session?.user ? (
          session.user.role === "admin" ? (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 px-3.5 py-1.5 text-xs font-mono font-semibold text-slate-950 transition-colors shadow-sm"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs font-mono font-semibold text-slate-950 transition-colors shadow-sm"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Go to Dashboard</span>
            </Link>
          )
        ) : (
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs font-mono font-semibold text-slate-950 transition-colors shadow-sm"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>DAU Sign In</span>
          </Link>
        )}

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Animated Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 border-b border-slate-800 bg-slate-950/98 backdrop-blur-xl px-4 py-6 shadow-2xl transition-all z-50">
          <div className="flex flex-col space-y-4">
            <Link
              href="/#about"
              onClick={closeMenu}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700 transition-all font-mono text-sm"
            >
              <div className="flex items-center gap-2.5">
                <Info className="h-4 w-4 text-sky-400" />
                <span>About Event</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link
              href="/#timeline"
              onClick={closeMenu}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700 transition-all font-mono text-sm"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span>Schedule & Timeline</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link
              href="/rulebook"
              onClick={closeMenu}
              className="flex items-center justify-between p-3 rounded-xl border border-sky-500/30 bg-sky-950/20 text-sky-300 hover:text-white hover:border-sky-500/60 transition-all font-mono text-sm"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-sky-400" />
                <div className="flex items-center gap-2">
                  <span>Official Rulebook</span>
                  <span className="rounded bg-sky-500/20 border border-sky-500/30 px-1.5 py-0.2 text-[10px] font-bold text-sky-400">
                    PDF
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-sky-400" />
            </Link>

            {/* Mobile Auth Button */}
            <div className="pt-2 border-t border-slate-800">
              {session?.user ? (
                session.user.role === "admin" ? (
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-purple-500 hover:bg-purple-400 py-3 text-sm font-mono font-bold text-slate-950 transition-colors shadow-sm"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Open Admin Console</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-sky-500 hover:bg-sky-400 py-3 text-sm font-mono font-bold text-slate-950 transition-colors shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Participant Dashboard</span>
                  </Link>
                )
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-sky-500 hover:bg-sky-400 py-3 text-sm font-mono font-bold text-slate-950 transition-colors shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In with @dau.ac.in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
