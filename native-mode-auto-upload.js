/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FORMCYCLE MULTIPLE UPLOAD - AUTO-UPLOAD MODE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * FÜR: Formcycle Native Mode mit AUTO-UPLOAD
 *
 * WIE ES FUNKTIONIERT:
 * 1. User wählt Dateien → Formcycle uploaded SOFORT automatisch
 * 2. Nach Upload: Dateien sind nur noch als DOM-Elemente vorhanden
 * 3. "Weitere hinzufügen" öffnet Dialog für nächste Auswahl
 * 4. UI zeigt alle bereits hochgeladenen Dateien aus DOM
 *
 * KEIN DataTransfer API - funktioniert nicht mit Auto-Upload!
 *
 * Version: 2.0 (Auto-Upload)
 * Datum: 2025-01-13
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

(function() {
    'use strict';

    // ============================================
    // KONFIGURATION
    // ============================================

    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10 MB pro Datei
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,    // 100 MB gesamt
        MAX_FILES: 10,                         // Max 10 Dateien
        DEBUG: true                            // Console-Logging
    };

    // ============================================
    // GLOBALE VARIABLEN
    // ============================================

    const $uploadField = $('#xi-upl-1');
    const $container = $('#xi-upl-1-xc');

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[MULTI-UPLOAD]', ...args);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Liest bereits hochgeladene Dateien aus dem DOM
     * WICHTIG: Nach Auto-Upload sind Dateien NICHT in input.files, sondern nur im DOM!
     */
    function getUploadedFilesFromDOM() {
        const files = [];

        // Strategie 1: .xm-upl-wrapper > .xm-upl-label
        $container.find('.xm-upl-wrapper').each(function() {
            const $wrapper = $(this);
            const $label = $wrapper.find('.xm-upl-label');
            const $sizeSpan = $wrapper.find('.xm-upl-size');

            if ($label.length) {
                const name = $label.text().trim();
                const sizeText = $sizeSpan.length ? $sizeSpan.text().trim() : '';

                if (isValidFileName(name)) {
                    files.push({
                        name: name,
                        size: parseSizeFromText(sizeText),
                        sizeText: sizeText,
                        $element: $wrapper
                    });
                }
            }
        });

        // Strategie 2: Fallback - direktes .xm-upl-label
        if (files.length === 0) {
            $container.find('.xm-upl-label').each(function() {
                const name = $(this).text().trim();
                if (isValidFileName(name)) {
                    files.push({
                        name: name,
                        size: 0,
                        sizeText: '',
                        $element: $(this).parent()
                    });
                }
            });
        }

        log('📋 Hochgeladene Dateien aus DOM:', files.length, files.map(f => f.name));
        return files;
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

    function parseSizeFromText(text) {
        if (!text) return 0;

        // "1.5 MB" → 1.5 * 1024 * 1024
        const match = text.match(/([0-9.]+)\s*(B|KB|MB|GB)/i);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        switch (unit) {
            case 'B': return value;
            case 'KB': return value * 1024;
            case 'MB': return value * 1024 * 1024;
            case 'GB': return value * 1024 * 1024 * 1024;
            default: return 0;
        }
    }

    /**
     * Validiert neu ausgewählte Dateien VOR dem Upload
     */
    function validateNewFiles(files) {
        const errors = [];
        const uploadedFiles = getUploadedFilesFromDOM();
        const uploadedNames = uploadedFiles.map(f => f.name);
        const uploadedCount = uploadedFiles.length;
        const uploadedSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);

        log('🔍 Validiere', files.length, 'neue Datei(en)');
        log('   Bereits hochgeladen:', uploadedCount, 'Dateien,', formatSize(uploadedSize));

        // Prüfe Anzahl
        if (uploadedCount + files.length > CONFIG.MAX_FILES) {
            errors.push(`Max ${CONFIG.MAX_FILES} Dateien erlaubt (${uploadedCount} bereits vorhanden + ${files.length} neue = ${uploadedCount + files.length} gesamt)`);
        }

        // Prüfe jede Datei
        let newTotalSize = uploadedSize;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Dateigröße
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                errors.push(`"${file.name}": Zu groß (${formatSize(file.size)} > ${formatSize(CONFIG.MAX_FILE_SIZE)})`);
            }

            // Duplikat
            if (uploadedNames.includes(file.name)) {
                errors.push(`"${file.name}": Bereits vorhanden`);
            }

            // Leere Datei
            if (file.size === 0) {
                errors.push(`"${file.name}": Datei ist leer (0 Bytes)`);
            }

            newTotalSize += file.size;
        }

        // Gesamtgröße
        if (newTotalSize > CONFIG.MAX_TOTAL_SIZE) {
            errors.push(`Gesamtgröße: ${formatSize(newTotalSize)} > ${formatSize(CONFIG.MAX_TOTAL_SIZE)}`);
        }

        const valid = errors.length === 0;

        log(valid ? '✅ Validierung OK' : '❌ Validierungsfehler:', errors);

        return {
            valid: valid,
            errors: errors,
            uploadedCount: uploadedCount,
            newCount: files.length,
            totalCount: uploadedCount + files.length,
            uploadedSize: uploadedSize,
            newSize: newTotalSize - uploadedSize,
            totalSize: newTotalSize
        };
    }

    /**
     * Zeigt Fehler-Box
     */
    function showError(errors) {
        // Alte Error-Box entfernen
        $('.multi-upload-error').remove();

        const $error = $('<div class="multi-upload-error"></div>').css({
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            fontSize: '13px',
            color: '#856404'
        });

        let html = '<div style="font-weight:bold;margin-bottom:10px">⚠️ Upload blockiert:</div><ul style="margin:0;padding-left:20px">';
        errors.forEach(err => {
            html += `<li>${err}</li>`;
        });
        html += '</ul>';

        $error.html(html);
        $container.prepend($error);

        // Nach 10 Sekunden ausblenden
        setTimeout(() => $error.fadeOut(500, () => $error.remove()), 10000);
    }

    /**
     * Zeigt Erfolgs-Meldung
     */
    function showSuccess(count, size) {
        // Alte Success-Box entfernen
        $('.multi-upload-success').remove();

        const $success = $('<div class="multi-upload-success"></div>').css({
            background: '#d4edda',
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '12px 15px',
            marginBottom: '15px',
            fontSize: '13px',
            color: '#155724',
            fontWeight: '500'
        });

        $success.html(`✅ ${count} Datei(en) ausgewählt (${formatSize(size)}) - Upload startet...`);
        $container.prepend($success);

        // Nach 5 Sekunden ausblenden
        setTimeout(() => $success.fadeOut(500, () => $success.remove()), 5000);
    }

    /**
     * Erstellt Info-UI
     */
    function createInfoUI() {
        // Alte UI entfernen
        $('.multi-upload-info').remove();

        const $ui = $('<div class="multi-upload-info"></div>').css({
            marginBottom: '15px',
            border: '2px solid #667eea',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        });

        // Header
        const $header = $('<div class="multi-header"></div>').css({
            padding: '12px 15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        });

        $header.html(
            '<div>🎯 Multiple-Upload <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:3px;font-size:12px">AUTO</span></div>' +
            '<button type="button" class="btn-add-more" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);color:white;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:500">➕ Weitere hinzufügen</button>'
        );

        // Content
        const $content = $('<div class="multi-content"></div>').css({
            padding: '15px',
            background: '#fff'
        });

        $ui.append($header).append($content);
        $container.prepend($ui);

        // Event Handler
        $header.find('.btn-add-more').on('click', function() {
            log('📂 Öffne Datei-Dialog für weitere Dateien...');
            $uploadField.click();
        });

        updateUI();
    }

    /**
     * Updated die Info-UI
     */
    function updateUI() {
        const $content = $('.multi-content');
        if (!$content.length) return;

        const uploadedFiles = getUploadedFilesFromDOM();
        const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
        const count = uploadedFiles.length;

        log('🔄 Update UI:', count, 'Dateien,', formatSize(totalSize));

        // Emoji und Farbe basierend auf Anzahl
        let emoji = '📦';
        let color = '#28a745';
        const percent = (count / CONFIG.MAX_FILES) * 100;

        if (percent > 80) { emoji = '🔴'; color = '#dc3545'; }
        else if (percent > 60) { emoji = '🟡'; color = '#ffc107'; }

        let html = '';

        // Status-Zeile
        html += `<div style="margin-bottom:12px;padding:10px;background:#f8f9fa;border-radius:4px">`;
        html += `<div style="font-weight:bold;color:${color};margin-bottom:5px">${emoji} ${count} / ${CONFIG.MAX_FILES} Dateien hochgeladen</div>`;
        html += `<div style="font-size:12px;color:#666">📦 Gesamtgröße: <strong>${formatSize(totalSize)}</strong> / ${formatSize(CONFIG.MAX_TOTAL_SIZE)}</div>`;
        html += `</div>`;

        // Dateiliste
        if (count > 0) {
            html += `<div style="font-weight:bold;margin-bottom:8px;font-size:13px">Hochgeladene Dateien:</div>`;
            html += `<div style="max-height:200px;overflow-y:auto;border:1px solid #e0e0e0;border-radius:4px">`;

            uploadedFiles.forEach((file, index) => {
                const shortName = file.name.length > 50
                    ? file.name.substr(0, 47) + '...'
                    : file.name;

                html += `<div style="padding:8px 10px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between">`;
                html += `<div style="flex:1">`;
                html += `<div style="font-weight:500;font-size:13px">📄 ${shortName}</div>`;
                if (file.sizeText) {
                    html += `<div style="font-size:11px;color:#999">${file.sizeText}</div>`;
                }
                html += `</div>`;
                html += `<div style="color:#28a745;font-size:11px">✓ Hochgeladen</div>`;
                html += `</div>`;
            });

            html += `</div>`;
        } else {
            html += `<div style="text-align:center;color:#999;padding:20px;font-size:13px">Noch keine Dateien hochgeladen</div>`;
        }

        // Hinweis
        html += `<div style="margin-top:12px;padding:10px;background:#e7f3ff;border-radius:4px;font-size:12px;color:#666">`;
        html += `💡 <strong>Tipp:</strong> Strg/Cmd+Klick für mehrere Dateien im Dialog`;
        html += `</div>`;

        $content.html(html);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    /**
     * Wenn User Dateien auswählt (VOR Auto-Upload)
     */
    function onFileChange(event) {
        const files = Array.from(event.target.files || []);

        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log('📁 Datei-Auswahl:', files.length, 'Datei(en)');
        files.forEach(f => log('   -', f.name, formatSize(f.size)));

        if (files.length === 0) {
            log('⚠️  Keine Dateien ausgewählt');
            return;
        }

        // Validierung
        const validation = validateNewFiles(files);

        if (!validation.valid) {
            // BLOCKIERE Upload
            log('❌ Upload blockiert!');
            showError(validation.errors);

            // Leere input um Upload zu verhindern
            event.target.value = '';
            return;
        }

        // Erfolg - Formcycle wird jetzt auto-uploaden
        log('✅ Validierung OK - Formcycle startet Auto-Upload...');
        showSuccess(files.length, validation.newSize);

        // UI wird nach Upload automatisch updated (siehe unten)
    }

    /**
     * Überwacht DOM-Änderungen um zu erkennen, wann Formcycle Dateien hochgeladen hat
     */
    function watchForUploadedFiles() {
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;

            mutations.forEach(mutation => {
                // Prüfe ob Upload-Elemente hinzugefügt wurden
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if ($(node).hasClass('xm-upl-wrapper') || $(node).find('.xm-upl-wrapper').length > 0) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });

            if (shouldUpdate) {
                log('🔄 DOM-Änderung erkannt - Update UI...');
                setTimeout(() => updateUI(), 100); // Kleines Delay für Formcycle
            }
        });

        observer.observe($container[0], {
            childList: true,
            subtree: true
        });

        log('👁️  MutationObserver aktiv - überwacht DOM für neue Uploads');
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    function init() {
        console.clear();
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
        console.log('%c🚀 MULTIPLE-UPLOAD - AUTO-UPLOAD MODE', 'color: #667eea; font-weight: bold; font-size: 16px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');

        // Prüfe jQuery
        if (typeof $ === 'undefined') {
            console.error('❌ jQuery nicht verfügbar!');
            return;
        }
        log('✅ jQuery:', $.fn.jquery);

        // Prüfe Upload-Feld
        if (!$uploadField.length) {
            console.error('❌ Upload-Feld #xi-upl-1 nicht gefunden!');
            return;
        }
        log('✅ Upload-Feld gefunden');

        const uploadMode = $uploadField.attr('data-upload-mode');
        log('📋 Upload-Mode:', uploadMode);

        if (uploadMode !== 'native') {
            console.warn('⚠️  Achtung: data-upload-mode ist nicht "native"!');
        }

        // Aktiviere multiple-Attribut
        $uploadField.prop('multiple', true);
        log('✅ Multiple-Attribut aktiviert');

        // Konfiguration ausgeben
        console.group('%c⚙️  Konfiguration', 'color: #2196F3; font-weight: bold');
        console.log('Max Dateigröße:', formatSize(CONFIG.MAX_FILE_SIZE));
        console.log('Max Gesamtgröße:', formatSize(CONFIG.MAX_TOTAL_SIZE));
        console.log('Max Anzahl:', CONFIG.MAX_FILES);
        console.groupEnd();

        // Event Handler registrieren (mit Namespace)
        $uploadField.off('change.multiupload').on('change.multiupload', onFileChange);
        log('✅ Change-Handler registriert');

        // MutationObserver starten
        watchForUploadedFiles();

        // UI erstellen
        createInfoUI();

        // Debug-Helper
        window.multiUploadDebug = {
            getUploaded: getUploadedFilesFromDOM,
            config: CONFIG,
            updateUI: updateUI
        };

        console.log('%c✅ Initialisierung erfolgreich!', 'color: #28a745; font-weight: bold; font-size: 14px');
        console.log('%cDebug-Helper: multiUploadDebug.getUploaded()', 'color: #999');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        $(document).ready(init);
    } else {
        init();
    }

})();
