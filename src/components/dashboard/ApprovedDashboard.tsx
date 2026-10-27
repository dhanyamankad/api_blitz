"use client";

import { useActionState } from "react";
import { submitGithubAction, ActionState } from "@/app/dashboard/actions";
import Link from "next/link";
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
  Video,
  Zap,
  MapPin,
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
      youtubeUrl?: string | null;
      submittedAt: Date;
      updatedAt: Date;
    } | null;
  };
  eventStartAt: Date | null;
  submissionDeadline: Date | null;
  rulebookUrl?: string;
  phase: "before_start" | "live" | "ended";
  isSubmissionsOpen?: boolean;
  apisPublished?: boolean;
}

export function ApprovedDashboard({
  team,
  eventStartAt,
  submissionDeadline,
  rulebookUrl,
  phase,
  isSubmissionsOpen = false,
  apisPublished = false,
}: ApprovedDashboardProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    submitGithubAction,
    {}
  );

  const hasSubmitted = !!team.submission;
  const isSubmissionLocked = !isSubmissionsOpen;
  const isApiLocked = !apisPublished;

  // Progress Steps calculation
  const steps = [
    { label: "REGISTERED", done: true },
    { label: "APPROVED", done: true },
    { label: "SUBMITTED", done: hasSubmitted },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Squad Header & Progress Tracker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>SQUAD APPROVED</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-mono font-medium text-sky-400">
                <Zap className="h-3.5 w-3.5" />
                <span>6 HOUR SPRINT</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-mono font-medium text-rose-300">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span>VENUE: CEP 102</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {team.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rulebook"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Rulebook</span>
            </Link>
          </div>
        </div>

        {/* 3-Step Progress Tracker */}
        <div className="mt-6">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3">
            EVENT PROGRESS TRACKER
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
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

      {/* Venue & Event Logistics Banner */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-slate-900/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300 font-semibold">
                Official In-Person Venue
              </span>
              <span className="rounded bg-rose-500/20 text-rose-200 text-[10px] font-mono px-1.5 py-0.2 font-bold">
                OFFLINE SPRINT
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-mono mt-0.5">
              CEP 102 <span className="text-slate-400 text-xs font-normal">· Dhirubhai Ambani University</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              All team members must report in-person to <b className="text-white">CEP 102</b> before the 7:00 PM kickoff. Bring your laptops, chargers, and student ID cards.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Kickoff Time</span>
          <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Today · 7:00 PM IST</span>
          </span>
        </div>
      </div>

      {/* 5 ALLOTTED APIS SECTION */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-sky-400 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              ALLOTTED API STACK (5 APIS)
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium self-start sm:self-auto ${
              !isApiLocked
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            {isApiLocked ? <Lock className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
            <span>{isApiLocked ? "LOCKED BY ORGANIZERS" : "5 APIS UNLOCKED"}</span>
          </span>
        </div>

        {isApiLocked ? (
          /* Locked State */
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              Secret API Stack Locked
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your 5 assigned APIs will be revealed right here on your dashboard when organizers publish the API bundles for the sprint. Stay tuned!
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-white shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
              PROJECT SUBMISSION
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium self-start sm:self-auto ${
              !isSubmissionLocked
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : phase === "ended"
                ? "border border-red-500/30 bg-red-500/10 text-red-400"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>
              {!isSubmissionLocked
                ? "SUBMISSIONS ACTIVE"
                : phase === "ended"
                ? "DEADLINE LOCKED"
                : "LOCKED UNTIL UNLOCKED"}
            </span>
          </span>
        </div>

        {/* Existing Submission Details if available */}
        {hasSubmitted && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase">Current Submission</div>
              <div className="space-y-1.5 mt-1">
                <a
                  href={team.submission?.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline font-medium text-xs sm:text-sm flex items-center gap-1.5 truncate"
                >
                  <GitBranch className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{team.submission?.githubUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                {team.submission?.youtubeUrl && (
                  <a
                    href={team.submission.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:underline font-medium text-xs sm:text-sm flex items-center gap-1.5 truncate"
                  >
                    <Video className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{team.submission.youtubeUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right text-[10px] text-slate-400 shrink-0">
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
            <span>Submission updated successfully! Both teammates can see and edit these links anytime before the deadline.</span>
          </div>
        )}

        {!isSubmissionLocked ? (
          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="githubUrl"
                className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5"
              >
                <GitBranch className="h-3.5 w-3.5 text-sky-400" />
                <span>GITHUB REPOSITORY URL *</span>
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

            <div>
              <label
                htmlFor="youtubeUrl"
                className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5"
              >
                <Video className="h-3.5 w-3.5 text-red-400" />
                <span>YOUTUBE VIDEO DEMO URL *</span>
              </label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                defaultValue={team.submission?.youtubeUrl || ""}
                required
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className={`w-full rounded-xl border bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${
                  state?.fieldErrors?.youtubeUrl
                    ? "border-red-500/60 focus:border-red-400 focus:ring-red-400"
                    : "border-slate-800 focus:border-sky-500 focus:ring-sky-500"
                }`}
              />
              {state?.fieldErrors?.youtubeUrl && (
                <p className="mt-1 text-[11px] font-mono text-red-400">
                  {state.fieldErrors.youtubeUrl}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 px-6 py-3 sm:py-2.5 text-xs font-mono font-bold text-slate-950 transition-colors shadow-sm"
            >
              {isPending
                ? "Saving Submission..."
                : hasSubmitted
                ? "Update Project Submission"
                : "Submit Project (GitHub & YouTube)"}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-5 text-xs font-mono text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Lock className="h-4 w-4" />
              <span>
                {phase === "ended"
                  ? "SUBMISSION WINDOW CLOSED"
                  : "SUBMISSIONS CURRENTLY LOCKED"}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {phase === "ended"
                ? "The submission deadline has passed (28 Oct 2026, 2:00 AM IST). Submissions are permanently locked for evaluation."
                : "Project submissions are currently locked. Organizers will unlock repository & video submissions during the sprint window. Submissions will close on 28th October 2026 at 02:00 AM IST. Prepare your GitHub repository and YouTube demo video in the meantime."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
