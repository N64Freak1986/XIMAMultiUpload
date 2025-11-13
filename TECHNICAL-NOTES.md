# Technical Notes - Formcycle Multiple Upload

## 🔬 Wichtige Erkenntnisse

Diese Notizen dokumentieren die technischen Entdeckungen während der Entwicklung.

---

## 1. Formcycle AjaxUploadManager Limitation ⚠️

### Entdeckung

**Formcycle's AjaxUploadManager ist für SINGLE-FILE-UPLOADS designed!**

### Beweis (Formcycle Clientscript Zeile 083-084)

```javascript
[c.xutil.ajaxUploadManager.getUpload(F)]  // ← Array mit nur EINEM Element!
```

**Nicht:** `getUploads()` (Plural)
**Sondern:** `getUpload()` (Singular)

### Konsequenz

Der AjaxUploadManager verwaltet pro Upload-Feld **immer nur 1 Datei** im Speicher. Auch wenn das HTML5-Input-Feld `multiple`-Attribut hat und der Browser mehrere Dateien auswählt, übergibt Formcycle nur **die erste Datei** an den Upload-Manager.

### Workaround

**Lösung:** Native Mode verwenden!

Mit `data-upload-mode="native"` kann man HTML5 File API direkt nutzen, ohne dass Formcycle's AjaxUploadManager dazwischenfunkt.

---

## 2. Upload-Mode Detection

### Native Mode erkennen

```javascript
const uploadMode = $('#upload-feld').attr('data-upload-mode');

if (uploadMode === 'native') {
    // Native HTML5 File API verwenden
    // KEIN AjaxUploadManager verfügbar
}
```

### Wann ist welcher Mode aktiv?

| data-upload-mode | API | Mehrere Dateien möglich? |
|------------------|-----|--------------------------|
| `"native"` | HTML5 File API | ✅ Ja (mit unserem Script) |
| `"ajax"` | AjaxUploadManager | ❌ Nein (1 Datei pro Feld) |
| `undefined` | Fallback auf native | ✅ Ja (mit unserem Script) |

---

## 3. Bereits hochgeladene Dateien erkennen

### Problem

Formcycle rendert bereits hochgeladene Dateien als DOM-Elemente, aber die Struktur variiert:

```html
<!-- Variante 1: Mit Wrapper -->
<div class="xm-upl-wrapper">
    <span class="xm-upl-label">datei1.pdf</span>
</div>

<!-- Variante 2: Direkt -->
<span class="xm-upl-label">datei2.pdf</span>

<!-- Variante 3: In Liste -->
<div class="xm-upload-list-item">
    <span class="xm-upload-list-item-name">datei3.pdf</span>
</div>
```

### Lösung: Triple-Detection-Strategie

```javascript
function getExistingFileNames() {
    const names = [];
    const $container = $('#xi-upl-1-xc');

    // Strategie 1: .xm-upl-wrapper > .xm-upl-label
    $container.find('.xm-upl-wrapper').each(function() {
        const $label = $(this).find('.xm-upl-label');
        if ($label.length) {
            const text = $label.text().trim();
            if (isValidFileName(text)) {
                names.push(text);
            }
        }
    });

    // Strategie 2: Direktes .xm-upl-label (Fallback)
    if (names.length === 0) {
        $container.find('.xm-upl-label').each(function() {
            const text = $(this).text().trim();
            if (isValidFileName(text)) {
                names.push(text);
            }
        });
    }

    // Strategie 3: Upload-Liste
    if (names.length === 0) {
        $container.find('.xm-upload-list-item-name').each(function() {
            const text = $(this).text().trim();
            if (text) {
                names.push(text);
            }
        });
    }

    return names;
}

function isValidFileName(text) {
    return text &&
           text !== '' &&
           text !== 'keine Datei ausgewählt' &&
           text !== 'No file selected' &&
           text !== 'Keine Datei' &&
           !text.startsWith('Keine ') &&
           !text.startsWith('No ') &&
           !text.toLowerCase().includes('ausgewählt') &&
           !text.toLowerCase().includes('selected');
}
```

### Warum Triple-Detection?

1. **Strategie 1** funktioniert in den meisten Fällen
2. **Strategie 2** fängt Randfälle ab (direktes Label ohne Wrapper)
3. **Strategie 3** fängt Listen-Darstellungen ab

**Wichtig:** Placeholder-Texte müssen gefiltert werden!

---

## 4. DataTransfer API für FileList-Manipulation

### Problem

`input.files` ist **read-only** und kann nicht direkt manipuliert werden:

```javascript
const input = document.getElementById('upload');
input.files.push(newFile);  // ❌ FUNKTIONIERT NICHT!
```

### Lösung: DataTransfer API

```javascript
function updateFileInput(files) {
    const dt = new DataTransfer();

    // Alle Dateien hinzufügen
    files.forEach(file => {
        dt.items.add(file);
    });

    // FileList ersetzen
    document.getElementById('upload').files = dt.files;
}
```

### Browser-Kompatibilität

| Browser | DataTransfer API |
|---------|------------------|
| Chrome 60+ | ✅ |
| Firefox 52+ | ✅ |
| Safari 14.1+ | ✅ |
| Edge 79+ | ✅ |
| IE11 | ❌ (Polyfill benötigt) |

---

## 5. File-Object mit Custom-ID erweitern

### Problem

File-Objects haben keine eindeutige ID, aber wir brauchen eine für Add/Remove-Funktionalität.

### Lösung

```javascript
let fileIdCounter = 0;

function addFile(file) {
    // Custom Property hinzufügen
    file._multiUploadId = fileIdCounter++;

    selectedFiles.push(file);
}

function removeFile(fileId) {
    const index = selectedFiles.findIndex(f => f._multiUploadId === fileId);
    if (index > -1) {
        selectedFiles.splice(index, 1);
    }
}
```

**Wichtig:** `_multiUploadId` ist ein Custom-Property und wird NICHT mit hochgeladen!

---

## 6. Event-Handler mit Namespace

### Problem

Mehrfaches Script-Ausführen führt zu duplizierten Event-Handlern.

### Lösung: jQuery Event-Namespace

```javascript
// Alte Handler entfernen
$uploadField.off('change.multiupload');

// Neuen Handler mit Namespace registrieren
$uploadField.on('change.multiupload', onFileChange);
```

**Vorteil:** Nur Handler mit `.multiupload`-Namespace werden entfernt, andere bleiben erhalten!

---

## 7. Validierung MUSS vor Upload erfolgen

### Problem

Wenn Formcycle den Upload startet, ist es zu spät zum Blockieren.

### Lösung: Validierung im change-Event

```javascript
$uploadField.on('change', function(event) {
    const files = event.target.files;

    const validation = validateFiles(files);

    if (!validation.valid) {
        // Upload blockieren
        showError(validation.errors);

        // OPTIONAL: FileList leeren (verhindert Upload komplett)
        event.target.value = '';

        return false;
    }

    // Weiter zu Formcycle's Upload-Logik
});
```

**Wichtig:** `event.target.value = ''` ist optional - manchmal will man, dass Formcycle eigene Fehler zeigt.

---

## 8. UI-Updates mit jQuery

### Best Practice: Element neu erstellen statt updaten

**❌ Kompliziert:**
```javascript
function updateStatus() {
    const $status = $('.multi-status');
    $status.find('.count').text(newCount);
    $status.find('.size').text(newSize);
    // ... mehr Updates ...
}
```

**✅ Einfacher:**
```javascript
function createInfoBox() {
    // Altes Element entfernen
    $('.multi-upload-info').remove();

    // Neues Element erstellen
    const $info = $('<div class="multi-upload-info"></div>');
    $info.html('...');

    // Einfügen
    $container.append($info);
}

// Bei jedem Update einfach neu erstellen
updateStatus = createInfoBox;
```

**Vorteil:** Keine komplexe Update-Logik, immer konsistenter Zustand!

---

## 9. Größenformatierung

### Funktion

```javascript
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
```

### Farbcodierung nach Prozent

```javascript
const sizePercent = (currentSize / maxSize) * 100;

let color;
if (sizePercent > 80) {
    color = '#dc3545';  // Rot
} else if (sizePercent > 60) {
    color = '#ffc107';  // Gelb
} else {
    color = '#28a745';  // Grün
}
```

---

## 10. Console-Logging Best Practices

### Mit Farben und Struktur

```javascript
console.clear();

// Header
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'color: #667eea; font-weight: bold');
console.log('%c🚀 MULTIPLE-UPLOAD',
            'color: #667eea; font-weight: bold; font-size: 16px');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'color: #667eea; font-weight: bold');

// Erfolg
console.log('%c✅ Initialisierung erfolgreich',
            'color: #28a745; font-weight: bold');

// Warnung
console.log('%c⚠️  Achtung: ...',
            'color: #ffc107; font-weight: bold');

// Fehler
console.log('%c❌ Fehler: ...',
            'color: #dc3545; font-weight: bold');

// Gruppierung
console.group('%c📂 Datei-Details', 'color: #2196F3; font-weight: bold');
console.log('Datei 1...');
console.log('Datei 2...');
console.groupEnd();
```

### Debug-Helper bereitstellen

```javascript
window.multiUploadDebug = {
    getExisting: getExistingFileNames,
    getCount: () => getExistingFileNames().length,
    config: CONFIG,

    // Nützlich für Testing:
    testValidation: (size, name) => {
        const mockFile = { size: size, name: name };
        return validateFiles([mockFile]);
    }
};
```

**Verwendung:**
```javascript
// In Browser-Console
multiUploadDebug.getExisting()
// → ["dokument.pdf", "rechnung.xlsx"]

multiUploadDebug.testValidation(999999999, 'huge.pdf')
// → { valid: false, errors: [...] }
```

---

## 11. Sicherheits-Überlegungen

### Client-Side = NICHT sicherheitsrelevant

**Alle JavaScript-Validierungen können umgangen werden!**

### Server-Side Validation ist PFLICHT

```php
// Formcycle-Backend / PHP
if ($_FILES['upl2']['size'] > 10485760) {
    throw new Exception('Datei zu groß');
}

if (!in_array($_FILES['upl2']['type'], $allowedTypes)) {
    throw new Exception('Dateityp nicht erlaubt');
}

// Virus-Scan
$clamav = new ClamAV();
if (!$clamav->scan($_FILES['upl2']['tmp_name'])) {
    throw new Exception('Virus gefunden');
}
```

### Best Practices

1. **Immer** serverseitig validieren
2. **Niemals** nur clientseitig validieren
3. **MIME-Type prüfen** (nicht nur Extension)
4. **Magic Bytes prüfen** (erste Bytes der Datei)
5. **Virus-Scan** durchführen
6. **Quota-Limits** serverseitig durchsetzen

---

## 12. Performance-Überlegungen

### Große Dateilisten

Wenn viele Dateien (> 100) angezeigt werden:

```javascript
// Virtualisierung verwenden (nur sichtbare Dateien rendern)
function renderVisibleFiles(startIndex, endIndex) {
    const $list = $('.file-list');
    $list.empty();

    for (let i = startIndex; i < endIndex; i++) {
        const file = selectedFiles[i];
        $list.append(createFileItem(file));
    }
}

// Scroll-Event mit Debouncing
let scrollTimeout;
$('.file-list-container').on('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const scrollTop = $(this).scrollTop();
        const startIndex = Math.floor(scrollTop / 50);  // 50px pro Item
        const endIndex = startIndex + 20;  // 20 Items anzeigen
        renderVisibleFiles(startIndex, endIndex);
    }, 100);
});
```

### Große Dateien

Bei Dateien > 100 MB:

```javascript
// Chunk-Upload (falls Formcycle unterstützt)
function uploadInChunks(file, chunkSize = 5 * 1024 * 1024) {
    const chunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Upload chunk
        uploadChunk(chunk, i, chunks);
    }
}
```

---

## 13. Bekannte Limitationen

### 1. Browser File-Picker

Manche Browser erlauben keine programmatische Multi-Selection:

```javascript
// Das funktioniert:
$uploadField.prop('multiple', true);
$uploadField.click();

// Das funktioniert NICHT:
// → Automatische Auswahl mehrerer Dateien
// → User MUSS manuell Strg/Cmd drücken
```

### 2. Mobile Devices

Auf Mobile ist Multi-Selection eingeschränkt:

- iOS: Unterstützt `multiple`, aber UI ist anders
- Android: Variiert je nach Browser/Version

### 3. Drag & Drop

Native Mode unterstützt standardmäßig kein Drag & Drop. Müsste custom implementiert werden:

```javascript
$uploadField.closest('.xm-container-upload').on('drop', function(e) {
    e.preventDefault();
    const files = e.originalEvent.dataTransfer.files;
    addFiles(files);
});
```

---

## Zusammenfassung

### Was funktioniert ✅

- Multiple-File-Selection in Native Mode
- Add/Remove-Funktionalität mit DataTransfer API
- Robuste Datei-Erkennung mit Triple-Detection
- Client-Side Validierung als UX-Verbesserung
- Live-UI-Updates

### Was NICHT funktioniert ❌

- Multiple-Upload mit AjaxUploadManager (1 Datei pro Feld)
- Programmatische File-Selection
- Automatische Multi-Selection (User muss Strg/Cmd drücken)
- Drag & Drop (ohne Custom-Implementierung)

### Wichtigste Learnings 🎓

1. **Native Mode > AjaxUploadManager** für Multiple-Upload
2. **Triple-Detection** für robuste Datei-Erkennung
3. **DataTransfer API** für FileList-Manipulation
4. **Event-Namespace** für saubere Event-Handler
5. **Server-Side Validation** ist PFLICHT
6. **UI neu erstellen** ist einfacher als updaten
7. **Debug-Helper** massiv hilfreich für Testing

---

**Dokumentiert:** 2024-11-13
**Basis:** Formcycle Native Mode Testing auf https://formulare.kempten.de/frontend-server/form/provide/10056/
