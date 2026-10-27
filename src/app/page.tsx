import Link from "next/link";
import { ArrowRight, Sparkles, Terminal, FileText, Users, ShieldAlert, Zap, MessageSquare, MapPin, Lock } from "lucide-react";
import { getSettings, eventPhase } from "@/lib/settings";
import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { Countdown } from "@/components/Countdown";
import { EventOverview } from "@/components/EventOverview";
import { Timeline } from "@/components/Timeline";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [s, session] = await Promise.all([getSettings(), auth()]);
  const phase = eventPhase(s);

  const targetDate =
    phase === "before_start"
      ? s.eventStartAt?.toISOString() ?? null
      : s.submissionDeadline?.toISOString() ?? null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Announcement Banner (if admin configured) */}
        {s.announcement && (
          <div className="border-b border-slate-800 bg-slate-900/90 py-2.5 px-4 text-center">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-xs font-mono text-slate-300">
              <Zap className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span>{s.announcement}</span>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Sponsor & Organizer Banner: NEON x MSTC */}
            <div className="inline-flex items-center gap-3 sm:gap-4 rounded-full border border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 py-2 sm:py-2.5 backdrop-blur-md mb-6 shadow-xl hover:border-slate-700 transition-all">
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/neon-logo.svg"
                  alt="Neon"
                  className="h-4 sm:h-5 w-auto object-contain"
                />
              </div>

              <span className="text-xs sm:text-sm font-mono font-bold text-slate-500 select-none">
                ✕
              </span>

              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="MSTC"
                  className="h-4 sm:h-5 w-auto object-contain"
                />
              </div>
            </div>

            {/* Venue & Registration Status Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-mono font-semibold text-rose-300 backdrop-blur-md shadow-lg shadow-rose-500/10">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span>VENUE: CEP 102</span>
                <span className="text-rose-500/50">·</span>
                <span className="text-slate-300">DHIRUBHAI AMBANI UNIVERSITY</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-mono font-semibold text-amber-300 backdrop-blur-md">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>REGISTRATIONS CLOSED</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              2 HACKERS. <br className="hidden sm:inline" />
              <span className="text-sky-400">5 SECRET APIS.</span> 6 HOURS.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              API Blitz is the flagship 2-person engineering sprint at Dhirubhai Ambani University, taking place live at <strong className="text-white font-semibold">CEP 102</strong>. Form your duo, receive your secret API bundle at kickoff, and push your limits.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3.5 text-sm font-mono font-bold text-slate-950 transition-colors shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Open Your Team Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3.5 text-sm font-mono font-bold text-slate-950 transition-colors shadow-sm"
                >
                  <Terminal className="h-4 w-4" />
                  <span>Sign In to Participant Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <Link
                href="/rulebook"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-6 py-3.5 text-sm font-mono font-medium text-slate-200 hover:border-cyan-400/50 hover:bg-slate-900 transition-all active:scale-[0.98]"
              >
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>View Rulebook</span>
              </Link>
            </div>

            {/* Quick Event Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-300">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span>Venue: <strong className="font-bold text-white">CEP 102</strong></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-sky-400" />
                <span>2 Hackers / Squad</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>6 Hours Sprint</span>
              </div>
            </div>

            {/* Dynamic Countdown Section */}
            <div className="mt-14 w-full">
              <Countdown targetDate={targetDate} phase={phase} />
            </div>
          </div>
        </section>

        {/* EVENT OVERVIEW SECTION */}
        <EventOverview rulebookUrl={s.rulebookUrl} />

        {/* TIMELINE SECTION */}
        <Timeline />

        {/* FAQ SECTION */}
        <section className="py-20 border-t border-white/[0.05] relative">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="mt-2 text-xs text-slate-400 font-mono">Everything you need to know about the format</p>
            </div>

            <div className="grid gap-4 sm:gap-6">
              {[
                {
                  q: "Where is the event taking place?",
                  a: "The hackathon takes place offline on-campus at CEP 102, Dhirubhai Ambani University. All registered squads should report to CEP 102 before 7:30 PM with their laptops and chargers.",
                },
                {
                  q: "Who is eligible to participate?",
                  a: "Any student with an active @dau.ac.in Google account is eligible. Both undergraduate and postgraduate students can participate.",
                },
                {
                  q: "How does the team registration flow work?",
                  a: "Only the Team Leader needs to fill the form. The leader signs in, chooses a team name, and enters their partner's name and @dau.ac.in email. Both are registered instantly upon submission.",
                },
                {
                  q: "Does the second member have to confirm before registration completes?",
                  a: "No! There is zero friction. When your teammate signs in later with their DAU Google account, the platform recognizes their email and links them to the team page automatically.",
                },
                {
                  q: "Can someone be in more than one team?",
                  a: "Strictly no. Each @dau.ac.in email can only belong to one team. Our database enforces this at the table constraint level, so duplicate registrations are impossible.",
                },
                {
                  q: "How and when are the 5 APIs revealed?",
                  a: "The APIs are locked until the event start countdown hits zero (27 October 2026, 7:30 PM IST). At that exact second, your dashboard reveals your team's 5 assigned APIs with official documentation links.",
                },
                {
                  q: "Can we modify our GitHub submission before the deadline?",
                  a: "Yes! You can edit your submitted repository link as many times as you like. The final link saved when the deadline expires will be reviewed by judges.",
                },
              ].map((item, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-6 border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">Q.</span>
                    {item.q}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
