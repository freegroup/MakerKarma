# User Stories - MakerKarma

## Rollen

### Mitglied (Standard-User)
Ein Vereinsmitglied, das Aufgaben erledigen möchte, um Punkte zu sammeln.

### Admin
Ein Vereinsvorstand oder berechtigtes Mitglied mit erweiterten Rechten.

### Gast (nicht angemeldet)
Kann die App nicht nutzen - muss sich anmelden.

---

## Epic 1: Authentifizierung

### US-1.1: Als Mitglied möchte ich mich mit Google anmelden
**Akzeptanzkriterien:**
- [ ] "Mit Google anmelden" Button auf Login-Seite
- [ ] OAuth-Flow wird korrekt durchgeführt
- [ ] Nach Login werde ich zur Task-Liste weitergeleitet
- [ ] Mein Name und Profilbild werden angezeigt

### US-1.2: Als Mitglied möchte ich mich mit GitHub anmelden
**Akzeptanzkriterien:**
- [ ] "Mit GitHub anmelden" Button auf Login-Seite
- [ ] OAuth-Flow wird korrekt durchgeführt
- [ ] GitHub-Username wird für Issue-Zuweisung verwendet

### US-1.3: Als Mitglied möchte ich mich abmelden können
**Akzeptanzkriterien:**
- [ ] Logout-Button im Profil
- [ ] Session wird beendet
- [ ] Weiterleitung zur Login-Seite

---

## Epic 2: Aufgaben ansehen

### US-2.1: Als Mitglied möchte ich alle offenen Aufgaben sehen
**Akzeptanzkriterien:**
- [ ] Liste zeigt alle offenen Tasks
- [ ] Jede Karte zeigt: Titel, Kategorie, Punkte
- [ ] Pull-to-Refresh aktualisiert die Liste
- [ ] Ladeindikator während des Ladens

### US-2.2: Als Mitglied möchte ich Aufgaben filtern können
**Akzeptanzkriterien:**
- [ ] Filter-Buttons für Kategorien
- [ ] "Alle" zeigt alle Aufgaben
- [ ] Filter wird visuell hervorgehoben

### US-2.3: Als Mitglied möchte ich Aufgaben-Details sehen
**Akzeptanzkriterien:**
- [ ] Tap auf Karte öffnet Detail-Ansicht
- [ ] Vollständige Beschreibung sichtbar
- [ ] Punktewert prominent angezeigt
- [ ] Info ob Foto erforderlich ist

---

## Epic 3: Aufgaben erledigen

### US-3.1: Als Mitglied möchte ich eine Aufgabe übernehmen
**Akzeptanzkriterien:**
- [ ] "Übernehmen" Button in Detail-Ansicht
- [ ] Aufgabe wird mir zugewiesen
- [ ] Andere sehen, dass die Aufgabe vergeben ist
- [ ] Ich kann die Übernahme rückgängig machen

### US-3.2: Als Mitglied möchte ich eine Aufgabe als erledigt markieren
**Akzeptanzkriterien:**
- [ ] "Erledigt" Button nur bei meinen Aufgaben
- [ ] Bei Pflicht-Foto: Foto-Upload erzwingen
- [ ] Bestätigungs-Dialog vor Abschluss
- [ ] Punkte werden gutgeschrieben (nach Verifizierung)

### US-3.3: Als Mitglied möchte ich ein Foto als Beweis hochladen
**Akzeptanzkriterien:**
- [ ] Kamera öffnet sich direkt
- [ ] Alternative: Foto aus Galerie wählen
- [ ] Foto-Vorschau vor Upload
- [ ] Fortschrittsanzeige beim Upload

### US-3.4: Als Mitglied möchte ich eine Aufgabe per QR-Code starten
**Akzeptanzkriterien:**
- [ ] QR-Scanner öffnet sich
- [ ] Nach Scan: Aufgabe wird angezeigt
- [ ] "Jetzt erledigen" Button
- [ ] Ungültiger QR zeigt Fehlermeldung

---

## Epic 4: Punkte & Profil

### US-4.1: Als Mitglied möchte ich meinen Punktestand sehen
**Akzeptanzkriterien:**
- [ ] Punktestand im Profil prominent angezeigt
- [ ] Punkte des aktuellen Zeitraums
- [ ] Gesamt-Punkte (all time)

### US-4.2: Als Mitglied möchte ich meine erledigten Aufgaben sehen
**Akzeptanzkriterien:**
- [ ] Liste aller erledigten Tasks
- [ ] Datum der Erledigung
- [ ] Erhaltene Punkte pro Task
- [ ] Status (verifiziert/ausstehend)

### US-4.3: Als Mitglied möchte ich sehen wie viele Punkte ich noch brauche
**Akzeptanzkriterien:**
- [ ] Anzeige: "X Punkte bis zur Beitragsreduzierung"
- [ ] Fortschrittsbalken
- [ ] Zeitraum-Info (z.B. "noch 14 Tage")

---

## Epic 5: Aufgaben erstellen

### US-5.1: Als Mitglied möchte ich eine neue Aufgabe vorschlagen
**Akzeptanzkriterien:**
- [ ] "+" Button öffnet Formular
- [ ] Pflichtfelder: Titel
- [ ] Optionale Felder: Beschreibung, Foto, Kategorie
- [ ] Punktevorschlag eingeben
- [ ] Task wird als "vorgeschlagen" erstellt

### US-5.2: Als Admin möchte ich vorgeschlagene Aufgaben freigeben
**Akzeptanzkriterien:**
- [ ] Liste aller vorgeschlagenen Tasks
- [ ] Punkte anpassen können
- [ ] Freigeben oder Ablehnen
- [ ] Begründung bei Ablehnung

---

## Epic 6: Administration

### US-6.1: Als Admin möchte ich erledigte Aufgaben verifizieren
**Akzeptanzkriterien:**
- [ ] Liste aller zu verifizierenden Tasks
- [ ] Foto-Beweis ansehen können
- [ ] "Bestätigen" oder "Ablehnen" Button
- [ ] Bei Ablehnung: Begründung eingeben

### US-6.2: Als Admin möchte ich QR-Codes generieren
**Akzeptanzkriterien:**
- [ ] QR-Code für existierende Aufgabe generieren
- [ ] QR-Code als PNG herunterladen
- [ ] Mehrere QR-Codes als PDF zum Drucken

### US-6.3: Als Admin möchte ich Benutzer-Punkte einsehen
**Akzeptanzkriterien:**
- [ ] Liste aller Mitglieder mit Punkten
- [ ] Sortierung nach Punkten
- [ ] Detail-Ansicht pro Mitglied
- [ ] Export als CSV

---

## Epic 7: Wiederkehrende Aufgaben

### US-7.1: Als Admin möchte ich wiederkehrende Aufgaben erstellen
**Akzeptanzkriterien:**
- [ ] Intervall auswählen: täglich, wöchentlich, monatlich
- [ ] Wochentag/Tag im Monat festlegen
- [ ] Aufgabe wird automatisch neu erstellt

### US-7.2: Als Mitglied möchte ich sehen wann die nächste Wiederholung ist
**Akzeptanzkriterien:**
- [ ] "Wiederholt sich jeden Donnerstag" Anzeige
- [ ] Nächstes Fälligkeitsdatum sichtbar

---

## Priorisierung (MoSCoW)

### Must Have (MVP)
- US-1.1, US-1.2, US-1.3 (Login/Logout)
- US-2.1, US-2.3 (Aufgaben ansehen)
- US-3.1, US-3.2, US-3.3 (Aufgaben erledigen)
- US-4.1, US-4.2 (Punktestand)

### Should Have
- US-2.2 (Filter)
- US-3.4 (QR-Code)
- US-4.3 (Punkte-Ziel)
- US-5.1 (Aufgaben vorschlagen)
- US-6.1 (Verifizierung)

### Could Have
- US-5.2 (Vorschläge freigeben)
- US-6.2 (QR-Generator)
- US-6.3 (Punkte-Übersicht)
- US-7.1, US-7.2 (Wiederkehrend)

### Won't Have (nicht im ersten Release)
- Push-Notifications
- Offline-Modus
- Rangliste/Gamification
- Team-Aufgaben