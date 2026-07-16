# FabLab Bremen — Infrastruktur-Runbook

Diese Datei richtet sich an Entwickler:innen, die zukünftig an dieser Website
arbeiten — egal ob dauerhaft oder nur für eine einmalige Änderung. Das Ziel:
niemand soll bei Null anfangen müssen, nur weil die Person, die das
ursprünglich gebaut hat (Abdulroqib), gerade nicht verfügbar ist.

Für nicht-technische Vorstandsmitglieder gibt es ein separates Dokument:
`leitfaden.html` — dort geht es um Inhalte pflegen (Workshops, Projekte,
Dokumente), nicht um Infrastruktur.

---

## 1. Architektur-Überblick

| Teil | Dienst | Zweck |
|---|---|---|
| Code | GitHub (Org: `fablab-bremen`) | Quellcode, Versionsverwaltung |
| Hosting | GitHub Pages | Liefert die Website an Besucher aus |
| Backend/Datenbank | Supabase | Postgres-DB, Auth, Edge Functions |
| Datei-Speicher (Dokumente) | Cloudinary | PDF/Word/Excel/PowerPoint-Uploads |
| Bilder | Supabase Storage | Maschinen-, Projekt-, Workshop-Fotos (WebP) |
| Domain | fablab-bremen.org | Zeigt per DNS auf GitHub Pages |

Der komplette Frontend-Code ist **vanilla HTML/CSS/JavaScript** — kein
Build-Schritt, kein Framework, kein `npm install` nötig, um die Seite lokal
zu öffnen. Das ist bewusst so gehalten: jede Entwicklerin/jeder Entwickler
mit Grundkenntnissen in Webentwicklung kann sich hier schnell zurechtfinden,
ohne sich erst in ein spezielles Framework einarbeiten zu müssen.

---

## 2. Deployment — wie kommt eine Änderung live?

1. Änderungen lokal machen, testen
2. `git add -A && git commit -m "..."`
3. `git push origin main`
4. GitHub Pages deployt automatisch bei jedem Push auf `main` — meist
   innerhalb von 1–2 Minuten live

Es gibt **keinen separaten Build/Deploy-Schritt** — kein Vercel, kein CI/CD,
kein manuelles "Deploy"-Kommando. Ein Push auf `main` ist gleichbedeutend
mit "live schalten". Entsprechend vorsichtig sein: nicht direkt auf `main`
experimentieren, lieber einen Branch nutzen (siehe unten) und erst mergen,
wenn es getestet ist.

**Empfohlener Workflow für größere Änderungen:**
```bash
git checkout -b feature-name
# ... Änderungen machen ...
git commit -am "..."
git push origin feature-name
# lokal/auf dem Branch testen, dann erst mergen:
git checkout main
git merge feature-name
git push origin main
```

---

## 3. Wo liegen die Zugangsdaten / Secrets?

**Nirgends im Code selbst.** Das ist wichtig — im Repo sind keine API-Keys
oder Passwörter hardcodiert (mit Ausnahme des Supabase `anon key`, der ist
absichtlich öffentlich, Sicherheit läuft über Row Level Security in der DB,
nicht über Geheimhaltung dieses Keys).

Echte Secrets liegen als **Supabase Edge Function Secrets**:
```bash
supabase secrets list          # zeigt welche Secrets gesetzt sind (nicht die Werte)
supabase secrets set KEY=wert  # setzt/überschreibt ein Secret
```

Aktuell gesetzte Secrets (Stand: Juli 2026):
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (für Edge Functions, die die RLS umgehen müssen)

Diese Werte selbst stehen **nicht** in diesem Dokument — sie liegen im
Supabase Dashboard unter *Project Settings → Edge Functions → Secrets*.
Zugriff darauf braucht ein Supabase-Account mit Zugriff auf das FabLab-Projekt.

---

## 4. Admin-Zugänge

Admins werden über eine `admins`-Tabelle verwaltet, verknüpft mit Supabase
Auth. Ein neuer Admin wird **manuell im Supabase-Dashboard** angelegt
(Authentication → Users → Add User) — ein DB-Trigger trägt die Person dann
automatisch in die `admins`-Tabelle ein.

Es gibt **keine Selbstregistrierung** für Admins — das ist Absicht, damit
nicht irgendjemand sich selbst Admin-Rechte geben kann.

---

## 5. Bekannte Stolperfallen

### Supabase-Projekt pausiert nach Inaktivität
Auf dem kostenlosen Supabase-Tier wird ein Projekt **nach ca. 7 Tagen ohne
Aktivität automatisch pausiert**. Das äußert sich so: die Website lädt
keine Inhalte mehr (Workshops/Projekte/Maschinen bleiben leer), obwohl der
Code selbst unverändert ist.

**Fix:** Ins Supabase-Dashboard einloggen, das Projekt zeigt einen
"Paused"-Status mit einem "Restore"-Button. Ein Klick reaktiviert es
innerhalb weniger Minuten. Das ist kein Datenverlust, nur eine
Pause-Funktion.

**Vorbeugend:** Falls die Seite länger nicht genutzt wird (z.B. Semesterferien
ohne neue Workshops), lohnt sich ein kurzer Login ins Dashboard alle paar
Tage, um das zu vermeiden — oder das Projekt auf einen bezahlten Tier heben,
falls das Budget das irgendwann hergibt.

### CORS-Fehler bei Edge Functions
Falls im Browser-Console-Log `blocked by CORS policy` auftaucht: die
betroffene Edge Function braucht `Access-Control-Allow-Origin`-Header auf
**jeder** Response (auch Fehler-Responses) plus eine explizite Behandlung
von `OPTIONS`-Preflight-Requests. Siehe `upload-document`/`delete-document`
Edge Functions als Referenzimplementierung.

### Cloudinary-Speicherlimit
Kostenloser Tier: 25 GB. Dokumente (PDF/Word/Excel/PowerPoint) laufen über
Cloudinary, Bilder laufen über Supabase Storage (WebP-komprimiert, deutlich
kleiner). Falls Cloudinary-Uploads plötzlich fehlschlagen, lohnt sich ein
Blick ins Cloudinary-Dashboard auf den aktuellen Speicherverbrauch.

### DNS / Domain zeigt nicht auf die Seite
Die Domain `fablab-bremen.org` muss per DNS (A-Record oder CNAME, je nach
Registrar-Konfiguration) auf GitHub Pages zeigen. Wer Zugriff auf die
DNS-Einstellungen hat, muss im Vorstand geklärt sein — siehe
`leitfaden.html` Abschnitt 3.

---

## 6. Notfall-Checkliste — "Die Seite ist kaputt, was jetzt?"

1. **Zeigt die Seite gar nichts an (weißer Bildschirm)?** → Browser-Konsole
   öffnen (F12), nach roten Fehlermeldungen suchen. Meist ein fehlgeschlagener
   Import oder ein Tippfehler in einem Dateipfad.
2. **Zeigt die Seite Layout, aber keine Workshops/Projekte/Maschinen?**
   → Supabase-Dashboard prüfen, ob das Projekt pausiert ist (siehe oben).
3. **Admin-Panel-Login funktioniert nicht?** → Supabase Auth-Status prüfen,
   ist die Person tatsächlich in der `admins`-Tabelle eingetragen?
4. **Änderungen wurden gepusht, sind aber nicht live?** → GitHub-Repo unter
   *Actions* oder *Settings → Pages* prüfen, ob der Build fehlgeschlagen ist.
5. **Nichts davon hilft?** → Das Problem im Detail dokumentieren
   (Fehlermeldung, wann es begann, was zuletzt geändert wurde) und im
   FabLab-Kontext nach technischer Unterstützung fragen — z.B. über lokale
   Entwickler-Communities in Bremen, Hochschule Bremen Informatik-Fachschaft,
   oder ähnliche Netzwerke.

---

## 7. Kontostruktur (Stand: Juli 2026)

Ziel ist, dass alle Konten unter einer FabLab-eigenen E-Mail-Adresse laufen,
nicht unter Privatkonten — Details dazu in `leitfaden.html` Abschnitt 2 und 3.

- **GitHub:** Org `fablab-bremen` — im Aufbau, Eigentümerübertragung an
  FabLab-Konto geplant, sobald eine FabLab-E-Mail-Adresse verfügbar ist
- **Supabase, Cloudinary:** aktuell unter Privatkonto, gleiche Migration geplant