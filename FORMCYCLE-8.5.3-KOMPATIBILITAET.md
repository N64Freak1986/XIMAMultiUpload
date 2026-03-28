# Formcycle 8.5.3 Kompatibilitätsanalyse

## Zusammenfassung

Diese Analyse dokumentiert alle Änderungen in der Formcycle 8.5.3 JavaScript-API, die das XIMAMultiUpload-Projekt betreffen. Die Code-Änderungen in diesem Repository wurden bereits abwärtskompatibel umgesetzt (funktioniert mit FC 8.4.x UND 8.5.3+).

---

## 1. Breaking Change: UploadRatio

### Alte API (FC 8.4.x)
```javascript
// event.progress hatte .loaded und .total
const percent = (event.progress.loaded / event.progress.total) * 100;
```

### Neue API (FC 8.5.3)
```javascript
// UploadRatio hat jetzt .bytesUploaded, .bytesTotal und .ratio
interface UploadRatio {
    bytesUploaded: number;  // war: loaded
    bytesTotal: number;     // war: total
    ratio: number;          // NEU: Wert zwischen 0 und 1
}
```

### Abwärtskompatible Lösung (bereits umgesetzt)
```javascript
const percent = event.progress.ratio !== undefined
    ? event.progress.ratio * 100
    : (event.progress.loaded / event.progress.total) * 100;
```

### Betroffene Dateien
- `formcycle-multiple-upload.js` (Zeile 345)
- `test-xi-upl-1.js` (Zeile 387)
- `test-console-script.js` (Zeile 331)

---

## 2. Neues Event-System: EventSource statt .on()

### Alte API (FC 8.4.x)
```javascript
$.xutil.ajaxUpload.on('begin', callback);
$.xutil.ajaxUpload.on('progress', callback);
$.xutil.ajaxUpload.on('success', callback);
```

### Neue API (FC 8.5.3)
```javascript
// Events sind jetzt EventSource-Objekte auf AjaxUploadManager.events
$.xutil.AjaxUploadManager.events.begin.on(callback);
$.xutil.AjaxUploadManager.events.progress.on(callback);
$.xutil.AjaxUploadManager.events.success.on(callback);
```

### Abwärtskompatible Lösung (bereits umgesetzt)
```javascript
var ajaxUpload = $.xutil && ($.xutil.ajaxUpload || $.xutil.AjaxUploadManager);
if (ajaxUpload.events) {
    // FC 8.5.3+
    ajaxUpload.events.begin.on(callback);
} else {
    // FC 8.4.x
    ajaxUpload.on('begin', callback);
}
```

### Betroffene Dateien
- `formcycle-multiple-upload.js` (registerGlobalEvents)
- `test-xi-upl-1.js` (Event-Registrierung)
- `test-console-script.js` (Event-Registrierung)

---

## 3. 3 neue Events in AjaxUploadData

| Event | Beschreibung | Daten |
|-------|-------------|-------|
| `cancel` | Upload wurde abgebrochen | `{ field: JQuery, id: string }` |
| `clearError` | Fehlernachricht wurde entfernt | `{ field: JQuery, id: string }` |
| `restore` | Datei nach Server-Validierung wiederhergestellt | `{ field: JQuery, id: string, item: FileItem }` |

### Empfehlung
Das `restore`-Event sollte behandelt werden, um den State korrekt zu halten, wenn ein abgesendetes Formular vom Server abgelehnt und wieder ausgeliefert wird.

---

## 4. Neue Methode: getUploads() (Plural!)

### Kritischste Neuerung

```javascript
// ALT: Gibt nur 1 Datei zurück (der Grund für dieses gesamte Projekt!)
getUpload(container?: any): undefined | FileItem;

// NEU: Gibt ALLE Dateien zurück!
getUploads(container?: any): FileItem[];
```

**Formcycle 8.5.3 unterstützt jetzt nativ mehrere Uploads pro Feld.** Das Monkey-Patching in den Code-Injection-Dateien (`native-mode-code-injection*.js`) ist damit für 8.5.3+ nicht mehr nötig.

### Weitere neue Methoden auf AjaxUploadManager

| Methode | Beschreibung |
|---------|-------------|
| `addUpload(element, data, fileName)` | Dateien programmatisch hochladen |
| `removeUpload(element)` | Upload entfernen |
| `abortAll(container?)` | Alle Uploads abbrechen |
| `awaitAll(container?)` | Auf alle Uploads warten (Promise) |
| `getPendingUploadCount(container?)` | Anzahl ausstehender Uploads |
| `isAjaxUploadEnabled(container)` | Prüft ob AJAX-Upload verfügbar |
| `restoreUploads(container)` | Uploads wiederherstellen |
| `stop(container)` | AJAX-Upload deaktivieren ohne laufende Uploads abzubrechen |
| `enable(container)` / `disable(container)` | AJAX-Upload aktivieren/deaktivieren |

---

## 5. Neues XUtil-Event: fileChange

```javascript
// Neues natives Event für Dateiänderungen (normal + AJAX Upload)
$.xutil.on('fileChange', function(params) {
    // params.file: FileLike | undefined - Die geänderte Datei
    // params.id: string - ID des Elements
});
```

Dies ersetzt potenziell das manuelle jQuery-`change`-Event:
```javascript
// ALT
$uploadField.on('change.multiupload', function(event) { ... });

// NEU (FC 8.5.3+)
$.xutil.on('fileChange', function(params) { ... });
```

---

## 6. Neues XUtil Event-System: $.xutil.on() / $.xutil.off()

### Verfügbare Events (XUtilCallbacks)

| Event | Beschreibung |
|-------|-------------|
| `fileChange` | Datei geändert (normal + AJAX) |
| `submit` | Formular wird abgesendet |
| `print` / `afterPrint` | Vor/nach dem Drucken |
| `addRow` / `beforeAddRow` | Zeile hinzufügen (Wiederholungen) |
| `deleteRow` / `beforeDeleteRow` | Zeile löschen (Wiederholungen) |
| `show` / `hide` | Element anzeigen/ausblenden |
| `enable` / `disable` | Element aktivieren/deaktivieren |
| `readOnly` | Element auf schreibgeschützt setzen |
| `clear` / `beforeClearAll` | Werte löschen |
| `resetAll` / `beforeResetAll` | Werte zurücksetzen |
| `saveNavigation` / `loadNavigation` | Navigationszustand speichern/laden |
| `beforeLoadFormData` / `afterLoadFormData` | Formulardaten laden |

### Deprecations

| Alt (deprecated) | Neu |
|------------------|-----|
| `$.xutil.onsubmit = function() {...}` | `$.xutil.on("submit", callback)` |
| `$.xutil.onSubmit(callback)` | `$.xutil.on("submit", callback)` |
| `$.xutil.offSubmit(callback)` | `$.xutil.off("submit", callback)` |
| `$.xutil.onPrint(callback)` | `$.xutil.on("print", callback)` |

---

## 7. FileItem: Neues state-Property

```javascript
// FileItem hat jetzt ein typisiertes state-Property
interface FileItem {
    state: FileItemState;  // NEU
    // ... rest bleibt gleich
}

// FileItemState ist ein Union-Type:
type FileItemState =
    | UploadStateEntry<"pending", UploadPendingData>
    | UploadStateEntry<"pendingRemoval", UploadPendingRemovalData>
    | UploadStateEntry<"success", UploadSuccessData>
    | UploadStateEntry<"failure", UploadErrorData>;
```

---

## 8. Property-Naming: Mögliche Änderung

### FC 8.4.x
```javascript
$.xutil.ajaxUploadDialog    // lowercase
$.xutil.ajaxUploadManager   // lowercase
$.xutil.ajaxUpload          // Event-Objekt
```

### FC 8.5.3
```javascript
$.xutil.AjaxUploadDialog    // UPPERCASE (in TypeScript-Doku)
$.xutil.AjaxUploadManager   // UPPERCASE (in TypeScript-Doku)
// $.xutil.ajaxUpload        // möglicherweise entfernt
```

**Hinweis:** Die genaue Runtime-Benennung muss in einer FC 8.5.3-Instanz verifiziert werden. Die abwärtskompatible Prüfung `$.xutil.ajaxUpload || $.xutil.AjaxUploadManager` deckt beide Fälle ab.

---

## 9. Betroffene Dateien im Repository

### Bereits aktualisiert (abwärtskompatibel)
- `formcycle-multiple-upload.js` - UploadRatio + Event-System
- `test-xi-upl-1.js` - UploadRatio + Event-System
- `test-console-script.js` - UploadRatio + Event-System

### Noch zu prüfen / optional zu aktualisieren
- `native-mode-code-injection.js` - Monkey-Patching von getUpload() (in 8.5.3 durch getUploads() ersetzbar)
- `native-mode-code-injection-all.js` - gleich
- `native-mode-code-injection-configurable-input-elements.js` - gleich
- `diagnose-formcycle-api.js` - $.xutil.ajaxUpload Prüfungen
- `native-mode-ajax-upload.js` - Eigenes XHR-Upload (e.loaded/e.total betrifft XMLHttpRequest, nicht FC API)

### Nicht betroffen (nutzen HTML5 File API, kein $.xutil)
- `native-mode-complete.js`
- `native-mode-enhanced-ui.js`
- `native-mode-final.js` / `native-mode-final-upl3.js`
- `native-mode-fixed.js`
- `native-mode-solution.js`
- `native-mode-custom-button.js`
- `native-mode-dynamic-fields.js` / `native-mode-dynamic-fields-upl3.js`
- `native-mode-manual-mode.js`
- `native-mode-auto-upload.js`

---

## 10. Empfohlene nächste Schritte

1. **Testen in FC 8.5.3-Umgebung** - Die abwärtskompatiblen Änderungen in einer echten 8.5.3-Instanz validieren
2. **Property-Namen verifizieren** - Prüfen ob `$.xutil.ajaxUpload` oder `$.xutil.AjaxUploadManager` zur Laufzeit existiert
3. **EventSource API testen** - Prüfen ob `.events.begin.on(callback)` die korrekte Syntax ist
4. **getUploads() evaluieren** - Prüfen ob das native Multi-Upload über `getUploads()` den Workaround überflüssig macht
5. **fileChange-Event nutzen** - Evaluieren ob `$.xutil.on('fileChange', ...)` das manuelle jQuery-Change-Event ersetzen kann
6. **Code-Injection-Dateien aktualisieren** - Monkey-Patching durch native `getUploads()` ersetzen (nur für FC 8.5.3+)
