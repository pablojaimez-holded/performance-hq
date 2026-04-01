export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const formatTime = (mins) => {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  return `${m}m`;
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

export const formatDateFull = (d) =>
  new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

export const isOverdue = (d) =>
  d && new Date(d) <= new Date(new Date().toISOString().split("T")[0]);

export const getWeekId = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `${now.getFullYear()}-W${week}`;
};

export const getTodayName = () => {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[new Date().getDay()];
};

// Get Monday of a given week offset (0 = current week, 1 = next, -1 = prev)
export const getWeekStart = (offset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getWeekIdFromDate = (date) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d - start;
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const getWeekLabel = (date) => {
  const monday = new Date(date);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fmtD = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `${fmtD(monday)} — ${fmtD(friday)}`;
};

export const isAfterTime = (hour, minute) => {
  const now = new Date();
  return now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute);
};
