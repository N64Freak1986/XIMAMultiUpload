/**
 * TEST-SCRIPT FÜR UPLOAD-FELD: xi-upl-1
 *
 * ANLEITUNG:
 * 1. Öffnen Sie: https://formulare.kempten.de/frontend-server/form/provide/10056/
 * 2. Drücken Sie F12 (Browser-Console öffnen)
 * 3. Kopieren Sie diesen GESAMTEN Code
 * 4. Fügen Sie ihn in die Console ein
 * 5. Drücken Sie Enter
 * 6. Testen Sie das Multiple-Upload!
 */

(function($) {
    'use strict';

    console.clear();
    console.log('%c==============================================', 'color: #667eea; font-weight: bold; font-size: 16px');
    console.log('%c🚀 XIMA Multiple Upload - TEST', 'color: #667eea; font-weight: bold; font-size: 16px');
    console.log('%c   Upload-Feld: xi-upl-1', 'color: #667eea; font-size: 14px');
    console.log('%c==============================================', 'color: #667eea; font-weight: bold; font-size: 16px');

    // ============================================
    // PRÜFUNGEN
    // ============================================

    // jQuery Check
    if (typeof $ === 'undefined' || !$) {
        console.error('❌ jQuery nicht verfügbar!');
        return;
    }
    console.log('✅ jQuery verfügbar:', $.fn.jquery);

    // Formcycle AjaxUploadManager Check
    if (!$.xutil || !$.xutil.ajaxUpload) {
        console.error('❌ Formcycle AjaxUploadManager nicht verfügbar!');
        console.error('   Benötigt Formcycle >= 8.4.2');
        return;
    }
    console.log('✅ Formcycle AjaxUploadManager verfügbar');

    // Upload-Feld finden
    const $uploadField = $('#xi-upl-1');
    if ($uploadField.length === 0) {
        console.error('❌ Upload-Feld mit ID "xi-upl-1" nicht gefunden!');
        console.error('   Verfügbare Upload-Felder:');
        $('input[type="file"]').each(function(i) {
            console.log(`     ${i + 1}. ID: ${$(this).attr('id')}, Name: ${$(this).attr('name')}`);
        });
        return;
    }
    console.log('✅ Upload-Feld gefunden:', {
        id: $uploadField.attr('id'),
        name: $uploadField.attr('name'),
        class: $uploadField.attr('class')
    });

    // ============================================
    // KONFIGURATION
    // ============================================
    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,        // 10 MB
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,      // 100 MB
        MAX_FILES: 10,                           // Max 10 Dateien
        MAX_FILENAME_LENGTH: 100,                // Max 100 Zeichen
        DEBUG: true                              // Debug aktiviert
    };

    console.log('⚙️  Konfiguration:', {
        'Max Dateigröße': formatFileSize(CONFIG.MAX_FILE_SIZE),
        'Max Gesamtgröße': formatFileSize(CONFIG.MAX_TOTAL_SIZE),
        'Max Anzahl': CONFIG.MAX_FILES,
        'Debug': CONFIG.DEBUG
    });

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        console.log('%c[MultiUpload]', 'color: #2196F3; font-weight: bold', ...args);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function getTotalSize() {
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

    function getUploadedFileNames() {
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

    function createInfoBox() {
        const $container = $uploadField.closest('.xm-container-upload');
        $container.find('.multi-upload-info').remove();

        const $info = $('<div class="multi-upload-info"></div>').css({
            marginTop: '15px',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '2px solid #5568d3'
        });

        const $header = $('<div style="font-weight: bold; margin-bottom: 8px; font-size: 15px;">🎯 Multiple-Upload AKTIVIERT</div>');

        const $sizeDisplay = $('<div class="multi-upload-size"></div>').css({
            fontWeight: '500',
            marginBottom: '8px',
            fontSize: '14px'
        });

        const $help = $('<div class="multi-upload-help"></div>').css({
            fontSize: '13px',
            opacity: '0.95'
        }).html(
            '💡 <strong>Tipp:</strong> Sie können jetzt mehrere Dateien gleichzeitig auswählen!<br>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Windows/Linux: <strong>Strg+Klick</strong> | Mac: <strong>Cmd+Klick</strong>'
        );

        $info.append($header).append($sizeDisplay).append($help);
        $container.append($info);

        updateSizeDisplay();
    }

    function updateSizeDisplay() {
        const $container = $uploadField.closest('.xm-container-upload');
        const $sizeDisplay = $container.find('.multi-upload-size');

        if (!$sizeDisplay.length) return;

        const totalSize = getTotalSize();
        const uploadedCount = getUploadedFileNames().length;
        const percentUsed = (totalSize / CONFIG.MAX_TOTAL_SIZE) * 100;

        let emoji = '📦';
        let colorStyle = '';
        if (percentUsed > 80) {
            emoji = '🔴';
            colorStyle = 'background: rgba(255,255,255,0.2); padding: 3px 6px; border-radius: 4px;';
        } else if (percentUsed > 60) {
            emoji = '🟡';
            colorStyle = 'background: rgba(255,255,255,0.15); padding: 3px 6px; border-radius: 4px;';
        }

        $sizeDisplay.html(
            `<span style="${colorStyle}">` +
            `${emoji} <strong>${uploadedCount} / ${CONFIG.MAX_FILES}</strong> Dateien | ` +
            `<strong>${formatFileSize(totalSize)}</strong> / ${formatFileSize(CONFIG.MAX_TOTAL_SIZE)}` +
            `</span>`
        );
    }

    function showProgress(fileName, percent) {
        const $container = $uploadField.closest('.xm-container-upload');
        let $progress = $container.find('.multi-upload-progress');

        if (!$progress.length) {
            $progress = $('<div class="multi-upload-progress"></div>').css({
                marginTop: '12px',
                padding: '12px',
                background: 'white',
                borderRadius: '6px',
                border: '2px solid #2196F3',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            });

            const $label = $('<div class="progress-label"></div>').css({
                fontSize: '13px',
                marginBottom: '8px',
                color: '#333',
                fontWeight: '500'
            });

            const $barWrapper = $('<div class="progress-bar-wrapper"></div>').css({
                background: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden',
                height: '24px',
                position: 'relative'
            });

            const $bar = $('<div class="progress-bar"></div>').css({
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                width: '0%',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            });

            $barWrapper.append($bar);
            $progress.append($label).append($barWrapper);
            $container.find('.multi-upload-info').before($progress);
        }

        const shortName = fileName.length > 40 ? fileName.substr(0, 37) + '...' : fileName;
        $progress.find('.progress-label').text(`📤 ${shortName}`);
        $progress.find('.progress-bar')
            .css('width', percent + '%')
            .text(Math.round(percent) + '%');
    }

    function hideProgress() {
        const $container = $uploadField.closest('.xm-container-upload');
        $container.find('.multi-upload-progress').fadeOut(400, function() {
            $(this).remove();
        });
    }

    function showError(message) {
        const $container = $uploadField.closest('.xm-container-upload');

        // Entferne alte Fehler
        $container.find('.multi-upload-error').remove();

        const $error = $('<div class="multi-upload-error"></div>').css({
            marginTop: '12px',
            padding: '12px 15px',
            background: '#fff3cd',
            borderRadius: '6px',
            border: '2px solid #ffc107',
            color: '#856404',
            fontSize: '13px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }).html(`<strong>⚠️ Validierungsfehler:</strong><br>${message.replace(/\n/g, '<br>')}`);

        $container.find('.multi-upload-info').before($error);

        setTimeout(function() {
            $error.fadeOut(400, function() {
                $(this).remove();
            });
        }, 6000);
    }

    function showSuccess(message) {
        const $container = $uploadField.closest('.xm-container-upload');

        const $success = $('<div class="multi-upload-success"></div>').css({
            marginTop: '12px',
            padding: '12px 15px',
            background: '#d4edda',
            borderRadius: '6px',
            border: '2px solid #28a745',
            color: '#155724',
            fontSize: '13px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }).html(`<strong>✅ ${message}</strong>`);

        $container.find('.multi-upload-info').before($success);

        setTimeout(function() {
            $success.fadeOut(400, function() {
                $(this).remove();
            });
        }, 3000);
    }

    // ============================================
    // VALIDIERUNG
    // ============================================

    function validateFiles(files) {
        const errors = [];
        const existingFiles = getUploadedFileNames();
        const totalExisting = existingFiles.length;
        let totalSize = getTotalSize();

        log('📋 Validiere', files.length, 'Datei(en)');
        log('   Bereits hochgeladen:', totalExisting, 'Datei(en)');
        log('   Aktuelle Größe:', formatFileSize(totalSize));

        // Prüfe Anzahl
        if (totalExisting + files.length > CONFIG.MAX_FILES) {
            errors.push(`🔢 Maximal ${CONFIG.MAX_FILES} Dateien erlaubt (bereits ${totalExisting} vorhanden)`);
        }

        // Prüfe jede Datei
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            log(`   📄 Datei ${i + 1}: ${file.name} (${formatFileSize(file.size)})`);

            // Dateigröße
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                errors.push(`📏 "${file.name}": Zu groß (${formatFileSize(file.size)} > ${formatFileSize(CONFIG.MAX_FILE_SIZE)})`);
                continue;
            }

            // Dateiname-Länge
            if (file.name.length > CONFIG.MAX_FILENAME_LENGTH) {
                errors.push(`📝 "${file.name}": Name zu lang (${file.name.length} > ${CONFIG.MAX_FILENAME_LENGTH} Zeichen)`);
                continue;
            }

            // Duplikate
            if (existingFiles.includes(file.name)) {
                errors.push(`🔄 "${file.name}": Bereits vorhanden`);
                continue;
            }

            totalSize += file.size;
        }

        // Gesamtgröße
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            errors.push(`📦 Gesamtgröße überschritten: ${formatFileSize(totalSize)} > ${formatFileSize(CONFIG.MAX_TOTAL_SIZE)}`);
        }

        if (errors.length > 0) {
            log('❌ Validierung fehlgeschlagen:', errors.length, 'Fehler');
            errors.forEach(err => log('   ', err));
            return errors.join('\n');
        }

        log('✅ Validierung erfolgreich - Upload kann starten');
        return '';
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    let currentUploadCount = 0;
    let totalUploadCount = 0;

    function onUploadBegin(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        totalUploadCount++;
        currentUploadCount++;
        log('📤 Upload #' + totalUploadCount + ' startet:', event.fileName);
        showProgress(event.fileName, 0);
    }

    function onUploadProgress(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        const percent = (event.progress.loaded / event.progress.total) * 100;
        log('⏳ Upload-Fortschritt:', Math.round(percent) + '%');
        showProgress(event.fileName || 'Lädt...', percent);
    }

    function onUploadSuccess(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        currentUploadCount--;
        log('✅ Upload erfolgreich:', event.item.fileName || event.item.name);

        if (currentUploadCount === 0) {
            hideProgress();
            showSuccess('Alle Dateien erfolgreich hochgeladen!');
        }

        updateSizeDisplay();
    }

    function onUploadError(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        currentUploadCount--;
        log('❌ Upload fehlgeschlagen:', event.error);
        hideProgress();
        showError('Upload fehlgeschlagen: ' + (event.error || 'Unbekannter Fehler'));
    }

    function onFileRemove(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        log('🗑️  Datei entfernt');
        updateSizeDisplay();
    }

    function onUploadComplete(event) {
        const $field = $(event.field);
        if ($field[0] !== $uploadField[0]) return;

        log('🎉 Alle Uploads abgeschlossen');
        hideProgress();
        updateSizeDisplay();
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    console.log('\n%c⚙️  INITIALISIERUNG', 'color: #ff9800; font-weight: bold; font-size: 14px');

    // 1. Multiple-Attribut setzen
    const alreadyMultiple = $uploadField.prop('multiple');
    $uploadField.prop('multiple', true);
    if (alreadyMultiple) {
        log('ℹ️  Multiple-Attribut war bereits gesetzt');
    } else {
        log('✅ Multiple-Attribut gesetzt');
    }

    // 2. errorFunc() registrieren
    $uploadField.errorFunc(function() {
        const files = this.files;
        if (!files || files.length === 0) return '';

        const error = validateFiles(files);
        if (error) {
            showError(error);
        }
        return error;
    });
    log('✅ errorFunc() registriert (Client-side Validierung)');

    // 3. UI erstellen
    createInfoBox();
    log('✅ Info-Box erstellt');

    // 4. Events registrieren
    $.xutil.ajaxUpload.on('begin', onUploadBegin);
    $.xutil.ajaxUpload.on('progress', onUploadProgress);
    $.xutil.ajaxUpload.on('success', onUploadSuccess);
    $.xutil.ajaxUpload.on('error', onUploadError);
    $.xutil.ajaxUpload.on('remove', onFileRemove);
    $.xutil.ajaxUpload.on('complete', onUploadComplete);
    log('✅ Event-Handler registriert');

    // ============================================
    // FERTIG
    // ============================================

    console.log('\n%c==============================================', 'color: #28a745; font-weight: bold; font-size: 16px');
    console.log('%c✅ INITIALISIERUNG ERFOLGREICH!', 'color: #28a745; font-weight: bold; font-size: 16px');
    console.log('%c==============================================', 'color: #28a745; font-weight: bold; font-size: 16px');

    console.log('\n%c📖 SO GEHT ES WEITER:', 'color: #2196F3; font-weight: bold; font-size: 14px');
    console.log('%c1️⃣  Scrollen Sie zum Upload-Feld "xi-upl-1"', 'color: #666');
    console.log('%c2️⃣  Sie sehen eine lila Info-Box mit "Multiple-Upload AKTIVIERT"', 'color: #666');
    console.log('%c3️⃣  Klicken Sie auf "Dateien auswählen"', 'color: #666');
    console.log('%c4️⃣  Wählen Sie MEHRERE Dateien:', 'color: #666');
    console.log('%c    • Windows/Linux: Strg + Klick', 'color: #999');
    console.log('%c    • Mac: Cmd + Klick', 'color: #999');
    console.log('%c5️⃣  Beobachten Sie die Console und die UI-Updates!', 'color: #666');

    console.log('\n%c🎯 Upload-Feld:', 'color: #667eea; font-weight: bold');
    console.log('   ID:', $uploadField.attr('id'));
    console.log('   Name:', $uploadField.attr('name'));
    console.log('   Multiple:', $uploadField.prop('multiple'));

    console.log('\n%c⚙️  Limits:', 'color: #667eea; font-weight: bold');
    console.log('   Max Dateigröße:', formatFileSize(CONFIG.MAX_FILE_SIZE));
    console.log('   Max Gesamtgröße:', formatFileSize(CONFIG.MAX_TOTAL_SIZE));
    console.log('   Max Anzahl Dateien:', CONFIG.MAX_FILES);

    console.log('\n%c💡 Alle Console-Logs beginnen mit [MultiUpload]', 'color: #999; font-style: italic');
    console.log('\n');

})(jQuery);
