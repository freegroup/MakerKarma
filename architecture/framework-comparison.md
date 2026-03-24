# Framework-Vergleich: React vs SvelteKit

## Kurzfassung

| Kriterium | React (Vite) | SvelteKit |
|-----------|-------------|-----------|
| **Deine Erfahrung** | ✅ Bekannt | ❌ Neu lernen |
| **Bundle-Größe** | ~45-80 KB | ~15-25 KB |
| **Lernkurve** | - | Mittel (1-2 Tage) |
| **Community** | Riesig | Kleiner, aber wächst |
| **Komponenten-Libraries** | Sehr viele | Weniger |
| **Performance** | Sehr gut | Exzellent |
| **Boilerplate Code** | Mehr | Weniger |

---

## Empfehlung: **Bleib bei React**

Da du React bereits kennst, macht es mehr Sinn dabei zu bleiben:
- **Schnellerer Start** - Kein neues Framework lernen
- **Bekannte Patterns** - useState, useEffect, etc.
- **Mehr Libraries** - React Query, Zustand, etc.

---

## React-Optionen für GitHub Pages

### Option A: Vite + React (SPA) -- Gewählt

```bash
npm create vite@latest makerkarma -- --template react
```

**Vorteile:**
- Schneller Build
- Simples Setup
- Funktioniert perfekt mit GitHub Pages (statischer Output nach `docs/`)
- Alle React-Libraries verfügbar
- Plain JavaScript -- kein TypeScript-Setup nötig

**Für OAuth (externer Serverless Worker):**
```
Cloudflare Worker (oder ähnlich):
└── auth/
    └── callback.js    # OAuth Token-Tausch
```

### Option B: Next.js (Static Export)

```bash
npx create-next-app@latest makerkarma
```

Dann in `next.config.js`:
```javascript
module.exports = {
  output: 'export',  // Statischer Export
}
```

**Nachteile:**
- Overkill für eine SPA
- Mehr Konfiguration für statischen Export
- Größeres Bundle
- Manche Features funktionieren nicht statisch
- NextAuth ist Next.js-spezifisch und nicht portabel

### Option C: Remix

**Vorteile:**
- Sehr gut für Forms
- Progressive Enhancement

**Nachteile:**
- Neueres Framework
- Weniger Ressourcen

---

## Code-Vergleich: React vs Svelte

### React Component
```jsx
import { useState } from 'react';

function TaskCard({ task }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    await completeTask(task.id);
    setIsLoading(false);
  };

  return (
    <div className="card">
      <h3>{task.title}</h3>
      <span className="points">{task.points} Punkte</span>
      <button
        onClick={handleComplete}
        disabled={isLoading}
      >
        {isLoading ? 'Lädt...' : 'Erledigt'}
      </button>
    </div>
  );
}

export default TaskCard;
```

### Svelte Component (zum Vergleich)
```svelte
<script>
  export let task;
  let isLoading = false;

  async function handleComplete() {
    isLoading = true;
    await completeTask(task.id);
    isLoading = false;
  }
</script>

<div class="card">
  <h3>{task.title}</h3>
  <span class="points">{task.points} Punkte</span>
  <button
    on:click={handleComplete}
    disabled={isLoading}
  >
    {isLoading ? 'Lädt...' : 'Erledigt'}
  </button>
</div>
```

**Unterschiede:**
- Svelte: Weniger Boilerplate, kein `useState`
- Svelte: Reaktivität ist automatisch
- React: Vertrautere Syntax für dich

---

## Gewählter Tech Stack

### **Vite + React + JavaScript + Less + GitHub Pages**

```
Tech Stack:
├── Vite (Build Tool)
├── React 18 (UI)
├── Plain JavaScript (kein TypeScript)
├── Less (Styling, Theme in src/theme/)
├── React Query (Data Fetching)
├── React Router (Routing)
├── Zustand (State Management)
└── GitHub Pages (Hosting, Build-Output in docs/)
```

**Warum diese Kombination?**
1. ✅ Du kennst React bereits
2. ✅ Vite ist schneller als Create React App
3. ✅ Plain JavaScript hält das Setup einfach
4. ✅ Less bietet Variablen-basiertes Theming
5. ✅ React Query macht API-Calls einfach
6. ✅ GitHub Pages ist kostenlos und direkt im Repo

---

## Projekt-Setup

```bash
# 1. Vite + React (Plain JavaScript)
npm create vite@latest makerkarma -- --template react

# 2. In Projektordner wechseln
cd makerkarma

# 3. Dependencies
npm install

# 4. Less
npm install -D less

# 5. Nützliche Libraries
npm install @tanstack/react-query    # Data Fetching
npm install react-router-dom         # Routing
npm install zustand                  # State Management
npm install @octokit/rest            # GitHub API
npm install html5-qrcode             # QR Scanner
```

---

## Fazit

| Szenario | Empfehlung |
|----------|------------|
| Du willst schnell starten | **Vite + React** |
| Du willst was Neues lernen | SvelteKit |
| Du willst maximale Features | Next.js |
| Du willst minimales Bundle | SvelteKit oder Astro |

**Entscheidung: Vite + React + Plain JavaScript + Less + GitHub Pages.**
