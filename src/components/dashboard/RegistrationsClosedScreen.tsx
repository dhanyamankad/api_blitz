import Link from "next/link";
import { Lock, MapPin, Calendar, Users, FileText, ArrowLeft, ShieldAlert } from "lucide-react";

interface RegistrationsClosedScreenProps {
  userEmail: string;
  userName?: string | null;
}

export function RegistrationsClosedScreen({
  userEmail,
  userName,
}: RegistrationsClosedScreenProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        {/* Lock Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-5">
          <Lock className="h-7 w-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-medium text-amber-300 mb-3">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>REGISTRATION DEADLINE OVER</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Registrations Are Officially Closed
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          The registration window for <span className="text-white font-semibold">API Blitz 2026</span> has now concluded. A total of <span className="text-sky-400 font-bold font-mono">31 squads</span> have been registered and confirmed for the sprint.
        </p>

        {/* Venue & Event Logistics Card */}
        <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
              <MapPin className="h-4 w-4 text-rose-400" />
              <span>OFFICIAL EVENT VENUE</span>
            </div>
            <span className="rounded bg-rose-500/20 text-rose-200 text-[10px] font-mono px-2 py-0.5 font-semibold">
              CEP 102
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[11px] block">Location:</span>
              <span className="text-white font-semibold">CEP 102, Dhirubhai Ambani University</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Kickoff Time:</span>
              <span className="text-sky-400 font-semibold">Today · 7:30 PM IST</span>
            </div>
          </div>
        </div>

        {/* Teammate note */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left text-xs font-mono text-slate-400 space-y-1">
          <p className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-sky-400" />
            <span>Expecting to be on a registered team?</span>
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            If your partner already created a team and added you as a teammate, make sure you are signed in with the exact email address (<b className="text-white">{userEmail}</b>) they entered.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/rulebook"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-5 py-2.5 text-xs font-mono font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>View Rulebook</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
