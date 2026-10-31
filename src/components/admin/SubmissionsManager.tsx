"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Search,
  GitBranch,
  Video,
  Trophy,
  Star,
  Mail,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Award,
} from "lucide-react";
import { ExportPdfButton } from "./ExportPdfButton";
import {
  toggleShortlistTeamAction,
  togglePublishShortlistAction,
  notifyShortlistedTeamsAction,
  sendTestShortlistEmailAction,
} from "@/app/admin/actions";

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
  createdAt: Date | string;
  members: TeamMemberData[];
  assignments?: {
    api: {
      id?: string;
      name: string;
      docsLink?: string;
      setNumber?: number | null;
    };
  }[];
  submission: SubmissionData | null;
  isShortlisted?: boolean;
  shortlistRank?: number | null;
  shortlistNotifiedAt?: Date | string | null;
}

interface SubmissionsManagerProps {
  teams: TeamData[];
  adminEmail?: string;
  shortlistPublished?: boolean;
}

export function SubmissionsManager({
  teams,
  adminEmail,
  shortlistPublished = false,
}: SubmissionsManagerProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "shortlisted" | "submitted" | "unsubmitted">("all");
  const [search, setSearch] = useState("");

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [, startTransition] = useTransition();

  const approvedTeams = teams.filter((t) => t.status === "approved");
  const submittedCount = approvedTeams.filter((t) => !!t.submission).length;
  const shortlistedTeams = approvedTeams.filter((t) => !!t.isShortlisted);

  const filtered = approvedTeams.filter((t) => {
    let matchesFilter = true;
    if (filter === "submitted") {
      matchesFilter = !!t.submission;
    } else if (filter === "unsubmitted") {
      matchesFilter = !t.submission;
    } else if (filter === "shortlisted") {
      matchesFilter = !!t.isShortlisted;
    }

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

  const handleToggleShortlist = async (teamId: string, currentStatus: boolean) => {
    setTogglingId(teamId);
    setStatusMessage(null);
    try {
      const res = await toggleShortlistTeamAction(teamId, !currentStatus);
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: !currentStatus
            ? "Team added to Top 7 shortlist!"
            : "Team removed from shortlist.",
        });
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to update shortlist status." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const res = await togglePublishShortlistAction(!shortlistPublished);
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: res.message || "Shortlist visibility updated successfully.",
        });
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to update publish state." });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleNotifyShortlisted = async () => {
    if (shortlistedTeams.length === 0) {
      setStatusMessage({
        type: "error",
        text: "No squads are currently shortlisted. Shortlist squads first before sending emails.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Send official Grand Finale shortlist notification emails to the squad leaders of all ${shortlistedTeams.length} shortlisted teams?`
    );
    if (!confirmed) return;

    setIsNotifying(true);
    setStatusMessage(null);
    try {
      const res = await notifyShortlistedTeamsAction();
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: res.message || `Emails sent to ${res.count} squad leader(s).`,
        });
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to dispatch email notifications." });
    } finally {
      setIsNotifying(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setStatusMessage(null);
    try {
      const res = await sendTestShortlistEmailAction(adminEmail);
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: res.message || "Test shortlist verification email sent successfully!",
        });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to dispatch test verification email." });
    } finally {
      setIsSendingTest(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Team Name",
      "Shortlisted",
      "Shortlist Notified",
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
        `"${t.isShortlisted ? "YES" : "NO"}"`,
        `"${t.shortlistNotifiedAt ? new Date(t.shortlistNotifiedAt).toISOString() : "NO"}"`,
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
    link.setAttribute(
      "download",
      `api-blitz-submissions-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top 7 Shortlist Control Banner */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-900/95 p-4 sm:p-6 backdrop-blur-md shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-mono font-bold text-amber-300 shadow-sm shadow-amber-500/10">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>TOP 7 GRAND FINALE SUITE</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-mono font-bold ${
                  shortlistPublished
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    shortlistPublished ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                {shortlistPublished
                  ? "DASHBOARD ANNOUNCEMENT LIVE"
                  : "DASHBOARD ANNOUNCEMENT HIDDEN"}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <span>Finalist Shortlist &amp; Notification Control</span>
              <span
                className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-md border ${
                  shortlistedTeams.length === 7
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                }`}
              >
                {shortlistedTeams.length} / 7 Selected
              </span>
            </h3>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Toggle the star on any approved squad below to shortlist them into Top 7. When ready, publish the status so participants see their shortlist result on their dashboards, and dispatch the official briefing emails to squad leaders.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold transition-all shadow-md ${
                shortlistPublished
                  ? "border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
              }`}
            >
              {isPublishing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : shortlistPublished ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              <span>
                {shortlistPublished ? "Hide from Dashboards" : "Publish to Dashboards"}
              </span>
            </button>

            <button
              onClick={handleNotifyShortlisted}
              disabled={isNotifying || shortlistedTeams.length === 0}
              className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 px-4 py-2.5 text-xs font-mono font-bold text-white shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {isNotifying ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <Mail className="h-3.5 w-3.5 text-sky-200" />
              )}
              <span>Email Leaders ({shortlistedTeams.length})</span>
            </button>

            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-200 transition-all shadow-md disabled:opacity-50"
              title="Send a sample Top 7 finalist briefing email to verification inbox"
            >
              {isSendingTest ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
              ) : (
                <Send className="h-3.5 w-3.5 text-sky-400" />
              )}
              <span>Send Test Mail</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-[11px] underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
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
            onClick={() => setFilter("shortlisted")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
              filter === "shortlisted"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-900 text-amber-400/80 border border-slate-800"
            }`}
          >
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>Top 7 Shortlist</span>
            <span className="rounded bg-amber-500/20 px-1.5 text-[10px] text-amber-300 font-bold">
              {shortlistedTeams.length}
            </span>
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
              className="rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 w-full font-mono"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportCSV}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-mono font-semibold text-white transition-colors"
              title="Download CSV spreadsheet"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
              <span>CSV</span>
            </button>

            <ExportPdfButton teams={teams} adminEmail={adminEmail} variant="compact" />
          </div>
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
              const isShortlisted = !!team.isShortlisted;

              return (
                <div
                  key={team.id}
                  className={`p-4 space-y-3 font-mono text-xs transition-colors ${
                    isShortlisted
                      ? "bg-amber-950/20 border-l-4 border-l-amber-500"
                      : "hover:bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm truncate">{team.name}</h4>
                        {isShortlisted && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 shrink-0">
                            <Trophy className="h-2.5 w-2.5" />
                            TOP 7
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {leader?.name} &amp; {partner?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{leader?.email}</p>
                    </div>

                    {/* Shortlist Toggle on Mobile */}
                    <button
                      onClick={() => handleToggleShortlist(team.id, isShortlisted)}
                      disabled={togglingId === team.id}
                      className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                        isShortlisted
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          isShortlisted ? "fill-amber-400 text-amber-400" : "text-slate-400"
                        }`}
                      />
                      <span>{isShortlisted ? "Top 7" : "Shortlist"}</span>
                    </button>
                  </div>

                  {/* Submission and Notification Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
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

                    {isShortlisted && (
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono ${
                          team.shortlistNotifiedAt
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border border-amber-500/20 text-amber-400/80"
                        }`}
                      >
                        <Mail className="h-2.5 w-2.5" />
                        {team.shortlistNotifiedAt ? "Email Notified" : "Email Pending"}
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
                <th className="py-3.5 px-4 text-center">Top 7 Shortlist</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Deliverables (GitHub &amp; YouTube)</th>
                <th className="py-3.5 px-4 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching submissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((team) => {
                  const leader = team.members.find((m) => m.isLeader);
                  const partner = team.members.find((m) => !m.isLeader);
                  const isShortlisted = !!team.isShortlisted;

                  return (
                    <tr
                      key={team.id}
                      className={`transition-colors ${
                        isShortlisted
                          ? "bg-amber-950/20 border-l-4 border-l-amber-500 hover:bg-amber-950/30"
                          : "hover:bg-slate-900/40"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{team.name}</span>
                          {isShortlisted && (
                            <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                              FINALIST
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">
                          {leader?.name} &amp; {partner?.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{leader?.email}</div>
                      </td>

                      {/* Top 7 Shortlist Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleShortlist(team.id, isShortlisted)}
                          disabled={togglingId === team.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                            isShortlisted
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800"
                          }`}
                          title={
                            isShortlisted
                              ? "Click to remove from Top 7 Shortlist"
                              : "Click to add to Top 7 Shortlist"
                          }
                        >
                          {togglingId === team.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Star
                              className={`h-3.5 w-3.5 ${
                                isShortlisted ? "fill-amber-400 text-amber-400" : "text-slate-400"
                              }`}
                            />
                          )}
                          <span>{isShortlisted ? "Top 7 Finalist" : "Shortlist"}</span>
                        </button>

                        {isShortlisted && (
                          <div className="mt-1 text-[10px]">
                            {team.shortlistNotifiedAt ? (
                              <span className="text-emerald-400 flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span>Leader Notified</span>
                              </span>
                            ) : (
                              <span className="text-amber-400/80 flex items-center justify-center gap-1">
                                <Mail className="h-2.5 w-2.5" />
                                <span>Email Pending</span>
                              </span>
                            )}
                          </div>
                        )}
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
