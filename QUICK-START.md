# Quick Start Guide - Formcycle Multiple Upload

## 🎯 Welches Script brauche ich?

### 1️⃣ Prüfen Sie Ihren Upload-Mode

Öffnen Sie die Browser-Console (F12) und führen Sie aus:

```javascript
$('#xi-upl-1').attr('data-upload-mode')
```

| Ergebnis | Lösung |
|----------|--------|
| `"native"` | ✅ **Native Mode Lösung** (siehe unten) |
| `"ajax"` oder `undefined` | ❌ AjaxUploadManager (nicht verfügbar in diesem Projekt) |

---

## 🚀 Native Mode - Schnellstart

### Option 1: Vollversion mit Add/Remove ⭐ EMPFOHLEN

**Datei:** `native-mode-complete.js`

**Features:**
- ➕ Weitere Dateien hinzufügen
- ✕ Einzelne Dateien entfernen
- 🗑️ Alle löschen
- Live-Updates

**Installation:**
1. F12 drücken (Browser-Console öffnen)
2. Kompletten Code aus `native-mode-complete.js` kopieren
3. In Console einfügen
4. Enter drücken
5. ✅ Fertig!

---

### Option 2: Enhanced UI (Detaillierte Vorschau)

**Datei:** `native-mode-enhanced-ui.js`

**Features:**
- Grüne Sektion: Gültige Dateien
- Gelbe Sektion: Blockierte Dateien
- Gesamtgröße mit Prozent
- Detaillierte Fehler pro Datei

**Wann verwenden:** Wenn maximale Transparenz wichtig ist.

---

### Option 3: Basis-Version (Einfach)

**Datei:** `native-mode-final.js`

**Features:**
- Robuste Dateierkennung
- Basis-Validierung
- Info-Box mit Status
- Fehler-Warnungen

**Wann verwenden:** Einfachste Lösung ohne Extras.

---

## ⚙️ Konfiguration anpassen

Am Anfang jeder Datei finden Sie:

```javascript
const CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10 MB
    MAX_TOTAL_SIZE: 100 * 1024 * 1024,    // 100 MB
    MAX_FILES: 10,                         // Max Anzahl
    DEBUG: true                            // Console-Logs
};
```

### Häufige Anpassungen:

**20 MB pro Datei erlauben:**
```javascript
MAX_FILE_SIZE: 20 * 1024 * 1024,
```

**20 Dateien erlauben:**
```javascript
MAX_FILES: 20,
```

**Andere Upload-Feld-ID (z.B. xi-upl-2):**

Suchen Sie im Code nach `xi-upl-1` und ersetzen Sie durch `xi-upl-2`:

```javascript
// Zeile ~23-24
const $uploadField = $('#xi-upl-2');  // Geändert!
const $container = $('#xi-upl-2-xc');  // Geändert!
```

---

## 📖 Verwendung (Für Endbenutzer)

### Mehrere Dateien auswählen:

1. Klicken Sie "Ändern" oder "Hinzufügen"
2. Im Datei-Dialog:
   - **Windows/Linux:** `Strg` gedrückt halten + Dateien anklicken
   - **Mac:** `Cmd` gedrückt halten + Dateien anklicken
   - **Bereich:** `Shift` + erste und letzte Datei anklicken
3. "Öffnen" klicken

### Weitere Dateien hinzufügen (nur complete.js):

1. Klicken Sie "➕ Weitere hinzufügen"
2. Wählen Sie zusätzliche Dateien
3. Bestehende bleiben erhalten ✅

### Dateien entfernen (nur complete.js):

- **Eine Datei:** Klicken Sie "✕" neben der Datei
- **Alle Dateien:** Klicken Sie "🗑️ Alle löschen"

---

## 🐛 Häufige Probleme

### "jQuery nicht verfügbar"

**Lösung:** Script erst laden wenn Seite fertig ist:

```javascript
$(document).ready(function() {
    // Code hier einfügen
});
```

### "Upload-Feld nicht gefunden"

**Prüfen:**
```javascript
console.log($('#xi-upl-1').length);  // Sollte 1 sein
```

**Lösung:** Warten Sie kurz:
```javascript
setTimeout(function() {
    // Code hier einfügen
}, 1000);
```

### Dateien werden nicht erkannt

**Debug:**
```javascript
multiUploadDebug.getExisting()  // Zeigt erkannte Dateien
```

**Lösung:** Passen Sie Selektoren in `getExistingFileNames()` an.

---

## 🎨 UI-Farben ändern

### Info-Box (Lila → Blau):

```javascript
// Suchen Sie nach:
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Ersetzen durch:
background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
```

### Buttons (Grün → Orange):

```javascript
// Suchen Sie nach:
background: '#28a745'

// Ersetzen durch:
background: '#ff9800'
```

---

## 📋 Test-Checklist

Vor Produktiv-Einsatz testen:

- [ ] Datei-Dialog öffnet sich
- [ ] Mehrfachauswahl funktioniert
- [ ] Zu große Dateien werden blockiert
- [ ] Duplikate werden erkannt
- [ ] Fehlermeldungen erscheinen
- [ ] Upload funktioniert
- [ ] Status-Box zeigt korrekte Anzahl
- [ ] (complete.js) Add/Remove funktioniert

---

## 📚 Weiterführende Dokumentation

- **Vollständige Doku:** [README-NATIVE-MODE.md](README-NATIVE-MODE.md)
- **Alle Features:** Siehe native-mode-complete.js Header
- **API-Referenz:** README-NATIVE-MODE.md → API-Referenz

---

## 💡 Tipps

### Produktiv einsetzen:

1. Formcycle-Admin öffnen
2. Formular bearbeiten
3. "JavaScript" → "Custom-JavaScript"
4. Code einfügen
5. Speichern

### Debug-Modus aktivieren:

```javascript
CONFIG.DEBUG = true  // Detaillierte Console-Logs
```

### Debug-Helper verwenden:

```javascript
multiUploadDebug.getExisting()  // Bereits hochgeladene Dateien
multiUploadDebug.getCount()     // Anzahl
multiUploadDebug.config         // Aktuelle Config
```

---

## 🎯 Zusammenfassung

| Anforderung | Empfohlenes Script |
|-------------|-------------------|
| Maximum Control & UX | `native-mode-complete.js` ⭐ |
| Maximale Transparenz | `native-mode-enhanced-ui.js` |
| Einfachste Lösung | `native-mode-final.js` |

**Bei Fragen:** Siehe [README-NATIVE-MODE.md](README-NATIVE-MODE.md) → Troubleshooting
