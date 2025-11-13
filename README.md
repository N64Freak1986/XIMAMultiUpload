# XIMA Formcycle Multiple File Upload

⚠️ **WICHTIG: Bitte zuerst Upload-Mode prüfen!**

Dieses README beschreibt die Lösung für **AjaxUploadManager-basierte** Formcycle-Systeme.

## 🔍 Welche Lösung brauche ich?

**Führen Sie in der Browser-Console (F12) aus:**
```javascript
$('#ihr-upload-feld-id').attr('data-upload-mode')
```

| Ergebnis | Dokumentation |
|----------|---------------|
| **`"native"`** | ➡️ **[README-NATIVE-MODE.md](README-NATIVE-MODE.md)** (EMPFOHLEN für die meisten Fälle) |
| `"ajax"` oder `undefined` | ➡️ Dieses README (siehe unten) |

**Schnellstart für Native Mode:** [QUICK-START.md](QUICK-START.md)

---

# AjaxUploadManager-Lösung

Eine robuste Lösung für Multiple File Uploads in XIMA Formcycle 8.4.2+ mit AjaxUploadManager

## 🎯 Features

✅ **Echter Multiple-Upload** mit HTML5 `multiple`-Attribut
✅ **Client-side Validierung** VOR dem Upload
✅ **Native Formcycle Integration** mit AjaxUploadManager
✅ **Progress-Tracking** mit Echtzeit-Fortschrittsanzeige
✅ **Inkrementelles Hinzufügen** von Dateien aus verschiedenen Ordnern
✅ **Vollständig kompatibel** mit Formcycle 8.4.2+
✅ **Keine externe Dependencies** außer jQuery (bereits in Formcycle vorhanden)

## 📋 Hauptunterschiede zum alten Ansatz

### ❌ Alter Ansatz (funktioniert NICHT):
- Versuchte FileList mit DataTransfer API zu manipulieren
- Verwendete falsche Events (`xutil.upload.*`)
- Zu komplex und fehleranfällig

### ✅ Neuer Ansatz (funktioniert PERFEKT):
- Nutzt natives HTML5 `multiple`-Attribut
- Verwendet korrekte Formcycle API (`$.xutil.ajaxUpload`)
- Einfach, robust, wartbar

## 🚀 Installation

### Schritt 1: Script einbinden

Gehen Sie in Formcycle zu: **Admin → Formulare → Ihr Formular → JavaScript**

**Option 1: Externe Datei**
```html
<script src="formcycle-multiple-upload.js"></script>
```

**Option 2: Inline**
Kopieren Sie den Inhalt von `formcycle-multiple-upload.js` in den JavaScript-Bereich.

### Schritt 2: Upload-Feld konfigurieren

1. Upload-Element im Form-Designer hinzufügen
2. **CSS-Klasse** auf `custom-upload` setzen
3. Speichern

Das war's! 🎉

## ⚙️ Konfiguration

Passen Sie die Einstellungen in `formcycle-multiple-upload.js` an:

```javascript
const CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,        // 10 MB pro Datei
    MAX_TOTAL_SIZE: 100 * 1024 * 1024,      // 100 MB gesamt
    MAX_FILES: 10,                          // Max 10 Dateien
    UPLOAD_SELECTOR: '.custom-upload',      // CSS-Klasse
    MAX_FILENAME_LENGTH: 100,               // Max Dateiname-Länge
    DEBUG: false                            // Debug-Logs
};
```

## 📚 Wie es funktioniert

### 1. HTML5 Multiple-Attribut

```javascript
$uploadField.prop('multiple', true);
```

Aktiviert native Browser-Unterstützung für Multiple-File-Selection.

### 2. Client-side Validierung mit errorFunc()

```javascript
$uploadField.errorFunc(function() {
    // Validiere Dateien VOR dem Upload
    const files = this.files;

    // Prüfe: Anzahl, Größe, Duplikate, etc.
    if (tooManyFiles || fileTooLarge || duplicate) {
        return 'Fehlermeldung';  // Blockiert Upload
    }

    return '';  // Erlaubt Upload
});
```

**Wichtig**: `errorFunc()` wird von Formcycle **vor** jedem Upload aufgerufen!

### 3. Formcycle AjaxUploadManager Events

```javascript
$.xutil.ajaxUpload.on('begin', function(event) {
    // Upload startet
    showProgress(event.fileName, 0);
});

$.xutil.ajaxUpload.on('progress', function(event) {
    // Upload-Fortschritt
    const percent = (event.progress.loaded / event.progress.total) * 100;
    updateProgress(percent);
});

$.xutil.ajaxUpload.on('success', function(event) {
    // Upload erfolgreich
    updateFileList(event.item);
});
```

**Korrekte Events**: `begin`, `progress`, `success`, `error`, `complete`, `remove`

## 🛡️ Validierung

### Client-side (JavaScript)

Alle Validierungen werden **vor** dem Upload durchgeführt:

- ✅ Dateigröße (Standard: 10 MB)
- ✅ Gesamtgröße (Standard: 100 MB)
- ✅ Anzahl Dateien (Standard: 10)
- ✅ Dateiname-Länge (Standard: 100 Zeichen)
- ✅ Duplikate (gleicher Dateiname)

### Server-side (Formcycle)

**WICHTIG**: Client-side Validierung ist NICHT sicherheitsrelevant!

Konfigurieren Sie zusätzlich in Formcycle:

1. **Upload-Element → Constraints → Maximale Dateigröße**
2. **Upload-Element → Constraints → Erlaubte Dateitypen**
3. **Formular → Einstellungen → Upload-Limits**

## 🎨 UI-Komponenten

Das Script erstellt automatisch:

### 1. Info-Box

Zeigt:
- Anzahl hochgeladener Dateien
- Gesamtgröße
- Hilfetext

### 2. Progress-Bar

Zeigt während des Uploads:
- Dateiname
- Fortschritt in Prozent
- Visueller Progress-Bar

### 3. Größen-Anzeige

Farbcodiert:
- 🟢 Grün (< 60%)
- 🟡 Gelb (60-80%)
- 🔴 Rot (> 80%)

## 📖 API-Referenz

### Formcycle AjaxUploadManager Events

| Event | Beschreibung | Event-Daten |
|-------|--------------|-------------|
| `begin` | Upload startet | `{ field, fileName, id, data }` |
| `progress` | Upload-Fortschritt | `{ field, id, progress: { loaded, total } }` |
| `success` | Upload erfolgreich | `{ field, id, item: FileItem }` |
| `error` | Upload fehlgeschlagen | `{ field, id, error }` |
| `complete` | Alle Uploads fertig | `{ field, container }` |
| `remove` | Datei entfernt | `{ field, id }` |

### JavaScript API

```javascript
// Alle Upload-Felder initialisieren
FormcycleMultiUpload.init();

// Einzelnes Feld initialisieren
FormcycleMultiUpload.initField('#my_upload_field');

// Konfiguration abrufen
console.log(FormcycleMultiUpload.config);
```

## 🐛 Troubleshooting

### Problem: Upload-Feld akzeptiert keine Multiple-Auswahl

**Lösung:**
1. Prüfen Sie CSS-Klasse `custom-upload`
2. Aktivieren Sie DEBUG: `CONFIG.DEBUG = true`
3. Browser-Console öffnen und Logs prüfen
4. Prüfen: `$('#upload_feld').prop('multiple')` sollte `true` sein

### Problem: "$.xutil.ajaxUpload is undefined"

**Ursache:** Formcycle-Version zu alt (< 8.4.0)

**Lösung:**
- Upgrade auf Formcycle >= 8.4.2
- Oder: Prüfen Sie in Browser-Console: `console.log($.xutil.ajaxUpload)`

### Problem: Keine Progress-Anzeige

**Lösung:**
1. Stellen Sie sicher: Formcycle >= 8.4.2
2. Prüfen: `$.xutil.ajaxUpload` ist definiert
3. Prüfen: Events werden gefeuert (DEBUG-Modus aktivieren)

### Problem: Events werden nicht getriggert

**Lösung:**
1. Script muss NACH jQuery geladen werden
2. Prüfen: `XFC.ready()` wird ausgeführt
3. Console-Check: `console.log(window.XFC)`

## 🧪 Testing

### Test-Checklist

- [ ] **Multiple-Selection funktioniert**
  - File-Dialog öffnen
  - Mehrere Dateien mit Strg/Cmd+Klick auswählen
  - Alle Dateien werden hochgeladen

- [ ] **Inkrementelles Hinzufügen funktioniert**
  - 2 Dateien hochladen
  - Weitere 3 Dateien hochladen
  - Insgesamt 5 Dateien vorhanden

- [ ] **Validierung funktioniert**
  - Zu große Datei → Fehlermeldung
  - Zu viele Dateien → Fehlermeldung
  - Duplikat → Fehlermeldung

- [ ] **Progress-Anzeige funktioniert**
  - Große Dateien hochladen
  - Progress-Bar zeigt Fortschritt
  - Progress-Bar verschwindet nach Upload

- [ ] **Größenanzeige funktioniert**
  - Gesamtgröße wird aktualisiert
  - Farbe ändert sich bei hoher Auslastung

- [ ] **Datei-Entfernung funktioniert**
  - Datei entfernen
  - Größenanzeige wird aktualisiert

## 📊 Browser-Kompatibilität

✅ Chrome 60+
✅ Firefox 55+
✅ Safari 11+
✅ Edge 79+

**Hinweis**: HTML5 `multiple`-Attribut wird von allen modernen Browsern unterstützt.

## 🔧 Erweiterte Anpassungen

### Custom Validierung

```javascript
$uploadField.errorFunc(function() {
    const files = this.files;

    // Standard-Validierungen
    const error = validateFiles($uploadField, files);
    if (error) return error;

    // Custom Validierung
    for (let file of files) {
        if (file.name.includes('_DRAFT_')) {
            return 'Draft-Dateien nicht erlaubt';
        }
    }

    return '';
});
```

### Custom Event-Handler

```javascript
$.xutil.ajaxUpload.on('success', function(event) {
    const $field = $(event.field);

    // Nur für bestimmtes Feld
    if ($field.attr('id') !== 'mein_upload') return;

    // Custom Logik
    console.log('Upload erfolgreich:', event.item);
    // ... Ihre Logik ...
});
```

### Custom UI

```javascript
// Nach Upload-Erfolg
$.xutil.ajaxUpload.on('success', function(event) {
    const $field = $(event.field);
    const $wrapper = $field.closest('.xm-container-upload');

    // Custom UI-Element hinzufügen
    $wrapper.append('<div class="my-custom-element">...</div>');
});
```

## 📦 Projektstruktur

```
XIMAMultiUpload/
├── formcycle-multiple-upload.js    # Haupt-Script
├── README.md                        # Diese Datei
├── MIGRATION.md                     # Migrations-Anleitung
└── demo.html                        # Demo/Dokumentation
```

## 🤝 Migrieren vom alten Script

Wenn Sie das alte (fehlerhafte) Script verwenden, siehe: [MIGRATION.md](MIGRATION.md)

## 📄 Lizenz

Dieses Projekt ist für die Verwendung mit XIMA Formcycle gedacht.

## 📞 Support

Bei Fragen:
1. Aktivieren Sie DEBUG-Modus: `CONFIG.DEBUG = true`
2. Prüfen Sie Browser-Console
3. Vergleichen Sie mit Test-Checklist
4. Konsultieren Sie [MIGRATION.md](MIGRATION.md)

---

**Version**: 1.0.0
**Formcycle**: >= 8.4.2
**Datum**: 2024

**Viel Erfolg!** 🚀
