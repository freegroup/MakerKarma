# MakerKarma

## Projektziel
Eine WebApp für Vereinsmitglieder, um Aufgaben zu erledigen und "Sozialstunden/Punkte" zu sammeln. Ähnlich wie vereinsstunden.de, aber mit GitHub Issues als Backend.

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
1. User klickt "Login" → Redirect zu Google/GitHub OAuth
2. OAuth-Callback mit `code` → Frontend schickt code an Worker
3. Worker tauscht code gegen Provider-Token (serverseitig)
4. Worker prüft ob Email in `users.json` steht (Allow-List)
5. Worker erstellt JWT mit User-Daten + Rolle → Frontend speichert JWT

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
