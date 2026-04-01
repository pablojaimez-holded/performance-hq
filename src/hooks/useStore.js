import { useState, useEffect } from "react";
import { STORAGE_KEY } from "../data/constants";

export function useStore(initialData) {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setData(initialData);
      }
    } catch {
      setData(initialData);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (!loaded || !data) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save:", e);
    }
  }, [data, loaded]);

  // Updater: supports both direct value and functional updates
  const update = (key, valueOrFn) => {
    setData((prev) => ({
      ...prev,
      [key]: typeof valueOrFn === "function" ? valueOrFn(prev[key]) : valueOrFn,
    }));
  };

  // Batch update: merge multiple keys at once
  const batch = (fn) => {
    setData((prev) => fn(prev));
  };

  return { data, loaded, update, batch, setData };
}
