import Link from "next/link";
import { getSettings, daysUntil, eventPhase } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const s = await getSettings();
  const phase = eventPhase(s);
  const days = daysUntil(phase === "before_start" ? s.eventStartAt : s.submissionDeadline, s);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24">
      <h1 className="text-5xl font-bold tracking-tight">API Blitz</h1>
      <p className="text-slate-300">
        A 2-person-team API event by Microsoft Club, DAU. Event description goes here.
      </p>
      {days !== null && phase !== "ended" && (
        <p className="text-lg">
          {days} day{days === 1 ? "" : "s"} {phase === "before_start" ? "until the event starts" : "until submissions close"}
        </p>
      )}
      {phase === "ended" && <p className="text-lg">Submissions are closed.</p>}
      <div className="flex gap-4">
        <Link href="/login" className="rounded bg-sky-500 px-5 py-2 font-medium text-slate-950">
          Login with DAU account
        </Link>
        {s.rulebookUrl && (
          <a href={s.rulebookUrl} className="rounded border border-slate-600 px-5 py-2">
            Rulebook (PDF)
          </a>
        )}
      </div>
    </main>
  );
}
