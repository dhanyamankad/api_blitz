"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Radio,
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
    setNumber?: number | null;
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
  setNumber?: number | null;
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
    rulebookFileName?: string;
    rulebookFileUpdatedAt?: Date | null;
    rulebookFileSize?: number;
    announcement: string;
    nowOverride: Date | null;
    submissionsUnlocked?: boolean;
    apisPublished?: boolean;
  };
}

type TabType = "queue" | "apis" | "submissions" | "settings";

export function AdminDashboardClient({ teams, apis, settings }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const router = useRouter();
  const [isSyncing, startSync] = useTransition();

  const handleManualSync = () => {
    startSync(() => {
      router.refresh();
    });
  };

  // Real-time synchronization across all logged-in admins
  useEffect(() => {
    // 1. Supabase Realtime channel for instant postgres changes
    const supabase = createClient();
    const channel = supabase
      .channel("admin-multi-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          startSync(() => {
            router.refresh();
          });
        }
      )
      .subscribe();

    // 2. Fallback polling every 8s while the tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        startSync(() => {
          router.refresh();
        });
      }
    }, 8000);

    // 3. Instant sync whenever the admin tabs back into the window
    const onFocus = () => {
      startSync(() => {
        router.refresh();
      });
    };
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

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

      {/* Navigation Tab Bar & Live Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-px gap-3">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0">
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

        {/* Real-time synchronization indicator & action */}
        <div className="flex items-center gap-2.5 pb-2 sm:pb-0 px-2 sm:px-0 self-end sm:self-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE SYNC ACTIVE</span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            title="Force refresh database state across all organizers"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-sky-400" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "queue" && (
          <ApprovalQueue initialTeams={teams} />
        )}

        {activeTab === "apis" && (
          <ApiAssignmentManager
            apis={apis}
            approvedTeams={approvedTeams}
            apisPublished={settings.apisPublished}
          />
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
