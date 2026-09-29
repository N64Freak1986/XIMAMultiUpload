# XIMA FORMCYCLE Multiple Upload Plugin

[![Java 11](https://img.shields.io/badge/Java-11-blue.svg)](https://openjdk.org/)
[![FORMCYCLE](https://img.shields.io/badge/XIMA%20FORMCYCLE-8.5.5+-orange.svg)](https://www.formcycle.eu/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Natives **XIMA FORMCYCLE Form-Widget-Plugin** für komfortablen, modernen Multiple-File-Upload mit voller Designer-Integration, Drag & Drop, inkrementellem Hinzufügen, Einzel-Entfernen (✕) und Quota-Tracking.

---

## 🌟 Highlights des nativen Plugins

- 🧩 **Natives Formcycle Widget (`IPluginFormElementWidget`)**:
  - Direkt in der Designer-Elementpalette per Drag & Drop verfügbar
  - Eigenes SVG-Vektoricon (`ico-fc-multi-upload`) für Elementbaum & Palette
  - Vollständige Vorschau im Designer-Canvas (`renderItemPreview`)
- 📁 **Echte Mehrfachauswahl & Drag & Drop**:
  - HTML5 Mehrfachauswahl im Dateidialog (`Ctrl` / `Cmd` + Klick)
  - Moderne Drag & Drop Upload-Zone mit visuellen Hover-Zuständen
- ➕ **Inkrementelles Hinzufügen (DataTransfer API)**:
  - Benutzer können über *"➕ Weitere hinzufügen"* zusätzliche Dateien auswählen, ohne bereits gewählte Dateien zu verlieren!
- ✕ **Einzelnes Entfernen von Dateien**:
  - Jede Datei kann einzeln per Klick auf den Schließen-Button entfernt werden
  - Synchronisiert die HTML5-FileList automatisch mit der Browser-DataTransfer API
- 📊 **Quota- & Speicher-Tracking**:
  - Echtzeit-Balkenanzeige mit Prozent- und Farbcodierung (🟢 <60%, 🟡 60-80%, 🔴 >80%)
- 🛡️ **Client- und Server-seitige Validierung**:
  - Sofortige Prüfung im Browser: Max. Dateigröße, Max. Gesamtgröße, Max. Anzahl, erlaubte Dateiendungen, Duplikatserkennung
  - Robuste Server-Validierung beim Absenden (`validate`), blockiert ungültige Übermittlungen und berücksichtigt `required`, `ishidden` und Entwurfs-Aktionen
- 🚀 **100% Autark & Resilient (Anti-404-Architektur)**:
  - Vollständiges Inlining von CSS & JS im generierten Markup
  - Automatische Bereinigung externer Servlet-Includes (`cleanUpIncludes()`), wodurch typische Formcycle-404- und *Strict MIME checking*-Fehler vollständig unterbunden werden

---

## ⚙️ Konfigurierbare Eigenschaften im Designer

In den Element-Eigenschaften im Formcycle-Designer können Sie das Verhalten pro Upload-Feld festlegen:

| Eigenschaft | Key | Standard | Beschreibung |
|-------------|-----|----------|--------------|
| **Max. Dateigröße (MB)** | `multiUploadMaxFileSize` | `10` | Maximale Größe pro Einzeldatei in MB |
| **Max. Gesamtgröße (MB)** | `multiUploadMaxTotalSize` | `100` | Maximale Gesamtgröße aller Dateien in MB |
| **Max. Dateianzahl** | `multiUploadMaxFiles` | `10` | Höchstgrenze für die Anzahl an Dateien |
| **Erlaubte Dateiendungen** | `multiUploadAllowedExtensions` | `.pdf, .png, .jpg, .jpeg, .docx, .xlsx, .zip` | Kommagetrennte Liste der Dateitypen |
| **Drag & Drop Zone** | `multiUploadDropzoneEnabled` | `true` | Zeigt die Drag & Drop Dropzone an |
| **Farbschema** | `multiUploadTheme` | `modern` | Stil: `modern`, `xima-blue`, `minimal`, `dark` |
| **Button-Text (Auswahl)** | `multiUploadButtonText` | `Dateien auswählen` | Beschriftung des Haupt-Auswahlbuttons |
| **Button-Text (Hinzufügen)**| `multiUploadAddMoreText` | `➕ Weitere hinzufügen` | Beschriftung des Add-Buttons |
| **Button-Text (Löschen)** | `multiUploadClearAllText` | `🗑️ Alle löschen` | Beschriftung für den Löschen-Button |
| **Fehlermeldung** | `multiUploadCustomErrorMsg` | *(leer)* | Optionale individuelle Fehlermeldung |

---

## 🏛️ Globale Mandanten-Einstellungen (Bundle Properties)

Unter **FORMCYCLE Administration → Plugins → Multipler Upload Plugin** können globale Standardwerte für den gesamten Mandanten hinterlegt werden:

- `fc.plugin.multiupload.defaultMaxFileSize` (Standard: 10 MB)
- `fc.plugin.multiupload.defaultMaxTotalSize` (Standard: 100 MB)
- `fc.plugin.multiupload.defaultMaxFiles` (Standard: 10 Dateien)
- `fc.plugin.multiupload.defaultAllowedExtensions` (Standard: `.pdf, .png, .jpg, .jpeg, .docx, .xlsx, .zip`)
- `fc.plugin.multiupload.enableGlobalAutoEnhance` (Standard: `true`)

*Hinweis:* Wird am Formular-Element kein expliziter Wert gesetzt, greift automatisch die globale Mandanten-Einstellung.

---

## 🛠️ Build & Installation

### Voraussetzungen
- Java 11 oder höher (JDK 11, JDK 17 oder JDK 21)
- Apache Maven 3.8+ (oder via Maven Wrapper `.m2/wrapper`)

### 1. Plugin-JAR bauen
```bash
# Kompilieren, Tests ausführen und Fat-JAR erstellen
mvn clean package
```

Das fertige Plugin wird erstellt unter:
```
target/fc-plugin-multi-upload.jar
```

### 2. In FORMCYCLE installieren
1. Öffnen Sie die **FORMCYCLE Administration**
2. Navigieren Sie zu **Plugins**
3. Klicken Sie auf **"Plugin hochladen"** und wählen Sie `target/fc-plugin-multi-upload.jar`
4. Nach dem Upload ist das Plugin sofort aktiv

### 3. Im Designer verwenden
1. Öffnen Sie ein Formular im **Formcycle Designer**
2. In der Element-Palette links finden Sie das Element **"Multipler Upload"**
3. Ziehen Sie das Element an die gewünschte Stelle im Formular
4. Passen Sie bei Bedarf die Grenzwerte in der rechten Eigenschaften-Leiste an
5. Formular speichern – Fertig! 🎉

---

## 🔄 Standalone / Legacy Scripts

Für Formulare, in denen aus administrativen Gründen kein Plugin installiert werden kann, befinden sich die ursprünglichen Standalone-JavaScript-Lösungen im Verzeichnis:
- [`standalone-scripts/`](standalone-scripts/) (u. a. `native-mode-complete.js`, `native-mode-enhanced-ui.js`, `formcycle-multiple-upload.js`)
- Siehe auch: [README-NATIVE-MODE.md](README-NATIVE-MODE.md)

---

## 📄 Lizenz

Dieses Projekt ist lizenziert unter der [MIT-Lizenz](LICENSE).
