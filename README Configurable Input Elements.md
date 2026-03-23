# Formcycle Multiple Upload

Ein JavaScript-Skript für [Formcycle](https://www.formcycle.eu/), das native Upload-Felder auf **Mehrfach-Dateiauswahl** erweitert – ohne Änderungen am Formcycle-Kern.

---

## Funktionsweise

Formcycle übergibt beim Absenden eines Formulars intern nur die **erste** Datei eines Upload-Feldes. Dieses Skript patcht zur Laufzeit die Funktion `$.xutil.ajaxUploadManager.getUpload()` per Monkey-Patching, sodass **alle** ausgewählten Dateien übergeben werden.

```
Formcycle ruft getUpload(field) auf
        ↓
[Wrapper] Liest alle Dateien aus input.files
        ↓
Gibt Array mit Upload-Objekten zurück (statt nur eines)
        ↓
Formcycle verarbeitet alle Dateien wie gewohnt
```

Der Patch greift **ausschließlich** auf Felder mit der CSS-Klasse `custom-upload` – alle anderen Felder bleiben unberührt.

---

## Features

- Mehrfachauswahl für Upload-Felder (natives `multiple`-Attribut wird automatisch gesetzt)
- Eigene UI mit Dateiliste, Add- und Remove-Buttons
- Validierung von Dateigröße, Gesamtgröße und Dateianzahl
- Feldspezifische Konfiguration per HTML-Attribut
- Kompatibel mit Native Mode und AJAX Mode
- Bestehende Formcycle-Dateityp- und Dateinamen-Validierung wird weiterhin respektiert
- Unterstützt `XFC_METADATA.limits` (serverseitige Limits)

---

## Installation

Das Skript wird als **Code-Injection** in Formcycle eingebunden – z. B. über die Formular-Einstellungen unter *Skripte* oder als externe JS-Ressource.

```html
<script src="native-mode-code-injection-configurable-input-elements.js"></script>
```

Anschließend `window.initMultiUpload()` aufrufen, sobald das Formular geladen ist:

```javascript
// Beispiel: nach Formcycle-Init-Event
$('[data-fc-event="formReady"]').on('formReady', function() {
    window.initMultiUpload();
});
```

---

## Konfiguration

### Globale Standardwerte

Die globale `CONFIG` im Skript-Header definiert die Standardwerte für alle Felder:

```javascript
const CONFIG = {
    MAX_FILE_SIZE:  50 * 1024 * 1024,   // 50 MB pro Datei
    MAX_TOTAL_SIZE: 100 * 1024 * 1024,  // 100 MB gesamt
    MAX_FILES:      10,                 // max. 10 Dateien
    DEBUG:          true,
    PATCH_DELAY:    200,                // ms vor erstem Patch-Versuch
    PATCH_STRATEGY: 'custom-upload',   // 'all' | 'custom-upload' | 'specific'
    SPECIFIC_FIELDS: ['xi-upl-1'],
    RESPECT_METADATA_LIMITS: true
};
```

Zur Laufzeit können Werte über `window.updateConfig()` angepasst werden:

```javascript
window.updateConfig('MAX_FILE_SIZE', 100 * 1024 * 1024);
window.updateConfig('MAX_TOTAL_SIZE', 200 * 1024 * 1024);
window.updateConfig('MAX_FILES', 3);
window.updateConfig('DEBUG', false);
```

### Feldspezifische Konfiguration per HTML-Attribut

Für jedes Upload-Feld können die drei Größen- und Anzahllimits **direkt am `<input>`-Element** überschrieben werden. Diese Werte haben Vorrang vor den globalen `CONFIG`-Werten.

| Attribut | Typ | Beschreibung | Beispielwert |
|---|---|---|---|
| `data-max-file-size` | Zahl (Bytes) | Maximale Größe einer einzelnen Datei | `5242880` (= 5 MB) |
| `data-max-total-size` | Zahl (Bytes) | Maximale Gesamtgröße aller Dateien | `15728640` (= 15 MB) |
| `data-max-files` | Zahl | Maximale Anzahl Dateien | `3` |

> Alle anderen Einstellungen (Strategie, Debug, Delay usw.) sind ausschließlich über die globale `CONFIG` steuerbar.

**Beispiel:**

```html
<input type="file"
       class="custom-upload"
       data-max-file-size="5242880"
       data-max-total-size="15728640"
       data-max-files="3" />
```

Dieses Feld erlaubt maximal **3 Dateien**, je max. **5 MB**, insgesamt max. **15 MB** – unabhängig von den globalen Standardwerten.

---

## Patch-Strategie

Über `CONFIG.PATCH_STRATEGY` wird gesteuert, welche Upload-Felder gepatcht werden:

| Strategie | Beschreibung |
|---|---|
| `'custom-upload'` | Nur Felder mit CSS-Klasse `custom-upload` *(Standard)* |
| `'all'` | Alle `<input type="file">`-Elemente im Formular |
| `'specific'` | Nur die in `CONFIG.SPECIFIC_FIELDS` gelisteten Feld-IDs |

---

## Validierung

Beim Hinzufügen von Dateien werden folgende Prüfungen durchgeführt:

- **Dateigröße** – Einzeldatei überschreitet `MAX_FILE_SIZE`
- **Leere Datei** – Datei hat 0 Bytes
- **Dateianzahl** – Gesamtanzahl überschreitet `MAX_FILES`
- **Gesamtgröße** – Summe aller Dateien überschreitet `MAX_TOTAL_SIZE`
- **Dateityp** – Wird aus der Formcycle-UI oder dem `accept`-Attribut ausgelesen
- **Dateiname** – Maximale Zeichenlänge aus `XM_FORM_MODEL.validation`

Ungültige Dateien werden automatisch herausgefiltert; gültige Dateien bleiben erhalten. Der Nutzer wird per `alert()` über entfernte Dateien informiert.

---

## Byte-Umrechnungshilfe

| Wert | Bytes |
|---|---|
| 1 MB | `1048576` |
| 5 MB | `5242880` |
| 10 MB | `10485760` |
| 25 MB | `26214400` |
| 50 MB | `52428800` |
| 100 MB | `104857600` |

---

## Debug

Im `CONFIG.DEBUG`-Modus gibt das Skript detaillierte Informationen in die Browser-Konsole aus. Zusätzlich steht ein globales Debug-Objekt bereit:

```javascript
// Wurde der Patch angewendet?
multiUploadDebug.patchApplied();

// getUpload() manuell testen
multiUploadDebug.testGetUpload();

// Aktuelle Konfiguration anzeigen
multiUploadDebug.config;
```

---

## Voraussetzungen

- Formcycle ab Version 7
- jQuery (wird von Formcycle bereitgestellt)
- Browser mit `DataTransfer`-API-Unterstützung (alle modernen Browser)
