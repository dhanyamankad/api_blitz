"use client";

import { useActionState, useState, useTransition } from "react";
import { updateSettingsAction, removeRulebookAction, AdminActionState } from "@/app/admin/actions";
import {
  Settings,
  Save,
  AlertCircle,
  Check,
  MessageSquare,
  Clock,
  ShieldAlert,
  Link as LinkIcon,
  TestTube,
  Lock,
  FileText,
  UploadCloud,
  ExternalLink,
  Trash2,
  FileCheck2,
  X,
} from "lucide-react";

interface EventSettingsManagerProps {
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
    registrationsLocked?: boolean;
  };
}

export function EventSettingsManager({ settings }: EventSettingsManagerProps) {
  const [state, formAction, isPending] = useActionState<AdminActionState, FormData>(
    updateSettingsAction,
    {}
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRemovingFile, startRemoveTransition] = useTransition();
  const [localFeedback, setLocalFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
        setLocalFeedback({ type: "error", msg: "Please select a valid PDF file (.pdf)" });
        setSelectedFile(null);
        e.target.value = "";
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setLocalFeedback({ type: "error", msg: "File size exceeds 15MB limit" });
        setSelectedFile(null);
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      setLocalFeedback(null);
    }
  };

  const handleRemoveCustomRulebook = () => {
    if (!confirm("Are you sure you want to remove the uploaded rulebook and revert back to default /rulebook.pdf?")) {
      return;
    }
    startRemoveTransition(async () => {
      setLocalFeedback(null);
      const res = await removeRulebookAction();
      if (res.error) {
        setLocalFeedback({ type: "error", msg: res.error });
      } else {
        setLocalFeedback({ type: "success", msg: res.message || "Custom rulebook removed." });
        setSelectedFile(null);
      }
    });
  };

  const isCustomFileActive =
    !!settings.rulebookFileName ||
    settings.rulebookUrl === "/api/rulebook" ||
    settings.rulebookUrl.startsWith("/api/rulebook");

  const isExternalUrlActive =
    !isCustomFileActive &&
    !!settings.rulebookUrl &&
    settings.rulebookUrl !== "/rulebook.pdf" &&
    settings.rulebookUrl !== "/api-blitz-spec.pdf";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-6">
          <Settings className="h-5 w-5 text-sky-400" />
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Event Control Center
          </h2>
        </div>

        {/* Global Feedback */}
        {localFeedback && (
          <div
            className={`mb-6 rounded-xl border p-3.5 text-xs font-mono flex items-center justify-between gap-2 ${
              localFeedback.type === "error"
                ? "border-red-500/30 bg-red-950/30 text-red-300"
                : "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {localFeedback.type === "error" ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              ) : (
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
              <span>{localFeedback.msg}</span>
            </div>
            <button
              onClick={() => setLocalFeedback(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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
                <div className="flex items-center gap-2 flex-wrap">
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

          {/* Registration Lock Toggle */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                    Registration Lock (Deadline Over)
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      settings.registrationsLocked
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {settings.registrationsLocked ? "LOCKED (CLOSED)" : "OPEN (ACCEPTING TEAMS)"}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-xl">
                  When locked, new team registrations are disabled across the public platform and unregistered users see a deadline closed screen. Keep this locked as the registration deadline has concluded.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  name="registrations_locked"
                  value="true"
                  defaultChecked={settings.registrationsLocked}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Submissions Lock / Unlock Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
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

          {/* WhatsApp URL */}
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

          {/* ========================================================= */}
          {/* DEDICATED OFFICIAL RULEBOOK MANAGEMENT (FILE & URL)       */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-sky-500/20 bg-slate-950/80 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                  Official Rulebook Publication
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isCustomFileActive ? (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1">
                    <FileCheck2 className="h-3 w-3" />
                    <span>CUSTOM FILE ACTIVE</span>
                  </span>
                ) : isExternalUrlActive ? (
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-purple-400 flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    <span>EXTERNAL LINK ACTIVE</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                    DEFAULT STATIC PDF ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Currently Active Status Display */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-0.5">
                    Currently Active Rulebook Document
                  </span>
                  <div className="text-xs font-mono font-semibold text-white flex items-center gap-2 flex-wrap">
                    <span>
                      {settings.rulebookFileName || (isExternalUrlActive ? settings.rulebookUrl : "rulebook.pdf (Default)")}
                    </span>
                    {settings.rulebookFileSize && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({formatFileSize(settings.rulebookFileSize)})
                      </span>
                    )}
                  </div>
                  {settings.rulebookFileUpdatedAt && (
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      Uploaded on{" "}
                      {new Date(settings.rulebookFileUpdatedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <a
                    href={settings.rulebookUrl || "/rulebook.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-mono text-slate-200 transition-colors"
                  >
                    <span>Preview Live PDF</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {isCustomFileActive && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomRulebook}
                      disabled={isRemovingFile}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 px-3 py-1.5 text-xs font-mono transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{isRemovingFile ? "Removing..." : "Revert to Default"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Upload File Input Zone */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 block flex items-center gap-1.5">
                <UploadCloud className="h-3.5 w-3.5 text-sky-400" />
                <span>UPLOAD NEW RULEBOOK (PDF FILE)</span>
              </label>

              <div className="relative border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-xl p-5 text-center transition-colors bg-slate-900/40 cursor-pointer group">
                <input
                  type="file"
                  name="rulebook_file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <UploadCloud className="h-8 w-8 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-sky-400 font-bold group-hover:underline">Click to browse</span> or drag and drop your PDF here
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">
                    Supported format: PDF up to 15MB. Overwrites existing rulebook upon saving.
                  </p>
                </div>
              </div>

              {/* Selected File Feedback */}
              {selectedFile && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 flex items-center justify-between text-xs font-mono text-sky-300">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-sky-400" />
                    <span className="font-bold truncate">{selectedFile.name}</span>
                    <span className="text-slate-400 shrink-0">({formatFileSize(selectedFile.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Optional External Link Override */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="text-xs font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3 text-slate-500" />
                <span>OR PROVIDE EXTERNAL RULEBOOK LINK (OPTIONAL)</span>
              </label>
              <input
                type="url"
                name="rulebook_url"
                defaultValue={isCustomFileActive ? "" : settings.rulebookUrl}
                placeholder="https://drive.google.com/... (leave empty if uploading file above)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] font-mono text-slate-500 block mt-1">
                If both a file and URL are given, the uploaded file takes precedence.
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs px-6 py-3.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Saving Settings & Publishing..." : "Save Event Settings & Publish"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
