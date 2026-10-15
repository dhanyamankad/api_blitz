"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ApprovalQueue } from "./ApprovalQueue";
import { ApiAssignmentManager } from "./ApiAssignmentManager";
import { SubmissionsManager } from "./SubmissionsManager";
import { EventSettingsManager } from "./EventSettingsManager";

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
  userId: string | null;
}

interface ApiAssignmentData {
  id: string;
  api: {
    id: string;
    name: string;
    docsLink: string;
  };
}

interface SubmissionData {
  githubUrl: string;
  youtubeUrl?: string | null;
  submittedAt: Date;
  updatedAt: Date;
}

interface TeamData {
  id: string;
  name: string;
  status: "pending_approval" | "approved" | "rejected";
  createdAt: Date;
  members: TeamMemberData[];
  assignments: ApiAssignmentData[];
  submission: SubmissionData | null;
}

interface ApiData {
  id: string;
  name: string;
  docsLink: string;
  assignments: { teamId: string }[];
}

interface AdminDashboardClientProps {
  teams: TeamData[];
  apis: ApiData[];
  settings: {
    eventStartAt: Date | null;
    submissionDeadline: Date | null;
    whatsappUrl: string;
    rulebookUrl: string;
    announcement: string;
    nowOverride: Date | null;
    submissionsUnlocked?: boolean;
  };
}

type TabType = "queue" | "apis" | "submissions" | "settings";

export function AdminDashboardClient({ teams, apis, settings }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("queue");

  const pendingTeams = teams.filter((t) => t.status === "pending_approval");
  const approvedTeams = teams.filter((t) => t.status === "approved");
  const submittedTeams = teams.filter((t) => t.status === "approved" && !!t.submission);
  const totalHackers = teams.reduce((acc, t) => acc + t.members.length, 0);

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; alert?: boolean }[] = [
    {
      id: "queue",
      label: "Approval Queue",
      icon: Users,
      badge: pendingTeams.length,
      alert: pendingTeams.length > 0,
    },
    {
      id: "apis",
      label: "API Vault & Allotment",
      icon: Layers,
      badge: apis.length,
    },
    {
      id: "submissions",
      label: "Submissions & Export",
      icon: FileSpreadsheet,
      badge: submittedTeams.length,
    },
    {
      id: "settings",
      label: "Event Controls",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Awaiting Review</span>
            <Clock className={`h-4 w-4 ${pendingTeams.length > 0 ? "text-amber-400" : "text-slate-500"}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-mono font-bold ${pendingTeams.length > 0 ? "text-amber-300" : "text-white"}`}>
              {pendingTeams.length}
            </span>
            <span className="text-[11px] font-mono text-slate-500">squads</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Approved Teams</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{approvedTeams.length}</span>
            <span className="text-[11px] font-mono text-slate-500">active</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Hackers</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{totalHackers}</span>
            <span className="text-[11px] font-mono text-slate-500">students</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Submissions</span>
            <FileSpreadsheet className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{submittedTeams.length}</span>
            <span className="text-[11px] font-mono text-slate-500">/ {approvedTeams.length}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">API Vault</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{apis.length}</span>
            <span className="text-[11px] font-mono text-slate-500">APIs</span>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex overflow-x-auto border-b border-slate-800 pb-px gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-mono font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? "border-sky-400 text-sky-400 bg-sky-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {typeof tab.badge !== "undefined" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    tab.alert
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : isActive
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "queue" && (
          <ApprovalQueue initialTeams={teams} />
        )}

        {activeTab === "apis" && (
          <ApiAssignmentManager apis={apis} approvedTeams={approvedTeams} />
        )}

        {activeTab === "submissions" && (
          <SubmissionsManager teams={teams} />
        )}

        {activeTab === "settings" && (
          <EventSettingsManager settings={settings} />
        )}
      </div>
    </div>
  );
}
