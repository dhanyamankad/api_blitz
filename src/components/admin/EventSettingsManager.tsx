"use client";

import { useActionState } from "react";
import { updateSettingsAction, AdminActionState } from "@/app/admin/actions";
import { Settings, Save, AlertCircle, Check, MessageSquare, Clock, ShieldAlert, Link as LinkIcon, TestTube, Lock } from "lucide-react";

interface EventSettingsManagerProps {
  settings: {
    eventStartAt: Date | null;
    submissionDeadline: Date | null;
    whatsappUrl: string;
    rulebookUrl: string;
    announcement: string;
    nowOverride: Date | null;
    submissionsUnlocked?: boolean;
    apisPublished?: boolean;
  };
}

export function EventSettingsManager({ settings }: EventSettingsManagerProps) {
  const [state, formAction, isPending] = useActionState<AdminActionState, FormData>(
    updateSettingsAction,
    {}
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-6">
          <Settings className="h-5 w-5 text-sky-400" />
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Event Control Center
          </h2>
        </div>

        {state?.error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Announcement Banner */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
              <span>GLOBAL ANNOUNCEMENT BANNER</span>
            </label>
            <input
              type="text"
              name="announcement"
              defaultValue={settings.announcement}
              placeholder="e.g. Welcome hackers! Team registration is now live."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
            />
            <p className="mt-1 text-[11px] font-mono text-slate-400">
              Displayed prominently across the top of the landing page and dashboard. Leave blank to hide.
            </p>
          </div>

          {/* Timestamps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>EVENT START (KICKOFF)</span>
              </label>
              <input
                type="text"
                name="event_start_at"
                defaultValue={settings.eventStartAt ? settings.eventStartAt.toISOString() : ""}
                placeholder="2026-10-27T13:30:00.000Z"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                ISO timestamp (e.g. 2026-10-27T13:30:00.000Z for 7PM IST)
              </span>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>SUBMISSION DEADLINE</span>
              </label>
              <input
                type="text"
                name="submission_deadline"
                defaultValue={settings.submissionDeadline ? settings.submissionDeadline.toISOString() : ""}
                placeholder="2026-10-28T13:30:00.000Z"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                Submissions automatically lock on server after this moment.
              </span>
            </div>
          </div>

          {/* Publish APIs to Participants Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚀</span>
                  <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                    Publish Allotted APIs to Participants
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      settings.apisPublished
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {settings.apisPublished ? "PUBLISHED (LIVE)" : "UNPUBLISHED (LOCKED)"}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-xl">
                  When enabled, participant dashboards will unlock and reveal their 5 allotted APIs along with direct documentation links. Keep disabled until official sprint kickoff.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  name="apis_published"
                  value="true"
                  defaultChecked={settings.apisPublished}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Submissions Lock / Unlock Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                    Submissions Lock Status
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      settings.submissionsUnlocked
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {settings.submissionsUnlocked ? "UNLOCKED (OPEN)" : "LOCKED (CLOSED)"}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-xl">
                  When locked, participants cannot submit and see a locked notice. Switch this on when organizers officially open repository & YouTube submissions during the sprint. (Submissions will always automatically hard-lock after 28 Oct 2:00 AM IST).
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  name="submissions_unlocked"
                  value="true"
                  defaultChecked={settings.submissionsUnlocked}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* URLs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>WHATSAPP COMMUNITY INVITE LINK</span>
              </label>
              <input
                type="url"
                name="whatsapp_url"
                defaultValue={settings.whatsappUrl}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                Visible only to logged-in @dau.ac.in participants.
              </span>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-purple-400" />
                <span>RULEBOOK PDF URL</span>
              </label>
              <input
                type="url"
                name="rulebook_url"
                defaultValue={settings.rulebookUrl}
                placeholder="https://... or empty for /api-blitz-spec.pdf"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                Direct public link to the official rulebook PDF.
              </span>
            </div>
          </div>

          {/* Time Machine / Test Simulator */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-4 space-y-2">
            <label className="text-xs font-mono font-semibold text-purple-300 flex items-center gap-1.5">
              <TestTube className="h-3.5 w-3.5 text-purple-400" />
              <span>TEST SIMULATOR (`now_override`)</span>
            </label>
            <input
              type="text"
              name="now_override"
              defaultValue={settings.nowOverride ? settings.nowOverride.toISOString() : ""}
              placeholder="Leave blank for live real-time (or ISO string to simulate date)"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[10px] font-mono text-slate-400">
              Useful to test API reveal animation or submission deadline locks before the real event. Leave empty for normal clock.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs px-6 py-3 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Saving Settings..." : "Save Event Settings"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
