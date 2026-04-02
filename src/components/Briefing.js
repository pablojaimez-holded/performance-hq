import React from "react";
import { WEEK_DAYS, AMPLITUDE_DASHBOARD } from "../data/constants";
import { formatTime, getTodayName } from "../data/utils";
import { getCat } from "./UI";
import { s } from "../styles/theme";

export default function Briefing({ data, pendingChanges, onMarkReviewed }) {
  const { tasks, projects, reminders, completed, changelog } = data;
  const actProj = projects.filter((p) => p.status === "active");
  const urgCnt = pendingChanges.length + (reminders || []).filter((r) => !r.off && r.date && new Date(r.date) <= new Date(new Date().toISOString().split("T")[0])).length;

  const wkTotal = WEEK_DAYS.reduce((a, d) => a + (tasks[d] || []).length, 0);
  const wkMins = WEEK_DAYS.reduce((a, d) => a + (tasks[d] || []).reduce((sum, t) => sum + (t.dur || 0), 0), 0);
  const today = getTodayName();
  const todayTasks = tasks[today] || [];

  return (
    <div style={{ ...s.card, animation: "fadeIn .2s ease" }}>
      <h2 style={s.h2}>Buenos días — tu briefing</h2>
      <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 14px", lineHeight: 1.5 }}>
        <b>{wkTotal} tareas</b> ({formatTime(wkMins)}) · <b>{actProj.length} proyectos</b> activos · <b>{urgCnt} alerta{urgCnt !== 1 ? "s" : ""}</b> · <b>{completed.length}</b> completadas
      </p>

      {/* Dashboard links */}
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#166534", margin: "0 0 8px" }}>📊 Tus dashboards</p>
        <a href={AMPLITUDE_DASHBOARD} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2563eb", fontWeight: 500, textDecoration: "none", display: "block", marginBottom: 6 }}>
          → PM Daily Control Center (Amplitude)
        </a>
        <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 8px 14px" }}>
          Funnel completo · 3 modelos atribución · First accounts · Suscripciones
        </p>
        <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 8 }}>
          <p style={{ fontSize: 11, color: "#166534", fontWeight: 500, margin: "0 0 2px" }}>📈 Performance Dashboard (Claude)</p>
          <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 0 14px" }}>
            KPIs semáforo · Spend por canal · Desglose por plataforma · Atribución Cookie vs Survey vs Platform
          </p>
          <p style={{ fontSize: 10, color: "#166534", margin: "4px 0 0", fontStyle: "italic" }}>
            Pídeme "dame el performance dashboard" para ver los últimos 90 días con datos actualizados
          </p>
        </div>
        <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 8, marginTop: 4 }}>
          <a href="/demand-capture.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2563eb", fontWeight: 500, textDecoration: "none", display: "block", marginBottom: 4 }}>
            → Demand Capture Dashboard (Search & PMAX)
          </a>
          <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 0 14px" }}>
            FASS · FAC · QEv2 · CR QEv2 · ROAS QEv2 · CAC Payback · Sin Brand · 90 días semanal
          </p>
          <p style={{ fontSize: 10, color: "#166534", margin: "4px 0 0", fontStyle: "italic" }}>
            Se actualiza automáticamente cada mañana a las 8:30 (L-V) via Windsor
          </p>
        </div>
        <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 8, marginTop: 4 }}>
          <a href="/full-funnel.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2563eb", fontWeight: 500, textDecoration: "none", display: "block", marginBottom: 4 }}>
            → Full Funnel Dashboard (YouTube, Demand Gen & Display)
          </a>
          <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 0 14px" }}>
            AWA · ACQ · REM · Impressions · CPM · VTR · CPV · Conversions · CPA · ROAS · 3 cuentas
          </p>
          <p style={{ fontSize: 10, color: "#8b5cf6", margin: "4px 0 0", fontStyle: "italic" }}>
            Full funnel analysis: Awareness → Acquisition → Remarketing
          </p>
        </div>
      </div>

      {/* Pending changes */}
      {pendingChanges.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 12, marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e", margin: "0 0 6px" }}>🔍 Cambios pendientes de revisar</p>
          {pendingChanges.slice(0, 5).map((ch) => (
            <div key={ch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
              <span style={{ fontSize: 12, color: "#1e293b" }}>
                {ch.text} <span style={{ color: "#94a3b8", fontSize: 10 }}>{ch.plat}</span>
              </span>
              <button onClick={() => onMarkReviewed(ch.id)} style={{ background: "#fef3c7", color: "#92400e", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer" }}>
                ✓
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Today's tasks */}
      {todayTasks.length > 0 && (
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: "0 0 6px" }}>📋 Hoy — {today}</p>
          {todayTasks.map((t) => {
            const c = getCat(t.cat);
            const pr = t.pid ? projects.find((p) => p.id === t.pid) : null;
            return (
              <div key={t.id} style={{ padding: "3px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: c.color, fontSize: 8 }}>{c.icon}</span>
                  <span style={{ fontSize: 12, color: "#475569", flex: 1 }}>{t.text}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{formatTime(t.dur)}</span>
                </div>
                {pr && (
                  <div style={{ marginLeft: 14, marginTop: 2 }}>
                    {pr.subs.filter((sub) => !sub.done).slice(0, 3).map((sub) => (
                      <div key={sub.id} style={{ fontSize: 10, color: "#94a3b8", padding: "1px 0" }}>· {sub.text}</div>
                    ))}
                    {pr.subs.filter((sub) => !sub.done).length > 3 && (
                      <div style={{ fontSize: 10, color: "#cbd5e1" }}>+{pr.subs.filter((sub) => !sub.done).length - 3} más</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {todayTasks.length === 0 && (
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            {WEEK_DAYS.includes(today) ? "No hay tareas para hoy" : "Hoy es fin de semana 🎉"}
          </p>
        </div>
      )}
    </div>
  );
}
