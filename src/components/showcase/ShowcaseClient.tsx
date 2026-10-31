"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ExternalLink,
  Lock,
  GitBranch,
  CheckCircle2,
  Layers,
  ArrowRight,
  Video,
} from "lucide-react";
import { Phase } from "@/lib/settings";

export interface ShowcaseTeamMember {
  name: string;
  isLeader: boolean;
}

export interface ShowcaseApi {
  id: string;
  name: string;
  docsLink: string;
}

export interface ShowcaseTeam {
  id: string;
  name: string;
  createdAt: string;
  members: ShowcaseTeamMember[];
  apis: ShowcaseApi[];
  hasSubmission: boolean;
  githubUrl: string | null;
  youtubeUrl: string | null;
}

interface ShowcaseClientProps {
  teams: ShowcaseTeam[];
  phase: Phase;
  eventStartIso: string | null;
}

export function ShowcaseClient({ teams, phase, eventStartIso }: ShowcaseClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "submitted">("all");

  const isRevealed = phase !== "before_start";

  const filteredTeams = teams.filter((t) => {
    if (filter === "submitted" && !t.hasSubmission) return false;

    if (!search.trim()) return true;

    const term = search.toLowerCase();
    const matchesName = t.name.toLowerCase().includes(term);
    const matchesMembers = t.members.some((m) => m.name.toLowerCase().includes(term));
    const matchesApis = isRevealed && t.apis.some((a) => a.name.toLowerCase().includes(term));

    return matchesName || matchesMembers || matchesApis;
  });

  const totalHackers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const submittedCount = teams.filter((t) => t.hasSubmission).length;

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Approved Squads</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{teams.length}</span>
            <span className="text-[11px] font-mono text-slate-500">squads</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Hackers</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{totalHackers}</span>
            <span className="text-[11px] font-mono text-slate-500">DAU students</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Submissions</span>
            <GitBranch className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{submittedCount}</span>
            <span className="text-[11px] font-mono text-slate-500">projects</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by squad or hacker name..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 sm:flex-none rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors ${
              filter === "all"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            All Squads ({teams.length})
          </button>
          {isRevealed && (
            <button
              onClick={() => setFilter("submitted")}
              className={`flex-1 sm:flex-none rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors ${
                filter === "submitted"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              Submitted ({submittedCount})
            </button>
          )}
        </div>
      </div>

      {/* Squad Cards Grid */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-xl mx-auto">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold text-white mb-1">No Squads Found</h3>
          <p className="text-xs font-mono text-slate-400 mb-6">
            {search
              ? "No team or member matched your query. Try a different search term."
              : "No teams have been approved yet. Registration is open for DAU students!"}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2.5 text-xs font-mono font-bold transition-colors"
          >
            <span>Register Your Squad</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {filteredTeams.map((team) => {
            const leader = team.members.find((m) => m.isLeader);
            const partner = team.members.find((m) => !m.isLeader);

            return (
              <div
                key={team.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition-colors group"
              >
                <div>
                  {/* Top Bar: Squad Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <h3 className="font-mono font-bold text-base text-white tracking-tight group-hover:text-sky-300 transition-colors">
                          {team.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        Approved 2-Person Squad
                      </span>
                    </div>

                    {team.hasSubmission ? (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        SUBMITTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Privacy-Conscious Member List (Names Only) */}
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Squad Leader:</span>
                      <span className="text-white font-medium truncate ml-2">
                        {leader?.name || "Anonymous Leader"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Partner:</span>
                      <span className="text-white font-medium truncate ml-2">
                        {partner?.name || "Anonymous Partner"}
                      </span>
                    </div>
                  </div>

                  {/* API Allotment Section */}
                  <div className="mb-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-sky-400" />
                      <span>Allotted API Stack</span>
                    </div>

                    {isRevealed && team.apis.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {team.apis.map((api) => (
                          <a
                            key={api.id}
                            href={api.docsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition-colors"
                          >
                            <span>{api.name}</span>
                            <ExternalLink className="h-2.5 w-2.5 text-slate-500" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5 flex items-center gap-2 text-xs font-mono text-slate-400">
                        <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px]">
                          5 APIs encrypted until kickoff (27 Oct 8PM IST)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Deliverables if Submitted */}
                {(team.githubUrl || team.youtubeUrl) && (
                  <div className="pt-3 border-t border-slate-800/80 mt-2 flex flex-wrap items-center gap-3">
                    {team.githubUrl && (
                      <a
                        href={team.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 hover:underline truncate max-w-full"
                      >
                        <GitBranch className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{team.githubUrl.replace("https://github.com/", "")}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    )}
                    {team.youtubeUrl && (
                      <a
                        href={team.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 hover:underline truncate max-w-full"
                      >
                        <Video className="h-3.5 w-3.5 shrink-0" />
                        <span>Watch Demo</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
