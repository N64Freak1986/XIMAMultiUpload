/**
 * MULTIPLE-UPLOAD FÜR FORMCYCLE NATIVE MODE
 *
 * Funktioniert mit: data-upload-mode="native"
 * Kein $.xutil.ajaxUpload benötigt!
 *
 * ANLEITUNG:
 * 1. Öffnen Sie: https://formulare.kempten.de/frontend-server/form/provide/10056/
 * 2. Drücken Sie F12 (Browser-Console)
 * 3. Kopieren Sie diesen GESAMTEN Code
 * 4. Fügen Sie ihn ein und drücken Sie Enter
 */

(function($) {
    'use strict';

    console.clear();
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    console.log('%c🚀 MULTIPLE-UPLOAD FÜR NATIVE MODE', 'color: #667eea; font-weight: bold; font-size: 16px');
    console.log('%c   Upload-Feld: xi-upl-1 (native mode)', 'color: #667eea; font-size: 14px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    console.log('');

    // ============================================
    // CHECKS
    // ============================================

    if (typeof $ === 'undefined') {
        console.error('❌ jQuery nicht verfügbar!');
        return;
    }
    console.log('✅ jQuery:', $.fn.jquery);

    const $uploadField = $('#xi-upl-1');
    if ($uploadField.length === 0) {
        console.error('❌ Upload-Feld xi-upl-1 nicht gefunden!');
        return;
    }
    console.log('✅ Upload-Feld gefunden');

    const uploadMode = $uploadField.attr('data-upload-mode');
    console.log('📋 Upload-Mode:', uploadMode);
    console.log('📋 Modern enabled:', $uploadField.attr('data-x-upload-modern-enabled'));
    console.log('');

    // ============================================
    // KONFIGURATION
    // ============================================

    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10 MB
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,    // 100 MB
        MAX_FILES: 10,                         // Max 10 Dateien
        ALLOWED_EXTENSIONS: [],                // Leer = alle erlaubt
        DEBUG: true
    };

    console.log('⚙️  Konfiguration:');
    console.log('   Max Dateigröße:', (CONFIG.MAX_FILE_SIZE / (1024*1024)).toFixed(0), 'MB');
    console.log('   Max Gesamtgröße:', (CONFIG.MAX_TOTAL_SIZE / (1024*1024)).toFixed(0), 'MB');
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

    function getExistingFileCount() {
        const $container = $('#xi-upl-1-xc');
        const $existingFiles = $container.find('.xm-upl-wrapper .xm-upl-label');
        return $existingFiles.length;
    }

    function getExistingFileNames() {
        const names = [];
        const $container = $('#xi-upl-1-xc');
        const $existingFiles = $container.find('.xm-upl-wrapper .xm-upl-label');

        $existingFiles.each(function() {
            const name = $(this).text().trim();
            if (name) names.push(name);
        });

        return names;
    }

    // ============================================
    // VALIDIERUNG
    // ============================================

    function validateFiles(files) {
        const errors = [];
        const existingFiles = getExistingFileNames();
        const existingCount = existingFiles.length;

        log('📋 Validiere', files.length, 'Datei(en)');
        log('   Bereits hochgeladen:', existingCount);

        // Prüfe Anzahl
        if (existingCount + files.length > CONFIG.MAX_FILES) {
            errors.push(`Max ${CONFIG.MAX_FILES} Dateien (${existingCount} bereits vorhanden)`);
        }

        let totalSize = 0;

        // Prüfe jede Datei
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            log(`   📄 ${file.name} (${formatSize(file.size)})`);

            // Dateigröße
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                errors.push(`"${file.name}": Zu groß (${formatSize(file.size)} > ${formatSize(CONFIG.MAX_FILE_SIZE)})`);
                continue;
            }

            // Leer-Datei
            if (file.size === 0) {
                errors.push(`"${file.name}": Datei ist leer`);
                continue;
            }

            // Duplikat
            if (existingFiles.includes(file.name)) {
                errors.push(`"${file.name}": Bereits vorhanden`);
                continue;
            }

            // Dateierweiterung
            if (CONFIG.ALLOWED_EXTENSIONS.length > 0) {
                const ext = file.name.split('.').pop().toLowerCase();
                if (!CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
                    errors.push(`"${file.name}": Dateityp .${ext} nicht erlaubt`);
                    continue;
                }
            }

            totalSize += file.size;
        }

        // Gesamtgröße
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            errors.push(`Gesamtgröße: ${formatSize(totalSize)} > ${formatSize(CONFIG.MAX_TOTAL_SIZE)}`);
        }

        if (errors.length > 0) {
            log('❌ Validierung fehlgeschlagen:', errors.length, 'Fehler');
            return { valid: false, errors: errors };
        }

        log('✅ Validierung erfolgreich');
        return { valid: true, errors: [] };
    }

    // ============================================
    // UI COMPONENTS
    // ============================================

    function createInfoBox() {
        const $container = $('#xi-upl-1-xc');
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

        const $header = $('<div></div>').css({
            fontWeight: 'bold',
            fontSize: '15px',
            marginBottom: '8px'
        }).html('🎯 Multiple-Upload <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 3px; font-size: 12px;">AKTIVIERT</span>');

        const $status = $('<div class="multi-status"></div>').css({
            fontSize: '13px',
            marginBottom: '8px',
            fontWeight: '500'
        });

        const $help = $('<div></div>').css({
            fontSize: '12px',
            opacity: '0.9',
            lineHeight: '1.4'
        }).html(
            '💡 <strong>Mehrere Dateien auswählen:</strong><br>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;• Windows/Linux: <strong>Strg + Klick</strong><br>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;• Mac: <strong>Cmd + Klick</strong>'
        );

        $info.append($header).append($status).append($help);
        $container.append($info);

        updateStatus();
    }

    function updateStatus() {
        const $status = $('.multi-status');
        const existingCount = getExistingFileCount();
        const existingNames = getExistingFileNames();

        let emoji = '📦';
        if (existingCount >= CONFIG.MAX_FILES * 0.8) emoji = '🔴';
        else if (existingCount >= CONFIG.MAX_FILES * 0.6) emoji = '🟡';

        $status.html(
            `${emoji} <strong>${existingCount} / ${CONFIG.MAX_FILES}</strong> Dateien hochgeladen`
        );
    }

    function showError(errors) {
        const $container = $('#xi-upl-1-xc');
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

        const $title = $('<div></div>').css({
            fontWeight: 'bold',
            marginBottom: '6px'
        }).text(`⚠️ ${errors.length} Validierungsfehler:`);

        const $list = $('<ul></ul>').css({
            margin: '0',
            paddingLeft: '20px'
        });

        errors.forEach(error => {
            $list.append($('<li></li>').text(error));
        });

        $error.append($title).append($list);
        $container.find('.multi-upload-info').before($error);

        setTimeout(() => {
            $error.fadeOut(400, function() { $(this).remove(); });
        }, 8000);
    }

    function showSuccess(fileCount) {
        const $container = $('#xi-upl-1-xc');
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
            log('❌ Validierung fehlgeschlagen');
            showError(validation.errors);

            // Dateiauswahl zurücksetzen
            event.target.value = '';
            return;
        }

        // Erfolg
        log('✅ Alle Dateien gültig');

        // Liste in Console
        console.group('%c✅ ' + files.length + ' Datei(en) werden hochgeladen', 'color: #28a745; font-weight: bold');
        for (let i = 0; i < files.length; i++) {
            console.log(`${i+1}. ${files[i].name} (${formatSize(files[i].size)})`);
        }
        console.groupEnd();

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
        log('📋 Bereits hochgeladen:');
        existing.forEach((name, i) => {
            log(`   ${i+1}. ${name}`);
        });
    }

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('%c✅ INITIALISIERUNG ERFOLGREICH!', 'color: #28a745; font-weight: bold; font-size: 16px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('');
    console.log('%c📖 JETZT TESTEN:', 'color: #2196F3; font-weight: bold; font-size: 14px');
    console.log('%c1. Scrollen Sie zum Upload-Feld (zeigt lila Info-Box)', 'color: #666');
    console.log('%c2. Klicken Sie auf "Ändern/Hinzufügen"', 'color: #666');
    console.log('%c3. Im File-Dialog:', 'color: #666');
    console.log('%c   • Halten Sie Strg (Windows) oder Cmd (Mac)', 'color: #999');
    console.log('%c   • Klicken Sie mehrere Dateien nacheinander', 'color: #999');
    console.log('%c   • ODER: Markieren Sie einen Bereich mit Shift', 'color: #999');
    console.log('%c4. Klicken Sie "Öffnen"', 'color: #666');
    console.log('%c5. Console zeigt alle Dateien + Validierung', 'color: #666');
    console.log('');
    console.log('%c💡 Bei Validierungsfehlern erscheint gelbe Warnung', 'color: #999; font-style: italic');
    console.log('');

    // ============================================
    // DEBUGGING HELPERS
    // ============================================

    window.multiUploadDebug = {
        getConfig: () => CONFIG,
        getExistingFiles: () => getExistingFileNames(),
        getExistingCount: () => getExistingFileCount(),
        testValidation: (size, name) => {
            const mockFile = { size: size, name: name };
            return validateFiles([mockFile]);
        }
    };

    log('🛠️  Debug-Helper verfügbar: window.multiUploadDebug');

})(jQuery);
