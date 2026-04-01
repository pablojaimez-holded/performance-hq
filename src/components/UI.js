import React from "react";
import { CATEGORIES } from "../data/constants";
import { theme } from "../styles/theme";

export function Checkbox({ checked, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", flexShrink: 0, marginTop: 1 }}
    >
      {checked ? (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill={color} />
          <path d="M4.5 8l2.5 2.5L11.5 5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x=".75" y=".75" width="14.5" height="14.5" rx="3.5" stroke={theme.colors.borderHover} strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </button>
  );
}

export function Badge({ children, color = theme.colors.border, textColor = theme.colors.textSecondary }) {
  return (
    <span style={{ fontSize: 10, background: color, color: textColor, padding: "2px 6px", borderRadius: theme.radius.pill, fontWeight: 600 }}>
      {children}
    </span>
  );
}

export function CategoryPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          style={{
            padding: "5px 10px",
            borderRadius: theme.radius.sm,
            border: value === c.id ? `1.5px solid ${c.color}` : `1.5px solid transparent`,
            background: value === c.id ? c.color + "0d" : "transparent",
            display: "flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .15s",
          }}
        >
          <span style={{ color: c.color, fontSize: 10 }}>{c.icon}</span>
          <span style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{c.label}</span>
        </button>
      ))}
    </div>
  );
}

export function DurationPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {[15, 30, 45, 60, 90, 120].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding: "5px 10px",
            borderRadius: theme.radius.sm,
            fontSize: 12,
            fontWeight: 600,
            background: value === m ? theme.colors.dark : "transparent",
            color: value === m ? "#fff" : theme.colors.textSecondary,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .15s",
          }}
        >
          {m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}` : `${m}m`}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: 28, color: theme.colors.textFaint, fontSize: 13 }}>
      {text}
    </div>
  );
}

export function SectionHeader({ title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: theme.colors.dark, letterSpacing: "-0.01em" }}>{title}</h2>
      {right}
    </div>
  );
}

export function ActionButton({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: theme.colors.primary,
        color: "#fff",
        padding: "7px 14px",
        borderRadius: theme.radius.sm,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background .15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function getCat(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}
