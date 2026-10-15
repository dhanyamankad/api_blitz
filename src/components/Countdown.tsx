"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";

interface CountdownProps {
  targetDate: string | null;
  phase: "before_start" | "live" | "ended";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function Countdown({ targetDate, phase }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!targetDate) return;

    const calculate = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-28">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
      </div>
    );
  }

  if (phase === "ended" || (timeLeft && timeLeft.total <= 0)) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl p-6 text-center border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Submissions Locked</span>
        </div>
        <p className="text-xl font-bold text-white">The event has concluded.</p>
        <p className="text-sm text-slate-400 mt-1">Check the showcase gallery for submitted projects.</p>
      </div>
    );
  }

  const title =
    phase === "before_start"
      ? "KICKOFF COUNTDOWN"
      : "SUBMISSION DEADLINE";

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-7 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-5">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-400 font-semibold">
            {title}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>27 OCT 2026 · 19:00 IST</span>
          </div>
        </div>

        {/* Digits Grid */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
          {[
            { label: "DAYS", val: timeLeft?.days ?? 0 },
            { label: "HOURS", val: timeLeft?.hours ?? 0 },
            { label: "MINUTES", val: timeLeft?.minutes ?? 0 },
            { label: "SECONDS", val: timeLeft?.seconds ?? 0 },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center rounded-xl bg-slate-950/80 border border-slate-800 p-3 sm:p-4"
            >
              <div className="font-mono text-3xl sm:text-5xl font-black tracking-tight text-white">
                {String(item.val).padStart(2, "0")}
              </div>
              <span className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
