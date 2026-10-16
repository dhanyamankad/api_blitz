import { Cpu, Users, GitBranch, ShieldCheck, FileText, Download, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface EventOverviewProps {
  rulebookUrl?: string;
}

export function EventOverview({ rulebookUrl }: EventOverviewProps) {
  const cards = [
    {
      icon: Users,
      tag: "TEAM FORMAT",
      title: "2-Person Squads",
      desc: "Register with your DAU classmate. The team leader signs in, names the team, and adds their partner's @dau.ac.in email.",
      color: "from-cyan-500/20 to-blue-500/10",
      border: "border-cyan-500/30",
      accent: "text-cyan-400",
    },
    {
      icon: Cpu,
      tag: "THE SURPRISE",
      title: "5 Secret APIs",
      desc: "At exactly 7:00 PM on 27 October, each approved team receives 5 randomly allotted APIs from our curated 100-API vault.",
      color: "from-purple-500/20 to-indigo-500/10",
      border: "border-purple-500/30",
      accent: "text-purple-400",
    },
    {
      icon: GitBranch,
      tag: "EXECUTION",
      title: "6-Hour Sprint",
      desc: "Integrate, architect, and ship your solution. Collaborate on GitHub and polish your submission before the clock strikes zero.",
      color: "from-sky-500/20 to-cyan-500/10",
      border: "border-sky-500/30",
      accent: "text-sky-400",
    },
    {
      icon: ShieldCheck,
      tag: "FAIR PLAY",
      title: "Strict Deadline Lock",
      desc: "Submissions lock automatically on the server at the deadline. Edits are allowed anytime before the cutoff—your latest commit counts.",
      color: "from-emerald-500/20 to-teal-500/10",
      border: "border-emerald-500/30",
      accent: "text-emerald-400",
    },
  ];

  return (
    <section id="about" className="py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-medium text-cyan-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>EVENT BLUEPRINT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How API Blitz Works
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            API Blitz challenges developer duos to turn unexpected API combinations into working, high-impact prototypes under competition pressure.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Glow splash on hover */}
                <div
                  className={`absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br ${card.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      {card.tag}
                    </span>
                    <div className={`p-2 rounded-xl bg-white/[0.03] border border-white/10 ${card.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">Stage 0{i + 1}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/50 group-hover:bg-cyan-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Rulebook Download Banner */}
        <div className="mt-12 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">Official Event Rulebook & Guidelines</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Read the complete judging criteria, submission requirements, team policies, and technical rules before kickoff.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/rulebook"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-5 py-3 sm:py-2.5 text-xs font-mono font-semibold text-white transition-all active:scale-[0.98]"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>View Rulebook</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 sm:py-2.5 text-xs font-mono font-bold text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98]"
            >
              <span>Register Squad</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
