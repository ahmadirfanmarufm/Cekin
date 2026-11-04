"use client";

import { useEffect, useRef } from "react";

export function usePolling(task: () => Promise<void> | void, intervalMs: number, enabled = true) {
  const taskRef = useRef(task);
  taskRef.current = task;

  useEffect(() => {
    if (!enabled) return;

    let running = false;

    const tick = async () => {
      if (running || document.hidden) return;
      running = true;
      try {
        await taskRef.current();
      } catch {
      } finally {
        running = false;
      }
    };

    const timer = setInterval(() => void tick(), intervalMs);
    const onVisibility = () => {
      if (!document.hidden) void tick();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, enabled]);
}