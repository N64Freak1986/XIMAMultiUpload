# Multiple-Upload für Formcycle (Native Mode)

**Vollständige Lösung für Formcycle-Formulare mit `data-upload-mode="native"`**

## 🎯 Überblick

Diese Lösung ermöglicht **Multiple-File-Upload** in XIMA Formcycle-Formularen, die den **Native-Upload-Modus** verwenden (ohne AjaxUploadManager).

### ✅ Features

- **Mehrfachauswahl** im Datei-Dialog (Strg/Cmd + Klick)
- **Einzelne Dateien hinzufügen** ohne bestehende Auswahl zu verlieren
- **Einzelne Dateien entfernen** mit X-Button
- **Alle Dateien löschen** mit einem Klick
- **Live-Validierung** (Dateigröße, Duplikate, Anzahl)
- **Visuelles Feedback** mit farbigen Status-Boxen
- **Gesamtgröße-Tracking** mit Farbcodierung
- **Duplikatserkennung** (bereits hochgeladen + ausgewählt)

## 📦 Verfügbare Versionen

### `native-mode-complete.js` ⭐ **EMPFOHLEN**

**Vollständige Lösung mit Add/Remove-Funktionalität**

Features:
- ➕ Weitere Dateien hinzufügen
- ✕ Einzelne Dateien entfernen
- 🗑️ Alle Dateien löschen
- Live-Update der Dateiliste
- Interaktive Buttons

**Wann verwenden:** Wenn Benutzer volle Kontrolle über ihre Dateiauswahl haben sollen.

---

### `native-mode-enhanced-ui.js`

**Version mit detaillierter Dateivorschau**

Features:
- Grüne Sektion für gültige Dateien
- Gelbe Sektion für blockierte Dateien
- Detaillierte Fehleranzeige pro Datei
- Gesamtgröße mit Prozentanzeige

**Wann verwenden:** Wenn maximale Transparenz bei der Validierung gewünscht ist.

---

### `native-mode-final.js`

**Stabile Basis-Version mit Triple-Detection**

Features:
- Robuste Erkennung bereits hochgeladener Dateien (3 Strategien)
- Basis-Validierung
- Info-Box mit Status
- Fehler-Warnungen

**Wann verwenden:** Einfache Lösung ohne Add/Remove-Buttons.

---

## 🚀 Installation

### 1. Voraussetzungen prüfen

Ihr Formcycle-Upload-Feld muss `data-upload-mode="native"` verwenden:

```html
<input id="xi-upl-1"
       type="file"
       data-upload-mode="native"
       name="upl2" />
```

### 2. Script einbinden

**Option A: Über Browser-Console (Testen)**

1. Öffnen Sie Ihr Formcycle-Formular
2. Drücken Sie `F12` (Browser-Console)
3. Kopieren Sie den kompletten Code aus `native-mode-complete.js`
4. Fügen Sie ihn in die Console ein
5. Drücken Sie `Enter`

**Option B: Als Custom-JavaScript (Produktion)**

Fügen Sie das Script in Formcycle als Custom-JavaScript ein:

1. Formcycle-Admin öffnen
2. Formular bearbeiten
3. "JavaScript" → "Custom-JavaScript hinzufügen"
4. Code aus `native-mode-complete.js` einfügen
5. Speichern

## ⚙️ Konfiguration

Am Anfang der Datei finden Sie die Konfiguration:

```javascript
const CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10 MB pro Datei
    MAX_TOTAL_SIZE: 100 * 1024 * 1024,    // 100 MB Gesamtgröße
    MAX_FILES: 10,                         // Max 10 Dateien
    DEBUG: true                            // Console-Logging
};
```

### Anpassungen

**Dateigröße ändern:**
```javascript
MAX_FILE_SIZE: 20 * 1024 * 1024,  // 20 MB
```

**Mehr Dateien erlauben:**
```javascript
MAX_FILES: 20,
```

**Andere Upload-Feld-ID:**
```javascript
const $uploadField = $('#xi-upl-2');  // Statt xi-upl-1
const $container = $('#xi-upl-2-xc');
```

## 📖 Verwendung

### Für Endbenutzer

1. **Dateien auswählen:**
   - Klicken Sie "Ändern" oder "Hinzufügen"
   - Im Datei-Dialog: `Strg + Klick` (Windows) oder `Cmd + Klick` (Mac)
   - Wählen Sie mehrere Dateien
   - Klicken Sie "Öffnen"

2. **Weitere Dateien hinzufügen** (nur `complete.js`):
   - Klicken Sie "➕ Weitere hinzufügen"
   - Wählen Sie zusätzliche Dateien
   - Bestehende Auswahl bleibt erhalten

3. **Einzelne Datei entfernen** (nur `complete.js`):
   - Klicken Sie das "✕" neben der Datei

4. **Alle löschen** (nur `complete.js`):
   - Klicken Sie "🗑️ Alle löschen"

### Status-Anzeigen

| Symbol | Bedeutung |
|--------|-----------|
| 📦 | Normal (< 60% Kapazität) |
| 🟡 | Warnung (60-80% Kapazität) |
| 🔴 | Kritisch (> 80% Kapazität) |
| ✅ | Gültige Datei |
| ⚠️ | Validierungsfehler |

## 🔍 Validierung

### Was wird geprüft?

1. **Dateigröße**
   - Einzelne Datei > 10 MB → ❌ Blockiert
   - Anzeige: `"datei.pdf": Zu groß (15.2 MB > 10.0 MB)`

2. **Gesamtgröße**
   - Summe aller Dateien > 100 MB → ❌ Blockiert
   - Anzeige: `Gesamtgröße: 120.5 MB > 100.0 MB`

3. **Anzahl**
   - Mehr als 10 Dateien → ❌ Blockiert
   - Anzeige: `Max 10 Dateien (3 bereits vorhanden + 8 neue = 11 gesamt)`

4. **Duplikate**
   - Dateiname bereits vorhanden → ❌ Blockiert
   - Anzeige: `"rechnung.pdf": Bereits vorhanden`

5. **Leere Dateien**
   - Dateigröße = 0 Bytes → ❌ Blockiert
   - Anzeige: `"leer.txt": Datei ist leer (0 Bytes)`

### Fehleranzeige

**In der UI:**
- Gelbe Warnbox mit Liste aller Fehler
- Verschwindet nach 10 Sekunden

**In der Console:**
- Detaillierte Validierungs-Logs
- Pro-Datei-Status
- Gesamtergebnis

## 🛠️ Debugging

### Debug-Helper

Alle Versionen stellen `window.multiUploadDebug` bereit:

```javascript
// Bereits hochgeladene Dateien anzeigen
multiUploadDebug.getExisting()
// → ["dokument1.pdf", "rechnung.xlsx"]

// Anzahl bereits hochgeladener Dateien
multiUploadDebug.getCount()
// → 2

// Konfiguration anzeigen
multiUploadDebug.config
// → { MAX_FILE_SIZE: 10485760, ... }
```

### Console-Logs

Bei `CONFIG.DEBUG = true` erscheinen detaillierte Logs:

```
🚀 MULTIPLE-UPLOAD - COMPLETE VERSION
✅ jQuery: 3.6.1
✅ Upload-Feld gefunden
📋 Upload-Mode: native

⚙️  Konfiguration:
   Max Dateigröße: 10 MB
   Max Anzahl: 10

📋 Validiere 3 Datei(en)
   Bereits hochgeladen: 2
   📄 Prüfe: dokument.pdf (1.5 MB)
   ✅ dokument.pdf ist gültig
   ...

✅ Initialisierung erfolgreich!
```

## 🐛 Troubleshooting

### Problem: "jQuery nicht verfügbar"

**Ursache:** jQuery wurde noch nicht geladen

**Lösung:**
```javascript
// Warten bis jQuery geladen ist
$(document).ready(function() {
    // Script hier einfügen
});

// ODER: Script ans Ende der Seite verschieben
```

### Problem: "Upload-Feld nicht gefunden"

**Ursache:** Falsche ID oder Feld wurde noch nicht gerendert

**Lösung:**
```javascript
// 1. Prüfen Sie die ID im HTML
console.log($('#xi-upl-1').length);  // Sollte 1 sein

// 2. Warten Sie auf vollständiges Laden
setTimeout(function() {
    // Script hier einfügen
}, 1000);
```

### Problem: Keine Datei-Erkennung

**Ursache:** Formcycle verwendet andere HTML-Struktur

**Lösung:** Passen Sie die Selektoren in `getExistingFileNames()` an:

```javascript
function getExistingFileNames() {
    const names = [];
    const $container = $('#xi-upl-1-xc');

    // Strategie 1: Standard-Struktur
    $container.find('.xm-upl-wrapper .xm-upl-label').each(function() {
        const text = $(this).text().trim();
        if (text && text !== 'keine Datei ausgewählt') {
            names.push(text);
        }
    });

    // IHR CUSTOM-SELEKTOR:
    $container.find('.ihre-custom-klasse').each(function() {
        // ...
    });

    return names;
}
```

### Problem: Multiple-Attribut wird entfernt

**Ursache:** Formcycle-Script überschreibt das Attribut

**Lösung:** Verwenden Sie MutationObserver:

```javascript
const observer = new MutationObserver(function() {
    if (!$uploadField.prop('multiple')) {
        $uploadField.prop('multiple', true);
        log('⚠️  Multiple-Attribut wurde wiederhergestellt');
    }
});

observer.observe($uploadField[0], {
    attributes: true,
    attributeFilter: ['multiple']
});
```

### Problem: Dateien werden nicht hochgeladen

**Ursache:** Formcycle blockiert den Upload

**Lösung:**
1. Prüfen Sie Formcycle-Server-Limits
2. Prüfen Sie PHP `upload_max_filesize` und `post_max_size`
3. Prüfen Sie Nginx/Apache Request-Body-Limits

## 📊 Vergleich der Versionen

| Feature | complete.js | enhanced-ui.js | final.js |
|---------|------------|----------------|----------|
| Multiple-Auswahl | ✅ | ✅ | ✅ |
| Datei hinzufügen | ✅ | ❌ | ❌ |
| Datei entfernen | ✅ | ❌ | ❌ |
| Alle löschen | ✅ | ❌ | ❌ |
| Detaillierte Vorschau | ✅ | ✅ | ❌ |
| Gesamtgröße | ✅ | ✅ | ❌ |
| Triple-Detection | ✅ | ✅ | ✅ |
| Duplikatserkennung | ✅ | ✅ | ✅ |
| Komplexität | Mittel | Mittel | Niedrig |

## 🔐 Sicherheit

### Client-Side Validierung

⚠️ **WICHTIG:** Alle Validierungen in diesem Script sind **clientseitig** und können umgangen werden!

**Immer auch serverseitig validieren:**

```php
// PHP-Beispiel (Formcycle-Backend)
if ($_FILES['upl2']['size'] > 10485760) {
    throw new Exception('Datei zu groß');
}

if (count($_FILES['upl2']['name']) > 10) {
    throw new Exception('Zu viele Dateien');
}
```

### Best Practices

1. **Server-Limits setzen:**
   - PHP: `upload_max_filesize`, `post_max_size`, `max_file_uploads`
   - Webserver: Request-Body-Limits

2. **Dateitypen prüfen:**
   - Nicht nur Extension, sondern auch MIME-Type
   - Magic-Bytes-Validierung

3. **Virus-Scan:**
   - ClamAV oder ähnliches einsetzen

## 📚 API-Referenz

### Funktionen (native-mode-complete.js)

```javascript
// Dateien hinzufügen
addFiles(files)
// @param {FileList|File[]} files
// @return {Object} { added: File[], rejected: Array }

// Datei entfernen
removeFile(fileId)
// @param {Number} fileId - Die _multiUploadId
// @return {Boolean} true wenn erfolgreich

// Alle Dateien löschen
clearAllFiles()
// @return {void}

// Dateiauswahl-Dialog öffnen
openFileDialog()
// @return {void}

// Bereits hochgeladene Dateien
getExistingUploadedFiles()
// @return {String[]} Array von Dateinamen
```

### Events

```javascript
// Change-Event (wenn Dateien ausgewählt werden)
$uploadField.on('change', function(event) {
    const files = event.target.files;
    // ...
});
```

## 🎨 UI-Anpassungen

### Farben ändern

```javascript
// Info-Box (lila Gradient)
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Ändern zu blauem Gradient:
background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
```

### Button-Style ändern

```javascript
$('.btn-add-more').css({
    background: '#28a745',  // Grün
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
});
```

### Animationen deaktivieren

```javascript
// Statt fadeOut:
$success.remove();

// Statt setTimeout + fadeOut:
// Entfernen Sie die setTimeout-Blöcke
```

## 🧪 Testing

### Test-Checklist

- [ ] Datei-Dialog öffnet sich
- [ ] Mehrfachauswahl funktioniert (Strg/Cmd + Klick)
- [ ] Validierung blockiert zu große Dateien
- [ ] Validierung blockiert Duplikate
- [ ] Validierung blockiert zu viele Dateien
- [ ] Erfolgs-Meldung erscheint
- [ ] Fehler-Meldung erscheint
- [ ] Status-Box zeigt korrekte Anzahl
- [ ] Upload an Server funktioniert
- [ ] Bereits hochgeladene Dateien werden erkannt
- [ ] (complete.js) "Weitere hinzufügen" funktioniert
- [ ] (complete.js) "Entfernen"-Buttons funktionieren
- [ ] (complete.js) "Alle löschen" funktioniert

### Browser-Kompatibilität

Getestet in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

⚠️ DataTransfer API nicht verfügbar in:
- IE11 (verwenden Sie Polyfill oder deaktivieren Sie Add/Remove-Funktionen)

## 📝 Lizenz

Dieses Script ist frei verwendbar für XIMA Formcycle-Projekte.

## 🙋 Support

Bei Problemen:

1. Prüfen Sie die Browser-Console auf Fehler
2. Aktivieren Sie `DEBUG: true`
3. Verwenden Sie `multiUploadDebug` Funktionen
4. Prüfen Sie HTML-Struktur mit Browser-DevTools

## 🔄 Updates

### Version 1.0 (Complete)
- ✅ Add/Remove-Funktionalität
- ✅ DataTransfer API Integration
- ✅ Live-Updates
- ✅ Interaktive Buttons

### Version 0.3 (Enhanced UI)
- ✅ Detaillierte Dateivorschau
- ✅ Grün/Gelb-Sektionen

### Version 0.2 (Final)
- ✅ Triple-Detection-Strategie
- ✅ Robuste Dateierkennung

### Version 0.1 (Solution)
- ✅ Basis-Implementierung
- ✅ Native-Mode-Support
