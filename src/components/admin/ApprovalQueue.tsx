"use client";

import { useState, useTransition } from "react";
import { approveTeamAction, rejectTeamAction } from "@/app/admin/actions";
import { Check, X, Clock, Users, User, ShieldCheck, AlertCircle, Filter } from "lucide-react";

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
  userId: string | null;
}

interface TeamData {
  id: string;
  name: string;
  status: "pending_approval" | "approved" | "rejected";
  createdAt: Date;
  members: TeamMemberData[];
}

interface ApprovalQueueProps {
  initialTeams: TeamData[];
}

export function ApprovalQueue({ initialTeams }: ApprovalQueueProps) {
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const pendingCount = initialTeams.filter((t) => t.status === "pending_approval").length;
  const approvedCount = initialTeams.filter((t) => t.status === "approved").length;

  const filteredTeams = initialTeams.filter((t) => {
    if (filter === "pending") return t.status === "pending_approval";
    if (filter === "approved") return t.status === "approved";
    return true;
  });

  const handleApprove = (teamId: string) => {
    startTransition(async () => {
      setStatusMsg(null);
      const res = await approveTeamAction(teamId);
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({ type: "success", text: res.message || "Team approved!" });
      }
    });
  };

  const handleReject = (teamId: string, teamName: string) => {
    if (
      !confirm(
        `Are you sure you want to reject "${teamName}"? This will release both emails and the team name so they can register again.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      setStatusMsg(null);
      const res = await rejectTeamAction(teamId);
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({ type: "success", text: res.message || "Team rejected and released." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter and Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
              filter === "pending"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <span>Pending Review</span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px]">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setFilter("approved")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
              filter === "approved"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <span>Approved Squads</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px]">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors ${
              filter === "all"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <span>All ({initialTeams.length})</span>
          </button>
        </div>

        {statusMsg && (
          <div
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              statusMsg.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/40 border-red-500/30 text-red-300"
            }`}
          >
            {statusMsg.type === "success" ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs font-mono text-slate-400">
          No teams found in this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTeams.map((team) => {
            const leader = team.members.find((m) => m.isLeader);
            const partner = team.members.find((m) => !m.isLeader);

            return (
              <div
                key={team.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-5 group hover:border-slate-700 transition-colors"
              >
                {/* Team Info */}
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                        team.status === "approved"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : team.status === "pending_approval"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}
                    >
                      {team.status.replace("_", " ")}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight truncate">
                      {team.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      · {new Date(team.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Members Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    {/* Leader */}
                    <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="flex items-center gap-1 text-sky-400 font-semibold">
                          <User className="h-3 w-3" />
                          LEADER
                        </span>
                        <span className="text-slate-500">{leader?.userId ? "SSO Verified" : "Pending"}</span>
                      </div>
                      <div className="font-semibold text-white truncate">{leader?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{leader?.email}</div>
                    </div>

                    {/* Partner */}
                    <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="flex items-center gap-1 text-purple-400 font-semibold">
                          <Users className="h-3 w-3" />
                          PARTNER
                        </span>
                        <span className="text-slate-500">{partner?.userId ? "Linked" : "Invited"}</span>
                      </div>
                      <div className="font-semibold text-white truncate">{partner?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{partner?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col md:flex-row items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {team.status === "pending_approval" ? (
                    <>
                      <button
                        onClick={() => handleApprove(team.id)}
                        disabled={isPending}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-mono font-bold transition-colors disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(team.id, team.name)}
                        disabled={isPending}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 px-3.5 py-2 text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : team.status === "approved" ? (
                    <button
                      onClick={() => handleReject(team.id, team.name)}
                      disabled={isPending}
                      className="text-xs font-mono text-red-400 hover:underline px-3 py-1.5"
                    >
                      Revoke & Release
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
