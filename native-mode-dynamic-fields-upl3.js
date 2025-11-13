/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FORMCYCLE MULTIPLE UPLOAD - DYNAMIC FIELDS (Option 1)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * DYNAMISCHE UPLOAD-FELDER - Nutzt Formcycle Native Mode
 *
 * ✅ Erstellt für jede Datei ein eigenes Upload-Feld
 * ✅ Formcycle uploaded jedes Feld separat (Auto-Upload)
 * ✅ Tracked alle Uploads im DOM
 * ✅ Add/Remove Funktionalität vor Upload
 * ✅ Nutzt Formcycle's nativen Upload-Mechanismus
 *
 * WIE ES FUNKTIONIERT:
 * 1. User wählt mehrere Dateien im Dialog
 * 2. Für JEDE Datei wird ein neues <input type="file"> erstellt
 * 3. Programmatisch wird jedes Input mit 1 Datei befüllt (DataTransfer)
 * 4. Formcycle uploaded jedes Feld automatisch
 * 5. Jedes Feld zeigt seinen Upload-Status
 *
 * TRICK: Wir "täuschen" Formcycle mit mehreren separaten Feldern!
 *
 * Version: 1.0 (Dynamic Fields)
 * Datum: 2025-01-13
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

(function() {
    'use strict';

    // ============================================
    // KONFIGURATION
    // ============================================

    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,
        MAX_FILES: 10,
        DEBUG: true
    };

    // ============================================
    // GLOBALE VARIABLEN
    // ============================================

    const $originalField = $('#xi-upl-3');
    const $container = $('#xi-upl-3-xc');

    let dynamicFields = [];  // Alle erstellten Upload-Felder
    let fieldIdCounter = 0;

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[DYNAMIC-FIELDS]', ...args);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Erstellt ein dynamisches Upload-Feld für 1 Datei
     */
    function createDynamicField(file) {
        const fieldId = `xi-upl-dynamic-${fieldIdCounter++}`;

        log('🆕 Erstelle dynamisches Feld:', fieldId, 'für', file.name);

        // Erstelle Input-Feld
        const $field = $('<input>').attr({
            type: 'file',
            id: fieldId,
            name: 'upl3',  // Gleicher name wie Original-Feld
            'data-upload-mode': 'native',
            class: 'XItem XUpload dynamic-upload-field'
        }).css({
            position: 'absolute',
            left: '-9999px',
            opacity: '0'
        });

        // Erstelle Container für dieses Feld
        const $fieldContainer = $('<div class="dynamic-field-container"></div>').attr({
            'data-field-id': fieldId
        }).css({
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '6px',
            marginBottom: '8px',
            border: '2px solid #667eea'
        });

        // UI für diese Datei
        const $ui = $('<div></div>').css({
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        $ui.html(`
            <div style="font-size:20px">📄</div>
            <div style="flex:1">
                <div style="font-weight:500;font-size:13px">${file.name}</div>
                <div style="font-size:11px;color:#666">${formatSize(file.size)}</div>
            </div>
            <div class="field-status" style="font-size:12px;color:#999">⏳ Bereit</div>
            <button type="button" class="btn-remove-field" style="background:#dc3545;border:none;color:white;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">✕</button>
        `);

        $fieldContainer.append($ui).append($field);

        // Setze File via DataTransfer API
        try {
            const dt = new DataTransfer();
            dt.items.add(file);
            $field[0].files = dt.files;
            log('✅ Datei gesetzt via DataTransfer');
        } catch (e) {
            log('❌ DataTransfer fehlgeschlagen:', e);
            return null;
        }

        // Event Handler für Remove
        $fieldContainer.find('.btn-remove-field').on('click', function() {
            removeDynamicField(fieldId);
        });

        // Speichere Referenz
        const fieldData = {
            id: fieldId,
            file: file,
            $field: $field,
            $container: $fieldContainer,
            status: 'ready',  // ready, uploading, uploaded, error
            uploaded: false
        };

        dynamicFields.push(fieldData);

        return fieldData;
    }

    /**
     * Entfernt ein dynamisches Feld
     */
    function removeDynamicField(fieldId) {
        const index = dynamicFields.findIndex(f => f.id === fieldId);
        if (index > -1) {
            const field = dynamicFields[index];

            // Nur entfernen wenn noch nicht uploaded
            if (!field.uploaded) {
                field.$container.remove();
                dynamicFields.splice(index, 1);
                log('🗑️ Feld entfernt:', fieldId);
                updateUI();
            } else {
                log('⚠️ Kann nicht entfernen - bereits hochgeladen');
            }
        }
    }

    /**
     * Fügt Dateien hinzu (erstellt dynamische Felder)
     */
    function addFiles(files) {
        const added = [];
        const rejected = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const errors = [];

            // Validierungen
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                errors.push(`Zu groß (${formatSize(file.size)})`);
            }

            if (file.size === 0) {
                errors.push('Datei ist leer');
            }

            // Duplikat-Check
            const existingNames = dynamicFields.map(f => f.file.name);
            if (existingNames.includes(file.name)) {
                errors.push('Bereits vorhanden');
            }

            // Anzahl-Check
            if (dynamicFields.length >= CONFIG.MAX_FILES) {
                errors.push('Maximum erreicht');
            }

            if (errors.length === 0) {
                const fieldData = createDynamicField(file);
                if (fieldData) {
                    added.push(file);
                } else {
                    rejected.push({ file: file, errors: ['Feld konnte nicht erstellt werden'] });
                }
            } else {
                rejected.push({ file: file, errors: errors });
            }
        }

        if (rejected.length > 0) {
            showErrors(rejected);
        }

        updateUI();
        return { added, rejected };
    }

    /**
     * Triggert Upload aller Felder
     */
    function uploadAllFields() {
        log('🚀 Triggere Upload aller Felder...');

        const readyFields = dynamicFields.filter(f => !f.uploaded && f.status === 'ready');

        if (readyFields.length === 0) {
            log('⚠️ Keine Felder zum Upload');
            return;
        }

        // Füge alle Felder ins DOM ein (macht sie "sichtbar" für Formcycle)
        readyFields.forEach(field => {
            field.status = 'uploading';
            field.$container.find('.field-status').html('⏳ Uploading...').css('color', '#ffc107');

            // Füge Field ins DOM ein (triggert Formcycle Auto-Upload)
            $container.append(field.$field);

            log('📤 Upload getriggert für:', field.file.name);
        });

        // Beobachte DOM für Upload-Status
        watchForUploads();
    }

    /**
     * Überwacht DOM für Upload-Status-Änderungen
     */
    function watchForUploads() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            const $node = $(node);

                            // Suche nach Upload-Success-Indikatoren
                            if ($node.hasClass('xm-upl-wrapper') || $node.find('.xm-upl-label').length > 0) {
                                log('🔄 Upload-Status-Änderung erkannt');

                                // Update Status der entsprechenden Felder
                                dynamicFields.forEach(field => {
                                    if (field.status === 'uploading') {
                                        // Prüfe ob Upload erfolgreich
                                        const $label = $container.find(`.xm-upl-label:contains("${field.file.name}")`);
                                        if ($label.length > 0) {
                                            field.status = 'uploaded';
                                            field.uploaded = true;
                                            field.$container.find('.field-status').html('✅ Hochgeladen').css('color', '#28a745');
                                            field.$container.find('.btn-remove-field').remove();
                                            field.$container.css('border-color', '#28a745');
                                            log('✅ Upload erfolgreich:', field.file.name);
                                        }
                                    }
                                });

                                updateUI();
                            }
                        }
                    });
                }
            });
        });

        observer.observe($container[0], {
            childList: true,
            subtree: true
        });

        log('👁️  Upload-Observer aktiv');

        // Auto-Disconnect nach 30 Sekunden
        setTimeout(() => {
            observer.disconnect();
            log('👁️  Upload-Observer beendet');
        }, 30000);
    }

    /**
     * Zeigt Fehler
     */
    function showErrors(rejected) {
        $('.multi-upload-errors').remove();

        const $errors = $('<div class="multi-upload-errors"></div>').css({
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            fontSize: '13px',
            color: '#856404'
        });

        let html = '<div style="font-weight:bold;margin-bottom:10px">⚠️ Folgende Dateien konnten nicht hinzugefügt werden:</div>';
        html += '<ul style="margin:0;padding-left:20px">';
        rejected.forEach(r => {
            html += `<li><strong>${r.file.name}:</strong> ${r.errors.join(', ')}</li>`;
        });
        html += '</ul>';

        $errors.html(html);
        $container.prepend($errors);

        setTimeout(() => $errors.fadeOut(500, () => $errors.remove()), 8000);
    }

    /**
     * Erstellt UI
     */
    function createUI() {
        // Verstecke Original-Feld
        $originalField.css({
            position: 'absolute',
            left: '-9999px',
            opacity: '0'
        });
        $('#xi-upl-3-label').css('display', 'none');

        $('.multi-upload-container').remove();

        const $ui = $('<div class="multi-upload-container"></div>');

        // Header
        const $header = $('<div class="multi-header"></div>').css({
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            gap: '10px'
        });

        const $addBtn = $('<button type="button" class="btn-add-files"></button>').css({
            flex: '1',
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#667eea'
        }).html('➕ Dateien hinzufügen');

        const $uploadBtn = $('<button type="button" class="btn-upload-all"></button>').css({
            flex: '1',
            background: '#28a745',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white'
        }).html('🚀 Upload starten');

        $header.append($addBtn).append($uploadBtn);

        // Content
        const $content = $('<div class="multi-content"></div>').css({
            background: '#fff',
            border: '2px solid #667eea',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '15px',
            minHeight: '100px'
        });

        $ui.append($header).append($content);
        $container.prepend($ui);

        // Event Handlers
        $addBtn.on('click', function() {
            $originalField.click();
        });

        $uploadBtn.on('click', function() {
            uploadAllFields();
        });

        $originalField.off('change.dynamic').on('change.dynamic', function(e) {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                log('📁 Dateien ausgewählt:', files.length);
                addFiles(files);
            }
            e.target.value = '';
        });

        updateUI();
    }

    /**
     * Updated UI
     */
    function updateUI() {
        const $content = $('.multi-content');
        if (!$content.length) return;

        const totalReady = dynamicFields.filter(f => !f.uploaded).length;
        const totalUploaded = dynamicFields.filter(f => f.uploaded).length;
        const totalSize = dynamicFields.reduce((sum, f) => sum + f.file.size, 0);

        log('🔄 Update UI:', totalReady, 'bereit,', totalUploaded, 'hochgeladen');

        let html = '';

        // Status
        html += `<div style="padding:12px;background:#f8f9fa;border-radius:6px;margin-bottom:15px">`;
        html += `<div style="font-weight:bold;margin-bottom:8px">`;
        html += `📦 ${totalReady} bereit | ✅ ${totalUploaded} hochgeladen | 📊 ${dynamicFields.length} / ${CONFIG.MAX_FILES}`;
        html += `</div>`;
        html += `<div style="font-size:12px;color:#666">`;
        html += `Gesamtgröße: ${formatSize(totalSize)} / ${formatSize(CONFIG.MAX_TOTAL_SIZE)}`;
        html += `</div>`;
        html += `</div>`;

        // Felder
        if (dynamicFields.length > 0) {
            html += `<div class="fields-list"></div>`;
            $content.html(html);

            // Füge Feld-Container hinzu
            dynamicFields.forEach(field => {
                $('.fields-list').append(field.$container);
            });
        } else {
            html += `<div style="text-align:center;color:#999;padding:30px">`;
            html += `<div style="font-size:48px;margin-bottom:10px">📭</div>`;
            html += `<div>Keine Dateien ausgewählt</div>`;
            html += `</div>`;
            $content.html(html);
        }

        // Button States
        $('.btn-upload-all').prop('disabled', totalReady === 0).css({
            background: totalReady === 0 ? '#ccc' : '#28a745',
            cursor: totalReady === 0 ? 'not-allowed' : 'pointer'
        });
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    function init() {
        console.clear();
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
        console.log('%c🚀 MULTIPLE-UPLOAD - DYNAMIC FIELDS MODE', 'color: #667eea; font-weight: bold; font-size: 16px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');

        if (typeof $ === 'undefined') {
            console.error('❌ jQuery nicht verfügbar!');
            return;
        }
        log('✅ jQuery:', $.fn.jquery);

        if (!$originalField.length) {
            console.error('❌ Upload-Feld nicht gefunden!');
            return;
        }
        log('✅ Upload-Feld gefunden');

        $originalField.prop('multiple', true);

        console.group('%c⚙️  Konfiguration', 'color: #2196F3; font-weight: bold');
        console.log('Max Dateigröße:', formatSize(CONFIG.MAX_FILE_SIZE));
        console.log('Max Gesamtgröße:', formatSize(CONFIG.MAX_TOTAL_SIZE));
        console.log('Max Anzahl:', CONFIG.MAX_FILES);
        console.log('Modus: Dynamische Felder pro Datei');
        console.groupEnd();

        createUI();

        window.multiUploadDebug = {
            fields: () => dynamicFields,
            config: CONFIG,
            uploadAll: uploadAllFields
        };

        console.log('%c✅ Initialisierung erfolgreich!', 'color: #28a745; font-weight: bold; font-size: 14px');
        console.log('%cDebug: multiUploadDebug.fields()', 'color: #999');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    }

    if (document.readyState === 'loading') {
        $(document).ready(init);
    } else {
        init();
    }

})();
