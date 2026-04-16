/**
 * TEST-SCRIPT FÜR BROWSER-CONSOLE
 *
 * So verwenden Sie dieses Script:
 * 1. Öffnen Sie https://formulare.kempten.de/frontend-server/form/provide/10056/
 * 2. Öffnen Sie die Browser-Console (F12 oder Rechtsklick → Untersuchen → Console)
 * 3. Kopieren Sie diesen gesamten Code
 * 4. Fügen Sie ihn in die Console ein und drücken Sie Enter
 * 5. Das Script wird auf das zweite Upload-Feld angewendet
 */

(function($) {
    'use strict';

    console.log('==============================================');
    console.log('XIMA Multiple Upload - Test auf zweitem Upload-Feld');
    console.log('==============================================');

    // Prüfe ob jQuery verfügbar
    if (typeof $ === 'undefined' || !$) {
        console.error('❌ jQuery nicht verfügbar!');
        return;
    }
    console.log('✅ jQuery verfügbar:', $.fn.jquery);

    // Prüfe ob Formcycle AjaxUploadManager verfügbar
    if (!$.xutil || !$.xutil.ajaxUpload) {
        console.error('❌ Formcycle AjaxUploadManager nicht verfügbar!');
        console.error('   Stellen Sie sicher, dass Formcycle >= 8.4.2 verwendet wird.');
        return;
    }
    console.log('✅ Formcycle AjaxUploadManager verfügbar');

    // Finde alle Upload-Felder
    const $allUploads = $('input[type="file"]');
    console.log('📎 Gefundene Upload-Felder:', $allUploads.length);

    $allUploads.each(function(index) {
        const $field = $(this);
        console.log(`  Upload-Feld #${index + 1}:`, {
            id: $field.attr('id'),
            name: $field.attr('name'),
            class: $field.attr('class')
        });
    });

    // Wähle das ZWEITE Upload-Feld
    if ($allUploads.length < 2) {
        console.error('❌ Kein zweites Upload-Feld gefunden!');
        return;
    }

    const $uploadField = $allUploads.eq(1); // Index 1 = zweites Element
    console.log('\n🎯 Verwende Upload-Feld #2:', {
        id: $uploadField.attr('id'),
        name: $uploadField.attr('name')
    });

    // ============================================
    // KONFIGURATION
    // ============================================
    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,        // 10 MB pro Datei
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,      // 100 MB gesamt
        MAX_FILES: 10,                          // Maximal 10 Dateien
        MAX_FILENAME_LENGTH: 100,               // Maximale Dateinamen-Länge
        DEBUG: true                             // Debug-Modus AN für Testing
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        console.log('[MultiUpload]', ...args);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function getTotalSize($uploadField) {
        let totalSize = 0;
        const $container = $uploadField.closest('.xm-container-upload');
        const $fileList = $container.find('.xm-upload-list-item');

        $fileList.each(function() {
            const $item = $(this);
            const sizeText = $item.find('.xm-upload-list-item-size').text();
            const match = sizeText.match(/([\d.]+)\s*(Bytes|KB|MB|GB)/);
            if (match) {
                const value = parseFloat(match[1]);
                const unit = match[2];
                const multipliers = { 'Bytes': 1, 'KB': 1024, 'MB': 1024*1024, 'GB': 1024*1024*1024 };
                totalSize += value * (multipliers[unit] || 1);
            }
        });

        return totalSize;
    }

    function getUploadedFileNames($uploadField) {
        const fileNames = [];
        const $container = $uploadField.closest('.xm-container-upload');
        const $fileList = $container.find('.xm-upload-list-item');

        $fileList.each(function() {
            const fileName = $(this).find('.xm-upload-list-item-name').text().trim();
            if (fileName) {
                fileNames.push(fileName);
            }
        });

        return fileNames;
    }

    // ============================================
    // UI COMPONENTS
    // ============================================

    function createInfoBox($uploadField) {
        const $wrapper = $uploadField.closest('.xm-container-upload');
        $wrapper.find('.multi-upload-info').remove();

        const $info = $('<div class="multi-upload-info"></div>').css({
            marginTop: '10px',
            padding: '10px',
            background: '#e7f3ff',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#666',
            border: '2px solid #2196F3'
        });

        const $sizeDisplay = $('<div class="multi-upload-size"></div>').css({
            fontWeight: '500',
            marginBottom: '5px'
        });

        const $help = $('<div class="multi-upload-help"></div>').html(
            '<strong>💡 TEST-MODUS:</strong> Multiple-Upload aktiviert! ' +
            'Sie können mehrere Dateien gleichzeitig auswählen (Strg/Cmd+Klick).'
        );

        $info.append($sizeDisplay).append($help);
        $wrapper.append($info);

        updateSizeDisplay($uploadField);
    }

    function updateSizeDisplay($uploadField) {
        const $wrapper = $uploadField.closest('.xm-container-upload');
        const $sizeDisplay = $wrapper.find('.multi-upload-size');

        if (!$sizeDisplay.length) return;

        const totalSize = getTotalSize($uploadField);
        const uploadedCount = getUploadedFileNames($uploadField).length;
        const percentUsed = (totalSize / CONFIG.MAX_TOTAL_SIZE) * 100;

        let color = '#28a745';
        if (percentUsed > 80) color = '#dc3545';
        else if (percentUsed > 60) color = '#ffc107';

        $sizeDisplay.html(
            `<span style="color: ${color}">` +
            `📦 ${uploadedCount} / ${CONFIG.MAX_FILES} Dateien | ` +
            `${formatFileSize(totalSize)} / ${formatFileSize(CONFIG.MAX_TOTAL_SIZE)}` +
            `</span>`
        );
    }

    function showProgress($uploadField, fileName, percent) {
        const $wrapper = $uploadField.closest('.xm-container-upload');
        let $progress = $wrapper.find('.multi-upload-progress');

        if (!$progress.length) {
            $progress = $('<div class="multi-upload-progress"></div>').css({
                marginTop: '10px',
                padding: '10px',
                background: '#e7f3ff',
                borderRadius: '4px',
                border: '1px solid #2196F3'
            });

            const $label = $('<div class="progress-label"></div>').css({
                fontSize: '13px',
                marginBottom: '5px',
                color: '#333'
            });

            const $barWrapper = $('<div class="progress-bar-wrapper"></div>').css({
                background: '#fff',
                borderRadius: '3px',
                overflow: 'hidden',
                height: '20px',
                position: 'relative'
            });

            const $bar = $('<div class="progress-bar"></div>').css({
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                width: '0%',
                transition: 'width 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
            });

            $barWrapper.append($bar);
            $progress.append($label).append($barWrapper);
            $wrapper.find('.multi-upload-info').before($progress);
        }

        $progress.find('.progress-label').text(`📤 ${fileName}`);
        $progress.find('.progress-bar')
            .css('width', percent + '%')
            .text(Math.round(percent) + '%');
    }

    function hideProgress($uploadField) {
        const $wrapper = $uploadField.closest('.xm-container-upload');
        $wrapper.find('.multi-upload-progress').fadeOut(300, function() {
            $(this).remove();
        });
    }

    function showError($uploadField, message) {
        const $wrapper = $uploadField.closest('.xm-container-upload');

        const $error = $('<div class="multi-upload-error"></div>').css({
            marginTop: '10px',
            padding: '10px',
            background: '#f8d7da',
            borderRadius: '4px',
            border: '1px solid #dc3545',
            color: '#721c24',
            fontSize: '13px'
        }).html(`<strong>⚠️ Fehler:</strong> ${message}`);

        $wrapper.find('.multi-upload-info').before($error);

        setTimeout(function() {
            $error.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
    }

    // ============================================
    // VALIDIERUNG
    // ============================================

    function validateFiles($uploadField, files) {
        const errors = [];
        const existingFiles = getUploadedFileNames($uploadField);
        const totalExisting = existingFiles.length;
        let totalSize = getTotalSize($uploadField);

        log('Validiere', files.length, 'Dateien');
        log('Bereits hochgeladen:', totalExisting, 'Dateien');
        log('Aktuelle Gesamtgröße:', formatFileSize(totalSize));

        if (totalExisting + files.length > CONFIG.MAX_FILES) {
            errors.push(`Maximal ${CONFIG.MAX_FILES} Dateien erlaubt (bereits ${totalExisting} hochgeladen)`);
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > CONFIG.MAX_FILE_SIZE) {
                errors.push(
                    `${file.name}: Datei zu groß (${formatFileSize(file.size)} > ${formatFileSize(CONFIG.MAX_FILE_SIZE)})`
                );
                continue;
            }

            if (file.name.length > CONFIG.MAX_FILENAME_LENGTH) {
                errors.push(
                    `${file.name}: Dateiname zu lang (${file.name.length} > ${CONFIG.MAX_FILENAME_LENGTH} Zeichen)`
                );
                continue;
            }

            if (existingFiles.includes(file.name)) {
                errors.push(`${file.name}: Datei bereits vorhanden`);
                continue;
            }

            totalSize += file.size;
        }

        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            errors.push(
                `Gesamtgröße überschritten (${formatFileSize(totalSize)} > ${formatFileSize(CONFIG.MAX_TOTAL_SIZE)})`
            );
        }

        if (errors.length > 0) {
            log('❌ Validierung fehlgeschlagen:', errors);
            return errors.join('\n');
        }

        log('✅ Validierung erfolgreich');
        return '';
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    function onUploadBegin(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        log('Upload begin:', event.fileName);
        showProgress($field, event.fileName, 0);
    }

    function onUploadProgress(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        const percent = (event.progress.loaded / event.progress.total) * 100;
        log('Upload progress:', Math.round(percent) + '%');
        showProgress($field, 'Lädt...', percent);
    }

    function onUploadSuccess(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        log('✅ Upload success:', event.item);
        hideProgress($field);
        updateSizeDisplay($field);
    }

    function onUploadError(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        log('❌ Upload error:', event.error);
        hideProgress($field);
        showError($field, 'Upload fehlgeschlagen: ' + (event.error || 'Unbekannter Fehler'));
    }

    function onFileRemove(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        log('File removed');
        updateSizeDisplay($field);
    }

    function onUploadComplete(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        log('✅ All uploads complete');
        hideProgress($field);
        updateSizeDisplay($field);
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    log('\n🚀 Initialisiere Upload-Feld...');

    // 1. HTML5 Multiple-Attribut setzen
    $uploadField.prop('multiple', true);
    log('✅ Multiple-Attribut gesetzt');

    // 2. errorFunc() für Client-side Validierung
    $uploadField.errorFunc(function() {
        const files = this.files;
        if (!files || files.length === 0) return '';

        const error = validateFiles($uploadField, files);
        if (error) {
            showError($uploadField, error);
        }
        return error;
    });
    log('✅ errorFunc registriert');

    // 3. UI-Komponenten erstellen
    createInfoBox($uploadField);
    log('✅ Info-Box erstellt');

    // 4. Event-Handler registrieren
    $.xutil.ajaxUpload.on('begin', onUploadBegin);
    $.xutil.ajaxUpload.on('progress', onUploadProgress);
    $.xutil.ajaxUpload.on('success', onUploadSuccess);
    $.xutil.ajaxUpload.on('error', onUploadError);
    $.xutil.ajaxUpload.on('remove', onFileRemove);
    $.xutil.ajaxUpload.on('complete', onUploadComplete);
    log('✅ Events registriert');

    console.log('\n==============================================');
    console.log('✅ INITIALISIERUNG ABGESCHLOSSEN!');
    console.log('==============================================');
    console.log('\n📖 ANLEITUNG:');
    console.log('1. Scrollen Sie zum zweiten Upload-Feld');
    console.log('2. Klicken Sie auf "Dateien auswählen"');
    console.log('3. Wählen Sie mehrere Dateien mit Strg/Cmd+Klick');
    console.log('4. Beobachten Sie die Console-Logs und UI-Updates');
    console.log('\n🎯 Upload-Feld ID:', $uploadField.attr('id'));
    console.log('🎯 Multiple-Attribut:', $uploadField.prop('multiple'));
    console.log('\n');

})(jQuery);
