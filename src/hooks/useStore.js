import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../data/supabase";
import { STORAGE_KEY } from "../data/constants";

const DB_ROW_ID = "main";
const SAVE_DEBOUNCE_MS = 1500;
const ADMIN_KEY = "performance-hq-admin";

// Admin mode: unlocked via ?admin=PASSWORD in URL or saved in localStorage
// Admin only controls Supabase cloud sync — local reads/writes always work
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
  const [syncStatus, setSyncStatus] = useState("idle");
  const timerRef = useRef(null);

  // Load: try Supabase first (if admin + available), fall back to localStorage, then initialData
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (isAdmin && supabase) {
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
      }

      // Always fall back to localStorage (works for everyone)
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

  // Save to Supabase (only if admin/cloud sync enabled)
  const saveToSupabase = useCallback(async (newData) => {
    if (!isAdmin || !supabase) return;
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

  // Always save to localStorage — Supabase sync is optional (admin only)
  useEffect(() => {
    if (!loaded || !data) return;

    // Save to localStorage instantly (always, for everyone)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("localStorage save failed:", e);
    }

    // Debounced cloud sync to Supabase (only if admin)
    if (isAdmin) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => saveToSupabase(data), SAVE_DEBOUNCE_MS);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, loaded, isAdmin, saveToSupabase]);

  // Updater: always works (no admin gate)
  const update = (key, valueOrFn) => {
    setData((prev) => ({
      ...prev,
      [key]: typeof valueOrFn === "function" ? valueOrFn(prev[key]) : valueOrFn,
    }));
  };

  // Batch update: always works (no admin gate)
  const batch = (fn) => {
    setData((prev) => fn(prev));
  };

  return { data, loaded, update, batch, setData, syncStatus, isReadOnly: false, isAdmin };
}
