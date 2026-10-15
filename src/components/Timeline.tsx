import { Calendar, CheckCircle2, Clock, Trophy, Zap } from "lucide-react";

export function Timeline() {
  const steps = [
    {
      time: "ACTIVE NOW",
      title: "Team Registration Window",
      desc: "Leader signs in with Google DAU email, specifies team name, and registers partner. Registration is free and instant.",
      status: "current",
      badge: "LIVE NOW",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      icon: Zap,
    },
    {
      time: "27 OCT 2026 · 19:00 IST",
      title: "API Reveal & Kickoff",
      desc: "Countdown reaches zero! Dashboards automatically unlock each team's 5 assigned APIs with documentation links.",
      status: "upcoming",
      badge: "KICKOFF",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      icon: Clock,
    },
    {
      time: "28 OCT 2026 · 19:00 IST",
      title: "Submission Deadline",
      desc: "GitHub repository URL lock activates on the server. Your final pushed commits are frozen for evaluation.",
      status: "upcoming",
      badge: "24H MARK",
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      icon: Calendar,
    },
    {
      time: "POST EVENT",
      title: "Showcase & Winner Announcements",
      desc: "Organizer review and public showcase gallery unlock for community voting and final leaderboard honors.",
      status: "upcoming",
      badge: "FINALE",
      badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      icon: Trophy,
    },
  ];

  return (
    <section id="timeline" className="py-20 relative border-t border-white/[0.05]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono font-medium text-purple-300 mb-4">
            <Clock className="h-3.5 w-3.5" />
            <span>EVENT CHRONOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Sprint Timeline
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Mark your calendar. Every deadline is synchronized globally.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Track Line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent opacity-30" />

          <div className="space-y-8">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Center Node Icon */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-10">
                    <Icon className="h-4 w-4 text-cyan-400" />
                  </div>

                  {/* Content Card */}
                  <div className="ml-12 sm:ml-0 sm:w-1/2 sm:px-8 w-full">
                    <div className="glass-card rounded-2xl p-6 group hover:border-cyan-500/40">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold ${s.badgeColor}`}>
                          {s.badge}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {s.time}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
