# Architecture Decision Records (ADRs)

## ADR-001: PWA statt Native App

### Status
✅ Akzeptiert

### Kontext
Wir müssen entscheiden, ob wir eine native App (iOS/Android) oder eine Progressive Web App (PWA) entwickeln.

### Entscheidung
Wir entwickeln eine **Progressive Web App (PWA)**.

### Begründung
| Kriterium | Native App | PWA |
|-----------|-----------|-----|
| Entwicklungskosten | Hoch (2 Plattformen) | Niedrig (1 Codebase) |
| iOS Developer Account | 99€/Jahr erforderlich | Nicht nötig |
| App Store Zulassung | Komplexer Prozess | Entfällt |
| Updates | Store-Review nötig | Sofort live |
| Installation | Via Store | Via Browser |
| Kamera-Zugriff | ✅ | ✅ |
| Push-Notifications | ✅ | ✅ (mit Einschränkungen auf iOS) |
| Offline-Support | ✅ | ✅ |

### Konsequenzen
- (+) Keine App Store Gebühren
- (+) Schnellere Updates
- (+) Eine Codebase für alle Plattformen
- (-) Auf iOS: Nutzer müssen manuell "Zum Home-Bildschirm" hinzufügen
- (-) Push-Notifications auf iOS erst ab iOS 16.4 möglich

---

## ADR-002: GitHub Issues als Backend

### Status
✅ Akzeptiert

### Kontext
Wir benötigen eine Datenbank für Aufgaben. Optionen: eigene Datenbank, Firebase, Supabase, oder GitHub Issues.

### Entscheidung
Wir nutzen **GitHub Issues als Datenspeicher** mit **konfigurierbarem Repository**.

### Begründung
- Keine zusätzlichen Hosting-Kosten
- Built-in Versionierung und Audit-Trail
- Markdown-Support für Beschreibungen
- Labels für Metadaten (Punkte, Kategorien)
- Assignees für Aufgabenzuweisung
- API ist stabil und gut dokumentiert
- Spätere Integration mit GitHub Actions möglich

### Konsequenzen
- (+) Kostenlos bei Public Repository
- (+) Keine eigene Datenbank-Infrastruktur
- (+) Backup durch GitHub
- (-) Rate Limits beachten (5000 req/h authenticated)
- (-) Komplexere Abfragen schwieriger als mit SQL

### Implementierung
```
GitHub Issue = Aufgabe
├── Title = Aufgaben-Titel
├── Body = Beschreibung (Markdown)
├── Labels = Metadaten
│   ├── punkte:5
│   ├── kategorie:wartung
│   ├── recurring:weekly
│   └── qr:muell-001
├── Assignee = Zugewiesener User
├── State = open/closed
└── Comments = Aktivitäts-Log + Fotos + History
```

**Konfiguration:** Repository wird in `config.yaml` festgelegt.

---

## ADR-003: Vite + React als Framework

### Status
✅ Akzeptiert

### Kontext
Wir brauchen ein Frontend-Framework für die PWA.

### Optionen

#### Option A: Vite + React (SPA) -- Gewählt
**Pro:**
- Schneller Build mit Vite
- Simples Setup, keine Server-Abhängigkeiten
- React ist bereits bekannt
- Große Community und viele Libraries
- Funktioniert perfekt als statische SPA auf GitHub Pages

**Con:**
- Kein Server-Side Rendering (nicht benötigt für diese App)

#### Option B: Next.js
**Pro:**
- Server Components für Performance
- Große Community

**Con:**
- Overkill für eine SPA
- NextAuth ist Next.js-spezifisch
- Benötigt Vercel oder spezielle Konfiguration für statischen Export
- Größeres Bundle

#### Option C: SvelteKit
**Pro:**
- Sehr schnell und leichtgewichtig
- Kleineres Bundle

**Con:**
- Kleinere Community
- Neues Framework lernen nötig

### Entscheidung
**Vite + React** wegen Einfachheit, bestehendem Know-how und perfekter Eignung für eine statische SPA auf GitHub Pages.

---

## ADR-004: Authentifizierungs-Strategie

### Status
✅ Akzeptiert

### Kontext
User sollen sich mit Google, Apple oder GitHub anmelden können. Gleichzeitig nutzen wir GitHub Issues als Backend.

### Entscheidung
- **Einfacher OAuth-Flow** via Serverless Functions (z.B. Cloudflare Workers)
- **Service Account Token** für GitHub API Zugriffe
- **Admin-Rechte** werden per Config definiert (Email-Liste oder GitHub-Username)

### Architektur
```
User ──OAuth──► Serverless Function ──► Session (JWT)
                       │
                       ▼
                Config: Ist User Admin?

API ──Service Account Token──► GitHub Issues
```

### Admin-Definition (aus config.yaml)
```yaml
auth:
  admins:
    emails:
      - "admin@makerspace.de"
    github_usernames:
      - "admin-user"
```

---

## ADR-005: Verifizierung von Aufgaben

### Status
✅ Akzeptiert

### Kontext
Wie wird sichergestellt, dass Aufgaben wirklich erledigt wurden?

### Entscheidung
**Vertrauensbasis mit History-Tracking**

- Foto ODER Checkmark reicht aus
- Bei wiederkehrenden Aufgaben: History zeigt wer zuletzt erledigt hat
- Kein Admin-Review für jede Aufgabe notwendig
- Optional: Foto als Beweis für kritische Aufgaben

### Begründung
- MakerSpace-Community basiert auf Vertrauen
- Vereinfacht den Ablauf
- History ermöglicht Nachvollziehbarkeit bei Problemen

### History-Anzeige
Bei wiederkehrenden Aufgaben sieht man:
```
Letzte Erledigungen:
- 21.03.2024 - Max Mustermann ✓
- 14.03.2024 - Erika Musterfrau ✓
- 07.03.2024 - Hans Schmidt ✓
```

---

## ADR-006: Punktesystem und Tarifstufen

### Status
✅ Akzeptiert

### Kontext
Wie werden Punkte in Beitragsreduzierung umgerechnet?

### Entscheidung
**Konfigurierbares Tarifstufen-System**

### Implementierung
```yaml
points:
  period: "monthly"      # Monatliche Abrechnung
  carry_over: true       # Punkte übertragbar
  
  tiers:
    - name: "Standard"
      min_points: 0
      monthly_fee: 45.00
    
    - name: "Aktiv"  
      min_points: 10
      monthly_fee: 30.00
    
    - name: "Sehr Aktiv"
      min_points: 25
      monthly_fee: 15.00
```

### Alternative
Punkte können auch in Arbeitszeitkonto umgerechnet werden (optional aktivierbar).

---

## ADR-007: QR-Code Implementierung

### Status
✅ Akzeptiert

### Kontext
Aufgaben sollen per QR-Code ausgelöst werden können.

### Entscheidung
QR-Codes enthalten eine URL: `https://app.example.com/qr/{code}`

### Ablauf
1. User scannt QR-Code mit Handy-Kamera ODER In-App Scanner
2. URL öffnet die App/PWA
3. App zeigt zugehörige Aufgabe mit History
4. User klickt "Erledigt" → Checkbox oder Foto
5. Punkte werden gutgeschrieben

### History bei QR-Tasks
Besonders wichtig bei QR-basierten wiederkehrenden Aufgaben:
- "Letzte Erledigung: Vor 3 Tagen von Max M."
- Verhindert doppelte Erledigung
- Motiviert zur regelmäßigen Erledigung

---

## ADR-008: Foto-Upload Strategie

### Status
⏳ Vorgeschlagen

### Optionen

#### Option A: GitHub Issue Comments
- Fotos direkt in GitHub Issues hochladen
- Gratis, max 10MB pro Datei
- Bei Private Repo: Nur für Repo-Mitglieder sichtbar

#### Option B: Cloudinary (Favorit)
- Kostenloser Tier: 25GB Storage
- Automatische Bildoptimierung
- CDN-Auslieferung
- Unabhängig vom GitHub Repo

#### Option C: Cloudflare R2
- Sehr günstig
- Mehr Setup

### Tendenz
**Cloudinary** für MVP - einfach, kostenlos, optimiert Bilder automatisch.

---

## ADR-009: Plain JavaScript statt TypeScript

### Status
✅ Akzeptiert

### Kontext
Sollen wir TypeScript oder Plain JavaScript verwenden?

### Entscheidung
Wir verwenden **Plain JavaScript (ES6+)** ohne TypeScript.

### Begründung
- Schnellerer Entwicklungsstart ohne TS-Konfiguration
- Geringere Build-Komplexität
- Für ein Vereinsprojekt dieser Größe ist TypeScript Overhead
- JSDoc-Kommentare können bei Bedarf für Dokumentation genutzt werden
- Vite unterstützt beide Varianten, Wechsel wäre später möglich

### Konsequenzen
- (+) Einfacheres Setup und schnellerer Build
- (+) Niedrigere Einstiegshürde für Contributors
- (-) Keine Compile-Zeit-Typprüfung
- (-) Weniger IDE-Autocompletion ohne Types

---

## ADR-010: Less statt Tailwind CSS

### Status
✅ Akzeptiert

### Kontext
Wir brauchen eine Styling-Lösung für die App.

### Optionen
- Tailwind CSS: Utility-First CSS Framework
- Less: CSS-Präprozessor mit Variablen und Mixins
- Plain CSS / CSS Modules

### Entscheidung
Wir verwenden **Less** als CSS-Präprozessor.

### Begründung
- Variablen-basiertes Theming ist einfach und übersichtlich
- Theme-Ordner unter `src/theme/` für zentrale Farbdefinitionen
- Bekannte CSS-Syntax, keine neuen Utility-Klassen lernen
- Bessere Lesbarkeit im HTML (keine langen Utility-Klassen-Strings)
- Vite unterstützt Less nativ

### Theme-Struktur
```
src/theme/
├── variables.less    # Farben, Abstände, Schriftgrößen
├── mixins.less       # Wiederverwendbare Styles
└── global.less       # Globale Styles
```

### Konsequenzen
- (+) Klare Trennung von Struktur und Styling
- (+) Zentrale Theme-Variablen für konsistentes Design
- (+) Standard-CSS-Kenntnisse reichen aus
- (-) Kein Utility-First Ansatz (mehr eigenes CSS schreiben)

---

## ADR-011: GitHub Pages als Hosting

### Status
✅ Akzeptiert

### Kontext
Wir brauchen ein kostenloses Hosting für die PWA.

### Optionen
- Vercel: Kostenlos, aber Team-Limit und Vendor Lock-in
- Cloudflare Pages: Kostenlos, gute Performance
- GitHub Pages: Kostenlos, direkt im Repository integriert
- Netlify: Kostenlos, ähnlich wie Vercel

### Entscheidung
Wir verwenden **GitHub Pages** mit dem `docs/` Ordner als Build-Output.

### Begründung
- Komplett kostenlos ohne Limits
- Direkt im selben GitHub-Repository wie der Code
- Kein externer Dienst nötig (kein Vercel/Cloudflare-Account)
- Einfaches Deployment: `npm run build` schreibt nach `docs/`
- GitHub Actions für automatische Builds
- Passt zum "GitHub als Backend"-Ansatz (ADR-002)

### Deployment-Konfiguration
```javascript
// vite.config.js
export default {
  build: {
    outDir: 'docs'
  }
}
```

### OAuth-Lösung
Da GitHub Pages nur statische Dateien hosten kann, wird der OAuth-Token-Tausch über eine minimale Serverless Function (z.B. Cloudflare Worker) abgewickelt.

### Konsequenzen
- (+) Kein externer Hosting-Account nötig
- (+) Alles in einem Repository
- (+) Unbegrenztes Bandwidth
- (-) Nur statische Dateien (kein SSR)
- (-) OAuth benötigt externen Serverless-Dienst

---

## Entscheidungs-Log

| Datum | ADR | Status | Entscheidung |
|-------|-----|--------|--------------|
| 2024-03-24 | ADR-001 | ✅ | PWA statt Native |
| 2024-03-24 | ADR-002 | ✅ | GitHub Issues + Config |
| 2024-03-24 | ADR-003 | ✅ | Vite + React (SPA) |
| 2024-03-24 | ADR-004 | ✅ | OAuth via Serverless Functions + Config-basierte Admins |
| 2024-03-24 | ADR-005 | ✅ | Vertrauensbasis + History |
| 2024-03-24 | ADR-006 | ✅ | Konfigurierbares Tarifstufen-System |
| 2024-03-24 | ADR-007 | ✅ | URL-basierte QR-Codes |
| 2024-03-24 | ADR-008 | ⏳ | Cloudinary (Tendenz) |
| 2024-03-24 | ADR-009 | ✅ | Plain JavaScript statt TypeScript |
| 2024-03-24 | ADR-010 | ✅ | Less statt Tailwind CSS |
| 2024-03-24 | ADR-011 | ✅ | GitHub Pages als Hosting |