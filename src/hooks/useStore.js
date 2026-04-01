import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../data/supabase";
import { STORAGE_KEY } from "../data/constants";

const DB_ROW_ID = "main";
const SAVE_DEBOUNCE_MS = 1500;

// Read-only when accessed from Vercel URL (public viewers can't edit)
// Only localhost is editable — any other host is read-only
const IS_READ_ONLY = typeof window !== "undefined"
  && !window.location.hostname.includes("localhost")
  && !window.location.hostname.includes("127.0.0.1");

export function useStore(initialData) {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState(IS_READ_ONLY ? "readonly" : "idle");
  const timerRef = useRef(null);

  // Load: try Supabase first, fall back to localStorage, then initialData
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: row, error } = await supabase
          .from("app_state")
          .select("data")
          .eq("id", DB_ROW_ID)
          .maybeSingle();

        if (!cancelled && row?.data) {
          setData(row.data);
          if (!IS_READ_ONLY) localStorage.setItem(STORAGE_KEY, JSON.stringify(row.data));
          setLoaded(true);
          return;
        }
        if (error) console.warn("Supabase load error, using local:", error.message);
      } catch (e) {
        console.warn("Supabase unreachable, using local:", e.message);
      }

      // Fallback: localStorage (only in local/editable mode)
      if (!cancelled) {
        if (!IS_READ_ONLY) {
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
        } else {
          setData(initialData);
        }
        setLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line
  }, []);

  // Save to both localStorage (instant) and Supabase (debounced)
  const saveToSupabase = useCallback(async (newData) => {
    if (IS_READ_ONLY) return; // Block writes in read-only mode
    setSyncStatus("saving");
    try {
      const { error } = await supabase
        .from("app_state")
        .upsert({ id: DB_ROW_ID, data: newData, updated_at: new Date().toISOString() });

      if (error) {
        console.error("Supabase save error:", error.message);
        setSyncStatus("error");
      } else {
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      }
    } catch (e) {
      console.error("Supabase unreachable:", e.message);
      setSyncStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!loaded || !data || IS_READ_ONLY) return;

    // Save to localStorage instantly
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("localStorage save failed:", e);
    }

    // Debounced save to Supabase
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveToSupabase(data), SAVE_DEBOUNCE_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, loaded, saveToSupabase]);

  // Updater: supports both direct value and functional updates
  const update = (key, valueOrFn) => {
    if (IS_READ_ONLY) return; // Block updates in read-only mode
    setData((prev) => ({
      ...prev,
      [key]: typeof valueOrFn === "function" ? valueOrFn(prev[key]) : valueOrFn,
    }));
  };

  // Batch update: merge multiple keys at once
  const batch = (fn) => {
    if (IS_READ_ONLY) return; // Block updates in read-only mode
    setData((prev) => fn(prev));
  };

  return { data, loaded, update, batch, setData, syncStatus, isReadOnly: IS_READ_ONLY };
}
