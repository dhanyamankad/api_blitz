import Link from "next/link";
import { ShieldCheck, ArrowLeft, LayoutDashboard, Globe } from "lucide-react";

interface AdminHeaderProps {
  adminEmail: string;
}

export function AdminHeader({ adminEmail }: AdminHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="MSTC Logo"
              height={24}
              style={{ maxHeight: "24px", width: "auto" }}
              className="h-5 sm:h-6 w-auto object-contain"
            />
            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-semibold text-purple-300">
              ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Public Site</span>
          </Link>
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-mono text-slate-300 truncate max-w-[110px] sm:max-w-[200px]">
            {adminEmail}
          </div>
        </div>
      </div>
    </header>
  );
}
