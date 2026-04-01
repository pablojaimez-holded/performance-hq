import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../data/supabase";
import { STORAGE_KEY } from "../data/constants";

const DB_ROW_ID = "main";
const SAVE_DEBOUNCE_MS = 1500;
const ADMIN_KEY = "performance-hq-admin";

// Admin mode: unlocked via ?admin=PASSWORD in URL or saved in localStorage
function checkAdmin() {
  const params = new URLSearchParams(window.location.search);
  const urlKey = params.get("admin");
  const savedKey = localStorage.getItem(ADMIN_KEY);
  const secret = process.env.REACT_APP_ADMIN_SECRET || "holded2026";

  if (urlKey === secret) {
    localStorage.setItem(ADMIN_KEY, "true");
    // Clean URL so password is not visible
    window.history.replaceState({}, "", window.location.pathname);
    return true;
  }
  return savedKey === "true";
}

export function useStore(initialData) {
  const [isAdmin, setIsAdmin] = useState(checkAdmin);
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isAdmin ? "idle" : "readonly");
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify(row.data));
          setLoaded(true);
          return;
        }
        if (error) console.warn("Supabase load error, using local:", error.message);
      } catch (e) {
        console.warn("Supabase unreachable, using local:", e.message);
      }

      // Fallback: localStorage
      if (!cancelled) {
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
      }
    }
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line
  }, []);

  // Save to both localStorage (instant) and Supabase (debounced)
  const saveToSupabase = useCallback(async (newData) => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

  useEffect(() => {
    if (!loaded || !data || !isAdmin) return;

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
  }, [data, loaded, isAdmin, saveToSupabase]);

  // Updater: supports both direct value and functional updates
  const update = (key, valueOrFn) => {
    if (!isAdmin) return;
    setData((prev) => ({
      ...prev,
      [key]: typeof valueOrFn === "function" ? valueOrFn(prev[key]) : valueOrFn,
    }));
  };

  // Batch update: merge multiple keys at once
  const batch = (fn) => {
    if (!isAdmin) return;
    setData((prev) => fn(prev));
  };

  return { data, loaded, update, batch, setData, syncStatus, isReadOnly: !isAdmin, isAdmin };
}
