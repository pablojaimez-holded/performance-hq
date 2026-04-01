import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer() {
  const [active, setActive] = useState(null); // { day, taskId }
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (active) {
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(ref.current);
      setElapsed(0);
    }
    return () => clearInterval(ref.current);
  }, [active]);

  const start = useCallback((day, taskId) => {
    setActive({ day, taskId });
  }, []);

  const stop = useCallback(() => {
    const mins = Math.max(1, Math.round(elapsed / 60));
    const result = { ...active, minutes: mins };
    setActive(null);
    return result;
  }, [active, elapsed]);

  const toggle = useCallback(
    (day, taskId) => {
      if (active && active.taskId === taskId) {
        return stop();
      }
      start(day, taskId);
      return null;
    },
    [active, start, stop]
  );

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return { active, elapsed, start, stop, toggle, formatElapsed };
}
