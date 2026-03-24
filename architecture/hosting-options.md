# Hosting-Optionen - MakerKarma

## Übersicht der Optionen

| Option | Serverless? | Kosten | Komplexität | Empfehlung |
|--------|-------------|--------|-------------|------------|
| **GitHub Pages** | ❌ (nur statisch) | Kostenlos | Niedrig | ⭐ Empfohlen |
| **Cloudflare Pages + Workers** | ✅ | Kostenlos* | Mittel | Alternative |
| **Vercel** | ✅ | Kostenlos* | Niedrig | Alternative |
| **Netlify** | ✅ | Kostenlos* | Niedrig | Alternative |

*Kostenlos im Free Tier für kleine bis mittlere Projekte

---

## Option 1: GitHub Pages (Empfohlen) ⭐

### Architektur
```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Pages                              │
│              (Statische SPA / PWA)                          │
│                                                              │
│  Vite + React App - Build-Output im docs/ Ordner           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Serverless Function (OAuth)                      │
│                                                              │
│  Minimaler Worker für OAuth-Token-Tausch                    │
│  (z.B. Cloudflare Worker oder GitHub Actions)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub API                                │
│              (Issues als Datenbank)                         │
└─────────────────────────────────────────────────────────────┘
```

### Vorteile
- ✅ Komplett kostenlos ohne Limits
- ✅ Kein externer Hosting-Account nötig
- ✅ Alles in einem GitHub-Repository (Code + Hosting + Backend)
- ✅ Unbegrenztes Bandwidth
- ✅ Automatische Deployments via GitHub Actions
- ✅ HTTPS standardmäßig

### Nachteile
- ❌ Nur statische Dateien (kein SSR)
- ❌ OAuth-Token-Tausch benötigt externen Serverless-Dienst

### Deployment
```bash
# Vite baut nach docs/
npm run build

# GitHub Pages liest aus docs/ Ordner des Repositories
# In den Repository-Settings: Pages → Source → docs/ folder
```

### Vite-Konfiguration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs'
  }
});
```

---

## Option 2: Cloudflare Pages + Workers

### Architektur
```
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Pages                            │
│           (Frontend + Functions in einem)                    │
│                                                              │
│  /                → Statische PWA                           │
│  /functions/*     → Serverless Functions                    │
└─────────────────────────────────────────────────────────────┘
```

### Vorteile
- ✅ Alles in einem Deployment
- ✅ Kostenlos
- ✅ Integrierte Functions (kein separater Worker nötig)
- ✅ Automatisches HTTPS
- ✅ Preview Deployments für PRs

### Nachteile
- ❌ Externer Account nötig (Cloudflare)
- ❌ Vendor Lock-in bei Functions

### Cloudflare Workers Limits (Free)
- 100.000 Requests/Tag
- 10ms CPU-Zeit pro Request
- Bei 150 Mitgliedern locker ausreichend!

---

## Option 3: Vercel

### Vorteile
- ✅ Einfaches Deployment
- ✅ Serverless Functions automatisch dabei
- ✅ Kostenlos für Hobby-Projekte

### Nachteile
- ❌ Team-Beschränkung im Free Tier (1 Person)
- ❌ Vendor Lock-in
- ❌ Externer Account nötig

### Vercel Free Tier Limits
| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/Monat |
| Serverless Functions | 100.000 Ausführungen |
| Build Minutes | 6.000/Monat |
| Team Members | 1 (Hobby) |

---

## OAuth ohne Server? - Die Optionen

### Problem
OAuth benötigt einen Server für den Token-Austausch (Authorization Code → Access Token), weil das `client_secret` nicht im Browser exponiert werden darf.

### Lösung 1: Serverless Functions (Empfohlen)
```
Browser → Serverless Function → OAuth Provider
                  ↓
          Speichert client_secret sicher
```

Ein minimaler Cloudflare Worker oder eine GitHub Action kann den Token-Tausch übernehmen.

### Lösung 2: PKCE Flow (Proof Key for Code Exchange)
Einige OAuth Provider unterstützen PKCE für SPAs - kein Server nötig!

| Provider | PKCE Support |
|----------|--------------|
| Google | ✅ Ja |
| GitHub | ❌ Nein (benötigt Server) |
| Apple | ✅ Ja |

**Problem:** GitHub OAuth braucht IMMER einen Server/Function für den Token-Tausch.

### Lösung 3: Minimal Auth Worker
Ein winziger Cloudflare Worker nur für den OAuth-Token-Tausch:

```javascript
// Cloudflare Worker - auth-worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth/github/callback') {
      const code = url.searchParams.get('code');

      // Token-Tausch mit GitHub
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokens = await tokenResponse.json();

      // Redirect zurück zur App mit Token
      return Response.redirect(
        `https://deine-app.github.io/callback?token=${tokens.access_token}`
      );
    }

    return new Response('Not found', { status: 404 });
  },
};
```

---

## Entscheidung

### Gewählt: **GitHub Pages + Vite + React**

| Kriterium | GitHub Pages |
|-----------|-------------|
| Kosten | Kostenlos |
| Build-Output | `docs/` Ordner |
| Serverless Functions | Via externen Dienst (z.B. Cloudflare Worker für OAuth) |
| Custom Domain | ✅ Kostenlos |
| Build Zeit | Schnell (Vite) |
| Vendor Lock-in | Keiner (Standard-HTML/JS) |
| Repository-Integration | ✅ Direkt im selben Repo |

### Warum GitHub Pages?
- Alles an einem Ort: Code, Issues-Backend und Hosting im selben GitHub-Repository
- Kein externer Hosting-Dienst nötig
- Passt perfekt zum "GitHub als Backend"-Ansatz (ADR-002)
- Einfachstes Setup: Build nach `docs/`, fertig

### OAuth-Lösung
Für den OAuth-Token-Tausch wird ein minimaler Cloudflare Worker verwendet (kostenlos, wenige Zeilen Code).

---

## Nächste Schritte

1. ✅ **Entscheidung getroffen**: GitHub Pages
2. ✅ **Framework gewählt**: Vite + React (Plain JavaScript)
3. **OAuth Apps erstellen**:
   - Google Cloud Console
   - GitHub Developer Settings
4. **Minimal Auth Worker aufsetzen** (Cloudflare Worker für OAuth)
5. **Projekt deployen**: Vite Build nach `docs/`
