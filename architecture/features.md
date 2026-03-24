# Features - MakerKarma

## MVP Features (Phase 1)

### 1. Authentifizierung
- [ ] Google OAuth Login
- [ ] GitHub OAuth Login
- [ ] Apple Sign-In (optional, komplexer)
- [ ] Session Management
- [ ] Logout Funktion

### 2. Task-Übersicht (Hauptbildschirm)
- [ ] Liste aller offenen Aufgaben
- [ ] Filterung nach Kategorie
- [ ] Sortierung (Punkte, Datum, Kategorie)
- [ ] Pull-to-Refresh
- [ ] Suchfunktion

### 3. Task-Details
- [ ] Titel und Beschreibung
- [ ] Punktewert anzeigen
- [ ] Kategorie-Badge
- [ ] "Aufgabe übernehmen" Button
- [ ] Foto-Upload bei Erledigung
- [ ] "Als erledigt markieren" Button

### 4. Profil & Punkte
- [ ] Eigener Punktestand
- [ ] Punkte-Historie
- [ ] Liste erledigter Aufgaben
- [ ] Aktueller Abrechnungszeitraum

### 5. PWA Basics
- [ ] Installierbar auf Homescreen
- [ ] Offline-Nachricht bei fehlender Verbindung
- [ ] Responsive Design (Mobile-First)

---

## Phase 2 Features

### 6. QR-Code System
- [ ] QR-Code Scanner in der App
- [ ] Kamera-Berechtigung anfragen
- [ ] QR-Code zeigt direkt die zugehörige Aufgabe
- [ ] Schnell-Erledigung via QR
- [ ] QR-Code Generator für Admins (zum Ausdrucken)

**Beispiel QR-Codes:**
- Mülltonnen-Stellplatz
- Werkstatt-Reinigung
- Absauganlage leeren
- Getränke-Kühlschrank auffüllen

### 7. Aufgaben erstellen (User)
- [ ] Titel eingeben
- [ ] Beschreibung (optional)
- [ ] Kategorie auswählen
- [ ] Foto hinzufügen (optional)
- [ ] Punktevorschlag (Community entscheidet)

### 8. Wiederkehrende Aufgaben
- [ ] Tägliche Aufgaben (z.B. Werkstatt aufräumen)
- [ ] Wöchentliche Aufgaben (z.B. Mülltonnen)
- [ ] Monatliche Aufgaben (z.B. Tiefenreinigung)
- [ ] Automatische Neu-Erstellung nach Erledigung
- [ ] Anzeige "Nächste Fälligkeit"

### 9. Benachrichtigungen
- [ ] Push-Notifications (neue dringende Aufgaben)
- [ ] Email-Zusammenfassung (optional)
- [ ] Erinnerung bei übernommenen Aufgaben

---

## Phase 3 Features

### 10. Admin-Panel
- [ ] Aufgaben verifizieren/ablehnen
- [ ] Benutzer verwalten
- [ ] Punkte manuell anpassen
- [ ] Neue Kategorien erstellen
- [ ] QR-Codes generieren und drucken
- [ ] Statistiken und Reports

### 11. Punktesystem Advanced
- [ ] Community-Voting für Punktewert
- [ ] Bonus-Punkte für schwierige Aufgaben
- [ ] Punkte-Multiplikator (z.B. Wochenende)
- [ ] Punkte-Verlauf über Zeit (Chart)
- [ ] Rangliste (optional, gamification)

### 12. Social Features
- [ ] Kommentare zu Aufgaben
- [ ] @Mentions für Hilfe
- [ ] Team-Aufgaben (mehrere Personen)
- [ ] Aktivitäts-Feed

### 13. Offline-Support (Advanced)
- [ ] Aufgaben offline ansehen
- [ ] Offline-Erledigung (sync wenn online)
- [ ] Foto-Queue für Upload

---

## UI/UX Spezifikationen

### Navigation (Bottom Tab Bar)
```
┌─────────────────────────────────────┐
│                                     │
│         [Hauptinhalt]               │
│                                     │
├─────────────────────────────────────┤
│  🏠      📷      ➕      👤        │
│ Tasks   Scan   Neu    Profil       │
└─────────────────────────────────────┘
```

### Task-Karte
```
┌─────────────────────────────────────┐
│ [Kategorie-Badge]          ⭐ 5 Pkt │
│                                     │
│ Mülltonnen rausstellen              │
│ Jeden Donnerstag bis 18:00          │
│                                     │
│ 🔄 Wiederkehrend    📷 Foto nötig  │
└─────────────────────────────────────┘
```

### Farbschema (Vorschlag)
- **Primary**: #3B82F6 (Blau)
- **Success**: #10B981 (Grün)
- **Warning**: #F59E0B (Orange)
- **Error**: #EF4444 (Rot)
- **Background**: #F9FAFB (Hellgrau)
- **Text**: #111827 (Fast-Schwarz)

### Kategorien & Icons
| Kategorie | Icon | Farbe |
|-----------|------|-------|
| Wartung | 🔧 | Orange |
| Reinigung | 🧹 | Blau |
| Garten | 🌱 | Grün |
| Event | 🎉 | Lila |
| Einkauf | 🛒 | Gelb |
| Sonstiges | 📋 | Grau |

---

## Technische Features

### Performance
- [ ] Lazy Loading für Bilder
- [ ] Infinite Scroll für Task-Liste
- [ ] Debounced Search
- [ ] Optimistic UI Updates

### Sicherheit
- [ ] CSRF Protection
- [ ] Rate Limiting
- [ ] Input Sanitization
- [ ] Sichere Foto-Uploads (Größenlimit, Typ-Check)

### Analytics (Optional)
- [ ] Anonyme Nutzungsstatistiken
- [ ] Error Tracking (Sentry)
- [ ] Performance Monitoring