import React, { useState } from "react";
import { theme } from "../styles/theme";

const AUTH_KEY = "performance-hq-admin";
const SECRET = process.env.REACT_APP_ADMIN_SECRET || "holded2026";

export function checkAuth() {
  // Check URL param first
  const params = new URLSearchParams(window.location.search);
  const urlKey = params.get("admin");
  if (urlKey === SECRET) {
    localStorage.setItem(AUTH_KEY, "true");
    window.history.replaceState({}, "", window.location.pathname);
    return true;
  }
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.reload();
}

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Small delay for UX
    setTimeout(() => {
      if (password === SECRET) {
        localStorage.setItem(AUTH_KEY, "true");
        onSuccess();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: theme.colors.bg,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: "40px 36px",
        width: 380,
        maxWidth: "90vw",
        boxShadow: theme.shadow.md,
        textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{
          width: 52, height: 52, borderRadius: theme.radius.md,
          background: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 24, fontWeight: 700,
          margin: "0 auto 20px",
        }}>P</div>

        <h1 style={{
          fontSize: 22, fontWeight: 700, color: theme.colors.dark,
          margin: "0 0 6px", letterSpacing: "-0.02em",
        }}>Performance HQ</h1>
        <p style={{ fontSize: 13, color: theme.colors.textMuted, margin: "0 0 28px" }}>
          Introduce tu contraseña para acceder
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          placeholder="Contraseña"
          autoFocus
          style={{
            width: "100%",
            padding: "11px 14px",
            fontSize: 14,
            border: `1px solid ${error ? theme.colors.danger : theme.colors.border}`,
            borderRadius: theme.radius.sm,
            background: theme.colors.bg,
            color: theme.colors.text,
            fontFamily: "inherit",
            marginBottom: 6,
            transition: "border-color .15s",
          }}
        />

        {error && (
          <p style={{
            fontSize: 12, color: theme.colors.danger, margin: "0 0 6px",
            textAlign: "left",
          }}>Contraseña incorrecta</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "11px 0",
            marginTop: 10,
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: loading || !password ? "#9CA3B4" : theme.colors.primary,
            border: "none",
            borderRadius: theme.radius.sm,
            cursor: loading || !password ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "background .15s",
          }}
        >
          {loading ? "Verificando..." : "Entrar"}
        </button>

        <p style={{ fontSize: 11, color: theme.colors.textFaint, margin: "20px 0 0" }}>
          Solo para uso interno · Holded Performance
        </p>
      </form>
    </div>
  );
}
