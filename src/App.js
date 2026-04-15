import React, { useState, useEffect, useCallback } from "react";
import { WEEK_DAYS } from "./data/constants";
import { isOverdue, getTodayName } from "./data/utils";
import { createInitialData } from "./data/initialData";
import { useStore } from "./hooks/useStore";
import { useTimer } from "./hooks/useTimer";
import { theme } from "./styles/theme";
import Briefing from "./components/Briefing";
import Planner from "./components/Planner";
import Notes from "./components/Notes";
import { Inbox, Changelog, Completed, Alerts, Projects } from "./components/Sections";
import Login, { checkAuth, logout } from "./components/Login";

// ── Responsive hook ────────────────────────────────────────────
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ── Navigation config ──────────────────────────────────────────
const NAV_ITEMS = [
  { id: "brief", label: "Briefing", icon: "☀" },
  { id: "plan", label: "Semana", icon: "📅" },
  { id: "inbox", label: "Inbox", icon: "📥" },
  { id: "proj", label: "Proyectos", icon: "📂" },
  { id: "notes", label: "Notas", icon: "📝" },
  { id: "log", label: "Cambios", icon: "🔄" },
  { id: "done", label: "Hechas", icon: "✅" },
  { id: "alerts", label: "Alertas", icon: "🔔" },
];

export default function App() {
  const [authed, setAuthed] = useState(checkAuth);

  // Show login screen if not authenticated
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return <AppMain />;
}

function AppMain() {
  const { data, loaded, batch } = useStore(createInitialData());
  const timer = useTimer();
  const [section, setSection] = useState("brief");
  const [weekOffset, setWeekOffset] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [day, setDay] = useState(() => {
    const today = getTodayName();
    return WEEK_DAYS.includes(today) ? today : "Martes";
  });

  const isDesktop = useMediaQuery("(min-width: 900px)");

  const navigateTo = useCallback((id) => {
    setSection(id);
    if (!isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  if (!loaded || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Inter', system-ui", color: theme.colors.textMuted }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Cargando Performance HQ...</p>
        </div>
      </div>
    );
  }

  const { tasks, reminders, changelog } = data;

  // Derived counts
  const wkTotal = WEEK_DAYS.reduce((a, d) => a + (tasks[d] || []).length, 0);
  const activeReminders = (reminders || []).filter((r) => !r.off);
  const overdueAlerts = activeReminders.filter((r) => r.date && isOverdue(r.date));
  const pendingChanges = changelog.filter((c) => c.revDate && !c.rev && isOverdue(c.revDate));
  const urgentCount = overdueAlerts.length + pendingChanges.length;
  const inboxPending = (data.inbox || []).filter((i) => !i.up).length;
  const activeProjects = data.projects.filter((p) => p.status === "active").length;
  const notesCount = (data.notes || []).length;

  const getBadge = (id) => {
    switch (id) {
      case "plan": return wkTotal;
      case "inbox": return inboxPending;
      case "proj": return activeProjects;
      case "notes": return notesCount;
      case "log": return pendingChanges.length;
      case "done": return data.completed.length;
      case "alerts": return urgentCount;
      default: return 0;
    }
  };

  const markReviewed = (id) => batch((p) => ({ ...p, changelog: p.changelog.map((c) => (c.id === id ? { ...c, rev: true } : c)) }));

  const handleToggleTimer = (d, taskId) => {
    const result = timer.toggle(d, taskId);
    if (result) {
      batch((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [result.day]: prev.tasks[result.day].map((t) =>
            t.id === result.taskId ? { ...t, ts: (t.ts || 0) + result.minutes } : t
          ),
        },
      }));
    }
  };

  const currentLabel = NAV_ITEMS.find((n) => n.id === section)?.label || "Briefing";

  // ── SIDEBAR CONTENT ────────────────────────────────────────────
  const sidebarContent = (
    <div style={{
      width: isDesktop ? 240 : 280,
      height: "100%",
      background: theme.colors.bgSidebar,
      borderRight: `1px solid ${theme.colors.border}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: theme.radius.sm,
            background: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 15, fontWeight: 700,
          }}>P</div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: theme.colors.dark, margin: 0, letterSpacing: "-0.01em" }}>Performance HQ</p>
            <p style={{ fontSize: 11, color: theme.colors.textMuted, margin: 0 }}>Pablo · Holded</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = section === item.id;
          const badge = getBadge(item.id);
          const isUrgent = item.id === "alerts" && urgentCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "9px 12px", marginBottom: 2,
                borderRadius: theme.radius.sm, border: "none",
                background: isActive ? theme.colors.primaryLight : "transparent",
                color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 15, width: 22, textAlign: "center" }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {badge > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: theme.radius.pill,
                  background: isUrgent ? theme.colors.danger : isActive ? theme.colors.primary : theme.colors.border,
                  color: isUrgent || isActive ? "#fff" : theme.colors.textSecondary,
                  minWidth: 20, textAlign: "center",
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Timer widget in sidebar */}
      {timer.active && (
        <div style={{
          margin: "0 10px 10px",
          padding: "10px 12px",
          background: theme.colors.dark,
          borderRadius: theme.radius.md,
          color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.colors.danger, animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>Timer activo</span>
          </div>
          <p style={{
            fontSize: 12, fontWeight: 600, margin: "0 0 6px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {(tasks[timer.active.day] || []).find((t) => t.id === timer.active.taskId)?.text || ""}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 600, letterSpacing: "0.02em" }}>{timer.formatElapsed()}</span>
            <button
              onClick={() => handleToggleTimer(timer.active.day, timer.active.taskId)}
              style={{
                border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)",
                color: "#fff", padding: "4px 10px", borderRadius: theme.radius.sm,
                fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}
            >Parar</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: `1px solid ${theme.colors.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 10, color: theme.colors.textFaint }}>Performance HQ v0.3</span>
        <button
          onClick={logout}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 10, color: theme.colors.textMuted, fontFamily: "inherit",
            padding: "2px 6px", borderRadius: theme.radius.sm,
          }}
          title="Cerrar sesión"
        >Salir</button>
      </div>
    </div>
  );

  // ── MAIN LAYOUT ────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      background: theme.colors.bg,
    }}>
      {/* Desktop sidebar */}
      {isDesktop && sidebarContent}

      {/* Mobile overlay sidebar */}
      {!isDesktop && sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.3)",
              zIndex: 40, backdropFilter: "blur(2px)",
            }}
          />
          <div style={{
            position: "fixed", left: 0, top: 0, bottom: 0,
            zIndex: 50, boxShadow: theme.shadow.lg,
          }}>
            {sidebarContent}
          </div>
        </>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top header bar */}
        <header style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: isDesktop ? "14px 28px" : "12px 16px",
          background: theme.colors.card,
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}>
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none", border: "none", fontSize: 20,
                color: theme.colors.text, cursor: "pointer", padding: "2px 4px",
              }}
            >☰</button>
          )}
          <h1 style={{
            fontSize: isDesktop ? 18 : 16, fontWeight: 700,
            color: theme.colors.dark, margin: 0, flex: 1,
            letterSpacing: "-0.01em",
          }}>{currentLabel}</h1>

          {urgentCount > 0 && section !== "alerts" && (
            <button
              onClick={() => navigateTo("alerts")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: theme.colors.dangerBg,
                border: `1px solid ${theme.colors.dangerBorder}`,
                padding: "5px 10px", borderRadius: theme.radius.sm,
                fontSize: 11, fontWeight: 600, color: theme.colors.danger,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              ⚠ {urgentCount}
            </button>
          )}

          {/* Timer badge for mobile */}
          {!isDesktop && timer.active && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: theme.colors.dark, color: "#fff",
              padding: "4px 8px", borderRadius: theme.radius.sm,
              fontSize: 11, fontWeight: 600,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: theme.colors.danger, animation: "pulse 1.5s infinite" }} />
              {timer.formatElapsed()}
            </div>
          )}
        </header>

        {/* Scrollable content */}
        <main style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: isDesktop ? "24px 32px 40px" : "16px 14px 40px",
        }}>
          <div style={{ maxWidth: isDesktop ? 860 : 600, margin: "0 auto" }}>
            {section === "brief" && <Briefing data={data} pendingChanges={pendingChanges} onMarkReviewed={markReviewed} />}
            {section === "plan" && <Planner data={data} day={day} setDay={setDay} timer={timer.active} onToggleTimer={handleToggleTimer} onBatch={batch} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />}
            {section === "inbox" && <Inbox data={data} onBatch={batch} />}
            {section === "proj" && <Projects data={data} onBatch={batch} />}
            {section === "notes" && <Notes data={data} onBatch={batch} />}
            {section === "log" && <Changelog data={data} onBatch={batch} />}
            {section === "done" && <Completed data={data} />}
            {section === "alerts" && <Alerts data={data} onBatch={batch} />}
          </div>
        </main>
      </div>
    </div>
  );
}
