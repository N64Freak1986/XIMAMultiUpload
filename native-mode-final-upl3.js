/**
 * MULTIPLE-UPLOAD FÜR FORMCYCLE NATIVE MODE - FINAL VERSION
 *
 * Verbesserte Erkennung bereits hochgeladener Dateien aus DOM
 */

(function($) {
    'use strict';

    console.clear();
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    console.log('%c🚀 MULTIPLE-UPLOAD - FINAL VERSION', 'color: #667eea; font-weight: bold; font-size: 16px');
    console.log('%c   Upload-Feld: xi-upl-3', 'color: #667eea; font-size: 14px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    console.log('');

    // Checks
    if (!$ || !$('#xi-upl-3').length) {
        console.error('❌ jQuery oder Upload-Feld nicht gefunden!');
        return;
    }

    const $uploadField = $('#xi-upl-3');
    console.log('✅ jQuery:', $.fn.jquery);
    console.log('✅ Upload-Feld gefunden');
    console.log('📋 Upload-Mode:', $uploadField.attr('data-upload-mode'));
    console.log('');

    // ============================================
    // KONFIGURATION
    // ============================================
    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10 MB
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,    // 100 MB
        MAX_FILES: 10,                         // Max 10 Dateien
        DEBUG: true
    };

    console.log('⚙️  Konfiguration:');
    console.log('   Max Dateigröße:', (CONFIG.MAX_FILE_SIZE / (1024*1024)).toFixed(0), 'MB');
    console.log('   Max Anzahl:', CONFIG.MAX_FILES);
    console.log('');

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('%c[Multi]', 'color: #2196F3; font-weight: bold', ...args);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * VERBESSERTE Funktion zum Auslesen bereits hochgeladener Dateien
     */
    function getExistingFileNames() {
        const names = [];
        const $container = $('#xi-upl-3-xc');

        // Strategie 1: Suche nach .xm-upl-label innerhalb .xm-upl-wrapper
        $container.find('.xm-upl-wrapper').each(function() {
            const $wrapper = $(this);
            const $label = $wrapper.find('.xm-upl-label');

            if ($label.length) {
                const text = $label.text().trim();
                log('   Debug: Gefundenes Label:', text);

                // Filter Platzhalter-Texte
                if (text &&
                    text !== '' &&
                    text !== 'keine Datei ausgewählt' &&
                    text !== 'No file selected' &&
                    text !== 'Keine Datei' &&
                    !text.startsWith('Keine ') &&
                    !text.startsWith('No ') &&
                    !text.toLowerCase().includes('ausgewählt') &&
                    !text.toLowerCase().includes('selected')) {

                    names.push(text);
                    log('   ✅ Datei erkannt:', text);
                }
            }
        });

        // Strategie 2: Fallback - suche direkt nach .xm-upl-label
        if (names.length === 0) {
            $container.find('.xm-upl-label').each(function() {
                const text = $(this).text().trim();
                log('   Debug: Direktes Label gefunden:', text);

                if (text &&
                    text !== 'keine Datei ausgewählt' &&
                    text !== 'No file selected' &&
                    !text.toLowerCase().includes('ausgewählt') &&
                    !text.toLowerCase().includes('selected')) {

                    names.push(text);
                    log('   ✅ Datei erkannt (direkt):', text);
                }
            });
        }

        // Strategie 3: Suche in der Upload-Liste (falls vorhanden)
        if (names.length === 0) {
            $container.find('.xm-upload-list-item-name').each(function() {
                const text = $(this).text().trim();
                if (text) {
                    names.push(text);
                    log('   ✅ Datei erkannt (Liste):', text);
                }
            });
        }

        log('   Gesamt gefunden:', names.length, 'Datei(en)');
        return names;
    }

    // ============================================
    // VALIDIERUNG
    // ============================================

    function validateFiles(files) {
        const errors = [];
        const existingFiles = getExistingFileNames();
        const existingCount = existingFiles.length;

        log('📋 Validiere', files.length, 'neue Datei(en)');

        if (existingFiles.length > 0) {
            log('   Bereits hochgeladen:', existingCount);
            existingFiles.forEach((name, i) => {
                log(`      ${i+1}. ${name}`);
            });
        } else {
            log('   Noch keine Dateien hochgeladen');
        }

        // Prüfe Anzahl
        const totalAfterUpload = existingCount + files.length;
        if (totalAfterUpload > CONFIG.MAX_FILES) {
            errors.push(`Max ${CONFIG.MAX_FILES} Dateien (${existingCount} bereits vorhanden + ${files.length} neue = ${totalAfterUpload} gesamt)`);
        }

        let totalSize = 0;

        // Prüfe jede Datei
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            log(`   📄 Prüfe: ${file.name} (${formatSize(file.size)})`);

            // Dateigröße
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                const err = `"${file.name}": Zu groß (${formatSize(file.size)} > ${formatSize(CONFIG.MAX_FILE_SIZE)})`;
                errors.push(err);
                console.log('%c      ❌ ' + err, 'color: #dc3545; font-weight: 500');
                continue;
            }

            // Leer-Datei
            if (file.size === 0) {
                const err = `"${file.name}": Datei ist leer (0 Bytes)`;
                errors.push(err);
                console.log('%c      ❌ ' + err, 'color: #dc3545; font-weight: 500');
                continue;
            }

            // Duplikat
            if (existingFiles.includes(file.name)) {
                const err = `"${file.name}": Bereits vorhanden`;
                errors.push(err);
                console.log('%c      ❌ ' + err, 'color: #dc3545; font-weight: 500');
                continue;
            }

            totalSize += file.size;
            log(`      ✅ ${file.name} ist gültig`);
        }

        // Gesamtgröße
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            const err = `Gesamtgröße: ${formatSize(totalSize)} > ${formatSize(CONFIG.MAX_TOTAL_SIZE)}`;
            errors.push(err);
            console.log('%c   ❌ ' + err, 'color: #dc3545; font-weight: 500');
        }

        if (errors.length > 0) {
            log('❌ Validierung fehlgeschlagen:', errors.length, 'Fehler');
        } else {
            log('✅ Alle', files.length, 'Datei(en) sind gültig!');
        }

        return { valid: errors.length === 0, errors: errors };
    }

    // ============================================
    // UI COMPONENTS
    // ============================================

    function createInfoBox() {
        const $container = $('#xi-upl-3-xc');
        $container.find('.multi-upload-info').remove();

        const $info = $('<div class="multi-upload-info"></div>').css({
            marginTop: '12px',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '2px solid #5568d3',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });

        const existingFiles = getExistingFileNames();
        const existingCount = existingFiles.length;

        let emoji = '📦';
        if (existingCount >= CONFIG.MAX_FILES * 0.8) emoji = '🔴';
        else if (existingCount >= CONFIG.MAX_FILES * 0.6) emoji = '🟡';

        let statusHtml = `${emoji} <strong>${existingCount} / ${CONFIG.MAX_FILES}</strong> Dateien hochgeladen`;

        // Zeige Dateinamen wenn vorhanden
        if (existingFiles.length > 0) {
            const shortNames = existingFiles.map(name => {
                return name.length > 30 ? name.substr(0, 27) + '...' : name;
            });
            statusHtml += `<br><small style="font-size:11px;opacity:0.9">${shortNames.join(', ')}</small>`;
        }

        $info.html(
            '<div style="font-weight:bold;margin-bottom:8px;font-size:15px">🎯 Multiple-Upload <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:3px;font-size:12px">AKTIV</span></div>' +
            `<div class="multi-status" style="margin-bottom:8px;font-weight:500;font-size:13px">${statusHtml}</div>` +
            '<div style="font-size:12px;opacity:0.9;line-height:1.4">💡 <strong>Mehrere Dateien:</strong> Strg+Klick (Win) / Cmd+Klick (Mac)</div>'
        );

        $container.append($info);
    }

    function updateStatus() {
        createInfoBox(); // Einfach neu erstellen
    }

    function showError(errors) {
        const $container = $('#xi-upl-3-xc');
        $container.find('.multi-error').remove();

        const $error = $('<div class="multi-error"></div>').css({
            marginTop: '12px',
            padding: '12px 15px',
            background: '#fff3cd',
            borderRadius: '6px',
            border: '2px solid #ffc107',
            color: '#856404',
            fontSize: '13px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });

        $error.html(
            `<div style="font-weight:bold;margin-bottom:6px">⚠️ ${errors.length} Validierungsfehler:</div>` +
            '<ul style="margin:0;padding-left:20px">' +
            errors.map(e => `<li>${e}</li>`).join('') +
            '</ul>'
        );

        $container.find('.multi-upload-info').before($error);

        setTimeout(() => {
            $error.fadeOut(400, function() { $(this).remove(); });
        }, 10000);
    }

    function showSuccess(fileCount) {
        const $container = $('#xi-upl-3-xc');
        $container.find('.multi-success').remove();

        const $success = $('<div class="multi-success"></div>').css({
            marginTop: '12px',
            padding: '12px 15px',
            background: '#d4edda',
            borderRadius: '6px',
            border: '2px solid #28a745',
            color: '#155724',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).html(`✅ <strong>${fileCount} Datei(en) ausgewählt</strong> - Upload läuft...`);

        $container.find('.multi-upload-info').before($success);

        setTimeout(() => {
            $success.fadeOut(400, function() {
                $(this).remove();
                updateStatus();
            });
        }, 3000);
    }

    // ============================================
    // EVENT HANDLER
    // ============================================

    function onFileChange(event) {
        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        log('📂 Dateiauswahl geändert:', files.length, 'Datei(en)');

        // Validierung
        const validation = validateFiles(files);

        if (!validation.valid) {
            log('❌ Upload blockiert wegen Validierungsfehlern');
            showError(validation.errors);
            return;
        }

        // Erfolg
        console.log('');
        console.group('%c✅ ' + files.length + ' Datei(en) werden hochgeladen', 'color: #28a745; font-weight: bold; font-size: 14px');
        for (let i = 0; i < files.length; i++) {
            console.log(`   ${i+1}. ${files[i].name} (${formatSize(files[i].size)})`);
        }
        console.groupEnd();
        console.log('');

        showSuccess(files.length);
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    console.log('%c⚙️  INITIALISIERUNG', 'color: #ff9800; font-weight: bold; font-size: 14px');
    console.log('');

    // 1. Multiple-Attribut setzen
    const wasMultiple = $uploadField.prop('multiple');
    $uploadField.prop('multiple', true);

    if (wasMultiple) {
        log('ℹ️  Multiple-Attribut war bereits aktiv');
    } else {
        log('✅ Multiple-Attribut gesetzt');
    }

    // 2. Event-Handler registrieren
    $uploadField.off('change.multiupload').on('change.multiupload', onFileChange);
    log('✅ Change-Event registriert');

    // 3. UI erstellen
    createInfoBox();
    log('✅ Info-Box erstellt');

    // 4. Bestehende Dateien loggen
    const existing = getExistingFileNames();
    if (existing.length > 0) {
        log('📋 Bereits hochgeladene Dateien:');
        existing.forEach((name, i) => {
            log(`   ${i+1}. ${name}`);
        });
    } else {
        log('📋 Noch keine Dateien hochgeladen');
    }

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('%c✅ INITIALISIERUNG ERFOLGREICH!', 'color: #28a745; font-weight: bold; font-size: 16px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('');
    console.log('%c📖 BEREIT ZUM TESTEN!', 'color: #2196F3; font-weight: bold; font-size: 14px');
    console.log('%c   • Multiple-File-Selection im File-Dialog', 'color: #666');
    console.log('%c   • Duplikatserkennung funktioniert', 'color: #666');
    console.log('%c   • Größenvalidierung aktiv', 'color: #666');
    console.log('%c   • Visuelle Warnungen bei Fehlern', 'color: #666');
    console.log('');

    // Debug-Helper
    window.multiUploadDebug = {
        getExisting: getExistingFileNames,
        getCount: () => getExistingFileNames().length,
        config: CONFIG
    };

    log('🛠️  Debug verfügbar: multiUploadDebug.getExisting()');
    console.log('');

})(jQuery);
