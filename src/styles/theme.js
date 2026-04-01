// ════════════════════════════════════════════════════════════
// Performance HQ — Design System (Holded-inspired)
// ════════════════════════════════════════════════════════════

export const theme = {
  colors: {
    // Primary brand (Holded blue)
    primary: "#4361EE",
    primaryHover: "#3A56D4",
    primaryLight: "#EEF1FE",
    primaryBorder: "#C7D2FE",

    // Backgrounds
    bg: "#F8F9FB",
    bgSidebar: "#FFFFFF",
    card: "#FFFFFF",

    // Borders
    border: "#E8ECF1",
    borderHover: "#D1D5DB",
    borderFocus: "#4361EE",

    // Text
    text: "#1A1D26",
    textSecondary: "#5F6577",
    textMuted: "#9CA3B4",
    textFaint: "#C5CAD6",

    // Dark (headers, nav active)
    dark: "#1A1D26",
    darkSoft: "#2D3142",

    // Accent colors
    accent: "#4361EE",
    success: "#10B981",
    successBg: "#ECFDF5",
    successBorder: "#A7F3D0",
    warning: "#F59E0B",
    warningBg: "#FFFBEB",
    warningBorder: "#FDE68A",
    danger: "#EF4444",
    dangerBg: "#FEF2F2",
    dangerBorder: "#FECACA",
    purple: "#7C3AED",
    purpleBg: "#F5F3FF",
    orange: "#F97316",
    teal: "#14B8A6",
  },

  // Shadows
  shadow: {
    xs: "0 1px 2px rgba(0,0,0,.04)",
    sm: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
    md: "0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05)",
    lg: "0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -4px rgba(0,0,0,.04)",
  },

  // Radius (Holded uses generous rounding)
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    pill: 100,
  },

  // Breakpoints
  bp: {
    mobile: 640,
    tablet: 1024,
    desktop: 1280,
  },
};

// ── COMPONENT STYLES ─────────────────────────────────────────
export const s = {
  card: {
    background: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 20,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.xs,
  },
  h2: {
    fontSize: 17,
    fontWeight: 700,
    margin: 0,
    color: theme.colors.dark,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
    color: theme.colors.text,
  },
  btn: {
    border: "none",
    background: theme.colors.primary,
    color: "#fff",
    padding: "8px 16px",
    borderRadius: theme.radius.sm,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .15s, transform .1s",
    fontFamily: "inherit",
  },
  btnOutline: {
    border: `1px solid ${theme.colors.border}`,
    background: "#fff",
    color: theme.colors.text,
    padding: "8px 16px",
    borderRadius: theme.radius.sm,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  form: {
    background: theme.colors.bg,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.sm,
    fontSize: 14,
    fontFamily: "inherit",
    color: theme.colors.text,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
  },
  select: {
    padding: "8px 12px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.sm,
    fontSize: 13,
    fontFamily: "inherit",
    color: theme.colors.textSecondary,
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  row: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  confirm: {
    background: theme.colors.primary,
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: theme.radius.sm,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background .15s",
  },
  chip: {
    border: `1px solid ${theme.colors.border}`,
    background: "#fff",
    padding: "4px 10px",
    borderRadius: theme.radius.pill,
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
    color: theme.colors.textSecondary,
    fontFamily: "inherit",
    transition: "all .15s",
  },
  chipDanger: {
    border: "none",
    background: theme.colors.dangerBg,
    color: theme.colors.danger,
    padding: "4px 10px",
    borderRadius: theme.radius.pill,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  taskRow: {
    borderRadius: theme.radius.md,
    padding: "12px 14px",
    background: theme.colors.bg,
    marginBottom: 6,
    borderLeft: "3px solid",
    transition: "box-shadow .15s",
  },
  dayTab: {
    flex: 1,
    padding: "10px 8px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    background: "#fff",
    transition: "all .15s",
    fontFamily: "inherit",
  },
  dayTabActive: {
    borderColor: theme.colors.primary,
    background: theme.colors.primaryLight,
    boxShadow: `0 0 0 1px ${theme.colors.primary}`,
  },
};
