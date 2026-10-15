"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TickerEvent {
  id: string;
  type: "registration" | "submission" | "approval" | "system";
  message: string;
  timestamp: string;
}

const INITIAL_EVENTS: TickerEvent[] = [
  {
    id: "init-1",
    type: "system",
    message: "Registration portal is open for all @dau.ac.in accounts",
    timestamp: "Now",
  },
  {
    id: "init-2",
    type: "registration",
    message: "A new 2-person team registered for API Blitz",
    timestamp: "10m ago",
  },
  {
    id: "init-3",
    type: "approval",
    message: "Organizers approved a team registration",
    timestamp: "20m ago",
  },
  {
    id: "init-4",
    type: "system",
    message: "100 APIs ready across 5 categories",
    timestamp: "1h ago",
  },
];

export function LiveActivityTicker() {
  const [events, setEvents] = useState<TickerEvent[]>(INITIAL_EVENTS);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel("public_activity");

    channel
      .on("broadcast", { event: "activity" }, (payload) => {
        const { eventType, text, timestamp } = payload.payload || {};
        if (text) {
          const newEvent: TickerEvent = {
            id: `evt-${Date.now()}`,
            type: eventType || "registration",
            message: text,
            timestamp: timestamp || "Just now",
          };
          setEvents((prev) => [newEvent, ...prev.slice(0, 9)]);
          setActiveIdx(0);
        }
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % events.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [events.length]);

  const current = events[activeIdx] || events[0];

  const getIcon = (type: TickerEvent["type"]) => {
    switch (type) {
      case "registration":
        return <UserPlus className="h-3.5 w-3.5 text-sky-400" />;
      case "approval":
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case "submission":
        return <Sparkles className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 backdrop-blur-sm text-xs font-mono">
        <div className="flex items-center gap-2 truncate text-slate-300">
          <span className="shrink-0">{getIcon(current.type)}</span>
          <span className="truncate">{current.message}</span>
        </div>
        <span className="shrink-0 text-[10px] text-slate-500">
          {current.timestamp}
        </span>
      </div>
    </div>
  );
}
