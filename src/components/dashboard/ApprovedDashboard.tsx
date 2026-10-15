"use client";

import { useActionState } from "react";
import { submitGithubAction, ActionState } from "@/app/dashboard/actions";
import {
  CheckCircle2,
  Lock,
  ExternalLink,
  GitBranch,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Code2,
  Users,
} from "lucide-react";

interface ApiData {
  id: string;
  name: string;
  docsLink: string;
}

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
  userId: string | null;
}

interface ApprovedDashboardProps {
  team: {
    id: string;
    name: string;
    members: TeamMemberData[];
    assignments: { api: ApiData }[];
    submission: {
      githubUrl: string;
      submittedAt: Date;
      updatedAt: Date;
    } | null;
  };
  eventStartAt: Date | null;
  submissionDeadline: Date | null;
  rulebookUrl?: string;
  phase: "before_start" | "live" | "ended";
}

export function ApprovedDashboard({
  team,
  eventStartAt,
  submissionDeadline,
  rulebookUrl,
  phase,
}: ApprovedDashboardProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    submitGithubAction,
    {}
  );

  const hasSubmitted = !!team.submission;
  const isSubmissionLocked = phase === "ended";
  const isApiLocked = phase === "before_start";

  // Progress Steps calculation
  const steps = [
    { label: "REGISTERED", done: true },
    { label: "APPROVED", done: true },
    { label: "SUBMITTED", done: hasSubmitted },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Squad Header & Progress Tracker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-medium text-emerald-400 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>SQUAD APPROVED</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {team.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={rulebookUrl || "/api-blitz-spec.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Rulebook</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* 3-Step Progress Tracker */}
        <div className="mt-6">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3">
            EVENT PROGRESS TRACKER
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {steps.map((st, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 flex items-center gap-2.5 ${
                  st.done
                    ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                    : "border-slate-800 bg-slate-950/50 text-slate-500"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    st.done
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {st.done ? "✓" : i + 1}
                </div>
                <div className="truncate">
                  <div className="font-mono text-xs font-semibold truncate">{st.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Squad Members Row */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3">
            SQUAD ROSTER
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 flex items-center justify-between"
              >
                <div className="truncate">
                  <div className="text-sm font-semibold text-white truncate">{m.name}</div>
                  <div className="text-xs font-mono text-slate-400 truncate">{m.email}</div>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-mono font-medium ${
                    m.isLeader
                      ? "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {m.isLeader ? "Leader" : "Member"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5 ALLOTTED APIS SECTION */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-tight font-mono">
              ALLOTTED API STACK (5 APIS)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {isApiLocked ? "LOCKED UNTIL KICKOFF" : "UNLOCKED"}
          </span>
        </div>

        {isApiLocked ? (
          /* Locked State */
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              API Bundle Locked
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your 5 assigned APIs will be automatically revealed on your dashboard when the event begins on 27 October 2026, 7:00 PM IST.
            </p>
          </div>
        ) : team.assignments.length === 0 ? (
          /* Approved but admin hasn't allotted yet */
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center text-xs font-mono text-slate-400">
            Organizers are currently finalizing API allotment sets. Please check back shortly.
          </div>
        ) : (
          /* Unlocked APIs */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.assignments.map((asgn, i) => (
              <div
                key={asgn.api.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 flex flex-col justify-between group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    API 0{i + 1}
                  </span>
                  <a
                    href={asgn.api.docsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:underline"
                  >
                    <span>Docs</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {asgn.api.name}
                </h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GITHUB SUBMISSION SECTION */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-white" />
            <h2 className="text-lg font-bold text-white tracking-tight font-mono">
              PROJECT SUBMISSION
            </h2>
          </div>
          <span
            className={`text-xs font-mono ${
              isSubmissionLocked ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {isSubmissionLocked ? "DEADLINE LOCKED" : "SUBMISSIONS ACTIVE"}
          </span>
        </div>

        {/* Existing Submission Details if available */}
        {hasSubmitted && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Current Submission</div>
              <a
                href={team.submission?.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline font-medium text-sm flex items-center gap-1.5 mt-0.5"
              >
                <span>{team.submission?.githubUrl}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              <div>Updated: {team.submission?.updatedAt ? new Date(team.submission.updatedAt).toLocaleString("en-IN") : "Recorded"}</div>
            </div>
          </div>
        )}

        {state?.error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Submission updated successfully! Both teammates can see and edit this link anytime before the deadline.</span>
          </div>
        )}

        {!isSubmissionLocked ? (
          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="githubUrl"
                className="text-xs font-mono font-semibold text-slate-300 block mb-1.5"
              >
                GITHUB REPOSITORY URL *
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                defaultValue={team.submission?.githubUrl || ""}
                required
                placeholder="https://github.com/organization-or-user/api-blitz-project"
                className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${
                  state?.fieldErrors?.githubUrl
                    ? "border-red-500/60 focus:border-red-400 focus:ring-red-400"
                    : "border-slate-800 focus:border-sky-500 focus:ring-sky-500"
                }`}
              />
              {state?.fieldErrors?.githubUrl && (
                <p className="mt-1 text-[11px] font-mono text-red-400">
                  {state.fieldErrors.githubUrl}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 px-6 py-2.5 text-xs font-mono font-bold text-slate-950 transition-colors"
            >
              {isPending
                ? "Saving..."
                : hasSubmitted
                ? "Update Submission Link"
                : "Submit GitHub Repository"}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs font-mono text-slate-400 flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>The deadline has passed. Submissions are permanently locked for evaluation.</span>
          </div>
        )}
      </div>
    </div>
  );
}
