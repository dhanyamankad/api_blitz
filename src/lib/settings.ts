import { prisma } from "@/lib/prisma";

export type EventSettings = {
  eventStartAt: Date | null;
  submissionDeadline: Date | null;
  whatsappUrl: string;
  rulebookUrl: string;
  announcement: string;
  nowOverride: Date | null;
  submissionsUnlocked: boolean;
};

const toDate = (v?: string) => (v && !Number.isNaN(Date.parse(v)) ? new Date(v) : null);

export async function getSettings(): Promise<EventSettings> {
  let map: Record<string, string> = {};
  try {
    const rows = await prisma.setting.findMany();
    map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    // DB unreachable (e.g. first local run): fall back to empty settings
  }
  return {
    eventStartAt: toDate(map.event_start_at),
    submissionDeadline: toDate(map.submission_deadline),
    whatsappUrl: map.whatsapp_url ?? "",
    rulebookUrl: map.rulebook_url ?? "",
    announcement: map.announcement ?? "",
    nowOverride: toDate(map.now_override),
    submissionsUnlocked: map.submissions_unlocked === "true",
  };
}

/** The site's notion of "now". Admins can set now_override to test reveal/lock behaviour. */
export function siteNow(s: EventSettings): Date {
  return s.nowOverride ?? new Date();
}

export type Phase = "before_start" | "live" | "ended";

export function eventPhase(s: EventSettings): Phase {
  const now = siteNow(s).getTime();
  if (s.eventStartAt && now < s.eventStartAt.getTime()) return "before_start";
  if (s.submissionDeadline && now >= s.submissionDeadline.getTime()) return "ended";
  return "live";
}

/** Submissions are only open if explicitly unlocked by admin AND deadline has not passed. */
export function areSubmissionsOpen(s: EventSettings): boolean {
  const now = siteNow(s).getTime();
  if (s.submissionDeadline && now >= s.submissionDeadline.getTime()) {
    return false;
  }
  return s.submissionsUnlocked;
}

export function daysUntil(target: Date | null, s: EventSettings): number | null {
  if (!target) return null;
  return Math.max(0, Math.ceil((target.getTime() - siteNow(s).getTime()) / 86_400_000));
}
