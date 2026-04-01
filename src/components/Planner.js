import React, { useState, useEffect } from "react";
import { WEEK_DAYS } from "../data/constants";
import { formatTime, uid, getWeekStart, getWeekIdFromDate, getWeekLabel, getTodayName, isAfterTime } from "../data/utils";
import { Checkbox, CategoryPicker, DurationPicker, ActionButton, EmptyState, SectionHeader, getCat } from "./UI";
import { s } from "../styles/theme";

export default function Planner({ data, day, setDay, timer, onToggleTimer, onBatch, weekOffset, setWeekOffset }) {
  const { tasks, projects } = data;
  const [addMode, setAddMode] = useState(false);
  const [nw, setNw] = useState({ text: "", cat: "optimize", dur: 30, pid: "" });
  const [editId, setEditId] = useState(null);
  const [moveId, setMoveId] = useState(null);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [endOfDay, setEndOfDay] = useState(false);

  const weekStart = getWeekStart(weekOffset);
  const weekId = getWeekIdFromDate(weekStart);
  const weekLabel = getWeekLabel(weekStart);
  const isCurrentWeek = weekOffset === 0;

  const getTaskKey = (d) => isCurrentWeek ? d : `${weekId}::${d}`;
  const getWeekTasks = (d) => tasks[getTaskKey(d)] || [];
  const dayTasks = getWeekTasks(day);

  const actProj = projects.filter((p) => p.status === "active");
  const getProj = (id) => projects.find((p) => p.id === id);

  // Check end-of-day at 17:30
  useEffect(() => {
    const check = () => {
      const today = getTodayName();
      if (isCurrentWeek && WEEK_DAYS.includes(today) && isAfterTime(17, 30)) {
        const todayTasks = tasks[today] || [];
        setEndOfDay(todayTasks.filter((t) => !t.done).length > 0);
      } else {
        setEndOfDay(false);
      }
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [tasks, weekOffset, isCurrentWeek]);

  const addTask = () => {
    if (!nw.text.trim()) return;
    const key = getTaskKey(day);
    onBatch((prev) => ({
      ...prev,
      tasks: { ...prev.tasks, [key]: [...(prev.tasks[key] || []), { id: uid(), text: nw.text.trim(), cat: nw.cat, dur: nw.dur, ts: 0, pid: nw.pid || undefined }] },
    }));
    setNw({ text: "", cat: "optimize", dur: 30, pid: "" });
    setAddMode(false);
  };

  const completeTask = (taskId) => {
    const key = getTaskKey(day);
    const t = (tasks[key] || []).find((x) => x.id === taskId);
    if (!t) return;
    onBatch((prev) => ({
      ...prev,
      tasks: { ...prev.tasks, [key]: (prev.tasks[key] || []).filter((x) => x.id !== taskId) },
      completed: [{ ...t, at: new Date().toISOString(), day, week: weekId }, ...prev.completed],
    }));
  };

  const deleteTask = (taskId) => {
    const key = getTaskKey(day);
    onBatch((prev) => ({
      ...prev,
      tasks: { ...prev.tasks, [key]: (prev.tasks[key] || []).filter((x) => x.id !== taskId) },
    }));
    setEditId(null);
  };

  const moveTask = (taskId, toDay, toOffset) => {
    const fromKey = getTaskKey(day);
    const tOff = toOffset !== undefined ? toOffset : weekOffset;
    const toWS = getWeekStart(tOff);
    const toWID = getWeekIdFromDate(toWS);
    const toKey = tOff === 0 ? toDay : `${toWID}::${toDay}`;

    onBatch((prev) => {
      const t = (prev.tasks[fromKey] || []).find((x) => x.id === taskId);
      if (!t) return prev;
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [fromKey]: (prev.tasks[fromKey] || []).filter((x) => x.id !== taskId),
          [toKey]: [...(prev.tasks[toKey] || []), t],
        },
      };
    });
    setEditId(null);
    setMoveId(null);
  };

  const toggleSubtask = (projId, subId) => {
    const key = getTaskKey(day);
    onBatch((prev) => {
      const pr = prev.projects.find((p) => p.id === projId);
      if (!pr) return prev;
      const sub = pr.subs.find((ss) => ss.id === subId);
      if (!sub) return prev;
      const nowDone = !sub.done;
      const newProj = prev.projects.map((p) =>
        p.id === projId ? { ...p, subs: p.subs.map((ss) => (ss.id === subId ? { ...ss, done: nowDone } : ss)) } : p
      );
      let newCompleted = [...prev.completed];
      if (nowDone) {
        newCompleted = [{ id: uid(), text: `${sub.text} (${pr.name})`, cat: "optimize", dur: 0, ts: 0, at: new Date().toISOString(), day, isSub: true }, ...newCompleted];
      } else {
        newCompleted = newCompleted.filter((c) => !(c.isSub && c.text === `${sub.text} (${pr.name})`));
      }
      const upProj = newProj.find((p) => p.id === projId);
      if (upProj && upProj.subs.length > 0 && upProj.subs.every((ss) => ss.done)) {
        const finalProj = newProj.map((p) => (p.id === projId ? { ...p, status: "done" } : p));
        newCompleted = [{ id: uid(), text: `PROYECTO: ${pr.name}`, cat: "strategy", dur: 0, ts: 0, at: new Date().toISOString(), day, isPrj: true }, ...newCompleted];
        const nt = { ...prev.tasks, [key]: (prev.tasks[key] || []).filter((t) => t.pid !== projId) };
        return { ...prev, projects: finalProj, completed: newCompleted, tasks: nt };
      }
      return { ...prev, projects: newProj, completed: newCompleted };
    });
  };

  const weekOptions = [];
  for (let i = -4; i <= 8; i++) {
    const ws = getWeekStart(i);
    weekOptions.push({ offset: i, label: getWeekLabel(ws), id: getWeekIdFromDate(ws), isCurrent: i === 0 });
  }

  const today = getTodayName();
  const todayPending = isCurrentWeek ? (tasks[today] || []).filter((t) => !t.done) : [];
  const showEOD = endOfDay && isCurrentWeek && day === today;

  return (
    <div style={{ animation: "fadeIn .2s ease" }}>
      {/* Week navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)} style={navBtn}>←</button>
        <button onClick={() => setShowWeekPicker(!showWeekPicker)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", display: "block" }}>{weekLabel}</span>
          <span style={{ fontSize: 10, color: isCurrentWeek ? "#059669" : "#94a3b8" }}>{isCurrentWeek ? "Esta semana" : weekId}</span>
        </button>
        <button onClick={() => setWeekOffset(weekOffset + 1)} style={navBtn}>→</button>
      </div>

      {showWeekPicker && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, marginBottom: 10, maxHeight: 200, overflowY: "auto" }}>
          {weekOptions.map((w) => (
            <button key={w.offset} onClick={() => { setWeekOffset(w.offset); setShowWeekPicker(false); }}
              style={{ display: "block", width: "100%", padding: "6px 10px", border: "none", background: w.offset === weekOffset ? "#f1f5f9" : "transparent", borderRadius: 5, cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: 12, color: w.isCurrent ? "#059669" : "#1e293b", fontWeight: w.offset === weekOffset ? 600 : 400 }}>
              {w.label} {w.isCurrent && "← hoy"}
            </button>
          ))}
        </div>
      )}

      {/* End-of-day banner at 17:30 */}
      {showEOD && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", margin: "0 0 6px" }}>🕐 Fin del día — {todayPending.length} tarea{todayPending.length > 1 ? "s" : ""} pendiente{todayPending.length > 1 ? "s" : ""}</p>
          {todayPending.map((t) => {
            const c = getCat(t.cat);
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid #fecaca33" }}>
                <span style={{ color: c.color, fontSize: 8 }}>{c.icon}</span>
                <span style={{ flex: 1, fontSize: 12, color: "#1e293b" }}>{t.text}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {WEEK_DAYS.filter((d) => d !== today).map((d) => (
                    <button key={d} onClick={() => moveTask(t.id, d, 0)} style={{ ...s.chip, fontSize: 9, padding: "2px 5px" }}>{d.slice(0, 3)}</button>
                  ))}
                  <button onClick={() => moveTask(t.id, "Lunes", weekOffset + 1)} style={{ ...s.chip, fontSize: 9, padding: "2px 5px", background: "#f0fdf4", color: "#059669", borderColor: "#bbf7d0" }}>Próx</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {WEEK_DAYS.map((d) => {
          const dt = getWeekTasks(d);
          const n = dt.length;
          const m = dt.reduce((sum, t) => sum + (t.dur || 0), 0);
          return (
            <button key={d} onClick={() => setDay(d)} style={{ ...s.dayTab, ...(d === day ? s.dayTabActive : {}), fontFamily: "inherit" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{d.slice(0, 3)}</span>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{n > 0 ? `${n} · ${formatTime(m)}` : "—"}</span>
            </button>
          );
        })}
      </div>

      <div style={s.card}>
        <SectionHeader title={day} right={<ActionButton onClick={() => setAddMode(!addMode)}>{addMode ? "✕" : "+ Tarea"}</ActionButton>} />

        {addMode && (
          <div style={s.form}>
            <input type="text" placeholder="¿Qué necesitas hacer?" value={nw.text} onChange={(e) => setNw({ ...nw, text: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addTask()} style={s.input} autoFocus />
            <CategoryPicker value={nw.cat} onChange={(cat) => setNw({ ...nw, cat })} />
            <DurationPicker value={nw.dur} onChange={(dur) => setNw({ ...nw, dur })} />
            {actProj.length > 0 && (
              <select value={nw.pid} onChange={(e) => setNw({ ...nw, pid: e.target.value })} style={s.select}>
                <option value="">Sin proyecto</option>
                {actProj.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            )}
            <button onClick={addTask} style={s.confirm}>Añadir</button>
          </div>
        )}

        {dayTasks.length === 0 && !addMode && <EmptyState text="Sin tareas" />}

        {dayTasks.map((task) => {
          const c = getCat(task.cat);
          const pr = task.pid ? getProj(task.pid) : null;
          const isTimer = timer && timer.taskId === task.id;
          const isEdit = editId === task.id;
          const isMove = moveId === task.id;
          const pendSubs = pr ? pr.subs.filter((ss) => !ss.done) : [];

          return (
            <div key={task.id} style={{ ...s.taskRow, borderLeftColor: c.color }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                {!pr && <Checkbox checked={false} color={c.color} onClick={() => completeTask(task.id)} />}
                {pr && <span style={{ fontSize: 10, color: c.color, marginTop: 3, fontWeight: 700 }}>P</span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", display: "block", lineHeight: 1.35 }}>{task.text}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: c.color }}>{c.icon} {c.label}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{formatTime(task.dur)}</span>
                    {task.ts > 0 && <span style={{ fontSize: 10, color: "#059669" }}>⏱{formatTime(task.ts)}</span>}
                    {pr && <span style={{ fontSize: 9, color: "#7c3aed", background: "#f5f3ff", padding: "1px 5px", borderRadius: 3, fontWeight: 600 }}>{pr.subs.filter((ss) => ss.done).length}/{pr.subs.length}</span>}
                    {!pr && (
                      <button onClick={() => onToggleTimer(day, task.id)} style={{ marginLeft: "auto", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: isTimer ? "#dc2626" : "#f1f5f9", color: isTimer ? "#fff" : "#475569", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                        {isTimer ? "⏹" : "▶"}
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => setEditId(isEdit ? null : task.id)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13, fontWeight: 700, padding: "2px 4px", cursor: "pointer", letterSpacing: "1px" }}>···</button>
              </div>

              {pr && (
                <div style={{ marginLeft: 20, marginTop: 6 }}>
                  {pr.subs.map((sub) => (
                    <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                      <Checkbox checked={sub.done} color="#059669" onClick={() => toggleSubtask(pr.id, sub.id)} />
                      <span style={{ fontSize: 12, color: sub.done ? "#94a3b8" : "#1e293b", textDecoration: sub.done ? "line-through" : "none", flex: 1 }}>{sub.text}</span>
                    </div>
                  ))}
                  {pendSubs.length > 0 && (
                    <div style={{ marginTop: 6, padding: "7px 10px", background: "#fffbeb", borderRadius: 6, border: "1px solid #fde68a" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#92400e", margin: "0 0 4px" }}>{pendSubs.length} pendiente{pendSubs.length > 1 ? "s" : ""}</p>
                      {!isMove && <button onClick={() => setMoveId(task.id)} style={{ fontSize: 11, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>Mover a otro día →</button>}
                      {isMove && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: "#92400e" }}>¿A qué día?</span>
                          {WEEK_DAYS.filter((d) => d !== day).map((d) => (
                            <button key={d} onClick={() => moveTask(task.id, d)} style={{ ...s.chip, fontWeight: 600 }}>{d.slice(0, 3)}</button>
                          ))}
                          <button onClick={() => moveTask(task.id, "Lunes", weekOffset + 1)} style={{ ...s.chip, fontWeight: 600, background: "#f0fdf4", color: "#059669", borderColor: "#bbf7d0" }}>Próx sem</button>
                          <button onClick={() => setMoveId(null)} style={{ fontSize: 10, color: "#94a3b8", background: "transparent", border: "none", cursor: "pointer" }}>Cancelar</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isEdit && (
                <div style={{ display: "flex", gap: 4, marginTop: 6, marginLeft: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>Mover:</span>
                  {WEEK_DAYS.filter((d) => d !== day).map((d) => (
                    <button key={d} onClick={() => moveTask(task.id, d)} style={s.chip}>{d.slice(0, 3)}</button>
                  ))}
                  <button onClick={() => moveTask(task.id, "Lunes", weekOffset + 1)} style={{ ...s.chip, background: "#f0fdf4", color: "#059669", borderColor: "#bbf7d0" }}>Próx</button>
                  <button onClick={() => deleteTask(task.id)} style={s.chipDanger}>Eliminar</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const navBtn = { border: "1px solid #e2e8f0", background: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 14, color: "#475569", fontFamily: "inherit" };
