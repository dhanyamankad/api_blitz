import Link from "next/link";
import { signOut } from "@/auth";
import { MessageCircle, LogOut, ArrowLeft, Shield, MapPin } from "lucide-react";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  whatsappUrl?: string;
}

export function DashboardHeader({ user, whatsappUrl }: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Back */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MSTC Logo" className="h-6 w-auto object-contain" />
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              PORTAL
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-rose-300">
              <MapPin className="h-2.5 w-2.5 text-rose-400" />
              <span>CEP 102</span>
            </span>
          </Link>
        </div>

        {/* User Status & Actions */}
        <div className="flex items-center gap-3">
          {/* WhatsApp community button (only visible to logged in @dau.ac.in users) */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Join WhatsApp Community</span>
              <span className="md:hidden">WhatsApp</span>
            </a>
          )}

          {/* User email badge */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-medium text-white truncate max-w-[150px]">
              {user.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
              {user.email}
            </span>
          </div>

          {/* Sign Out */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              title="Sign Out"
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 p-2 sm:px-3 sm:py-1.5 text-xs font-mono text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
