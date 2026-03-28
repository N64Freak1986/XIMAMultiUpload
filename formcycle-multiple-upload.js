/**
 * XIMA Formcycle Multiple File Upload - CORRECTED VERSION
 *
 * FUNKTIONIERT MIT: Standard Formcycle Upload-Feld + HTML5 Multiple-Attribut
 *
 * Features:
 * - Echter Multiple-File-Upload mit HTML5 multiple-Attribut
 * - Client-side Validierung VOR dem Upload (errorFunc)
 * - Native Formcycle AjaxUploadManager Integration
 * - Progress-Tracking mit nativen Events
 * - Inkrementelles Hinzufügen von Dateien
 * - Vollständig kompatibel mit Formcycle 8.4.2
 *
 * Dependencies: jQuery, Formcycle 8.4.2+
 */

(function($) {
    'use strict';

    // ============================================
    // KONFIGURATION
    // ============================================
    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,        // 10 MB pro Datei
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,      // 100 MB gesamt
        MAX_FILES: 10,                          // Maximal 10 Dateien
        UPLOAD_SELECTOR: '.custom-upload',      // CSS-Klasse für Upload-Felder
        MAX_FILENAME_LENGTH: 100,               // Maximale Dateinamen-Länge
        DEBUG: false                            // Debug-Modus
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    /**
     * Logger-Funktion (nur aktiv wenn DEBUG = true)
     */
    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[MultiUpload]', ...args);
        }
    }

    /**
     * Formatiert Bytes in menschenlesbare Größe
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Berechnet Gesamtgröße aller hochgeladenen Dateien
     */
    function getTotalSize($uploadField) {
        let totalSize = 0;
        const $container = $uploadField.closest('.xm-container-upload');
        const $fileList = $container.find('.xm-upload-list-item');

        $fileList.each(function() {
            const $item = $(this);
            const sizeText = $item.find('.xm-upload-list-item-size').text();
            // Parse size from text like "1.5 MB"
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

    /**
     * Holt alle bereits hochgeladenen Dateinamen
     */
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

    /**
     * Erstellt Info-Box unterhalb des Upload-Feldes
     */
    function createInfoBox($uploadField) {
        const $wrapper = $uploadField.closest('.xm-container-upload');

        // Entferne alte Info-Box falls vorhanden
        $wrapper.find('.multi-upload-info').remove();

        const $info = $('<div class="multi-upload-info"></div>').css({
            marginTop: '10px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#666'
        });

        const $sizeDisplay = $('<div class="multi-upload-size"></div>').css({
            fontWeight: '500',
            marginBottom: '5px'
        });

        const $help = $('<div class="multi-upload-help"></div>').html(
            '<strong>💡 Tipp:</strong> Sie können mehrere Dateien gleichzeitig auswählen (Strg/Cmd+Klick) ' +
            'oder nacheinander hinzufügen.'
        );

        $info.append($sizeDisplay).append($help);
        $wrapper.append($info);

        updateSizeDisplay($uploadField);
    }

    /**
     * Aktualisiert Größen-Anzeige
     */
    function updateSizeDisplay($uploadField) {
        const $wrapper = $uploadField.closest('.xm-container-upload');
        const $sizeDisplay = $wrapper.find('.multi-upload-size');

        if (!$sizeDisplay.length) return;

        const totalSize = getTotalSize($uploadField);
        const uploadedCount = getUploadedFileNames($uploadField).length;
        const percentUsed = (totalSize / CONFIG.MAX_TOTAL_SIZE) * 100;

        let color = '#28a745'; // Grün
        if (percentUsed > 80) color = '#dc3545'; // Rot
        else if (percentUsed > 60) color = '#ffc107'; // Gelb

        $sizeDisplay.html(
            `<span style="color: ${color}">` +
            `📦 ${uploadedCount} / ${CONFIG.MAX_FILES} Dateien | ` +
            `${formatFileSize(totalSize)} / ${formatFileSize(CONFIG.MAX_TOTAL_SIZE)}` +
            `</span>`
        );
    }

    /**
     * Zeigt Progress-Bar für aktuellen Upload
     */
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

    /**
     * Entfernt Progress-Bar
     */
    function hideProgress($uploadField) {
        const $wrapper = $uploadField.closest('.xm-container-upload');
        $wrapper.find('.multi-upload-progress').fadeOut(300, function() {
            $(this).remove();
        });
    }

    /**
     * Zeigt Fehler-Nachricht
     */
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

    /**
     * Validiert Dateiliste VOR dem Upload
     * Wird von Formcycle's errorFunc() aufgerufen
     */
    function validateFiles($uploadField, files) {
        const errors = [];
        const existingFiles = getUploadedFileNames($uploadField);
        const totalExisting = existingFiles.length;
        let totalSize = getTotalSize($uploadField);

        log('Validiere', files.length, 'Dateien');
        log('Bereits hochgeladen:', totalExisting, 'Dateien');
        log('Aktuelle Gesamtgröße:', formatFileSize(totalSize));

        // Prüfe Anzahl
        if (totalExisting + files.length > CONFIG.MAX_FILES) {
            errors.push(`Maximal ${CONFIG.MAX_FILES} Dateien erlaubt (bereits ${totalExisting} hochgeladen)`);
        }

        // Prüfe jede Datei
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Prüfe Dateigröße
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                errors.push(
                    `${file.name}: Datei zu groß (${formatFileSize(file.size)} > ${formatFileSize(CONFIG.MAX_FILE_SIZE)})`
                );
                continue;
            }

            // Prüfe Dateiname-Länge
            if (file.name.length > CONFIG.MAX_FILENAME_LENGTH) {
                errors.push(
                    `${file.name}: Dateiname zu lang (${file.name.length} > ${CONFIG.MAX_FILENAME_LENGTH} Zeichen)`
                );
                continue;
            }

            // Prüfe Duplikate
            if (existingFiles.includes(file.name)) {
                errors.push(`${file.name}: Datei bereits vorhanden`);
                continue;
            }

            // Addiere zur Gesamtgröße
            totalSize += file.size;
        }

        // Prüfe Gesamtgröße
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            errors.push(
                `Gesamtgröße überschritten (${formatFileSize(totalSize)} > ${formatFileSize(CONFIG.MAX_TOTAL_SIZE)})`
            );
        }

        if (errors.length > 0) {
            log('Validierung fehlgeschlagen:', errors);
            return errors.join('\n');
        }

        log('Validierung erfolgreich');
        return '';
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    /**
     * Reagiert auf Upload-Start
     */
    function onUploadBegin(event) {
        const $field = $(event.field);

        // Nur für unsere Upload-Felder
        if (!$field.is(CONFIG.UPLOAD_SELECTOR)) return;

        log('Upload begin:', event.fileName);
        showProgress($field, event.fileName, 0);
    }

    /**
     * Reagiert auf Upload-Fortschritt
     */
    function onUploadProgress(event) {
        const $field = $(event.field);

        // Nur für unsere Upload-Felder
        if (!$field.is(CONFIG.UPLOAD_SELECTOR)) return;

        // Kompatibel mit FC 8.5.3+ (bytesUploaded/bytesTotal/ratio) und älteren Versionen (loaded/total)
        const percent = event.progress.ratio !== undefined
            ? event.progress.ratio * 100
            : (event.progress.loaded / event.progress.total) * 100;
        log('Upload progress:', Math.round(percent) + '%');
        showProgress($field, 'Lädt...', percent);
    }

    /**
     * Reagiert auf Upload-Erfolg
     */
    function onUploadSuccess(event) {
        const $field = $(event.field);

        // Nur für unsere Upload-Felder
        if (!$field.is(CONFIG.UPLOAD_SELECTOR)) return;

        log('Upload success:', event.item);
        hideProgress($field);
        updateSizeDisplay($field);
    }

    /**
     * Reagiert auf Upload-Fehler
     */
    function onUploadError(event) {
        const $field = $(event.field);

        // Nur für unsere Upload-Felder
        if (!$field.is(CONFIG.UPLOAD_SELECTOR)) return;

        log('Upload error:', event.error);
        hideProgress($field);
        showError($field, 'Upload fehlgeschlagen: ' + (event.error || 'Unbekannter Fehler'));
    }

    /**
     * Reagiert auf Datei-Entfernung
     */
    function onFileRemove(event) {
        const $field = $(event.field);

        // Nur für unsere Upload-Felder
        if (!$field.is(CONFIG.UPLOAD_SELECTOR)) return;

        log('File removed');
        updateSizeDisplay($field);
    }

    /**
     * Reagiert auf Upload-Complete (alle Dateien fertig)
     */
    function onUploadComplete(event) {
        const $field = $(event.field);

        // Nur für unsere Upload-Felder
        if (!$field.is(CONFIG.UPLOAD_SELECTOR)) return;

        log('All uploads complete');
        hideProgress($field);
        updateSizeDisplay($field);
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    /**
     * Initialisiert ein einzelnes Upload-Feld
     */
    function initializeUploadField($uploadField) {
        const fieldId = $uploadField.attr('id');
        log('Initialisiere Upload-Feld:', fieldId);

        // Prüfe ob bereits initialisiert
        if ($uploadField.data('multi-upload-init')) {
            log('Feld bereits initialisiert, überspringe');
            return;
        }

        // 1. HTML5 Multiple-Attribut setzen
        $uploadField.prop('multiple', true);
        log('Multiple-Attribut gesetzt');

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
        log('errorFunc registriert');

        // 3. UI-Komponenten erstellen
        createInfoBox($uploadField);
        log('Info-Box erstellt');

        // Markiere als initialisiert
        $uploadField.data('multi-upload-init', true);
        log('Initialisierung abgeschlossen');
    }

    /**
     * Initialisiert alle Upload-Felder
     */
    function initializeAllUploadFields() {
        log('Suche Upload-Felder mit Selektor:', CONFIG.UPLOAD_SELECTOR);

        const $uploadFields = $(CONFIG.UPLOAD_SELECTOR);
        log('Gefunden:', $uploadFields.length, 'Upload-Felder');

        if ($uploadFields.length === 0) {
            log('WARNUNG: Keine Upload-Felder gefunden!');
            log('Stellen Sie sicher, dass die CSS-Klasse "custom-upload" gesetzt ist.');
            return;
        }

        $uploadFields.each(function() {
            initializeUploadField($(this));
        });
    }

    /**
     * Registriert globale Event-Handler
     */
    function registerGlobalEvents() {
        // Prüfe ob AjaxUploadManager verfügbar (kompatibel mit FC 8.4.x und 8.5.3+)
        var ajaxUpload = $.xutil && ($.xutil.ajaxUpload || $.xutil.AjaxUploadManager);
        if (!ajaxUpload) {
            console.error('FEHLER: AjaxUploadManager nicht verfügbar!');
            console.error('Stellen Sie sicher, dass Formcycle >= 8.4.2 verwendet wird.');
            return;
        }

        log('Registriere globale Events');

        // FC 8.5.3+: Events über EventSource-Objekte auf AjaxUploadManager.events
        // FC 8.4.x:  Events über $.xutil.ajaxUpload.on()
        if (ajaxUpload.events) {
            // FC 8.5.3+ Event-System
            ajaxUpload.events.begin.on(onUploadBegin);
            ajaxUpload.events.progress.on(onUploadProgress);
            ajaxUpload.events.success.on(onUploadSuccess);
            ajaxUpload.events.error.on(onUploadError);
            ajaxUpload.events.remove.on(onFileRemove);
            ajaxUpload.events.complete.on(onUploadComplete);
            log('Events registriert (FC 8.5.3+ EventSource API)');
        } else if (typeof ajaxUpload.on === 'function') {
            // FC 8.4.x Legacy Event-System
            ajaxUpload.on('begin', onUploadBegin);
            ajaxUpload.on('progress', onUploadProgress);
            ajaxUpload.on('success', onUploadSuccess);
            ajaxUpload.on('error', onUploadError);
            ajaxUpload.on('remove', onFileRemove);
            ajaxUpload.on('complete', onUploadComplete);
            log('Events registriert (Legacy $.xutil.ajaxUpload API)');
        } else {
            console.error('FEHLER: Keine kompatible Event-API gefunden!');
        }
    }

    /**
     * Hauptinitialisierung
     */
    function init() {
        log('==============================================');
        log('XIMA Formcycle Multiple Upload');
        log('Version: 1.0.0');
        log('==============================================');

        registerGlobalEvents();
        initializeAllUploadFields();

        log('Initialisierung abgeschlossen');
    }

    // ============================================
    // PUBLIC API
    // ============================================

    window.FormcycleMultiUpload = {
        init: init,
        initField: function(selector) {
            const $field = $(selector);
            if ($field.length) {
                initializeUploadField($field);
            }
        },
        config: CONFIG
    };

    // ============================================
    // AUTO-INIT
    // ============================================

    // Initialisiere sobald Formcycle bereit ist
    if (window.XFC && typeof XFC.ready === 'function') {
        XFC.ready(function() {
            log('XFC.ready - starte Initialisierung');
            init();
        });
    } else {
        // Fallback: jQuery ready
        $(document).ready(function() {
            log('document.ready - starte Initialisierung');
            init();
        });
    }

})(jQuery);
