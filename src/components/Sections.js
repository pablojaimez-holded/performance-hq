import React, { useState } from "react";
import { WEEK_DAYS, PLATFORMS, CHANGE_TYPES, CHANGELOG_REMINDER_PRESETS } from "../data/constants";
import { uid, formatDate, formatDateFull, daysFromNow, isOverdue, getWeekStart, getWeekIdFromDate } from "../data/utils";
import { Checkbox, CategoryPicker, ActionButton, EmptyState, SectionHeader, getCat } from "./UI";
import { s } from "../styles/theme";

// ═══════════════ INBOX ═══════════════
export function Inbox({ data, onBatch }) {
  const [input, setInput] = useState("");
  const [cat, setCat] = useState("optimize");
  const [showCat, setShowCat] = useState(false);
  const [alertFor, setAlertFor] = useState(null); // id of item showing alert form
  const [alertDate, setAlertDate] = useState("");

  const add = () => {
    if (!input.trim()) return;
    onBatch((p) => ({ ...p, inbox: [{ id: uid(), text: input.trim(), cat, at: new Date().toISOString(), up: false }, ...p.inbox] }));
    setInput("");
  };

  const promote = (id, day, weekOffset) => {
    const it = data.inbox.find((x) => x.id === id);
    if (!it) return;
    const off = weekOffset || 0;
    let targetKey = day;
    if (off !== 0) {
      const ws = getWeekStart(off);
      const wid = getWeekIdFromDate(ws);
      targetKey = `${wid}::${day}`;
    }
    onBatch((p) => ({
      ...p,
      inbox: p.inbox.map((x) => (x.id === id ? { ...x, up: true } : x)),
      tasks: { ...p.tasks, [targetKey]: [...(p.tasks[targetKey] || []), { id: uid(), text: it.text, cat: it.cat || "optimize", dur: 30, ts: 0, desc: "" }] },
    }));
  };

  const del = (id) => onBatch((p) => ({ ...p, inbox: p.inbox.filter((x) => x.id !== id) }));

  const addAlert = (item) => {
    if (!alertDate) return;
    onBatch((p) => ({
      ...p,
      reminders: [{ id: uid(), text: `Inbox: ${item.text}`, pri: "normal", at: new Date().toISOString(), date: alertDate, off: false, auto: false }, ...p.reminders],
      inbox: p.inbox.map((x) => x.id === item.id ? { ...x, alertDate } : x),
    }));
    setAlertFor(null);
    setAlertDate("");
  };

  const pending = (data.inbox || []).filter((i) => !i.up);

  return (
    <div style={{ ...s.card, animation: "fadeIn .2s ease" }}>
      <SectionHeader title="Inbox" right={<span style={{ fontSize: 11, color: "#94a3b8" }}>Ideas · peticiones</span>} />
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input type="text" placeholder="Apunta lo que sea..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} style={{ ...s.input, flex: 1 }} />
        <ActionButton onClick={add}>+</ActionButton>
      </div>
      {/* Category selector toggle */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowCat(!showCat)} style={{ fontSize: 11, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
          Tipo: <span style={{ color: getCat(cat).color, fontWeight: 600 }}>{getCat(cat).icon} {getCat(cat).label}</span> <span style={{ color: "#cbd5e1" }}>{showCat ? "▲" : "▼"}</span>
        </button>
        {showCat && (
          <div style={{ marginTop: 6 }}>
            <CategoryPicker value={cat} onChange={(c) => { setCat(c); setShowCat(false); }} />
          </div>
        )}
      </div>
      {pending.length === 0 && <EmptyState text="Inbox vacío" />}
      {pending.map((it) => {
        const ic = getCat(it.cat || "optimize");
        return (
          <div key={it.id} style={{ padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: ic.color, fontSize: 8 }}>{ic.icon}</span>
                  <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{it.text}</span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 1, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: ic.color, fontWeight: 500 }}>{ic.label}</span>
                  <span style={{ fontSize: 10, color: "#cbd5e1" }}>{formatDateFull(it.at)}</span>
                  {it.alertDate && <span style={{ fontSize: 10, color: "#f59e0b" }}>⏰ {formatDate(it.alertDate)}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 3, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {WEEK_DAYS.map((d) => (<button key={d} onClick={() => promote(it.id, d)} style={s.chip}>{d.slice(0, 3)}</button>))}
                <button onClick={() => promote(it.id, "Lunes", 1)} style={{ ...s.chip, background: "#f0fdf4", color: "#059669", borderColor: "#bbf7d0", fontWeight: 600 }}>Próx</button>
                <button onClick={() => { setAlertFor(alertFor === it.id ? null : it.id); setAlertDate(""); }} title="Añadir alerta" style={{ ...s.chip, background: alertFor === it.id ? "#fef3c7" : "#fff", borderColor: alertFor === it.id ? "#fde68a" : undefined }}>⏰</button>
                <button onClick={() => del(it.id)} style={s.chipDanger}>✕</button>
              </div>
            </div>
            {alertFor === it.id && (
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, paddingLeft: 12 }}>
                <input type="date" value={alertDate} onChange={(e) => setAlertDate(e.target.value)} style={{ ...s.input, fontSize: 11, padding: "4px 8px", flex: 1, maxWidth: 160 }} />
                <button onClick={() => addAlert(it)} style={{ ...s.confirm, fontSize: 10, padding: "4px 10px" }}>Crear alerta</button>
                <button onClick={() => setAlertFor(null)} style={{ ...s.chip, fontSize: 10 }}>✕</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════ CHANGELOG ═══════════════
const COMMENT_COLORS = [
  { id: "none", label: "Sin color", bg: "transparent", border: "#f1f5f9" },
  { id: "green", label: "Verde", bg: "#f0fdf4", border: "#bbf7d0" },
  { id: "yellow", label: "Amarillo", bg: "#fffbeb", border: "#fde68a" },
  { id: "grey", label: "Gris", bg: "#f8fafc", border: "#e2e8f0" },
];

export function Changelog({ data, onBatch }) {
  const [form, setForm] = useState(false);
  const [nw, setNw] = useState({
    text: "", campaign: "", plat: "Google Search", type: "Cambio de pujas",
    days: 7, detail: "", changeDate: new Date().toISOString().split("T")[0],
    noReminder: false, commentColor: "none"
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const pending = data.changelog.filter((c) => c.revDate && !c.rev && isOverdue(c.revDate));

  const add = () => {
    if (!nw.text.trim()) return;
    const ch = {
      id: uid(), text: nw.text.trim(), campaign: nw.campaign.trim(),
      plat: nw.plat, type: nw.type, detail: nw.detail,
      at: new Date().toISOString(), changeDate: nw.changeDate,
      revDate: nw.noReminder ? null : daysFromNow(nw.days),
      rev: false, commentColor: nw.commentColor || "none",
    };

    const updates = { changelog: [ch, ...data.changelog] };

    // Only create reminder if noReminder is false
    if (!nw.noReminder) {
      const campLabel = nw.campaign.trim() ? ` [${nw.campaign.trim()}]` : "";
      const al = {
        id: uid(), text: `Revisar: ${nw.text.trim()}${campLabel} (${nw.plat})`,
        pri: "high", at: new Date().toISOString(), date: daysFromNow(nw.days), off: false, auto: true
      };
      updates.reminders = [al, ...data.reminders];
    }

    onBatch((p) => ({
      ...p,
      changelog: updates.changelog,
      ...(updates.reminders ? { reminders: updates.reminders } : {}),
    }));

    setNw({
      text: "", campaign: "", plat: "Google Search", type: "Cambio de pujas",
      days: 7, detail: "", changeDate: new Date().toISOString().split("T")[0],
      noReminder: false, commentColor: "none"
    });
    setForm(false);
  };

  const markRev = (id) => onBatch((p) => ({ ...p, changelog: p.changelog.map((c) => (c.id === id ? { ...c, rev: true } : c)) }));

  const startEdit = (ch) => {
    setEditingId(ch.id);
    setEditData({ text: ch.text, campaign: ch.campaign || "", detail: ch.detail || "", plat: ch.plat, type: ch.type, commentColor: ch.commentColor || "none" });
  };

  const saveEdit = (id) => {
    onBatch((p) => ({
      ...p,
      changelog: p.changelog.map((c) => c.id === id ? { ...c, text: editData.text, campaign: editData.campaign, detail: editData.detail, plat: editData.plat, type: editData.type, commentColor: editData.commentColor } : c),
    }));
    setEditingId(null);
    setEditData({});
  };

  const getCommentStyle = (colorId) => {
    const cc = COMMENT_COLORS.find((c) => c.id === colorId) || COMMENT_COLORS[0];
    if (cc.id === "none") return {};
    return { background: cc.bg, borderRadius: 6, padding: "8px 10px", border: `1px solid ${cc.border}` };
  };

  return (
    <div style={{ ...s.card, animation: "fadeIn .2s ease" }}>
      <SectionHeader title="Cambios en campañas" right={<ActionButton onClick={() => setForm(!form)}>{form ? "✕" : "+ Cambio"}</ActionButton>} />

      {form && (
        <div style={s.form}>
          <input type="text" placeholder="¿Qué has cambiado?" value={nw.text} onChange={(e) => setNw({ ...nw, text: e.target.value })} style={s.input} autoFocus />
          <input type="text" placeholder="Nombre de campaña (ej: brand_ES_search)" value={nw.campaign} onChange={(e) => setNw({ ...nw, campaign: e.target.value })} style={{ ...s.input, fontSize: 12 }} />
          <input type="text" placeholder="Detalles (ej: CPC 0.50€→0.80€)" value={nw.detail} onChange={(e) => setNw({ ...nw, detail: e.target.value })} style={{ ...s.input, fontSize: 12 }} />
          <div style={s.row}>
            <select value={nw.plat} onChange={(e) => setNw({ ...nw, plat: e.target.value })} style={{ ...s.select, flex: 1 }}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
            <select value={nw.type} onChange={(e) => setNw({ ...nw, type: e.target.value })} style={{ ...s.select, flex: 1 }}>{CHANGE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>

          {/* Comment color highlight */}
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Destacar comentario</label>
            <div style={{ display: "flex", gap: 4 }}>
              {COMMENT_COLORS.map((cc) => (
                <button
                  key={cc.id}
                  onClick={() => setNw({ ...nw, commentColor: cc.id })}
                  style={{
                    padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600,
                    background: nw.commentColor === cc.id ? (cc.id === "none" ? "#1e293b" : cc.bg) : "transparent",
                    color: nw.commentColor === cc.id ? (cc.id === "none" ? "#fff" : "#1e293b") : "#64748b",
                    border: `1px solid ${cc.border}`,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >{cc.label}</button>
              ))}
            </div>
          </div>

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 3 }}>Fecha del cambio</label>
              <input type="date" value={nw.changeDate} onChange={(e) => setNw({ ...nw, changeDate: e.target.value })} style={{ ...s.input, fontSize: 12 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <label style={{ fontSize: 11, color: "#64748b" }}>Recordar en</label>
                <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: nw.noReminder ? "#dc2626" : "#94a3b8", cursor: "pointer" }}>
                  <input type="checkbox" checked={nw.noReminder} onChange={(e) => setNw({ ...nw, noReminder: e.target.checked })} style={{ width: 12, height: 12 }} />
                  Sin recordatorio
                </label>
              </div>
              {!nw.noReminder && (
                <div style={s.row}>
                  {CHANGELOG_REMINDER_PRESETS.map((d) => (
                    <button key={d} onClick={() => setNw({ ...nw, days: d })} style={{ padding: "4px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: nw.days === d ? "#1e293b" : "transparent", color: nw.days === d ? "#fff" : "#64748b", border: "none", cursor: "pointer", fontFamily: "inherit" }}>{d}d</button>
                  ))}
                </div>
              )}
              {nw.noReminder && <span style={{ fontSize: 11, color: "#cbd5e1" }}>No se creará alerta</span>}
            </div>
          </div>
          <button onClick={add} style={s.confirm}>Registrar</button>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", marginBottom: 6 }}>⏰ Pendientes de revisión</p>
          {pending.map((ch) => (
            <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fffbeb", borderRadius: 6, padding: "8px 10px", marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{ch.text}</span>
                {ch.campaign && <span style={{ fontSize: 10, color: "#2563eb", display: "block", marginTop: 1 }}>{ch.campaign}</span>}
                {ch.detail && <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 1 }}>{ch.detail}</span>}
                <span style={{ fontSize: 10, color: "#94a3b8", display: "block", marginTop: 2 }}>{ch.plat} · {ch.type} · {ch.changeDate ? formatDate(ch.changeDate) : formatDate(ch.at)}</span>
              </div>
              <button onClick={() => markRev(ch.id)} style={{ ...s.chip, background: "#059669", color: "#fff", borderColor: "#059669" }}>✓</button>
            </div>
          ))}
        </div>
      )}

      {data.changelog.filter((c) => c.rev || !(c.revDate && isOverdue(c.revDate))).map((ch) => {
        const colorStyle = getCommentStyle(ch.commentColor);
        const isEditing = editingId === ch.id;
        return (
          <div key={ch.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: "1px solid #f8fafc", opacity: ch.rev ? 0.5 : 1, ...colorStyle, marginBottom: colorStyle.background ? 4 : 0 }}>
            {isEditing ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <input type="text" value={editData.text} onChange={(e) => setEditData({ ...editData, text: e.target.value })} style={s.input} placeholder="¿Qué has cambiado?" />
                <input type="text" value={editData.campaign} onChange={(e) => setEditData({ ...editData, campaign: e.target.value })} style={{ ...s.input, fontSize: 12 }} placeholder="Nombre de campaña" />
                <input type="text" value={editData.detail} onChange={(e) => setEditData({ ...editData, detail: e.target.value })} style={{ ...s.input, fontSize: 12 }} placeholder="Detalles" />
                <div style={s.row}>
                  <select value={editData.plat} onChange={(e) => setEditData({ ...editData, plat: e.target.value })} style={{ ...s.select, flex: 1 }}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
                  <select value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })} style={{ ...s.select, flex: 1 }}>{CHANGE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {COMMENT_COLORS.map((cc) => (
                    <button key={cc.id} onClick={() => setEditData({ ...editData, commentColor: cc.id })} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, background: editData.commentColor === cc.id ? (cc.id === "none" ? "#1e293b" : cc.bg) : "transparent", color: editData.commentColor === cc.id ? (cc.id === "none" ? "#fff" : "#1e293b") : "#64748b", border: `1px solid ${cc.border}`, cursor: "pointer", fontFamily: "inherit" }}>{cc.label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => saveEdit(ch.id)} style={{ ...s.confirm, fontSize: 11, padding: "5px 12px" }}>Guardar</button>
                  <button onClick={() => { setEditingId(null); setEditData({}); }} style={{ ...s.chip, fontSize: 11 }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{ch.text}</span>
                  {ch.campaign && <span style={{ fontSize: 10, color: "#2563eb", display: "block", marginTop: 1 }}>{ch.campaign}</span>}
                  {ch.detail && <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 1 }}>{ch.detail}</span>}
                  <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{ch.plat} · {ch.type}</span>
                    <span style={{ fontSize: 10, color: "#cbd5e1" }}>{ch.changeDate ? formatDate(ch.changeDate) : formatDateFull(ch.at)}</span>
                    {ch.rev && <span style={{ fontSize: 10, color: "#059669" }}>✓</span>}
                    {!ch.rev && ch.revDate && <span style={{ fontSize: 10, color: "#f59e0b" }}>revisar {formatDate(ch.revDate)}</span>}
                    {!ch.rev && !ch.revDate && <span style={{ fontSize: 10, color: "#cbd5e1" }}>sin recordatorio</span>}
                  </div>
                </div>
                <button onClick={() => startEdit(ch)} title="Editar" style={{ ...s.chip, fontSize: 11, padding: "3px 7px", flexShrink: 0 }}>✏️</button>
              </>
            )}
          </div>
        );
      })}
      {data.changelog.length === 0 && !form && <EmptyState text="Sin cambios" />}
    </div>
  );
}

// ═══════════════ COMPLETED ═══════════════
export function Completed({ data }) {
  const { completed } = data;
  return (
    <div style={{ ...s.card, animation: "fadeIn .2s ease" }}>
      <h2 style={{ ...s.h2, marginBottom: 12 }}>Completadas ({completed.length})</h2>
      {completed.length === 0 && <EmptyState text="Nada aún" />}
      {completed.map((t) => {
        const c = getCat(t.cat);
        return (
          <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "4px 6px", borderLeft: `2px solid ${c.color}`, borderRadius: 4, background: t.isPrj ? "#f0fdf4" : "#fafbfc", marginBottom: 3 }}>
            <span style={{ color: c.color, fontSize: 10, marginTop: 2 }}>✓</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: t.isPrj ? "#059669" : "#64748b", fontWeight: t.isPrj ? 600 : 400 }}>{t.text}</span>
              <div style={{ display: "flex", gap: 6, marginTop: 1 }}>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{t.day}</span>
                <span style={{ fontSize: 10, color: "#cbd5e1" }}>{formatDateFull(t.at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════ ALERTS ═══════════════
export function Alerts({ data, onBatch }) {
  const [form, setForm] = useState(false);
  const [nw, setNw] = useState({ text: "", pri: "normal", date: "" });

  const { reminders } = data;
  const active = reminders.filter((r) => !r.off);
  const overdue = active.filter((r) => r.date && isOverdue(r.date));

  const add = () => {
    if (!nw.text.trim()) return;
    onBatch((p) => ({ ...p, reminders: [{ id: uid(), text: nw.text.trim(), pri: nw.pri, at: new Date().toISOString(), date: nw.date || "", off: false }, ...p.reminders] }));
    setNw({ text: "", pri: "normal", date: "" }); setForm(false);
  };

  const dismiss = (id) => onBatch((p) => ({ ...p, reminders: p.reminders.map((r) => (r.id === id ? { ...r, off: true } : r)) }));

  return (
    <div style={{ ...s.card, animation: "fadeIn .2s ease" }}>
      <SectionHeader title="Alertas" right={<ActionButton onClick={() => setForm(!form)}>{form ? "✕" : "+ Alerta"}</ActionButton>} />
      {form && (
        <div style={s.form}>
          <input type="text" placeholder="¿Qué necesitas recordar?" value={nw.text} onChange={(e) => setNw({ ...nw, text: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} style={s.input} autoFocus />
          <div style={s.row}>
            {["high", "normal", "low"].map((p) => (
              <button key={p} onClick={() => setNw({ ...nw, pri: p })} style={{ padding: "4px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: nw.pri === p ? (p === "high" ? "#dc2626" : p === "normal" ? "#1e293b" : "#94a3b8") : "transparent", color: nw.pri === p ? "#fff" : "#64748b", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {p === "high" ? "Alta" : p === "normal" ? "Normal" : "Baja"}
              </button>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b" }}>Fecha revisión</label>
            <input type="date" value={nw.date} onChange={(e) => setNw({ ...nw, date: e.target.value })} style={{ ...s.input, fontSize: 12, marginTop: 3 }} />
          </div>
          <button onClick={add} style={s.confirm}>Añadir</button>
        </div>
      )}
      {overdue.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#dc2626", textTransform: "uppercase", marginBottom: 4 }}>🔴 Vencidas</p>
          {overdue.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "6px 8px", background: "#fef2f2", borderRadius: 6, marginBottom: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626", flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#1e293b" }}>{r.text}</span>
                {r.auto && <span style={{ fontSize: 9, color: "#94a3b8", fontStyle: "italic", display: "block" }}>auto · cambio de campaña</span>}
              </div>
              <button onClick={() => dismiss(r.id)} style={s.chip}>Hecho</button>
            </div>
          ))}
        </div>
      )}
      {active.filter((r) => !r.date || !isOverdue(r.date)).map((r) => {
        const pc = r.pri === "high" ? "#dc2626" : r.pri === "normal" ? "#f59e0b" : "#94a3b8";
        return (
          <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: pc, flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#1e293b" }}>{r.text}</span>
              {r.date && <span style={{ fontSize: 10, color: "#94a3b8", display: "block", marginTop: 1 }}>Revisar: {formatDate(r.date)}</span>}
            </div>
            <button onClick={() => dismiss(r.id)} style={s.chip}>Hecho</button>
          </div>
        );
      })}
      {active.length === 0 && !form && <EmptyState text="Sin alertas" />}
    </div>
  );
}

// ═══════════════ PROJECTS ═══════════════
export function Projects({ data, onBatch }) {
  const [form, setForm] = useState(false);
  const [nw, setNw] = useState({ name: "", desc: "", subs: "" });
  const [editDesc, setEditDesc] = useState(null);
  const [exp, setExp] = useState(null);
  const [subIn, setSubIn] = useState("");

  const actProj = data.projects.filter((p) => p.status === "active");

  const add = () => {
    if (!nw.name.trim()) return;
    const subs = nw.subs.split("\n").filter((l) => l.trim()).map((l) => ({ id: uid(), text: l.trim(), done: false }));
    onBatch((p) => ({ ...p, projects: [...p.projects, { id: uid(), name: nw.name.trim(), desc: nw.desc.trim(), status: "active", subs }] }));
    setNw({ name: "", desc: "", subs: "" }); setForm(false);
  };

  const addSub = (projId) => {
    if (!subIn.trim()) return;
    onBatch((p) => ({ ...p, projects: p.projects.map((pr) => pr.id === projId ? { ...pr, subs: [...pr.subs, { id: uid(), text: subIn.trim(), done: false }] } : pr) }));
    setSubIn("");
  };

  const toggleSub = (projId, subId) => {
    onBatch((prev) => {
      const pr = prev.projects.find((p) => p.id === projId);
      if (!pr) return prev;
      const sub = pr.subs.find((ss) => ss.id === subId);
      if (!sub) return prev;
      const nowDone = !sub.done;
      const newProj = prev.projects.map((p) => p.id === projId ? { ...p, subs: p.subs.map((ss) => ss.id === subId ? { ...ss, done: nowDone } : ss) } : p);
      let newComp = [...prev.completed];
      if (nowDone) {
        newComp = [{ id: uid(), text: `${sub.text} (${pr.name})`, cat: "optimize", dur: 0, ts: 0, at: new Date().toISOString(), day: "—", isSub: true }, ...newComp];
      }
      const up = newProj.find((p) => p.id === projId);
      if (up && up.subs.every((ss) => ss.done)) {
        return { ...prev, projects: newProj.map((p) => p.id === projId ? { ...p, status: "done" } : p), completed: [{ id: uid(), text: `PROYECTO: ${pr.name}`, cat: "strategy", dur: 0, ts: 0, at: new Date().toISOString(), day: "—", isPrj: true }, ...newComp] };
      }
      return { ...prev, projects: newProj, completed: newComp };
    });
  };

  const promoteToTask = (projId, subId, day) => {
    const pr = data.projects.find((p) => p.id === projId);
    const sub = pr?.subs.find((ss) => ss.id === subId);
    if (!sub) return;
    onBatch((p) => ({ ...p, tasks: { ...p.tasks, [day]: [...(p.tasks[day] || []), { id: uid(), text: `${sub.text} (${pr.name})`, cat: "optimize", dur: 30, ts: 0, pid: projId, desc: "" }] } }));
  };

  return (
    <div style={{ ...s.card, animation: "fadeIn .2s ease" }}>
      <SectionHeader title="Proyectos" right={<ActionButton onClick={() => setForm(!form)}>{form ? "✕" : "+ Proyecto"}</ActionButton>} />
      {form && (
        <div style={s.form}>
          <input type="text" placeholder="Nombre del proyecto" value={nw.name} onChange={(e) => setNw({ ...nw, name: e.target.value })} style={s.input} autoFocus />
          <textarea placeholder="Descripción / notas del proyecto (opcional)" value={nw.desc} onChange={(e) => setNw({ ...nw, desc: e.target.value })} style={{ ...s.input, fontSize: 12, minHeight: 44 }} rows={2} />
          <textarea placeholder="Subtareas (una por línea)" value={nw.subs} onChange={(e) => setNw({ ...nw, subs: e.target.value })} style={{ ...s.input, minHeight: 50 }} rows={3} />
          <button onClick={add} style={s.confirm}>Crear</button>
        </div>
      )}
      {actProj.length === 0 && !form && <EmptyState text="Sin proyectos activos" />}
      {actProj.map((pr) => {
        const dn = pr.subs.filter((ss) => ss.done).length;
        const tt = pr.subs.length;
        const pct = tt > 0 ? Math.round((dn / tt) * 100) : 0;
        const isExp = exp === pr.id;
        return (
          <div key={pr.id} style={{ borderRadius: 8, border: "1px solid #f1f5f9", marginBottom: 8, overflow: "hidden" }}>
            <button onClick={() => setExp(isExp ? null : pr.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "10px 12px", border: "none", background: isExp ? "#f8fafc" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", display: "block" }}>{pr.name}</span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{dn}/{tt}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 50, height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#059669" : "#2563eb", borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, color: pct === 100 ? "#059669" : "#64748b", fontWeight: 600 }}>{pct}%</span>
              </div>
            </button>
            {isExp && (
              <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #f1f5f9" }}>
                {editDesc === pr.id ? (
                  <div style={{ marginBottom: 10 }}>
                    <textarea
                      defaultValue={pr.desc || ""}
                      id={`desc-${pr.id}`}
                      placeholder="Añade una descripción o notas del proyecto..."
                      style={{ ...s.input, fontSize: 12, minHeight: 60, marginBottom: 6 }}
                      rows={3}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          const val = document.getElementById(`desc-${pr.id}`)?.value || "";
                          onBatch((p) => ({ ...p, projects: p.projects.map((x) => x.id === pr.id ? { ...x, desc: val.trim() } : x) }));
                          setEditDesc(null);
                        }}
                        style={{ ...s.confirm, fontSize: 11, padding: "5px 10px" }}
                      >Guardar</button>
                      <button onClick={() => setEditDesc(null)} style={{ ...s.chip, fontSize: 11 }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 8 }}>
                    {pr.desc ? (
                      <p
                        style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55, margin: "0 0 6px", cursor: "pointer", background: "#f8fafc", padding: "6px 8px", borderRadius: 5 }}
                        onClick={() => setEditDesc(pr.id)}
                      >{pr.desc}</p>
                    ) : (
                      <button
                        onClick={() => setEditDesc(pr.id)}
                        style={{ fontSize: 11, color: "#94a3b8", background: "transparent", border: "1px dashed #e2e8f0", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
                      >+ Añadir descripción/notas</button>
                    )}
                  </div>
                )}
                {pr.subs.map((sub) => (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
                    <Checkbox checked={sub.done} color="#059669" onClick={() => toggleSub(pr.id, sub.id)} />
                    <span style={{ flex: 1, fontSize: 12, color: sub.done ? "#94a3b8" : "#1e293b", textDecoration: sub.done ? "line-through" : "none" }}>{sub.text}</span>
                    {!sub.done && (
                      <div style={{ display: "flex", gap: 2 }}>
                        {WEEK_DAYS.map((d) => (<button key={d} onClick={() => promoteToTask(pr.id, sub.id, d)} style={{ ...s.chip, fontSize: 9, padding: "2px 5px" }}>{d.slice(0, 3)}</button>))}
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  <input type="text" placeholder="Nueva subtarea..." value={exp === pr.id ? subIn : ""} onChange={(e) => setSubIn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSub(pr.id)} style={{ ...s.input, flex: 1, fontSize: 12, padding: "6px 8px" }} />
                  <ActionButton onClick={() => addSub(pr.id)} style={{ fontSize: 10, padding: "4px 8px" }}>+</ActionButton>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {data.projects.filter((p) => p.status === "done").length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Completados</p>
          {data.projects.filter((p) => p.status === "done").map((p) => (
            <div key={p.id} style={{ fontSize: 12, color: "#cbd5e1", padding: "2px 0", textDecoration: "line-through" }}>{p.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
