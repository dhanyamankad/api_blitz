import { Calendar, CheckCircle2, Clock, Trophy, Zap } from "lucide-react";

export function Timeline() {
  const steps = [
    {
      time: "DEADLINE CONCLUDED",
      title: "Team Registration Window (Closed)",
      desc: "Registrations are officially closed. Registered squads are locked in to compete at CEP 102.",
      status: "completed",
      badge: "REGISTRATIONS CLOSED",
      badgeColor: "text-slate-400 border-slate-700 bg-slate-800/80",
      icon: CheckCircle2,
    },
    {
      time: "27 OCT 2026 · 19:30 IST · CEP 102",
      title: "API Reveal & Kickoff",
      desc: "Assemble offline at CEP 102! As countdown hits zero, dashboards unlock each team's 5 assigned APIs with official documentation links.",
      status: "upcoming",
      badge: "KICKOFF @ CEP 102",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      icon: Clock,
    },
    {
      time: "28 OCT 2026 · 02:00 IST",
      title: "Submission Deadline",
      desc: "GitHub repository and YouTube demo video URL lock activates on the server at 2:00 AM. Your final pushed work is frozen for evaluation.",
      status: "upcoming",
      badge: "SUBMISSION DEADLINE",
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      icon: Calendar,
    },
    {
      time: "2 NOV 2026",
      title: "Top 7 Announcements & Presentations",
      desc: "Shortlisted top 7 squads present their projects live before the jury and peers. Final winners and podium honors awarded.",
      status: "upcoming",
      badge: "TOP 7 & FINALE",
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
          <div className="absolute left-3.5 sm:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent opacity-30" />

          <div className="space-y-6 sm:space-y-8">
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
                  <div className="absolute left-3.5 sm:left-1/2 -translate-x-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-950 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-10">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                  </div>

                  {/* Content Card */}
                  <div className="w-full pl-8 sm:pl-0 sm:w-1/2 sm:px-8">
                    <div className="glass-card rounded-2xl p-4 sm:p-6 group hover:border-cyan-500/40">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold ${s.badgeColor}`}>
                          {s.badge}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                          {s.time}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 sm:mt-2 text-xs text-slate-400 leading-relaxed">
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
