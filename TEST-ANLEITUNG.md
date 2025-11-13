# Test-Anleitung für die echte Formcycle-Seite

## 🎯 Ziel

Wir testen das Multiple-Upload-Script auf dem **zweiten Upload-Feld** von:
**https://formulare.kempten.de/frontend-server/form/provide/10056/**

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Formular öffnen

1. Öffnen Sie in Ihrem Browser: https://formulare.kempten.de/frontend-server/form/provide/10056/
2. Warten Sie, bis das Formular vollständig geladen ist

### Schritt 2: Browser-Console öffnen

**Chrome/Edge:**
- Drücken Sie `F12` oder
- Rechtsklick → "Untersuchen" → Tab "Console"

**Firefox:**
- Drücken Sie `F12` oder
- Rechtsklick → "Element untersuchen" → Tab "Konsole"

**Safari:**
- Drücken Sie `Cmd+Option+C` oder
- Entwicklermenü → "Web-Inspektor anzeigen" → Tab "Console"

### Schritt 3: Test-Script ausführen

1. Öffnen Sie die Datei: `test-console-script.js`
2. Kopieren Sie den **gesamten Inhalt** (Strg+A, Strg+C)
3. Fügen Sie ihn in die Browser-Console ein (Strg+V)
4. Drücken Sie **Enter**

### Schritt 4: Erwartete Console-Ausgabe

Sie sollten folgende Ausgabe sehen:

```
==============================================
XIMA Multiple Upload - Test auf zweitem Upload-Feld
==============================================
✅ jQuery verfügbar: 3.x.x
✅ Formcycle AjaxUploadManager verfügbar
📎 Gefundene Upload-Felder: 2 (oder mehr)
  Upload-Feld #1: { id: "...", name: "...", class: "..." }
  Upload-Feld #2: { id: "...", name: "...", class: "..." }

🎯 Verwende Upload-Feld #2: { id: "...", name: "..." }

[MultiUpload] 🚀 Initialisiere Upload-Feld...
[MultiUpload] ✅ Multiple-Attribut gesetzt
[MultiUpload] ✅ errorFunc registriert
[MultiUpload] ✅ Info-Box erstellt
[MultiUpload] ✅ Events registriert

==============================================
✅ INITIALISIERUNG ABGESCHLOSSEN!
==============================================

📖 ANLEITUNG:
1. Scrollen Sie zum zweiten Upload-Feld
2. Klicken Sie auf "Dateien auswählen"
3. Wählen Sie mehrere Dateien mit Strg/Cmd+Klick
4. Beobachten Sie die Console-Logs und UI-Updates

🎯 Upload-Feld ID: ...
🎯 Multiple-Attribut: true
```

### Schritt 5: Multiple-Upload testen

1. **Scrollen Sie zum zweiten Upload-Feld** im Formular
2. Sie sollten eine **blaue Info-Box** sehen mit:
   - 📦 0 / 10 Dateien | 0 Bytes / 100 MB
   - 💡 TEST-MODUS: Multiple-Upload aktiviert!
3. Klicken Sie auf **"Dateien auswählen"** oder **"Browse"**
4. Im File-Dialog:
   - Wählen Sie **mehrere Dateien** mit Strg+Klick (Windows/Linux) oder Cmd+Klick (Mac)
   - Oder wählen Sie alle Dateien in einem Ordner
5. Klicken Sie auf **"Öffnen"**

### Schritt 6: Upload beobachten

Während des Uploads sollten Sie sehen:

**In der Browser-Console:**
```
[MultiUpload] Validiere 3 Dateien
[MultiUpload] Bereits hochgeladen: 0 Dateien
[MultiUpload] Aktuelle Gesamtgröße: 0 Bytes
[MultiUpload] ✅ Validierung erfolgreich
[MultiUpload] Upload begin: datei1.pdf
[MultiUpload] Upload progress: 25%
[MultiUpload] Upload progress: 50%
[MultiUpload] Upload progress: 100%
[MultiUpload] ✅ Upload success: { ... }
[MultiUpload] Upload begin: datei2.pdf
...
```

**Auf der Seite (beim Upload-Feld):**
- **Progress-Bar** mit Dateiname und Prozent
- **Info-Box** wird aktualisiert:
  - 📦 1 / 10 Dateien | 1.5 MB / 100 MB
  - 📦 2 / 10 Dateien | 3.2 MB / 100 MB
  - 📦 3 / 10 Dateien | 5.8 MB / 100 MB

### Schritt 7: Validierung testen

**Test 1: Zu große Datei**
1. Versuchen Sie eine Datei > 10 MB hochzuladen
2. Erwartung: Rote Error-Box erscheint
   - ⚠️ Fehler: datei.zip: Datei zu groß (15 MB > 10 MB)

**Test 2: Duplikat**
1. Laden Sie eine Datei hoch (z.B. `test.pdf`)
2. Versuchen Sie dieselbe Datei nochmal hochzuladen
3. Erwartung: Error-Box
   - ⚠️ Fehler: test.pdf: Datei bereits vorhanden

**Test 3: Zu viele Dateien**
1. Laden Sie 10 Dateien hoch
2. Versuchen Sie eine weitere Datei hochzuladen
3. Erwartung: Error-Box
   - ⚠️ Fehler: Maximal 10 Dateien erlaubt (bereits 10 hochgeladen)

**Test 4: Inkrementelles Hinzufügen**
1. Laden Sie 3 Dateien hoch
2. Klicken Sie erneut auf "Dateien auswählen"
3. Wählen Sie weitere 2 Dateien
4. Erwartung: Jetzt insgesamt 5 Dateien
   - 📦 5 / 10 Dateien | ...

## ✅ Erfolgskriterien

Das Script funktioniert, wenn:

- [x] Multiple-Selection im File-Dialog möglich
- [x] Alle ausgewählten Dateien werden hochgeladen
- [x] Progress-Bar zeigt Fortschritt für jede Datei
- [x] Info-Box zeigt korrekte Anzahl und Größe
- [x] Validierung blockt ungültige Uploads
- [x] Inkrementelles Hinzufügen funktioniert
- [x] Console-Logs zeigen detaillierte Informationen

## 🐛 Troubleshooting

### Problem: "jQuery nicht verfügbar"

**Lösung:**
```javascript
// In Console prüfen:
console.log(typeof jQuery);
// Sollte "function" sein

// Falls undefined, warten bis Seite vollständig geladen
```

### Problem: "Formcycle AjaxUploadManager nicht verfügbar"

**Lösung:**
```javascript
// In Console prüfen:
console.log($.xutil);
console.log($.xutil.ajaxUpload);

// Falls undefined: Formcycle-Version < 8.4.2
// Bitte Admin kontaktieren für Upgrade
```

### Problem: "Kein zweites Upload-Feld gefunden"

**Lösung:**
```javascript
// In Console prüfen:
$('input[type="file"]').length  // Sollte >= 2 sein

// Falls nur 1 Feld vorhanden:
// Ändern Sie im Script: $allUploads.eq(0) statt .eq(1)
```

### Problem: Multiple-Attribut wird nicht gesetzt

**Lösung:**
```javascript
// In Console prüfen:
const $field = $('input[type="file"]').eq(1);
console.log($field.prop('multiple'));  // Sollte true sein

// Falls false:
$field.prop('multiple', true);
```

### Problem: Events werden nicht gefeuert

**Lösung:**
1. Console-Logs zeigen keine Upload-Events
2. Prüfen: `$.xutil.ajaxUpload` existiert
3. Events müssen VOR dem Upload registriert werden
4. Script erneut ausführen

## 📸 Screenshots

Bitte machen Sie Screenshots von:

1. **Console-Ausgabe** nach Script-Ausführung
2. **Upload-Feld** mit Info-Box
3. **File-Dialog** mit Multiple-Selection
4. **Progress-Bar** während Upload
5. **Fertige Upload-Liste** mit mehreren Dateien

## 📝 Test-Protokoll

Füllen Sie dieses Protokoll aus:

```
Datum: __________
Browser: __________
Formcycle-Version: __________

✅ Script erfolgreich in Console eingefügt
✅ Initialisierung erfolgreich (Console-Logs OK)
✅ Info-Box erscheint beim zweiten Upload-Feld
✅ Multiple-Selection im File-Dialog funktioniert
✅ Alle ausgewählten Dateien werden hochgeladen
✅ Progress-Bar zeigt Fortschritt
✅ Info-Box wird aktualisiert (Anzahl, Größe)
✅ Validierung: Zu große Datei wird blockiert
✅ Validierung: Duplikat wird blockiert
✅ Validierung: Zu viele Dateien werden blockiert
✅ Inkrementelles Hinzufügen funktioniert

Notizen:
_____________________________________
_____________________________________
_____________________________________
```

## 🔄 Nächste Schritte

Nach erfolgreichem Test:

1. **Für dauerhaften Einsatz:**
   - Kontaktieren Sie Formcycle-Admin
   - Script in Formular-JavaScript einbinden (siehe README.md)
   - CSS-Klasse `custom-upload` am zweiten Upload-Feld setzen

2. **Anpassungen:**
   - Limits anpassen (MAX_FILE_SIZE, MAX_FILES, etc.)
   - DEBUG-Modus deaktivieren für Produktion
   - Custom Validierungen hinzufügen

3. **Dokumentation:**
   - Test-Ergebnisse dokumentieren
   - Screenshots archivieren
   - Test-Protokoll speichern

---

**Viel Erfolg beim Testen!** 🚀

Bei Fragen oder Problemen:
1. Aktivieren Sie DEBUG: `CONFIG.DEBUG = true`
2. Console-Logs prüfen
3. Test-Protokoll ausfüllen
