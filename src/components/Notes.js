import React, { useState, useMemo } from "react";
import { uid, formatDateFull } from "../data/utils";
import { ActionButton, EmptyState, SectionHeader } from "./UI";
import { s } from "../styles/theme";

const NOTE_TAGS = [
  { id: "campaign", label: "Campaña", color: "#2563eb", bg: "#eff6ff" },
  { id: "strategy", label: "Estrategia", color: "#c2410c", bg: "#fff7ed" },
  { id: "meeting", label: "Reunión", color: "#0d9488", bg: "#f0fdfa" },
  { id: "idea", label: "Idea", color: "#d97706", bg: "#fffbeb" },
  { id: "insight", label: "Insight", color: "#7c3aed", bg: "#f5f3ff" },
  { id: "general", label: "General", color: "#64748b", bg: "#f8fafc" },
];

const getTag = (id) => NOTE_TAGS.find((t) => t.id === id) || NOTE_TAGS[5];

const EMPTY_FORM = { title: "", content: "", tag: "general", pinned: false, projectId: "" };

export default function Notes({ data, onBatch }) {
  const [mode, setMode] = useState("list"); // list | new | edit | view
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");

  const notes = data.notes || [];
  const projects = (data.projects || []).filter((p) => p.status === "active");

  // Filtered + sorted notes
  const filtered = useMemo(() => {
    let list = [...notes];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }
    if (filterTag !== "all") {
      list = list.filter((n) => n.tag === filterTag);
    }
    // Pinned first, then by date desc
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
    return list;
  }, [notes, search, filterTag]);

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  // CRUD
  const saveNew = () => {
    if (!form.title.trim() && !form.content.trim()) return;
    const note = {
      id: uid(),
      title: form.title.trim() || form.content.trim().slice(0, 50),
      content: form.content.trim(),
      tag: form.tag,
      pinned: form.pinned,
      projectId: form.projectId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onBatch((p) => ({ ...p, notes: [note, ...(p.notes || [])] }));
    setForm(EMPTY_FORM);
    setMode("list");
  };

  const saveEdit = () => {
    if (!form.title.trim() && !form.content.trim()) return;
    onBatch((p) => ({
      ...p,
      notes: (p.notes || []).map((n) =>
        n.id === editingId
          ? {
              ...n,
              title: form.title.trim() || form.content.trim().slice(0, 50),
              content: form.content.trim(),
              tag: form.tag,
              pinned: form.pinned,
              projectId: form.projectId || null,
              updatedAt: new Date().toISOString(),
            }
          : n
      ),
    }));
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMode("list");
  };

  const deleteNote = (id) => {
    onBatch((p) => ({ ...p, notes: (p.notes || []).filter((n) => n.id !== id) }));
    if (mode === "view") setMode("list");
  };

  const togglePin = (id) => {
    onBatch((p) => ({
      ...p,
      notes: (p.notes || []).map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      ),
    }));
  };

  const openEdit = (note) => {
    setForm({
      title: note.title,
      content: note.content,
      tag: note.tag,
      pinned: note.pinned,
      projectId: note.projectId || "",
    });
    setEditingId(note.id);
    setMode("edit");
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMode("new");
  };

  const cancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMode("list");
  };

  // ── FORM VIEW (new / edit) ────────────────────────────────────
  if (mode === "new" || mode === "edit") {
    const isNew = mode === "new";
    return (
      <div style={{ ...s.card, animation: "fadeIn .2s ease" }}>
        <SectionHeader
          title={isNew ? "Nueva nota" : "Editar nota"}
          right={
            <button onClick={cancel} style={{ background: "none", border: "none", fontSize: 16, color: "#94a3b8", cursor: "pointer" }}>
              ✕
            </button>
          }
        />

        {/* Title */}
        <input
          type="text"
          placeholder="Título (opcional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{ ...s.input, fontSize: 15, fontWeight: 600, marginBottom: 8 }}
          autoFocus
        />

        {/* Content */}
        <textarea
          placeholder="Escribe tu nota aquí..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{
            ...s.input,
            minHeight: 160,
            resize: "vertical",
            lineHeight: 1.6,
            fontSize: 13,
            marginBottom: 10,
          }}
          rows={7}
        />

        {/* Tags */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>Etiqueta</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {NOTE_TAGS.map((t) => (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, tag: t.id })}
                style={{
                  padding: "4px 10px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  border: `1px solid ${form.tag === t.id ? t.color : "#e2e8f0"}`,
                  background: form.tag === t.id ? t.bg : "#fff",
                  color: form.tag === t.id ? t.color : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project link */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Vincular a proyecto</p>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              style={{ ...s.select, fontSize: 12 }}
            >
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pin */}
        <button
          onClick={() => setForm({ ...form, pinned: !form.pinned })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: form.pinned ? "#fffbeb" : "transparent",
            border: `1px solid ${form.pinned ? "#fde68a" : "#e2e8f0"}`,
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            color: form.pinned ? "#92400e" : "#94a3b8",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: form.pinned ? 600 : 400,
            marginBottom: 12,
          }}
        >
          📌 {form.pinned ? "Anclada" : "Anclar nota"}
        </button>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={isNew ? saveNew : saveEdit}
            style={{ ...s.confirm, flex: 1, padding: "10px" }}
          >
            {isNew ? "Guardar nota" : "Guardar cambios"}
          </button>
          {!isNew && (
            <button
              onClick={() => deleteNote(editingId)}
              style={{ ...s.chipDanger, padding: "10px 14px", fontSize: 12 }}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────
  return (
    <div style={{ animation: "fadeIn .2s ease" }}>
      {/* Header + search */}
      <div style={{ ...s.card, marginBottom: 8 }}>
        <SectionHeader
          title="Notas"
          right={<ActionButton onClick={openNew}>+ Nueva</ActionButton>}
        />

        <input
          type="text"
          placeholder="Buscar notas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...s.input, fontSize: 12, marginBottom: 8 }}
        />

        {/* Tag filter */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterTag("all")}
            style={{
              padding: "3px 9px",
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 600,
              border: "1px solid",
              borderColor: filterTag === "all" ? "#0f172a" : "#e2e8f0",
              background: filterTag === "all" ? "#0f172a" : "#fff",
              color: filterTag === "all" ? "#fff" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            Todas ({notes.length})
          </button>
          {NOTE_TAGS.map((t) => {
            const cnt = notes.filter((n) => n.tag === t.id).length;
            if (cnt === 0) return null;
            return (
              <button
                key={t.id}
                onClick={() => setFilterTag(filterTag === t.id ? "all" : t.id)}
                style={{
                  padding: "3px 9px",
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 600,
                  border: `1px solid ${filterTag === t.id ? t.color : "#e2e8f0"}`,
                  background: filterTag === t.id ? t.bg : "#fff",
                  color: filterTag === t.id ? t.color : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {t.label} {cnt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ ...s.card }}>
          <EmptyState text={search || filterTag !== "all" ? "No hay notas con ese filtro" : "Sin notas todavía"} />
          {!search && filterTag === "all" && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button onClick={openNew} style={{ ...s.confirm, fontSize: 12, padding: "8px 16px" }}>
                Crear primera nota
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#92400e", textTransform: "uppercase", marginBottom: 6, paddingLeft: 2 }}>
            📌 Ancladas
          </p>
          {pinned.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              projects={projects}
              onEdit={() => openEdit(note)}
              onDelete={() => deleteNote(note.id)}
              onTogglePin={() => togglePin(note.id)}
            />
          ))}
        </div>
      )}

      {/* Unpinned */}
      {unpinned.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6, paddingLeft: 2 }}>
              Recientes
            </p>
          )}
          {unpinned.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              projects={projects}
              onEdit={() => openEdit(note)}
              onDelete={() => deleteNote(note.id)}
              onTogglePin={() => togglePin(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── NOTE CARD ────────────────────────────────────────────────────
function NoteCard({ note, projects, onEdit, onDelete, onTogglePin }) {
  const [expanded, setExpanded] = useState(false);
  const tag = getTag(note.tag);
  const proj = note.projectId ? projects.find((p) => p.id === note.projectId) : null;
  const preview = note.content.slice(0, 120);
  const hasMore = note.content.length > 120;

  return (
    <div
      style={{
        ...s.card,
        marginBottom: 6,
        borderLeft: `3px solid ${tag.color}`,
        cursor: "pointer",
        transition: "box-shadow .15s",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {note.title && (
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 3px", lineHeight: 1.3 }}>
              {note.pinned && <span style={{ marginRight: 4 }}>📌</span>}
              {note.title}
            </p>
          )}
          <p
            style={{
              fontSize: 12,
              color: "#475569",
              margin: 0,
              lineHeight: 1.55,
              whiteSpace: expanded ? "pre-wrap" : "normal",
            }}
          >
            {expanded ? note.content : preview}
            {!expanded && hasMore && (
              <span style={{ color: "#94a3b8" }}> …</span>
            )}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: tag.color,
            background: tag.bg,
            padding: "2px 7px",
            borderRadius: 8,
          }}
        >
          {tag.label}
        </span>
        {proj && (
          <span style={{ fontSize: 10, color: "#7c3aed", background: "#f5f3ff", padding: "2px 7px", borderRadius: 8, fontWeight: 500 }}>
            {proj.name}
          </span>
        )}
        <span style={{ fontSize: 10, color: "#cbd5e1", marginLeft: "auto" }}>
          {formatDateFull(note.updatedAt || note.createdAt)}
        </span>
      </div>

      {/* Actions (shown on expand) */}
      {expanded && (
        <div
          style={{ display: "flex", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            style={{ ...s.chip, fontSize: 11, padding: "4px 10px", fontWeight: 600 }}
          >
            ✎ Editar
          </button>
          <button
            onClick={onTogglePin}
            style={{
              ...s.chip,
              fontSize: 11,
              padding: "4px 10px",
              fontWeight: 600,
              background: note.pinned ? "#fffbeb" : "#fff",
              color: note.pinned ? "#92400e" : "#64748b",
              borderColor: note.pinned ? "#fde68a" : "#e2e8f0",
            }}
          >
            📌 {note.pinned ? "Desanclar" : "Anclar"}
          </button>
          <button
            onClick={onDelete}
            style={{ ...s.chipDanger, fontSize: 11, padding: "4px 10px", marginLeft: "auto" }}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
