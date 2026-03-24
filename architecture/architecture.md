# Systemarchitektur - MakerKarma

## Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        PWA Frontend                              │
│                      (React + Vite SPA)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Tasks   │  │  QR-Code │  │  Profil  │  │  Admin Panel │    │
│  │  Liste   │  │  Scanner │  │  Punkte  │  │  (optional)  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Serverless)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth Service │  │ Task Service │  │ Notification Service │  │
│  │  (OAuth)     │  │              │  │     (optional)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Backend                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Issues    │  │    Labels    │  │      Comments        │  │
│  │   (Tasks)    │  │  (Kategorien)│  │  (Erledigungen)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Milestones  │  │   Projects   │                            │
│  │  (Zeiträume) │  │   (Boards)   │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Komponenten

### 1. Frontend (PWA)
- **Framework**: Vite + React (Plain JavaScript, kein TypeScript)
- **Styling**: Less (Variablen-basiertes Theming in `src/theme/`)
- **State Management**: Zustand oder Jotai (leichtgewichtig)
- **PWA Features**:
  - Service Worker für Offline-Support
  - Web App Manifest für Installation
  - Push Notifications API

### 2. Authentifizierung
- **Methode**: Einfacher OAuth-Flow via Serverless Functions
- **OAuth Provider**:
  - Google OAuth 2.0
  - Apple Sign-In
  - GitHub OAuth
- **Session**: JWT-basierte Sessions

### 3. GitHub als Backend

#### Issues = Aufgaben
```yaml
Issue:
  title: "Mülltonnen rausstellen"
  body: "Beschreibung der Aufgabe..."
  labels:
    - "punkte:5"           # Punktewert
    - "kategorie:wartung"   # Kategorie
    - "wiederkehrend:weekly" # Wiederkehrend
    - "qr:muell-001"        # QR-Code ID
  state: open/closed
  assignee: user           # Wer arbeitet dran
```

#### Labels = Metadaten
- `punkte:X` - Punktewert der Aufgabe
- `kategorie:X` - Kategorie (Wartung, Reinigung, Event, etc.)
- `wiederkehrend:X` - daily, weekly, monthly, none
- `qr:X` - QR-Code Identifier
- `status:offen` / `status:in-arbeit` / `status:erledigt`
- `verifizierung:foto` / `verifizierung:admin`

#### Comments = Aktivitäts-Log
- Wer hat die Aufgabe übernommen
- Foto-Uploads als Beweis
- Admin-Verifizierung

#### Milestones = Zeiträume
- "Q1 2024", "März 2024", etc.
- Für Punkteabrechnung

### 4. Datenmodell (Mapping auf GitHub)

```javascript
// Task-Objekt (Mapping auf GitHub Issue)
const task = {
  id: '',              // GitHub Issue Number
  title: '',           // Issue Title
  description: '',     // Issue Body (Markdown)
  points: 0,           // Label: punkte:X
  category: '',        // Label: kategorie:X
  recurring: '',       // Label: wiederkehrend:X (daily/weekly/monthly/none)
  qrCode: null,        // Label: qr:X
  status: '',          // Issue State + Labels
  assignee: null,      // Issue Assignee
  createdBy: null,     // Issue Author
  createdAt: null,     // Issue created_at
  completedAt: null,   // Issue closed_at
  verificationRequired: false,
  photos: [],          // In Comments als Links
};

// User-Objekt
const user = {
  id: '',
  name: '',
  email: '',
  authProvider: '',    // 'google' | 'apple' | 'github'
  githubUsername: null, // Für Issue-Zuweisung
  totalPoints: 0,      // Berechnet aus erledigten Tasks
  currentPeriodPoints: 0,
};

// Completion-Objekt (Aufgabenabschluss)
const completion = {
  taskId: '',
  userId: '',
  completedAt: null,
  photoUrls: [],
  verifiedBy: null,    // Admin User ID
  verifiedAt: null,
};
```

## API Endpunkte

### Tasks
- `GET /api/tasks` - Alle offenen Aufgaben
- `GET /api/tasks/:id` - Einzelne Aufgabe
- `POST /api/tasks` - Neue Aufgabe erstellen
- `PUT /api/tasks/:id/claim` - Aufgabe übernehmen
- `PUT /api/tasks/:id/complete` - Aufgabe erledigen
- `POST /api/tasks/:id/upload` - Foto hochladen

### Users
- `GET /api/users/me` - Eigenes Profil
- `GET /api/users/me/points` - Punktestand
- `GET /api/users/me/history` - Erledigte Aufgaben

### QR Codes
- `GET /api/qr/:code` - Task für QR-Code
- `POST /api/qr/:code/complete` - Via QR erledigen

### Admin
- `GET /api/admin/pending` - Zu verifizierende Tasks
- `PUT /api/admin/verify/:id` - Task verifizieren
- `PUT /api/admin/reject/:id` - Task ablehnen

## Sicherheit

### GitHub Token Management
- Ein "Service Account" GitHub Token für API-Zugriffe
- Oder: User-spezifische Tokens (wenn GitHub OAuth)
- Token sicher in Environment Variables

### Rate Limiting
- GitHub API: 5000 Requests/Stunde (authenticated)
- Caching-Layer für häufige Abfragen
- Optimistic UI Updates

## Deployment

### GitHub Pages (Empfohlen)
- Build-Output in `docs/` Ordner
- Vite baut die SPA als statische Dateien
- Automatisches Deployment via GitHub Actions
- Kostenlos, kein externer Hosting-Dienst nötig
- Serverless Functions für OAuth via externen Dienst (z.B. Cloudflare Workers)

### Konfiguration
```javascript
// vite.config.js
export default {
  build: {
    outDir: 'docs'
  }
}
```