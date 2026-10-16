import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileText,
  Download,
  ShieldCheck,
  Cpu,
  Users,
  Clock,
  GitBranch,
  Video,
  Trophy,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Official Event Rulebook | API Blitz 2026",
  description: "Official guidelines, eligibility, API allotment rules, submission criteria, and evaluation schedule for API Blitz 2026 at Dhirubhai Ambani University.",
};

export default function RulebookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-mono font-medium text-sky-300 mb-4 backdrop-blur-sm">
            <FileText className="h-3.5 w-3.5" />
            <span>OFFICIAL GOVERNING SPECIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-mono font-black text-white tracking-tight mb-4">
            EVENT RULEBOOK
          </h1>
          <p className="text-sm font-mono text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Governing rules, API allotment constraints, submission standards, and evaluation protocols for API Blitz 2026.
          </p>

          {/* Quick PDF Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/rulebook.pdf"
              download="API-Blitz-2026-Rulebook.pdf"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs px-5 py-2.5 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download Official PDF</span>
            </a>
            <a
              href="/rulebook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs px-4 py-2.5 transition-colors"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Rulebook Sections */}
        <div className="space-y-8">
          {/* Section 1: Duo Eligibility & Squad Format */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Section 01</span>
                <h2 className="text-lg font-bold text-white font-mono">Duo Eligibility & Squad Formation</h2>
              </div>
            </div>

            <ul className="space-y-3 text-xs font-mono text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">Campus Exclusivity:</strong> Participation is strictly limited to students of Dhirubhai Ambani University with active <code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded">@dau.ac.in</code> Google Workspace accounts.
              </li>
              <li>
                <strong className="text-white">Strict 2-Person Squads:</strong> Every registered team must consist of exactly two students (Squad Leader + Teammate). Solo registrations or squads exceeding two members are not permitted.
              </li>
              <li>
                <strong className="text-white">One-Team-Per-Person Constraint:</strong> Each student email can belong to exactly one team. This is enforced at the database constraint level. Attempting duplicate registrations will fail immediately.
              </li>
              <li>
                <strong className="text-white">Seamless Account Link:</strong> The squad leader registers the partner using their official student ID email. When the teammate signs in, their account automatically links to the team without confirmation friction.
              </li>
              <li>
                <strong className="text-white">Edit Policy:</strong> Squad leaders can modify the squad name and teammate details while the team status is <span className="text-amber-400">pending_approval</span>. Once approved by organizers, team composition is permanently locked.
              </li>
            </ul>
          </section>

          {/* Section 2: 5 Secret APIs & Allotment Vault */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Section 02</span>
                <h2 className="text-lg font-bold text-white font-mono">Secret API Allotment & The Vault</h2>
              </div>
            </div>

            <ul className="space-y-3 text-xs font-mono text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">Curated 100-API Vault:</strong> Organizers maintain a vault of 100 distinct modern REST & GraphQL APIs spanning payments, AI/ML, geospatial, communication, finance, healthcare, and multimedia.
              </li>
              <li>
                <strong className="text-white">Random Balanced Distribution:</strong> Each approved squad is allotted exactly 5 APIs drawn randomly with balance constraints to maximize project diversity across campus.
              </li>
              <li>
                <strong className="text-white">Kickoff Reveal Moment:</strong> The 5 APIs are strictly encrypted and hidden from participants until the kickoff countdown reaches zero on <span className="text-sky-300 font-bold">27 October 2026, 7:00 PM IST</span>.
              </li>
              <li>
                <strong className="text-white">Integration Requirement:</strong> Teams are required to meaningfully integrate at least two (and ideally more) of their allotted APIs into their submitted application.
              </li>
            </ul>
          </section>

          {/* Section 3: 6-Hour Sprint & Timeline */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Section 03</span>
                <h2 className="text-lg font-bold text-white font-mono">6-Hour Sprint & Official Chronology</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Sprint Kickoff</span>
                <h4 className="font-mono text-base font-bold text-white mt-1">27 Oct 2026 · 7:00 PM IST</h4>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  APIs revealed on team dashboards. Repository creation and sprint begins immediately.
                </p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4">
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Hard Submission Deadline</span>
                <h4 className="font-mono text-base font-bold text-white mt-1">28 Oct 2026 · 2:00 AM IST</h4>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Server lock activates automatically. No submissions or URL changes accepted after 2:00 AM.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-4 mt-3">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Top 7 Announcements & Presentations</span>
              <h4 className="font-mono text-base font-bold text-white mt-1">2 November 2026</h4>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Jury evaluates code repositories and demo videos. The shortlisted top 7 teams present live before faculty and student peers for podium honors.
              </p>
            </div>
          </section>

          {/* Section 4: Submission Deliverables (GitHub + YouTube) */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Section 04</span>
                <h2 className="text-lg font-bold text-white font-mono">Deliverables & Submission Criteria</h2>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-400">
              Every squad must submit their deliverables through their participant dashboard prior to the 2:00 AM deadline:
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex items-start gap-3">
                <GitBranch className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">1. GitHub Repository URL</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Must be a public repository containing working code, clean commit history showing progress during the 6-hour sprint window, and a detailed <code className="text-sky-300">README.md</code> explaining architecture and APIs used.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex items-start gap-3">
                <Video className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">2. YouTube Video Demo URL</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    A video walkthrough (recommended 2–3 minutes) demonstrating the working user interface, end-to-end functionality, and live API network calls. Unlisted or public YouTube links are accepted.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-sky-400 shrink-0" />
              <span>
                Both squad members have equal access to update and resubmit the links on the dashboard anytime before 2:00 AM IST.
              </span>
            </div>
          </section>

          {/* Section 5: Evaluation Criteria */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Section 05</span>
                <h2 className="text-lg font-bold text-white font-mono">Judging & Evaluation Framework</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>API Integration Depth</span>
                  <span className="text-sky-400">30%</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  How effectively and creatively the allotted APIs were integrated into a unified workflow.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Technical Execution</span>
                  <span className="text-purple-400">25%</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Code cleanliness, error handling, responsiveness, architectural modularity, and repo hygiene.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Originality & Utility</span>
                  <span className="text-emerald-400">25%</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Novelty of the solution, practical problem-solving value, and real-world applicability.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Demo & Presentation</span>
                  <span className="text-amber-400">20%</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Quality and clarity of the demo video, user experience, and pitch clarity during finals.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Code of Conduct & Fair Play */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Section 06</span>
                <h2 className="text-lg font-bold text-white font-mono">Academic Integrity & Fair Play</h2>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              All code submitted must be authored during the active 6-hour sprint window. Open-source libraries and boilerplate frameworks (e.g. Next.js, Vite, Tailwind) are welcome, but pre-built applications or projects from prior hackathons are strictly prohibited. Plagiarism will lead to immediate squad disqualification.
            </p>
          </section>

          {/* Embedded PDF Viewer Section */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Document Embed</span>
                <h2 className="text-lg font-bold text-white font-mono">Original PDF Document</h2>
              </div>
              <a
                href="/rulebook.pdf"
                download="API-Blitz-2026-Rulebook.pdf"
                className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF directly</span>
              </a>
            </div>

            <div className="w-full h-[650px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe
                src="/rulebook.pdf"
                title="API Blitz Official Rulebook"
                className="w-full h-full border-none"
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
