# MakerKarma

**Inspired by Karma Yoga — the path of selfless action.**

MakerKarma turns everyday community tasks into a shared practice. Serve your makerspace, earn karma, grow together. Every task completed is a step on the path — the reward is in the doing.

A Progressive Web App where makerspace members pick up tasks, earn karma points, and reduce their membership fee. Built on GitHub Issues as a backend — invisible to users, effortless for admins.

## Features

- **Mobile-First PWA** - Funktioniert auf iPhone und Android ohne App Store
- **Aufgaben-Management** - Aufgaben ansehen, übernehmen und erledigen
- **QR-Code System** - Wiederkehrende Aufgaben per Scan erledigen
- **Punktesystem** - Punkte sammeln für Beitragsreduzierung
- **History** - Sehen wer Aufgaben zuletzt erledigt hat
- **OAuth Login** - Google, GitHub
- **Allow-List** - Nur registrierte Mitglieder haben Zugang (via `users.json`)
- **Rollen** - Admin/Member pro User konfigurierbar
- **Theming** - Anpassbare Farben und Styles via Less-Variablen

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

## Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [CLAUDE.md](./CLAUDE.md) | Projektübersicht |
| [architecture/architecture.md](./architecture/architecture.md) | Systemarchitektur |
| [architecture/features.md](./architecture/features.md) | Feature-Liste mit Phasen |
| [architecture/user-stories.md](./architecture/user-stories.md) | User Stories |
| [architecture/decisions.md](./architecture/decisions.md) | Architektur-Entscheidungen |

## Quick Start

```bash
# Frontend
npm install
npm run dev

# API Worker (separates Terminal)
cd cloudflare
npm install
npm run dev
```

## Konfiguration

### 1. GitHub Repo (privat)

Erstelle ein privates GitHub Repo und lege eine `users.json` an (siehe [config/users.example.json](./config/users.example.json)):

```json
[
  { "email": "admin@example.com", "name": "Max", "role": "admin" },
  { "email": "mitglied@example.com", "name": "Erika", "role": "member" }
]
```

### 2. Cloudflare Worker Secrets

```bash
cd cloudflare
wrangler secret put GITHUB_BOT_TOKEN      # GitHub PAT (repo scope)
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put JWT_SECRET             # Random string
```

### 3. Frontend

```env
# .env.local
VITE_API_URL=https://makerkarma-api.YOURNAME.workers.dev
```

## Tech Stack

- **Frontend**: Vite + React (Plain JavaScript)
- **Styling**: Less (Variablen-basiertes Theming)
- **State**: Zustand + TanStack React Query
- **API-Proxy**: Cloudflare Workers (Hono)
- **Auth**: OAuth (Google, GitHub) → JWT
- **Backend**: GitHub Issues API (privates Repo)
- **User-Verwaltung**: `users.json` im Repo (Allow-List + Rollen)
- **Hosting**: GitHub Pages (Frontend) + Cloudflare Workers (API)
- **CI/CD**: GitHub Actions (automatischer Build bei Commit)

## Projektstruktur

```
MakerSpace/
├── CLAUDE.md
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── .github/
│   └── workflows/
│       └── deploy.yml              # Auto-Build & Deploy
├── config/
│   ├── config.example.yaml         # Vereins-Konfiguration
│   └── users.example.json          # Beispiel Allow-List
├── architecture/                   # Projekt-Dokumentation
├── docs/                           # GitHub Pages (Build-Output)
├── cloudflare/                        # Cloudflare Workers (API)
│   ├── wrangler.toml
│   ├── package.json
│   └── src/
│       ├── index.js                # Haupt-Router (Hono)
│       ├── auth/
│       │   ├── google.js           # Google OAuth
│       │   └── github.js           # GitHub OAuth
│       ├── api/
│       │   ├── tasks.js            # GitHub Issues CRUD
│       │   └── users.js            # User-Verwaltung
│       └── middleware/
│           ├── auth.js             # JWT-Prüfung
│           └── jwt.js              # JWT sign/verify
└── src/                            # Frontend
    ├── main.jsx
    ├── index.less
    ├── theme/
    │   └── default.less            # Theme-Variablen
    ├── types/
    │   └── index.js                # Konstanten
    ├── store/
    │   └── authStore.js            # Auth + API-Helper
    ├── pages/                      # (noch zu erstellen)
    └── components/                 # (noch zu erstellen)
```

## Deployment

### Frontend (GitHub Pages)
Bei jedem Push auf `main` automatisch via GitHub Actions.

### API (Cloudflare Workers)
```bash
cd cloudflare
npm run deploy
```

## Roadmap

### Phase 1 - MVP
- [ ] Basic Auth (Google, GitHub)
- [ ] Aufgaben-Liste anzeigen
- [ ] Aufgaben erledigen
- [ ] Punkte-Anzeige

### Phase 2
- [ ] QR-Code Scanner
- [ ] Foto-Upload
- [ ] Wiederkehrende Aufgaben
- [ ] History-Anzeige

### Phase 3
- [ ] Admin-Panel
- [ ] Punkte-Export
- [ ] Push-Notifications
- [ ] Offline-Modus

## Lizenz

MIT License
