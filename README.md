# Performance HQ

Sistema de gestión de productividad y campañas de performance marketing.

## Funcionalidades

- **☀ Briefing diario**: Vista rápida con enlace a Amplitude, cambios pendientes y tareas del día
- **📋 Planner semanal**: Tareas por día con timer, categorías y duración estimada
- **📥 Inbox**: Captura rápida de ideas y peticiones para organizar después
- **📁 Proyectos**: Seguimiento de proyectos con subtareas inline en el planner
- **📊 Cambios en campañas**: Log de optimizaciones con recordatorio automático de revisión
- **✅ Hechas**: Archivo de tareas completadas con timestamps
- **🔔 Alertas**: Recordatorios con prioridad y fechas de revisión

## Cómo usar

### Desarrollo local

```bash
npm install
npm run dev
```

### Despliegue en Vercel

1. Sube este repo a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
3. Importa el repositorio
4. Vercel detectará que es un proyecto React y lo desplegará automáticamente

Cada push a `main` desplegará una nueva versión automáticamente.

## Stack

- React 18
- LocalStorage para persistencia
- Sin dependencias externas (todo vanilla CSS-in-JS)

## Estructura

```
src/
  App.js              → Componente principal, orquestación
  components/
    UI.js             → Componentes reutilizables (Checkbox, Badges, Pickers...)
    Briefing.js       → Sección de briefing diario
    Planner.js        → Planner semanal con subtareas inline
    Sections.js       → Inbox, Changelog, Completed, Alerts, Projects
  hooks/
    useStore.js       → Persistencia con localStorage
    useTimer.js       → Timer para tracking de tiempo
  data/
    constants.js      → Categorías, plataformas, configuración
    initialData.js    → Datos iniciales de ejemplo
    utils.js          → Utilidades (formateo, IDs, fechas)
  styles/
    theme.js          → Estilos compartidos
```
