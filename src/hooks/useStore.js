import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../data/supabase";
import { STORAGE_KEY } from "../data/constants";

const DB_ROW_ID = "main";
const SAVE_DEBOUNCE_MS = 1500;
const AUTH_KEY = "performance-hq-admin";
const TIMESTAMP_KEY = "performance-hq-updated-at";

function checkAdmin() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

/**
 * Smart sync strategy:
 * - Both localStorage and Supabase store a timestamp (updated_at)
 * - On load: read BOTH sources, compare timestamps, keep the NEWEST
 * - On save: write to BOTH with current timestamp
 * - This guarantees data survives deploys, cache clears, and device switches
 */
export function useStore(initialData) {
  const [isAdmin, setIsAdmin] = useState(checkAdmin);
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let localData = null;
      let localTimestamp = 0;
      let cloudData = null;
      let cloudTimestamp = 0;

      // 1. Read localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const ts = localStorage.getItem(TIMESTAMP_KEY);
        if (saved) {
          localData = JSON.parse(saved);
          localTimestamp = ts ? parseInt(ts, 10) : 0;
        }
      } catch {
        // localStorage failed
      }

      // 2. Read Supabase (if available)
      if (isAdmin && supabase) {
        try {
          const { data: row, error } = await supabase
            .from("app_state")
            .select("data, updated_at")
            .eq("id", DB_ROW_ID)
            .maybeSingle();

          if (row?.data) {
            cloudData = row.data;
            cloudTimestamp = row.updated_at
              ? new Date(row.updated_at).getTime()
              : 0;
          }
          if (error) console.warn("Supabase load error:", error.message);
        } catch (e) {
          console.warn("Supabase unreachable:", e.message);
        }
      }

      if (cancelled) return;

      // 3. Compare timestamps — keep the NEWEST data
      if (localData && cloudData) {
        if (cloudTimestamp > localTimestamp) {
          // Cloud is newer → use cloud, update localStorage
          console.log("[sync] Cloud data is newer, using Supabase data");
          setData(cloudData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
          localStorage.setItem(TIMESTAMP_KEY, String(cloudTimestamp));
        } else {
          // Local is newer (or same) → keep local, push to cloud
          console.log("[sync] Local data is newer or equal, keeping localStorage");
          setData(localData);
          // Sync local → cloud if local is strictly newer
          if (localTimestamp > cloudTimestamp && isAdmin && supabase) {
            syncToCloud(localData);
          }
        }
      } else if (localData) {
        // Only local exists
        console.log("[sync] Only localStorage found");
        setData(localData);
      } else if (cloudData) {
        // Only cloud exists (new device / cleared cache)
        console.log("[sync] Only Supabase found (new device?)");
        setData(cloudData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
        localStorage.setItem(TIMESTAMP_KEY, String(cloudTimestamp));
      } else {
        // Nothing found → fresh start
        console.log("[sync] No data found, using initial data");
        setData(initialData);
      }

      setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line
  }, []);

  // Push data to Supabase
  async function syncToCloud(newData) {
    if (!isAdmin || !supabase) return;
    try {
      await supabase
        .from("app_state")
        .upsert({
          id: DB_ROW_ID,
          data: newData,
          updated_at: new Date().toISOString(),
        });
    } catch (e) {
      console.warn("Background sync failed:", e.message);
    }
  }

  // Save to Supabase with status indicator
  const saveToSupabase = useCallback(async (newData) => {
    if (!isAdmin || !supabase) return;
    setSyncStatus("saving");
    try {
      const { error } = await supabase
        .from("app_state")
        .upsert({
          id: DB_ROW_ID,
          data: newData,
          updated_at: new Date().toISOString(),
        });

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

  // On every data change → save to localStorage + Supabase with timestamp
  useEffect(() => {
    if (!loaded || !data) return;

    const now = Date.now();

    // Save to localStorage instantly (always)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(TIMESTAMP_KEY, String(now));
    } catch (e) {
      console.error("localStorage save failed:", e);
    }

    // Debounced cloud sync (admin only)
    if (isAdmin) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => saveToSupabase(data), SAVE_DEBOUNCE_MS);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, loaded, isAdmin, saveToSupabase]);

  const update = (key, valueOrFn) => {
    setData((prev) => ({
      ...prev,
      [key]: typeof valueOrFn === "function" ? valueOrFn(prev[key]) : valueOrFn,
    }));
  };

  const batch = (fn) => {
    setData((prev) => fn(prev));
  };

  return { data, loaded, update, batch, setData, syncStatus, isReadOnly: false, isAdmin };
}
