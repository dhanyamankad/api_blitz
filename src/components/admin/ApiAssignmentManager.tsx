"use client";

import { useState, useTransition } from "react";
import {
  autoAssignApisAction,
  autoAssignTeamApisAction,
  manualAssignApisAction,
  addApiAction,
  deleteApiAction,
  togglePublishApisAction,
} from "@/app/admin/actions";
import {
  Sparkles,
  Plus,
  ExternalLink,
  Search,
  Check,
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Code2,
} from "lucide-react";

interface ApiData {
  id: string;
  name: string;
  docsLink: string;
  assignments: { teamId: string }[];
}

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
  members: TeamMemberData[];
  assignments: { api: { id: string; name: string; docsLink: string } }[];
}

interface ApiAssignmentManagerProps {
  apis: ApiData[];
  approvedTeams: TeamData[];
  apisPublished?: boolean;
}

export function ApiAssignmentManager({
  apis,
  approvedTeams,
  apisPublished = false,
}: ApiAssignmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [manualModeTeamId, setManualModeTeamId] = useState<string | null>(null);
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filtered APIs for the catalog
  const filteredApis = apis.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.docsLink.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered approved teams
  const filteredTeams = approvedTeams.filter((t) =>
    t.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
  );

  const unassignedTeamsCount = approvedTeams.filter(
    (t) => t.assignments.length < 5
  ).length;

  // Bulk auto-assign across all teams needing APIs
  const handleBulkAutoAssign = () => {
    if (
      !confirm(
        `Are you sure you want to balance & allot 5 APIs to all ${unassignedTeamsCount} unassigned approved team(s)?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      setStatusMsg(null);
      const res = await autoAssignApisAction();
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({
          type: "success",
          text: res.message || "Bulk auto-allotment completed successfully!",
        });
      }
    });
  };

  // Auto-allot for single team
  const handleTeamAutoAssign = (teamId: string, teamName: string) => {
    startTransition(async () => {
      setStatusMsg(null);
      const res = await autoAssignTeamApisAction(teamId);
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({
          type: "success",
          text: `Allotted 5 balanced APIs to "${teamName}".`,
        });
        setManualModeTeamId(null);
      }
    });
  };

  // Save manual 5-API selection
  const handleSaveManual = (teamId: string, teamName: string) => {
    if (selectedApiIds.length !== 5) {
      setStatusMsg({
        type: "error",
        text: `Please select exactly 5 APIs (currently selected: ${selectedApiIds.length}).`,
      });
      return;
    }
    startTransition(async () => {
      setStatusMsg(null);
      const res = await manualAssignApisAction(teamId, selectedApiIds);
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({
          type: "success",
          text: `Custom 5 APIs saved for "${teamName}".`,
        });
        setManualModeTeamId(null);
      }
    });
  };

  // Toggle Publish APIs
  const handleTogglePublish = () => {
    const actionDesc = apisPublished ? "lock/unpublish" : "publish";
    if (
      !confirm(
        `Are you sure you want to ${actionDesc} APIs for all participant dashboards?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      setStatusMsg(null);
      const res = await togglePublishApisAction(!apisPublished);
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({
          type: "success",
          text: res.message || `APIs ${actionDesc}ed successfully!`,
        });
      }
    });
  };

  // Delete an API
  const handleDeleteApi = (apiId: string, apiName: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${apiName}" from the catalog? This will also remove any assignments for this API.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      setStatusMsg(null);
      const res = await deleteApiAction(apiId);
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({
          type: "success",
          text: `Removed "${apiName}" from API pool.`,
        });
      }
    });
  };

  const toggleSelectApi = (id: string) => {
    if (selectedApiIds.includes(id)) {
      setSelectedApiIds(selectedApiIds.filter((x) => x !== id));
    } else {
      if (selectedApiIds.length >= 5) {
        alert("You can only select up to 5 APIs.");
        return;
      }
      setSelectedApiIds([...selectedApiIds, id]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Publish APIs Quick Switch */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-sky-400" />
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                API Allotment & Participant Release
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  apisPublished
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {apisPublished ? "PUBLISHED (LIVE)" : "DRAFT (LOCKED FOR PARTICIPANTS)"}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed max-w-2xl">
              {apisPublished
                ? "APIs are currently unlocked and visible on all participant dashboards. Participants can see their 5 allotted APIs and documentation links."
                : "APIs are currently locked in participant dashboards. Allot APIs below, then click Publish APIs to reveal them to participants."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleTogglePublish}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold transition-all shadow-sm ${
                apisPublished
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold"
              }`}
            >
              {apisPublished ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Unpublish APIs (Lock)</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>🚀 Publish APIs to Participants</span>
                </>
              )}
            </button>

            {unassignedTeamsCount > 0 && (
              <button
                onClick={handleBulkAutoAssign}
                disabled={isPending || apis.length < 5}
                className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-4 py-2.5 text-xs font-mono font-bold transition-colors shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Auto-Allot for All {unassignedTeamsCount} Teams</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`text-xs font-mono p-4 rounded-xl border flex items-center justify-between gap-3 ${
            statusMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === "success" ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: Approved Squads Allotment Status & Interactive Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white tracking-wider uppercase flex items-center gap-2">
              <span>Approved Squads Allotment</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({approvedTeams.length} Approved Squads)
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Click on any squad card to view allotted APIs or assign new APIs.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={teamSearchTerm}
              onChange={(e) => setTeamSearchTerm(e.target.value)}
              placeholder="Search squad name..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-mono text-slate-400">
            {approvedTeams.length === 0
              ? "No approved teams yet. Approve squads in the Approval Queue to assign them APIs."
              : "No squads match your search filter."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTeams.map((team) => {
              const hasFiveApis = team.assignments.length === 5;
              const isExpanded = expandedTeamId === team.id;
              const isManualMode = manualModeTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className={`rounded-2xl border transition-all ${
                    isExpanded
                      ? "border-sky-500/40 bg-slate-900/90 shadow-lg"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  {/* Clickable Header Bar */}
                  <div
                    onClick={() => {
                      setExpandedTeamId(isExpanded ? null : team.id);
                      if (isExpanded) {
                        setManualModeTeamId(null);
                      }
                    }}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-base">
                          {team.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            hasFiveApis
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {hasFiveApis
                            ? "✅ 5 / 5 APIs ALLOTTED"
                            : `⚠️ ${team.assignments.length} / 5 APIs ALLOTTED`}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                        {team.members.map((m) => (
                          <span key={m.id} className="text-slate-400">
                            {m.isLeader ? "👑 Leader: " : "Teammate: "}
                            <span className="text-slate-200">{m.name}</span>{" "}
                            <span className="text-slate-500">({m.email})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-sky-400 hidden sm:inline">
                        {isExpanded ? "Hide Details" : "View & Allot"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Card Body: View Allotted APIs or Allot Options */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 p-4 sm:p-6 bg-slate-950/50 space-y-5 rounded-b-2xl">
                      {/* Case 1: 5 APIs Are Allotted */}
                      {hasFiveApis && !isManualMode && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>5 APIs Allotted to this Squad</span>
                            </div>

                            <button
                              onClick={() => {
                                setManualModeTeamId(team.id);
                                setSelectedApiIds(
                                  team.assignments.map((a) => a.api.id)
                                );
                              }}
                              className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Change / Re-Allot</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {team.assignments.map((asgn, i) => (
                              <div
                                key={asgn.api.id}
                                className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 flex flex-col justify-between"
                              >
                                <div>
                                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                                    API 0{i + 1}
                                  </span>
                                  <h4 className="font-bold text-white text-xs leading-tight mb-2">
                                    {asgn.api.name}
                                  </h4>
                                </div>
                                <a
                                  href={asgn.api.docsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1 mt-2"
                                >
                                  <span>Docs</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Case 2: APIs Not Allotted (< 5) OR in Re-allot Mode */}
                      {(!hasFiveApis || isManualMode) && (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>
                                  {hasFiveApis
                                    ? "Re-Allotting APIs for Squad"
                                    : "Squad Awaiting API Allotment (0 / 5 Assigned)"}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-1">
                                Choose 1-Click Auto-Allot to automatically balance with the lowest-used APIs, or manually pick 5 APIs.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  handleTeamAutoAssign(team.id, team.name)
                                }
                                disabled={isPending || apis.length < 5}
                                className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 px-3.5 py-2 text-xs font-mono font-bold transition-colors"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>1-Click Auto-Allot 5 APIs</span>
                              </button>

                              {!isManualMode ? (
                                <button
                                  onClick={() => {
                                    setManualModeTeamId(team.id);
                                    setSelectedApiIds(
                                      team.assignments.map((a) => a.api.id)
                                    );
                                  }}
                                  className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-mono text-slate-200"
                                >
                                  Manual Pick
                                </button>
                              ) : (
                                <button
                                  onClick={() => setManualModeTeamId(null)}
                                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Manual Selection Grid */}
                          {isManualMode && (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="text-xs font-mono font-bold text-white uppercase">
                                  Select Exactly 5 APIs ({selectedApiIds.length} / 5 Selected)
                                </span>
                                <button
                                  onClick={() =>
                                    handleSaveManual(team.id, team.name)
                                  }
                                  disabled={
                                    isPending || selectedApiIds.length !== 5
                                  }
                                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-mono font-bold text-xs px-3.5 py-1.5 transition-colors"
                                >
                                  Save 5 APIs to Squad
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                                {apis.map((api) => {
                                  const isSelected = selectedApiIds.includes(
                                    api.id
                                  );
                                  return (
                                    <div
                                      key={api.id}
                                      onClick={() => toggleSelectApi(api.id)}
                                      className={`rounded-lg border p-2.5 flex items-start gap-2.5 cursor-pointer transition-colors ${
                                        isSelected
                                          ? "border-sky-500 bg-sky-950/40 text-white"
                                          : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold truncate">
                                          {api.name}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500 truncate">
                                          {api.assignments.length} assigned
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Complete API Catalog & Management */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-bold font-mono text-white tracking-wider uppercase flex items-center gap-2">
              <Code2 className="h-4 w-4 text-sky-400" />
              <span>API Vault Catalog ({apis.length} Total APIs)</span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              List of all APIs added by organizers. Each API has a name and clickable documentation link.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search API name or link..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New API</span>
            </button>
          </div>
        </div>

        {/* Add API Form */}
        {showAddForm && (
          <div className="rounded-xl border border-sky-500/40 bg-slate-950 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Add New API to Catalog
              </h4>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <form
              action={async (formData) => {
                const res = await addApiAction(formData);
                if (res.success) {
                  setShowAddForm(false);
                  setStatusMsg({
                    type: "success",
                    text: res.message || "API added successfully!",
                  });
                } else if (res.error) {
                  setStatusMsg({ type: "error", text: res.error });
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <div className="sm:col-span-2">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="API Name (e.g. Stripe, Twilio, Resend)"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="url"
                  name="docsLink"
                  required
                  placeholder="API Documentation Link (https://...)"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold py-2 transition-colors"
                >
                  Save API
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grid of APIs */}
        {filteredApis.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-center text-xs font-mono text-slate-400">
            {apis.length === 0
              ? "No APIs in the catalog yet. Click 'Add New API' to add APIs to the pool."
              : "No APIs found matching your search term."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredApis.map((api) => (
              <div
                key={api.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between group hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors">
                      {api.name}
                    </span>
                    <button
                      onClick={() => handleDeleteApi(api.id, api.name)}
                      title="Delete API"
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <a
                    href={api.docsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1 truncate"
                    title={api.docsLink}
                  >
                    <span className="truncate">{api.docsLink}</span>
                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  </a>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Assigned Count</span>
                  <span className="rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 text-sky-400 font-semibold">
                    {api.assignments.length} squads
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
