"use client";

import { useState, useActionState } from "react";
import { editTeamAction, ActionState } from "@/app/dashboard/actions";
import { Clock, ShieldAlert, Edit3, X, User, Users, Check, AlertCircle } from "lucide-react";

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
  userId: string | null;
}

interface PendingScreenProps {
  team: {
    id: string;
    name: string;
    status: string;
    members: TeamMemberData[];
  };
  currentUserEmail: string;
}

export function PendingScreen({ team, currentUserEmail }: PendingScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMemberBanner, setShowMemberBanner] = useState(true);

  const leader = team.members.find((m) => m.isLeader);
  const partner = team.members.find((m) => !m.isLeader);
  const isLeader = leader?.email === currentUserEmail;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    editTeamAction,
    {}
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Transparency Banner for Partner */}
      {!isLeader && showMemberBanner && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 text-xs font-mono text-sky-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Users className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Squad Assignment</p>
              <p className="mt-0.5 text-slate-300">
                You&apos;ve been added to team <b className="text-white">{team.name}</b> by{" "}
                <b className="text-white">{leader?.name || leader?.email}</b>. No confirmation action is required from you.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMemberBanner(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Status Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-8 backdrop-blur-md shadow-xl">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-medium text-amber-400 mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span>UNDER REVIEW BY ORGANIZERS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {team.name}
            </h1>
          </div>

          {isLeader && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 sm:py-2 text-xs font-mono font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors active:scale-[0.98]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Squad Info</span>
            </button>
          )}
        </div>

        {/* Edit Form (Leader Only) */}
        {isLeader && isEditing ? (
          <div className="mt-6 pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Modify Squad Details
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {state?.error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs font-mono text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{state.error}</span>
              </div>
            )}

            <form
              action={async (formData) => {
                await formAction(formData);
                if (!state?.error) {
                  setIsEditing(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Your Full Name (Leader)
                  </label>
                  <input
                    type="text"
                    name="leaderName"
                    defaultValue={leader?.name || ""}
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    defaultValue={team.name}
                    required
                    maxLength={40}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Teammate Full Name
                  </label>
                  <input
                    type="text"
                    name="memberName"
                    defaultValue={partner?.name || ""}
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Teammate @dau.ac.in Email
                  </label>
                  <input
                    type="email"
                    name="memberEmail"
                    defaultValue={partner?.email || ""}
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-mono font-bold text-slate-950 transition-colors"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-mono text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Squad Overview */
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Leader Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Member 01 · Leader
                  </span>
                  <span className="rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 text-[10px] font-mono text-sky-400">
                    Leader
                  </span>
                </div>
                <div className="font-semibold text-white truncate">{leader?.name}</div>
                <div className="text-xs font-mono text-slate-400 truncate mt-0.5">
                  {leader?.email}
                </div>
              </div>

              {/* Partner Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Member 02 · Partner
                  </span>
                  <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                    {partner?.userId ? "Linked" : "Invited"}
                  </span>
                </div>
                <div className="font-semibold text-white truncate">{partner?.name}</div>
                <div className="text-xs font-mono text-slate-400 truncate mt-0.5">
                  {partner?.email}
                </div>
              </div>
            </div>

            {/* Next steps notice */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs font-mono text-slate-400 flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300">What happens next?</p>
                <p className="mt-1 leading-relaxed">
                  The MSTC organizing team reviews registrations to ensure fair play and verify eligibility. Once approved, your squad dashboard will activate with your allotted APIs and GitHub submission link.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
