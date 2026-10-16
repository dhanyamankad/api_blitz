"use client";

import { useState } from "react";
import { Download, ExternalLink, CheckCircle2, Clock, Search, GitBranch, Video } from "lucide-react";

interface SubmissionData {
  githubUrl: string;
  youtubeUrl?: string | null;
  submittedAt: Date;
  updatedAt: Date;
}

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
}

interface TeamData {
  id: string;
  name: string;
  status: string;
  members: TeamMemberData[];
  submission: SubmissionData | null;
}

interface SubmissionsManagerProps {
  teams: TeamData[];
}

export function SubmissionsManager({ teams }: SubmissionsManagerProps) {
  const [filter, setFilter] = useState<"all" | "submitted" | "unsubmitted">("all");
  const [search, setSearch] = useState("");

  const approvedTeams = teams.filter((t) => t.status === "approved");
  const submittedCount = approvedTeams.filter((t) => !!t.submission).length;

  const filtered = approvedTeams.filter((t) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "submitted"
        ? !!t.submission
        : !t.submission;

    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.members.some(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase())
      ) ||
      (t.submission?.githubUrl || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.submission?.youtubeUrl || "").toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    const headers = [
      "Team Name",
      "Status",
      "Leader Name",
      "Leader Email",
      "Partner Name",
      "Partner Email",
      "GitHub Repository",
      "YouTube Video URL",
      "Submitted At",
      "Last Updated At",
    ];

    const rows = approvedTeams.map((t) => {
      const leader = t.members.find((m) => m.isLeader);
      const partner = t.members.find((m) => !m.isLeader);

      return [
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.status}"`,
        `"${(leader?.name || "").replace(/"/g, '""')}"`,
        `"${leader?.email || ""}"`,
        `"${(partner?.name || "").replace(/"/g, '""')}"`,
        `"${partner?.email || ""}"`,
        `"${t.submission?.githubUrl || "NO_SUBMISSION"}"`,
        `"${t.submission?.youtubeUrl || "NO_VIDEO"}"`,
        `"${t.submission ? new Date(t.submission.submittedAt).toISOString() : ""}"`,
        `"${t.submission ? new Date(t.submission.updatedAt).toISOString() : ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `api-blitz-submissions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors shrink-0 ${
              filter === "all"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            All Approved ({approvedTeams.length})
          </button>
          <button
            onClick={() => setFilter("submitted")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
              filter === "submitted"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            <span>Submitted</span>
            <span className="rounded bg-emerald-500/20 px-1.5 text-[10px]">{submittedCount}</span>
          </button>
          <button
            onClick={() => setFilter("unsubmitted")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors shrink-0 ${
              filter === "unsubmitted"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            Pending ({approvedTeams.length - submittedCount})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or repo..."
              className="rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 w-full"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 sm:py-1.5 text-xs font-mono font-semibold text-white transition-colors shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Submissions Table & Mobile Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-800/60">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No matching submissions found.
            </div>
          ) : (
            filtered.map((team) => {
              const leader = team.members.find((m) => m.isLeader);
              const partner = team.members.find((m) => !m.isLeader);

              return (
                <div key={team.id} className="p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{team.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {leader?.name} & {partner?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {leader?.email}
                      </p>
                    </div>
                    {team.submission ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        SUBMITTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px] shrink-0">
                        <Clock className="h-3 w-3" />
                        NO SUBMISSION
                      </span>
                    )}
                  </div>

                  {team.submission ? (
                    <div className="space-y-1.5 pt-1">
                      <a
                        href={team.submission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1.5 text-xs bg-slate-950/60 border border-slate-800/80 rounded-lg p-2"
                      >
                        <GitBranch className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{team.submission.githubUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
                      </a>
                      {team.submission.youtubeUrl && (
                        <a
                          href={team.submission.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 hover:underline flex items-center gap-1.5 text-xs bg-slate-950/60 border border-slate-800/80 rounded-lg p-2"
                        >
                          <Video className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{team.submission.youtubeUrl}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 ml-auto" />
                        </a>
                      )}
                      <div className="text-[10px] text-slate-500 pt-0.5">
                        Updated:{" "}
                        {new Date(team.submission.updatedAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 italic">
                      No project deliverables recorded yet.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Squad Name</th>
                <th className="py-3.5 px-4">Members</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Deliverables (GitHub & YouTube)</th>
                <th className="py-3.5 px-4 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No matching submissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((team) => {
                  const leader = team.members.find((m) => m.isLeader);
                  const partner = team.members.find((m) => !m.isLeader);

                  return (
                    <tr key={team.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {team.name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">
                          {leader?.name} & {partner?.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {leader?.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {team.submission ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            SUBMITTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px]">
                            <Clock className="h-3 w-3" />
                            NO SUBMISSION
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {team.submission ? (
                          <div className="space-y-1">
                            <a
                              href={team.submission.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:underline flex items-center gap-1 truncate max-w-xs"
                            >
                              <GitBranch className="h-3 w-3 shrink-0" />
                              <span className="truncate">{team.submission.githubUrl}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </a>
                            {team.submission.youtubeUrl && (
                              <a
                                href={team.submission.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 hover:underline flex items-center gap-1 truncate max-w-xs text-[11px]"
                              >
                                <Video className="h-3 w-3 shrink-0" />
                                <span className="truncate">{team.submission.youtubeUrl}</span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                        {team.submission
                          ? new Date(team.submission.updatedAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
