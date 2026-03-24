# MakerKarma

## Projektziel
Eine WebApp für Vereinsmitglieder, um Aufgaben zu erledigen und "Sozialstunden/Punkte" zu sammeln. Ähnlich wie vereinsstunden.de, aber mit GitHub Issues als Backend.

## Design-Philosophie
- **Mobile-First Social App** — Die App orientiert sich an modernen Social Apps (Telegram, WhatsApp, Instagram) in Look & Feel und Bedienerführung
- **Vertraute UX-Patterns**: FABs, Chat-Style Kommentare, Bottom Navigation, Pull-to-Refresh, Swipe-Gesten
- **Screens statt Dialoge**: Neue Inhalte öffnen als eigener Screen (kein Modal/Dialog), wie bei nativen Mobile Apps
- **Bottom-Nav nur auf Top-Level**: Aufgabenliste, Admin, Profil haben die Tab-Bar; Detail- und Erstellen-Screens nicht
- **Freude erzeugen**: Confetti bei erledigten Aufgaben, Stern-Visualisierung für Punkte, sanfte Animationen
- **Minimalistisch**: Wenig Text, große Touch-Targets, klare visuelle Hierarchie
- **Dynamische Konfiguration**: Kategorien und Punkte-Werte kommen aus GitHub Labels — kein Hardcoding, Admin verwaltet alles über GitHub

## Theming-Architektur
Striktes Theming mit klarer Trennung:

- **Komponenten-Less** (`src/pages/*.less`, `src/components/*.less`): Nur Layout und Verhalten (display, flex, position, width, height). Keine Farben, keine Abstände.
- **Theme-Less** (`src/theme/default.less`): Definiert ALLE visuellen Eigenschaften:
  1. **Variablen-Block** (oben): Less-Variablen für Farben, Abstände, Radii, Shadows, Fonts
  2. **Klassen-Block** (unten): Mapping der Variablen auf konkrete Komponenten-Klassen

### Beispiel Theme-Aufbau:
```less
// === VARIABLEN ===
@brand-primary: #3b82f6;
@spacing-4: 1rem;
@radius-xl: 0.75rem;

// === KLASSEN-MAPPING ===
.task-card {
  background: white;
  border-radius: @radius-xl;
  padding: @spacing-4;
  box-shadow: @shadow-sm;
}

.create-submit {
  background: @brand-primary;
  color: white;
  border-radius: @radius-full;
  padding: @spacing-4;
}
```

### Regeln:
- Ein neues Theme = Eine neue Less-Datei die alles überschreibt
- Farben, Abstände, Border-Radii, Schatten, Font-Sizes IMMER über Theme-Variablen
- Komponenten-Less: KEIN `color:`, `background:`, `padding:`, `margin:`, `border-radius:`, `box-shadow:`, `font-size:`
- Ausnahme: Layout-relevante Abstände (gap in Flexbox) dürfen in Komponenten bleiben

## Tech Stack
- **Frontend**: Vite + React (Plain JavaScript) → gehostet auf GitHub Pages
- **Styling**: Less (Variablen-basiertes Theming in `src/theme/`)
- **State Management**: Zustand (Auth) + TanStack React Query (Server State)
- **Backend**: GitHub Issues als Datenbank (privates Repo)
- **API-Proxy**: Cloudflare Workers (Hono) → OAuth + GitHub API Proxy
- **Auth**: OAuth (Google, GitHub) → JWT-basierte Sessions
- **User-Verwaltung**: `users.json` im privaten GitHub-Repo (Allow-List + Rollen)
- **CI/CD**: GitHub Actions (automatischer Build bei Push auf main)

## Architektur
```
GitHub Pages (Static Frontend)
       ↕ API Calls (JWT)
Cloudflare Workers (API-Proxy)
       ↕ Bot-Token
GitHub Repo (privat)
  ├── Issues = Aufgaben
  └── users.json = Mitglied-Liste + Rollen
```

## Auth-Flow
1. User klickt "Login" → Frontend leitet zu Worker `/auth/github?redirect=<frontend_url>`
2. Worker leitet zu GitHub OAuth weiter (Callback = Worker-URL)
3. GitHub redirected zurück zum Worker mit `code`
4. Worker tauscht code gegen Access Token + User-Profil
5. Worker prüft ob Email in `users.json` steht (Allow-List, read-only)
6. Worker erstellt JWT → Redirect zum Frontend mit `?token=...`
7. Frontend extrahiert JWT aus URL (inline Script in index.html) → localStorage
8. **Eine OAuth App** für Dev + Prod (Callback immer an Worker)

## Kernfeatures
1. **Aufgabenverwaltung** - Basierend auf GitHub Issues (für User unsichtbar)
2. **Authentifizierung** - Google, GitHub OAuth via Cloudflare Workers
3. **Allow-List** - `users.json` im Repo: nur registrierte Mitglieder haben Zugang
4. **Rollen** - admin/member via `users.json`
5. **Wiederkehrende Aufgaben** - Automatisch neu erstellte Tasks
6. **QR-Code System** - Aufgaben per Scan auswählen
7. **Punktesystem** - Community oder Admin bestimmt Wert
8. **Theming** - Anpassbare Farben via Less-Variablen

## Wichtige Dateien
- `/architecture/` - Detaillierte Projektdokumentation
- `/config/config.example.yaml` - Vereins-Konfiguration
- `/config/users.example.json` - Beispiel User Allow-List
- `/src/theme/default.less` - Theme-Variablen
- `/src/store/authStore.js` - Auth State + API-Helper
- `/cloudflare/` - Cloudflare Workers (API-Proxy)
- `/cloudflare/src/index.js` - Worker Haupt-Router (Hono)
- `/cloudflare/wrangler.toml` - Worker-Konfiguration
- `/.github/workflows/deploy.yml` - Auto-Build & Deploy

## Projekt-Details
- **Vereinstyp**: MakerSpace (keine Abteilungen)
- **Mitglieder**: ca. 150
- **GitHub Repo**: Privat (schützt users.json und Issues)
- **Punktesystem**:
  - Monatliche Umrechnung in Arbeitszeitkonto oder Beitragsreduzierung
  - Punkte können in nächsten Monat übernommen werden
  - Minimum-Punkte für günstigeren Tarif erforderlich
- **Verifizierung**: Foto oder Checkmark reicht (Vertrauensbasis)
- **History**: Bei wiederkehrenden Aufgaben sieht man wer zuletzt erledigt hat
- **Admin-Rechte**: Rolle in users.json, unabhängig vom Vorstand

## Quick Commands
```bash
# Frontend starten
npm run dev

# Frontend Build (Output: docs/)
npm run build

# Worker lokal starten
cd cloudflare && npm run dev

# Worker deployen
cd cloudflare && npm run deploy
```
