# Performance HQ — Contexto del Proyecto

> Este archivo es el punto de partida para cualquier sesión nueva en Cowork.
> Al inicio de cada conversación, dile a Claude: **"lee el CONTEXT.md de Performance HQ"**

---

## ¿Qué es esto?

**Performance HQ** es una app de productividad y gestión de campañas construida en React, diseñada exclusivamente para Pablo Jaimez (Performance Manager en Holded). Combina un sistema de tareas/proyectos/notas con dashboards de campañas y briefings diarios automatizados.

La app vive en: `~/Downloads/performance-hq 2/`
Para arrancarla: `cd ~/Downloads/performance-hq\ 2 && npm run dev`
**URL de producción (Vercel):** `https://performance-hq-app.vercel.app`

---

## Stack técnico

- **React 18** con Create React App (`react-scripts 5.0.1`)
- **Node.js v20 LTS** (⚠️ v24 es incompatible con react-scripts 5)
- Persistencia: **localStorage** via hook `useStore`
- Sin librería UI externa — todo con inline styles
- Fuente: **Inter** (Holded-inspired)
- Colores: azul primario `#4361EE`, sistema de diseño en `src/styles/theme.js`
- Para hacer build: `npm run build` (no `npm start`, el script se llama `dev`)

---

## Estructura de archivos

```
src/
├── App.js                  # Layout principal: sidebar + main content
├── components/
│   ├── Briefing.js         # Briefing diario con links a dashboards
│   ├── Planner.js          # Planificador semanal de tareas con timer
│   ├── Sections.js         # Inbox, Changelog, Completed, Alerts, Projects
│   ├── Notes.js            # Módulo de notas con tags y búsqueda
│   └── UI.js               # Componentes compartidos (Checkbox, ActionButton, etc.)
├── data/
│   ├── constants.js        # WEEK_DAYS, CATEGORIES, PLATFORMS, AMPLITUDE_DASHBOARD
│   ├── initialData.js      # Estructura inicial de datos (tasks, projects, notes...)
│   └── utils.js            # uid, formatDate, getTodayName, isOverdue, etc.
├── hooks/
│   ├── useStore.js         # Persistencia localStorage con load/save/batch
│   └── useTimer.js         # Timer para tracking de tiempo en tareas
└── styles/
    └── theme.js            # Design tokens: colores, sombras, radios, estilos `s`
```

---

## Funcionalidades implementadas

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Briefing | ✅ | Resumen diario, links a Amplitude, cambios pendientes |
| Planner semanal | ✅ | Tareas por día, mover entre días/semanas, timer, proyectos |
| Inbox | ✅ | Captura rápida, promover a día de la semana |
| Proyectos | ✅ | Con subtareas, progress bar, descripción/notas, promoción a tareas |
| Notas | ✅ | CRUD completo, 6 tags (campaña/estrategia/reunión/idea/insight/general), pin, búsqueda |
| Changelog campañas | ✅ | Registro de cambios con recordatorio automático de revisión |
| Completadas | ✅ | Historial de tareas y proyectos completados |
| Alertas | ✅ | Recordatorios con prioridad y fecha de revisión |
| Layout responsive | ✅ | Sidebar en desktop (≥900px), hamburger en móvil |
| Diseño Holded | ✅ | Inter font, azul #4361EE, cards limpias, sidebar navigation |

---

## Roadmap pendiente

| Feature | Prioridad | Notas |
|---------|-----------|-------|
| Drag & drop tareas en vista calendario | 🔴 Alta | Mover tareas entre franjas horarias del día arrastrándolas en la vista de calendario |
| Editar cambios del changelog | 🔴 Alta | Permitir editar entradas del changelog una vez creadas |
| Alertas en Inbox y tareas diarias | 🔴 Alta | Poder asignar alertas/recordatorios a tareas del Inbox y del planner semanal |
| Categorías: crear campaña y review | 🔴 Alta | Añadir "Crear campaña" y "Review" como tipologías de tareas en CATEGORIES |
| Notificaciones push | 🟡 Media | Browser Notifications API para alertas vencidas y tareas del día |
| Deploy (Vercel) | ✅ Hecho | `https://performance-hq-app.vercel.app` — auto-deploy desde GitHub main |
| Briefing automático Cowork | 🟡 Media | Tarea programada que genera briefing con datos de campañas |
| Dashboard de campañas | ✅ Hecho | Demand Capture Dashboard (Search & PMAX) con refresh diario via Windsor |
| Insights de campañas | 🟢 Futura | Motor de análisis y recomendaciones automáticas |

---

## Contexto de negocio (Pablo)

- **Rol**: Performance Manager en Holded
- **Canales que gestiona**: Google Ads (Search, YouTube, Demand Gen, Display), Bing Ads, Amazon Ads, Programática (DSP)
- **Metodología de medición**: First interaction cookie + encuesta (survey) + plataformas de publicidad → visión big picture para decisiones estratégicas
- **Dashboard principal**: Amplitude (PM Daily Control Center) — funnel completo, 3 modelos de atribución, first accounts, suscripciones
- **Empresa**: Holded — software de gestión empresarial, diseño azul/limpio, fuente Inter

---

## Demand Capture Dashboard (Google Ads)

El **Demand Capture Dashboard** es un report HTML autogenerado que cubre Search & PMAX (cuenta 727-602-0979), excluyendo Brand. Se refresca automáticamente cada mañana a las 8:30 (L-V) con la tarea programada `demand-capture-dashboard-refresh`.

**Abrir dashboard (online):** `https://performance-hq-app.vercel.app/demand-capture.html`
**Abrir dashboard (local):** [demand-capture.html](computer:///Users/pablojaimez/Downloads/performance-hq%202/public/demand-capture.html)

**Contenido:**
- Overview con KPIs y gráficos de tendencia
- Tabla de métricas 30d y 90d (Spend, Clicks, CPC, Conversions, CPA, ROAS, CR FAC, CR FASS, CR QEv2)
- 6 gráficos semanales 90d (sin Brand): FASS, FAC, QEv2, CR QEv2, ROAS QEv2, CAC Payback

**Datos:** Windsor.ai → google_ads → conversion actions: first_account_sub_started, first_account_created, qualification_v2

**Tarea programada:** `demand-capture-dashboard-refresh` — ejecuta a las 8:30 L-V, fetcha 90 días de Windsor y regenera WEEKLY_DATA en el HTML.

**⚠️ IMPORTANTE — Versión canónica del dashboard:**
El archivo `public/demand-capture.html` es la versión oficial y definitiva del dashboard. Ante cualquier tarea relacionada (refresh de datos, correcciones, mejoras), Claude DEBE leer primero ese archivo y trabajar sobre él directamente. NUNCA generar un HTML nuevo desde cero ni simplificar la estructura. Solo modificar lo estrictamente necesario (ej. inyectar WEEKLY_DATA actualizado). Si Pablo pide cambios de diseño o funcionalidad, aplicarlos sobre este archivo, no reemplazarlo.

---

## Full Funnel Dashboard (YouTube, Demand Gen & Display)

El **Full Funnel Dashboard** es un report HTML que cubre todas las campañas de Google Ads que NO son Search ni PMAX, organizadas por etapa del funnel:

- **AWA (Awareness):** Campañas VIDEO + DEMAND_GEN con "AWA" en el nombre → VVC, VRC, Magazine
- **ACQ (Acquisition):** Campañas DEMAND_GEN con "ACQ" en el nombre → Marca-Focused, Product-Focused, Shorts, Partners
- **REM (Remarketing):** Campañas DEMAND_GEN con "REM" en el nombre → Website Visitors, Free Users, Webinars

**Cuentas de Google Ads:**
- `793-556-1699` (Holded - Display & YouTube): AWA + ACQ
- `624-900-3211` (Holded - Remarketing): REM
- `865-500-6023` (Holded - Partners): ACQ (solo Demand Gen, excluye Search)

**Abrir dashboard (online):** `https://performance-hq-app.vercel.app/full-funnel.html`
**Abrir dashboard (local):** [full-funnel.html](computer:///Users/pablojaimez/Downloads/performance-hq%202/public/full-funnel.html)

**Contenido:**
- Overview con KPIs agregados y distribución de Spend por funnel stage (doughnut)
- Tab AWA: métricas upper funnel (Impressions, CPM, View Rate, CPV, VTR, Clicks, CTR)
- Tab ACQ: métricas mid funnel (Clicks, CTR, Conversions, CPA, ROAS)
- Tab REM: métricas bottom funnel (Conversions, CPA, ROAS, View-Through Conversions)
- 9 gráficos Chart.js con 19 campañas across 3 cuentas

**Datos:** Windsor.ai → google_ads → cuentas 793-556-1699, 624-900-3211, 865-500-6023

**⚠️ IMPORTANTE — Versión canónica del dashboard:**
El archivo `public/full-funnel.html` es la versión oficial y definitiva del dashboard. Ante cualquier tarea relacionada (refresh de datos, correcciones, mejoras), Claude DEBE leer primero ese archivo y trabajar sobre él directamente. NUNCA generar un HTML nuevo desde cero ni simplificar la estructura. Si Pablo pide cambios de diseño o funcionalidad, aplicarlos sobre este archivo, no reemplazarlo.

---

## Notas de desarrollo

- Al hacer build en el sandbox de Cowork, hay que **copiar el proyecto** a un directorio temporal antes (el mount point tiene conflictos con node_modules)
- El script de npm se llama `dev`, no `start`: `npm run dev`
- Para verificar build: copiar a `/sessions/.../tmp/`, instalar dependencias ahí, luego `npm run build`
- Los estilos se distribuyen entre `theme.js` (sistema de diseño) e inline styles en cada componente
- El `s` exportado de `theme.js` son atajos de estilo reutilizables (s.card, s.input, s.chip, etc.)
