"use client";

import { useState, useTransition } from "react";
import { autoAssignApisAction, addApiAction } from "@/app/admin/actions";
import { Sparkles, Plus, ExternalLink, Search, Check, AlertCircle, Code, Layers } from "lucide-react";

interface ApiData {
  id: string;
  name: string;
  docsLink: string;
  assignments: { teamId: string }[];
}

interface TeamData {
  id: string;
  name: string;
  assignments: { api: { id: string; name: string; docsLink: string } }[];
}

interface ApiAssignmentManagerProps {
  apis: ApiData[];
  approvedTeams: TeamData[];
}

export function ApiAssignmentManager({ apis, approvedTeams }: ApiAssignmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredApis = apis.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.docsLink.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAutoAssign = () => {
    startTransition(async () => {
      setStatusMsg(null);
      const res = await autoAssignApisAction();
      if (res.error) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({ type: "success", text: res.message || "Auto-allotment completed!" });
      }
    });
  };

  const unassignedTeamsCount = approvedTeams.filter((t) => t.assignments.length < 5).length;

  return (
    <div className="space-y-8">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-400" />
            <span>API ALLOTMENT ENGINE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {apis.length} total APIs in catalog · {unassignedTeamsCount} approved team(s) awaiting full allotment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-mono font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add API to Vault</span>
          </button>

          <button
            onClick={handleAutoAssign}
            disabled={isPending || approvedTeams.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-4 py-2 text-xs font-mono font-bold transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isPending ? "Balancing & Allotting..." : "Auto-Allot 5 APIs per Team"}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`text-xs font-mono p-3.5 rounded-xl border flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border-red-500/30 text-red-300"
          }`}
        >
          {statusMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Add API Form Modal/Drawer */}
      {showAddForm && (
        <div className="rounded-2xl border border-sky-500/30 bg-slate-900/90 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Add New API to Pool
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-xs font-mono text-slate-400 hover:text-white">
              ✕ Close
            </button>
          </div>

          <form
            action={async (formData) => {
              const res = await addApiAction(formData);
              if (res.success) {
                setShowAddForm(false);
                setStatusMsg({ type: "success", text: res.message || "Added successfully" });
              } else if (res.error) {
                setStatusMsg({ type: "error", text: res.error });
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div>
              <input
                type="text"
                name="name"
                required
                placeholder="API Name (e.g. Stripe, Twilio)"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <input
                type="url"
                name="docsLink"
                required
                placeholder="Documentation URL (https://...)"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold px-4 py-2"
            >
              Save API
            </button>
          </form>
        </div>
      )}

      {/* Approved Squads Allotment Status */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
          Approved Squad Allotments ({approvedTeams.length} Squads)
        </h3>

        {approvedTeams.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-mono text-slate-400">
            No approved teams yet. Approve teams in the Approval Queue to assign them APIs.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {approvedTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-white text-sm">{team.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {team.assignments.length === 5 ? (
                      <span className="text-emerald-400 font-semibold">5 / 5 APIs Assigned</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">
                        {team.assignments.length} / 5 APIs Assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges of assigned APIs */}
                <div className="flex flex-wrap gap-1.5 max-w-xl">
                  {team.assignments.map((asgn) => (
                    <span
                      key={asgn.api.id}
                      className="rounded bg-slate-800 border border-slate-700/80 px-2 py-0.5 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                    >
                      <span>{asgn.api.name}</span>
                      <a
                        href={asgn.api.docsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-sky-400"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Catalog Search & Distribution Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
              API Catalog & Variety Balance ({apis.length} Total)
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              The algorithm balances the assigned count to ensure an even distribution.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search API vault..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredApis.map((api) => (
            <div
              key={api.id}
              className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-white truncate">{api.name}</span>
                <span className="rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.2 text-[10px] font-mono text-sky-400 shrink-0">
                  {api.assignments.length} assigned
                </span>
              </div>
              <a
                href={api.docsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-[10px] font-mono text-slate-500 hover:text-sky-400 truncate flex items-center gap-1"
              >
                <span>{api.docsLink.replace("https://", "")}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
