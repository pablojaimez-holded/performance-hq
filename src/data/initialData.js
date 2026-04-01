import { uid, getWeekId } from "./utils";

export const createInitialData = () => ({
  weekId: getWeekId(),
  tasks: {
    Lunes: [],
    Martes: [
      { id: uid(), text: "Windsor + Claude: Reports automáticos", cat: "tech", dur: 120, ts: 0, pid: "p1" },
      { id: uid(), text: "Preparar Squad meeting", cat: "meeting", dur: 45, ts: 0 },
      { id: uid(), text: "Squad meeting", cat: "meeting", dur: 60, ts: 0 },
    ],
    Miércoles: [
      { id: uid(), text: "Ads statics Origo", cat: "creative", dur: 90, ts: 0, pid: "p2" },
      { id: uid(), text: "Demand Gen case study Google", cat: "strategy", dur: 120, ts: 0, pid: "p3" },
      { id: uid(), text: "Subir ads statics Scanner Ilimitado", cat: "creative", dur: 90, ts: 0 },
      { id: uid(), text: "Revisión: Google Search + Bing + Display", cat: "optimize", dur: 75, ts: 0 },
    ],
    Jueves: [
      { id: uid(), text: "Subir vídeos Holded Fácil a YT organic + paid", cat: "creative", dur: 60, ts: 0 },
      { id: uid(), text: "Subir vídeos producto a Claude", cat: "tech", dur: 60, ts: 0 },
      { id: uid(), text: "Revisar newsletter ads y performance", cat: "reporting", dur: 45, ts: 0 },
      { id: uid(), text: "Revisión: YouTube + DemandGen + Programática + Amazon", cat: "optimize", dur: 90, ts: 0 },
    ],
    Viernes: [],
  },
  projects: [
    {
      id: "p1", name: "Windsor + Claude: Reports automáticos", status: "active",
      subs: [
        { id: uid(), text: "Conectar API Windsor", done: false },
        { id: uid(), text: "Definir métricas y KPIs", done: false },
        { id: uid(), text: "Crear template de report", done: false },
        { id: uid(), text: "Automatizar generación", done: false },
      ],
    },
    {
      id: "p2", name: "Ads statics Origo", status: "active",
      subs: [
        { id: uid(), text: "Diseño y producción creativos", done: true },
        { id: uid(), text: "Subir a plataformas", done: false },
        { id: uid(), text: "Configurar campañas", done: false },
      ],
    },
    {
      id: "p3", name: "Demand Gen case study Google", status: "active",
      subs: [
        { id: uid(), text: "Recopilar datos y resultados", done: false },
        { id: uid(), text: "Redactar case study", done: false },
        { id: uid(), text: "Entregar a Account Managers", done: false },
      ],
    },
  ],
  inbox: [],
  changelog: [],
  completed: [],
  reminders: [],
  notes: [
    {
      id: "n1",
      title: "Metodología de atribución",
      content: "Usamos 3 modelos en paralelo para tener una visión completa:\n\n1. First interaction cookie — captura el primer canal que trajo al usuario\n2. Survey post-registro — preguntamos directamente cómo nos conocieron\n3. Plataformas de publicidad — datos propios de cada canal\n\nDecisiones estratégicas se toman mirando los 3 juntos, no solo uno.",
      tag: "strategy",
      pinned: true,
      projectId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "n2",
      title: "KPIs principales por canal",
      content: "Google Search: CPA, CTR, Quality Score\nYouTube / Demand Gen: View-through, CPV, Brand lift\nDisplay / Programática: CPM, Viewability, frecuencia\nBing Ads: CPA vs Google, overlap de audiencias\nAmazon Ads: ROAS, ACoS, share of voice",
      tag: "campaign",
      pinned: false,
      projectId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
});
