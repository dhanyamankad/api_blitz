"use client";

import { useTransition } from "react";
import { resetRejectedTeamAction } from "@/app/dashboard/actions";
import { AlertCircle, RotateCcw } from "lucide-react";

interface RejectedScreenProps {
  teamName: string;
}

export function RejectedScreen({ teamName }: RejectedScreenProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-red-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          Registration Not Approved
        </h2>
        <p className="mt-2 text-xs text-slate-300 leading-relaxed font-mono">
          Your squad registration for <b className="text-white">{teamName}</b> was rejected by organizers.
        </p>

        <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
          The team records have been cleared so you and your partner are eligible to register again with another name or squad.
        </p>

        <div className="mt-6">
          <button
            onClick={() => {
              startTransition(async () => {
                await resetRejectedTeamAction();
              });
            }}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 text-xs font-mono font-medium text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isPending ? "Resetting..." : "Release & Register Again"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
