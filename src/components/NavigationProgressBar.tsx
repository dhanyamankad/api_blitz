"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress bar on route arrival
  useEffect(() => {
    setNavigating(false);
    setProgress(100);
    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept link clicks to provide instant millisecond feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only trigger for internal links that aren't anchors or new tabs
      if (
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        target.target !== "_blank" &&
        href !== pathname
      ) {
        setNavigating(true);
        setProgress(25);
        setTimeout(() => setProgress(65), 100);
        setTimeout(() => setProgress(85), 350);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!navigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_#38bdf8] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
