"use client";

import { useActionState } from "react";
import { registerTeamAction, ActionState } from "@/app/dashboard/actions";
import { Users, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, User } from "lucide-react";

interface RegistrationFormProps {
  leader: {
    name: string;
    email: string;
  };
}

export function RegistrationForm({ leader }: RegistrationFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerTeamAction,
    {}
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-8 backdrop-blur-md shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-mono font-medium text-sky-300 mb-3">
            <Users className="h-3.5 w-3.5" />
            <span>SQUAD REGISTRATION</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Register Your 2-Person Team
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            As the squad leader, register your team name and add your teammate. Your partner does not need to accept an invite—they will be linked automatically when they sign in with their @dau.ac.in Google account.
          </p>
        </div>

        {/* Global Error Banner */}
        {state?.error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-xs font-mono text-red-300 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Registration Conflict</p>
              <p className="mt-1 text-[11px] text-red-300/90 leading-relaxed">
                {state.error}
              </p>
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* LEADER SECTION (NAME EDITABLE, EMAIL LOCKED TO GOOGLE SSO) */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-sky-400" />
                MEMBER 01 · SQUAD LEADER (YOU)
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                VERIFIED GOOGLE SSO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label htmlFor="leaderName" className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  id="leaderName"
                  name="leaderName"
                  required
                  defaultValue={leader.name !== leader.email ? leader.name : ""}
                  placeholder="Enter your real full name"
                  className={`w-full rounded-lg border bg-slate-900/90 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${
                    state?.fieldErrors?.leaderName
                      ? "border-red-500/60 focus:border-red-400 focus:ring-red-400"
                      : "border-slate-800 focus:border-sky-500 focus:ring-sky-500"
                  }`}
                />
                {state?.fieldErrors?.leaderName && (
                  <p className="mt-1 text-[11px] font-mono text-red-400">
                    {state.fieldErrors.leaderName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Your DAU Email (Verified)
                </label>
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-3.5 py-2 text-sm text-slate-400 font-medium truncate cursor-not-allowed">
                  {leader.email}
                </div>
              </div>
            </div>
          </div>

          {/* TEAM NAME */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="teamName" className="text-xs font-mono font-semibold text-slate-200">
                TEAM NAME *
              </label>
              <span className="text-[10px] font-mono text-slate-400">Unique · 2-40 chars</span>
            </div>
            <input
              type="text"
              id="teamName"
              name="teamName"
              required
              maxLength={40}
              placeholder="e.g. ByteForce, NullPointers, CyberKnights"
              className={`w-full rounded-xl border bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${
                state?.fieldErrors?.teamName
                  ? "border-red-500/60 focus:border-red-400 focus:ring-red-400"
                  : "border-slate-800 focus:border-sky-500 focus:ring-sky-500"
              }`}
            />
            {state?.fieldErrors?.teamName && (
              <p className="mt-1 text-[11px] font-mono text-red-400">
                {state.fieldErrors.teamName}
              </p>
            )}
          </div>

          {/* MEMBER 2 SECTION */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-purple-400" />
                MEMBER 02 · PARTNER
              </span>
              <span className="text-[10px] font-mono text-slate-400">Must have @dau.ac.in account</span>
            </div>

            {/* Member Name */}
            <div>
              <label htmlFor="memberName" className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Partner Full Name *
              </label>
              <input
                type="text"
                id="memberName"
                name="memberName"
                required
                placeholder="e.g. Aryan Patel"
                className={`w-full rounded-lg border bg-slate-900/90 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${
                  state?.fieldErrors?.memberName
                    ? "border-red-500/60 focus:border-red-400 focus:ring-red-400"
                    : "border-slate-800 focus:border-sky-500 focus:ring-sky-500"
                }`}
              />
              {state?.fieldErrors?.memberName && (
                <p className="mt-1 text-[11px] font-mono text-red-400">
                  {state.fieldErrors.memberName}
                </p>
              )}
            </div>

            {/* Member Email */}
            <div>
              <label htmlFor="memberEmail" className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Partner DAU Email *
              </label>
              <input
                type="email"
                id="memberEmail"
                name="memberEmail"
                required
                placeholder="e.g. 202501099@dau.ac.in"
                className={`w-full rounded-lg border bg-slate-900/90 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${
                  state?.fieldErrors?.memberEmail
                    ? "border-red-500/60 focus:border-red-400 focus:ring-red-400"
                    : "border-slate-800 focus:border-sky-500 focus:ring-sky-500"
                }`}
              />
              {state?.fieldErrors?.memberEmail ? (
                <p className="mt-1 text-[11px] font-mono text-red-400">
                  {state.fieldErrors.memberEmail}
                </p>
              ) : (
                <p className="mt-1 text-[10px] font-mono text-slate-400">
                  When your teammate logs in later with this email, their profile links automatically.
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 px-6 py-3.5 text-sm font-mono font-bold text-slate-950 transition-colors shadow-sm"
          >
            {isPending ? (
              <span>Submitting Registration...</span>
            ) : (
              <>
                <span>Complete Squad Registration</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
