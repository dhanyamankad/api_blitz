"use client";

import { useState } from "react";
import {
  FileDown,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { generateTeamsPdf, TeamExportData } from "@/lib/pdfGenerator";

interface TeamMemberData {
  id?: string;
  name: string;
  email: string;
  isLeader?: boolean;
}

interface ApiAssignmentData {
  api: {
    id?: string;
    name: string;
    docsLink?: string;
    setNumber?: number | null;
  };
}

interface SubmissionData {
  githubUrl: string;
  youtubeUrl?: string | null;
  submittedAt?: Date | string;
  updatedAt?: Date | string;
}

interface TeamData {
  id: string;
  name: string;
  status: "pending_approval" | "approved" | "rejected" | string;
  createdAt: Date | string;
  members: TeamMemberData[];
  assignments?: ApiAssignmentData[];
  submission?: SubmissionData | null;
}

interface ExportPdfButtonProps {
  teams: TeamData[];
  adminEmail?: string;
  variant?: "primary" | "secondary" | "compact";
  className?: string;
}

type FilterOption = "all" | "approved" | "pending" | "rejected" | "allotted" | "submitted";

export function ExportPdfButton({
  teams,
  adminEmail,
  variant = "primary",
  className = "",
}: ExportPdfButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Compute stats for modal display
  const totalCount = teams.length;
  const approvedCount = teams.filter((t) => t.status === "approved").length;
  const pendingCount = teams.filter((t) => t.status === "pending_approval").length;
  const rejectedCount = teams.filter((t) => t.status === "rejected").length;
  const allottedCount = teams.filter((t) => (t.assignments?.length || 0) > 0).length;
  const submittedCount = teams.filter((t) => !!t.submission).length;

  const getFilteredTeams = (filter: FilterOption) => {
    switch (filter) {
      case "approved":
        return teams.filter((t) => t.status === "approved");
      case "pending":
        return teams.filter((t) => t.status === "pending_approval");
      case "rejected":
        return teams.filter((t) => t.status === "rejected");
      case "allotted":
        return teams.filter((t) => (t.assignments?.length || 0) > 0);
      case "submitted":
        return teams.filter((t) => !!t.submission);
      case "all":
      default:
        return teams;
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case "approved":
        return "Approved Squads";
      case "pending":
        return "Pending Review Squads";
      case "rejected":
        return "Rejected Squads";
      case "allotted":
        return "Squads with Allotted APIs";
      case "submitted":
        return "Squads with Submissions";
      case "all":
      default:
        return "All Registered Squads";
    }
  };

  const handleDownloadPdf = async (filterToUse: FilterOption = selectedFilter) => {
    try {
      setIsGenerating(true);
      setStatusMessage("Preparing formatted PDF document...");

      const targetTeams = getFilteredTeams(filterToUse);
      const label = getFilterLabel(filterToUse);

      // Allow UI to update before heavy PDF building
      await new Promise((r) => setTimeout(r, 60));

      const doc = generateTeamsPdf(targetTeams as unknown as TeamExportData[], {
        title: "API BLITZ 2026",
        subtitle: "OFFICIAL REGISTRATIONS & API ALLOTMENT MASTER REPORT",
        generatedBy: adminEmail || "API Blitz Admin",
        filterLabel: label,
      });

      const todayStr = new Date().toISOString().slice(0, 10);
      const filename = `api-blitz-all-teams-allotment-${filterToUse}-${todayStr}.pdf`;

      doc.save(filename);

      setStatusMessage("PDF successfully generated and downloaded!");
      setTimeout(() => {
        setIsGenerating(false);
        setStatusMessage(null);
        setIsOpen(false);
      }, 1200);
    } catch (err) {
      console.error("Client PDF generation error:", err);
      setStatusMessage("Client generation failed. Redirecting to server download...");

      // Fallback to server route
      const directUrl = `/api/admin/export-pdf?filter=${filterToUse}`;
      window.open(directUrl, "_blank");

      setTimeout(() => {
        setIsGenerating(false);
        setStatusMessage(null);
      }, 1500);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === "primary" ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 text-xs font-mono font-semibold text-sky-300 hover:text-white transition-all shadow-sm shadow-sky-500/5 ${className}`}
          title="Export details of all teams, participants, and allotted APIs as one PDF"
        >
          <FileText className="h-3.5 w-3.5 text-sky-400" />
          <span>Export Details (PDF)</span>
          <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[10px] text-sky-200">
            {teams.length}
          </span>
        </button>
      ) : variant === "compact" ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-mono font-semibold text-white transition-colors ${className}`}
          title="Export PDF Report"
        >
          <FileDown className="h-3.5 w-3.5 text-rose-400" />
          <span>Export PDF</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-1 text-xs font-mono text-slate-300 hover:text-white transition-colors ${className}`}
        >
          <FileText className="h-3.5 w-3.5 text-sky-400" />
          <span>PDF Report ({teams.length})</span>
        </button>
      )}

      {/* Export Configuration Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl shadow-black/80 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <span>Export Teams & Allotment Report</span>
                    <span className="text-[10px] rounded bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 text-sky-300 uppercase tracking-wider">
                      PDF Document
                    </span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Generates a master landscape PDF containing all squad details, participant names, allocated APIs, and deliverables.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scope Filter Selection */}
            <div className="space-y-3 font-mono">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Select Scope to Include:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Option: All Registrations */}
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedFilter === "all"
                      ? "border-sky-500 bg-sky-500/10 text-white shadow-sm shadow-sky-500/10"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-bold">All Registrations</div>
                      <div className="text-[10px] text-slate-400">Complete Master List</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold rounded-full bg-slate-800 px-2 py-0.5 text-sky-300">
                    {totalCount}
                  </span>
                </button>

                {/* Option: Approved Squads Only */}
                <button
                  type="button"
                  onClick={() => setSelectedFilter("approved")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedFilter === "approved"
                      ? "border-emerald-500 bg-emerald-500/10 text-white shadow-sm shadow-emerald-500/10"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">Approved Squads</div>
                      <div className="text-[10px] text-slate-400">Verified & Active</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold rounded-full bg-slate-800 px-2 py-0.5 text-emerald-400">
                    {approvedCount}
                  </span>
                </button>

                {/* Option: Squads with APIs Allotted */}
                <button
                  type="button"
                  onClick={() => setSelectedFilter("allotted")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedFilter === "allotted"
                      ? "border-cyan-500 bg-cyan-500/10 text-white shadow-sm shadow-cyan-500/10"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold">APIs Allotted</div>
                      <div className="text-[10px] text-slate-400">Has API set assignment</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold rounded-full bg-slate-800 px-2 py-0.5 text-cyan-300">
                    {allottedCount}
                  </span>
                </button>

                {/* Option: Pending Review Squads */}
                <button
                  type="button"
                  onClick={() => setSelectedFilter("pending")}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedFilter === "pending"
                      ? "border-amber-500 bg-amber-500/10 text-white shadow-sm shadow-amber-500/10"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold">Pending Review</div>
                      <div className="text-[10px] text-slate-400">Awaiting squad approval</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold rounded-full bg-slate-800 px-2 py-0.5 text-amber-400">
                    {pendingCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Document Details Preview Box */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800/60">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">
                  Report Specification
                </span>
                <span className="text-sky-400">Landscape A4 · Auto-Paginated</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
                <div>
                  <span className="text-slate-500">Columns Included:</span>
                  <p className="text-slate-200 mt-0.5 text-[10px] leading-relaxed">
                    Squad Name, Status, Leader (Name & Email), Teammate (Name & Email), Allotted APIs (Set # & APIs), Deliverables, Registered Date.
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Executive Summary:</span>
                  <p className="text-slate-200 mt-0.5 text-[10px] leading-relaxed">
                    Header KPI cards, total hacker tally, allotment breakdown, and official DAU / MSTC timestamp footer.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2.5 text-center text-xs font-mono text-sky-300 animate-in fade-in">
                {statusMessage}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <a
                href={`/api/admin/export-pdf?filter=${selectedFilter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Direct browser download link via API"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Direct API Download Link</span>
              </a>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                  className="w-full sm:w-auto rounded-lg border border-slate-800 px-4 py-2 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf()}
                  disabled={isGenerating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs px-5 py-2 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  <FileDown className="h-4 w-4" />
                  <span>
                    {isGenerating
                      ? "Generating..."
                      : `Download PDF (${getFilteredTeams(selectedFilter).length} Teams)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
