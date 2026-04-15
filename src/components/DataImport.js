import React, { useState } from "react";
import { theme } from "../styles/theme";
import { STORAGE_KEY } from "../data/constants";

export default function DataImport({ onDone }) {
  const [json, setJson] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleImport = () => {
    try {
      const parsed = JSON.parse(json.trim());

      // Basic validation
      if (!parsed.tasks || !parsed.changelog || !parsed.inbox) {
        throw new Error("JSON no válido: faltan campos obligatorios (tasks, changelog, inbox)");
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e.message);
    }
  };

  if (status === "success") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: theme.colors.bg,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}>
        <div style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: "40px 36px",
          width: 480,
          maxWidth: "90vw",
          boxShadow: theme.shadow.md,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.colors.dark, margin: "0 0 8px" }}>
            Datos importados correctamente
          </h2>
          <p style={{ fontSize: 13, color: theme.colors.textMuted, margin: "0 0 24px" }}>
            Los datos se han guardado en localStorage. Pulsa el botón para cargar la app con los datos nuevos.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "11px 24px",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: theme.colors.primary,
              border: "none",
              borderRadius: theme.radius.sm,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Recargar app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: theme.colors.bg,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: "32px 28px",
        width: 560,
        maxWidth: "95vw",
        boxShadow: theme.shadow.md,
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.colors.dark, margin: "0 0 6px" }}>
            Importar datos
          </h2>
          <p style={{ fontSize: 12, color: theme.colors.textMuted, margin: 0 }}>
            Pega aquí el JSON de tus datos para restaurarlos
          </p>
        </div>

        <textarea
          value={json}
          onChange={(e) => { setJson(e.target.value); setStatus(null); }}
          placeholder='Pega tu JSON aquí... (empieza con {"inbox":...})'
          style={{
            width: "100%",
            height: 220,
            padding: "12px 14px",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            border: `1px solid ${status === "error" ? theme.colors.danger : theme.colors.border}`,
            borderRadius: theme.radius.sm,
            background: theme.colors.bg,
            color: theme.colors.text,
            resize: "vertical",
            marginBottom: 8,
          }}
        />

        {status === "error" && (
          <p style={{ fontSize: 12, color: theme.colors.danger, margin: "0 0 8px" }}>
            Error: {errorMsg}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={onDone}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 500,
              color: theme.colors.textSecondary,
              background: theme.colors.bg,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.sm,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Volver al login
          </button>
          <button
            onClick={handleImport}
            disabled={!json.trim()}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: !json.trim() ? "#9CA3B4" : theme.colors.primary,
              border: "none",
              borderRadius: theme.radius.sm,
              cursor: !json.trim() ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Importar datos
          </button>
        </div>

        <p style={{ fontSize: 10, color: theme.colors.textFaint, margin: "16px 0 0", textAlign: "center" }}>
          Para obtener tus datos, abre la consola del navegador en la versión antigua y ejecuta:<br />
          <code style={{ fontFamily: "'DM Mono', monospace", background: theme.colors.bg, padding: "2px 6px", borderRadius: 3 }}>
            copy(localStorage.getItem("performance-hq-data"))
          </code>
        </p>
      </div>
    </div>
  );
}
