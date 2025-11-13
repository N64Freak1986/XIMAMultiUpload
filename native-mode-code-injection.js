/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FORMCYCLE MULTIPLE UPLOAD - CODE INJECTION (Option 4)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * MONKEY-PATCHING: Überschreibt Formcycle's getUpload() Funktion!
 * STRATEGIE: Patcht nur Felder mit CSS-Klasse 'custom-upload'
 *
 * ✅ Eleganteste Lösung - patcht Formcycle direkt
 * ✅ Nutzt Formcycle's bestehende Logik
 * ✅ KEINE Workarounds nötig
 * ✅ Funktioniert mit Native & AJAX Mode
 * ✅ Minimale Änderungen
 * ✅ Schöne UI mit Datei-Liste und Add/Remove Buttons
 * ✅ Validiert Dateityp und Dateinamen-Länge
 * ✅ Behält gültige Dateien, entfernt nur ungültige
 *
 * DAS PROBLEM (Formcycle clientscript Zeile 083-084):
 * ```javascript
 * [c.xutil.ajaxUploadManager.getUpload(F)]  // ← Array mit nur 1 Element!
 * ```
 *
 * UNSERE LÖSUNG:
 * Überschreibe getUpload() um ALLE Dateien zurückzugeben, nicht nur die erste!
 *
 * WIE ES FUNKTIONIERT:
 * 1. Warte bis Formcycle clientscript geladen ist
 * 2. Sichere Original getUpload() Funktion
 * 3. Ersetze mit Wrapper der ALLE Dateien returned
 * 4. Formcycle denkt es gibt mehrere Uploads
 * 5. Profit! 🎉
 *
 * Version: 1.0 (Code Injection)
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
        DEBUG: true,
        PATCH_DELAY: 100,  // ms zu warten bevor patchen

        // PATCH-STRATEGIE:
        // 'all' = Patcht ALLE Upload-Felder
        // 'custom-upload' = Patcht nur Felder mit CSS-Klasse 'custom-upload'
        // 'specific' = Patcht nur spezifische IDs (siehe SPECIFIC_FIELDS)
        PATCH_STRATEGY: 'custom-upload',  // 'all' | 'custom-upload' | 'specific'

        // Bei PATCH_STRATEGY='specific': Welche Feld-IDs patchen?
        SPECIFIC_FIELDS: ['xi-upl-1', 'xi-upl-2'],

        // Respektiere XFC_METADATA.limits.singleFileUpload?
        RESPECT_METADATA_LIMITS: true
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[CODE-INJECTION]', ...args);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ============================================
    // CORE PATCHING LOGIC
    // ============================================

    let originalGetUpload = null;
    let patchApplied = false;

    /**
     * Prüft ob ein Feld gepatcht werden soll
     */
    function shouldPatchField($field) {
        const fieldId = $field.attr('id');
        const fieldClasses = $field.attr('class') || '';

        switch (CONFIG.PATCH_STRATEGY) {
            case 'all':
                return {
                    patch: true,
                    reason: 'Strategie=ALL → Alle Felder werden gepatcht'
                };

            case 'custom-upload':
                const hasCustomClass = $field.hasClass('custom-upload');
                return {
                    patch: hasCustomClass,
                    reason: hasCustomClass
                        ? `Feld hat 'custom-upload' Klasse`
                        : `Feld hat KEINE 'custom-upload' Klasse (Klassen: ${fieldClasses})`
                };

            case 'specific':
                const isSpecific = CONFIG.SPECIFIC_FIELDS.includes(fieldId);
                return {
                    patch: isSpecific,
                    reason: isSpecific
                        ? `Feld-ID '${fieldId}' ist in SPECIFIC_FIELDS`
                        : `Feld-ID '${fieldId}' ist NICHT in SPECIFIC_FIELDS`
                };

            default:
                log('⚠️ Unbekannte PATCH_STRATEGY:', CONFIG.PATCH_STRATEGY);
                return {
                    patch: false,
                    reason: 'Unbekannte Strategie'
                };
        }
    }

    /**
     * Patcht Formcycle's getUpload() Funktion
     */
    function patchFormcycleUpload() {
        // Prüfe ob Formcycle AjaxUploadManager verfügbar ist
        if (!window.$ || !$.xutil || !$.xutil.ajaxUploadManager) {
            log('⚠️ $.xutil.ajaxUploadManager noch nicht verfügbar, warte...');
            return false;
        }

        const manager = $.xutil.ajaxUploadManager;

        // Prüfe ob getUpload Funktion existiert
        if (typeof manager.getUpload !== 'function') {
            log('⚠️ getUpload() Funktion nicht gefunden in ajaxUploadManager');
            return false;
        }

        // Bereits gepatcht?
        if (patchApplied) {
            log('✅ Patch bereits angewendet');
            return true;
        }

        log('🔧 Patche Formcycle ajaxUploadManager.getUpload() Funktion...');

        // Sichere Original-Funktion
        originalGetUpload = manager.getUpload;

        // Erstelle Wrapper-Funktion
        manager.getUpload = function(field) {
            log('📞 getUpload() aufgerufen für Feld:', field);

            // Original-Aufruf (gibt nur 1 Datei zurück)
            const originalResult = originalGetUpload.call(this, field);

            log('   Original-Ergebnis:', originalResult);

            // Wenn es ein jQuery-Element ist, hole das native Input-Element
            const $field = $(field);
            if (!$field.length) {
                log('   ⚠️ Feld nicht gefunden, nutze Original');
                return originalResult;
            }

            // ============================================
            // PRÜFE: Soll dieses Feld gepatcht werden?
            // ============================================

            const shouldPatch = shouldPatchField($field);
            if (!shouldPatch.patch) {
                log('   ℹ️ Feld wird NICHT gepatcht:', shouldPatch.reason);
                return originalResult;
            }

            log('   ✅ Feld wird gepatcht:', shouldPatch.reason);

            // ============================================
            // PRÜFE: XFC_METADATA.limits
            // ============================================

            if (CONFIG.RESPECT_METADATA_LIMITS && window.XFC_METADATA && XFC_METADATA.limits) {
                const limits = XFC_METADATA.limits;
                log('   📋 XFC_METADATA.limits gefunden:', limits);

                if (limits.singleFileUpload === true || limits.singleFileUpload === 'true') {
                    log('   ⚠️ singleFileUpload=true → Nutze Original (nur 1 Datei erlaubt)');
                    return originalResult;
                }

                if (limits.singleFileUpload === false || limits.singleFileUpload === 'false') {
                    log('   ✅ singleFileUpload=false → Multiple-Upload erlaubt!');
                }

                // Weitere Limits prüfen
                if (limits.maxFiles && typeof limits.maxFiles === 'number') {
                    log('   📊 maxFiles Limit:', limits.maxFiles);
                    CONFIG.MAX_FILES = limits.maxFiles;
                }

                if (limits.maxFileSize && typeof limits.maxFileSize === 'number') {
                    log('   📊 maxFileSize Limit:', limits.maxFileSize, 'bytes');
                    CONFIG.MAX_FILE_SIZE = limits.maxFileSize;
                }
            }

            // ============================================
            // HOLE ALLE DATEIEN
            // ============================================

            const inputElement = $field[0];
            if (!inputElement || !inputElement.files) {
                log('   ⚠️ Kein input.files verfügbar, nutze Original');
                return originalResult;
            }

            // Hole ALLE Dateien aus input.files
            const allFiles = Array.from(inputElement.files);

            log('   🎯 Input hat', allFiles.length, 'Datei(en)');

            if (allFiles.length === 0) {
                log('   ℹ️ Keine Dateien, nutze Original');
                return originalResult;
            }

            if (allFiles.length === 1) {
                log('   ℹ️ Nur 1 Datei, nutze Original');
                return originalResult;
            }

            // HIER IST DER TRICK! 🎉
            // Statt nur die ERSTE Datei zurückzugeben (wie Formcycle's Original),
            // geben wir ALLE Dateien zurück!

            log('   ✨ Gebe ALLE', allFiles.length, 'Dateien zurück (statt nur 1)!');

            // Erstelle Upload-Objekte für jede Datei
            const uploads = allFiles.map((file, index) => {
                return {
                    file: file,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    index: index,
                    field: field,
                    // Original Upload-Objekt-Struktur nachbilden
                    // (basierend auf was Formcycle erwartet)
                };
            });

            log('   📦 Uploads erstellt:', uploads);

            return uploads;
        };

        patchApplied = true;
        log('✅ Patch erfolgreich angewendet!');

        return true;
    }

    /**
     * Validiert Dateien vor Upload
     */
    function validateFiles(files, $field) {
        const errors = [];
        const validFiles = [];
        const invalidFiles = [];

        log('🔍 Validiere', files.length, 'Datei(en)');

        // Hole Validierungs-Einstellungen aus dem Feld
        const allowedFormats = $field.data('allowedFormats') || [];
        const maxFileNameLength = $field.data('maxFileNameLength');

        let totalSize = 0;

        // Prüfe jede Datei einzeln
        files.forEach((file, index) => {
            const fileErrors = [];

            log(`   ${index + 1}. ${file.name} (${formatSize(file.size)})`);

            // Prüfe Dateigröße
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                fileErrors.push(`Zu groß (${formatSize(file.size)})`);
            }

            if (file.size === 0) {
                fileErrors.push(`Datei ist leer`);
            }

            // Prüfe Dateinamen-Länge (inkl. Endung)
            if (maxFileNameLength && file.name.length > maxFileNameLength) {
                fileErrors.push(`Dateiname zu lang (${file.name.length} Zeichen, max ${maxFileNameLength})`);
            }

            // Prüfe Dateityp
            if (allowedFormats.length > 0) {
                const fileExt = file.name.split('.').pop().toUpperCase();
                const isAllowed = allowedFormats.some(format =>
                    format.toUpperCase() === fileExt
                );
                if (!isAllowed) {
                    fileErrors.push(`Dateityp .${fileExt} nicht erlaubt (erlaubt: ${allowedFormats.join(', ')})`);
                }
            }

            // Datei ist ungültig?
            if (fileErrors.length > 0) {
                invalidFiles.push(file);
                errors.push(`"${file.name}": ${fileErrors.join(', ')}`);
            } else {
                validFiles.push(file);
                totalSize += file.size;
            }
        });

        // Prüfe Anzahl (nur gültige Dateien)
        if (validFiles.length > CONFIG.MAX_FILES) {
            return {
                valid: false,
                allInvalid: false,
                errors: [`Maximum von ${CONFIG.MAX_FILES} Dateien überschritten (${validFiles.length} gültige Dateien)`],
                validFiles: [],
                invalidFiles: files
            };
        }

        // Prüfe Gesamtgröße (nur gültige Dateien)
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            return {
                valid: false,
                allInvalid: false,
                errors: [`Gesamtgröße zu groß: ${formatSize(totalSize)} (max ${formatSize(CONFIG.MAX_TOTAL_SIZE)})`],
                validFiles: [],
                invalidFiles: files
            };
        }

        if (errors.length > 0) {
            log('❌ Validierungsfehler für', invalidFiles.length, 'Datei(en)');
            return {
                valid: false,
                allInvalid: validFiles.length === 0,
                errors: errors,
                validFiles: validFiles,
                invalidFiles: invalidFiles
            };
        }

        log('✅ Alle Dateien gültig');
        return {
            valid: true,
            allInvalid: false,
            errors: [],
            validFiles: validFiles,
            invalidFiles: []
        };
    }

    /**
     * Fügt Validierung zu Upload-Feldern hinzu
     */
    function addValidation() {
        let $fields;

        // Finde Felder basierend auf PATCH_STRATEGY
        switch (CONFIG.PATCH_STRATEGY) {
            case 'all':
                $fields = $('input[type="file"]');
                log('📋 Füge Validierung zu ALLEN Upload-Feldern hinzu:', $fields.length);
                break;

            case 'custom-upload':
                $fields = $('input[type="file"].custom-upload');
                log('📋 Füge Validierung zu .custom-upload Feldern hinzu:', $fields.length);
                break;

            case 'specific':
                const selectors = CONFIG.SPECIFIC_FIELDS.map(id => `#${id}`).join(', ');
                $fields = $(selectors);
                log('📋 Füge Validierung zu spezifischen Feldern hinzu:', $fields.length);
                break;

            default:
                log('⚠️ Unbekannte PATCH_STRATEGY, validiere nicht');
                return;
        }

        if (!$fields || $fields.length === 0) {
            log('⚠️ Keine Upload-Felder gefunden für Validierung');
            return;
        }

        // Aktiviere multiple-Attribut und Validierung für jedes Feld
        $fields.each(function() {
            const $field = $(this);
            const fieldId = $field.attr('id') || '(keine ID)';

            // Aktiviere multiple-Attribut
            $field.prop('multiple', true);
            log('  ✅ Multiple-Attribut aktiviert für:', fieldId);

            // Change-Event für Validierung
            $field.off('change.injection').on('change.injection', function(e) {
                const files = Array.from(e.target.files || []);

                if (files.length === 0) return;

                log('📁 Dateien ausgewählt in', fieldId, ':', files.length);

                const validation = validateFiles(files, $field);

                if (!validation.valid) {
                    if (validation.allInvalid) {
                        // ALLE Dateien ungültig - leere Input komplett
                        alert('❌ Alle Dateien ungültig:\n\n' + validation.errors.join('\n'));
                        e.target.value = '';
                        log('❌ Alle Dateien entfernt (alle ungültig)');
                    } else if (validation.validFiles.length > 0) {
                        // Einige Dateien gültig, einige ungültig - behalte nur gültige
                        const message = [
                            `⚠️ ${validation.invalidFiles.length} ungültige Datei(en) wurden entfernt:`,
                            '',
                            ...validation.errors,
                            '',
                            `✅ ${validation.validFiles.length} gültige Datei(en) behalten`
                        ].join('\n');

                        alert(message);

                        // Erstelle neue FileList nur mit gültigen Dateien
                        const dt = new DataTransfer();
                        validation.validFiles.forEach(file => {
                            dt.items.add(file);
                        });
                        e.target.files = dt.files;

                        log(`✅ ${validation.validFiles.length} gültige Dateien behalten, ${validation.invalidFiles.length} ungültige entfernt`);
                    } else {
                        // Keine gültigen Dateien (z.B. zu viele oder Gesamtgröße überschritten)
                        alert('❌ Upload nicht möglich:\n\n' + validation.errors.join('\n'));
                        e.target.value = '';
                        log('❌ Alle Dateien entfernt');
                    }
                    return false;
                }

                log('✅ Alle Dateien gültig, werden hochgeladen...');
            });
        });

        log('✅ Validierung hinzugefügt zu', $fields.length, 'Feld(ern)');
    }

    /**
     * Erstellt UI mit Datei-Liste und Buttons für gepatchte Felder
     */
    function createUI() {
        let $fields;

        // Finde Felder basierend auf PATCH_STRATEGY
        switch (CONFIG.PATCH_STRATEGY) {
            case 'all':
                $fields = $('input[type="file"]');
                break;
            case 'custom-upload':
                $fields = $('input[type="file"].custom-upload');
                break;
            case 'specific':
                const selectors = CONFIG.SPECIFIC_FIELDS.map(id => `#${id}`).join(', ');
                $fields = $(selectors);
                break;
            default:
                return;
        }

        if (!$fields || $fields.length === 0) {
            log('⚠️ Keine Felder für UI gefunden');
            return;
        }

        // Erstelle UI für jedes Feld
        $fields.each(function() {
            const $field = $(this);
            const fieldId = $field.attr('id');
            const $container = $field.closest('[id$="-xc"]');

            if (!$container.length) {
                log('⚠️ Container nicht gefunden für', fieldId);
                return;
            }

            // Entferne alte UI
            $container.find('.multi-upload-ui').remove();

            // Verstecke Original-Input
            $field.css({
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                opacity: '0'
            });

            // Verstecke Formcycle-native Upload-UI-Elemente
            $container.find('.xm-upl-wrapper').hide();
            $container.find('.xm-upl-input-wrapper').hide();

            // Extrahiere Informationen aus Formcycle UI
            const allowedFormats = [];
            $container.find('.xm-upl-format-value').each(function() {
                const format = $(this).text().trim();
                if (format) allowedFormats.push(format);
            });

            const maxSizeText = $container.find('.xm-upl-size-value').text().trim();
            const titleAttr = $field.attr('title') || '';
            const acceptAttr = $field.attr('accept') || '';

            // Fallback: Nutze accept-Attribut wenn keine Formate gefunden
            if (allowedFormats.length === 0 && acceptAttr) {
                acceptAttr.split(',').forEach(ext => {
                    const clean = ext.trim().replace('.', '').toUpperCase();
                    if (clean) allowedFormats.push(clean);
                });
            }

            // Extrahiere max Dateinamen-Länge aus XM_FORM_MODEL
            let maxFileNameLength = null;
            if (window.XM_FORM_MODEL && XM_FORM_MODEL.validation && XM_FORM_MODEL.validation.fields) {
                const fieldValidation = XM_FORM_MODEL.validation.fields[fieldId];
                if (fieldValidation && fieldValidation.vmxl) {
                    maxFileNameLength = parseInt(fieldValidation.vmxl, 10);
                    log('   📏 Max Dateinamen-Länge gefunden:', maxFileNameLength);
                }
            }

            // Speichere Validierungs-Infos am Feld für später
            $field.data('allowedFormats', allowedFormats);
            $field.data('maxFileNameLength', maxFileNameLength);

            const strategyText = CONFIG.PATCH_STRATEGY === 'all' ? 'Alle Felder' :
                               CONFIG.PATCH_STRATEGY === 'custom-upload' ? 'Custom-Upload' :
                               'Spezifische Felder';

            // Erstelle UI-Container
            const $ui = $('<div class="multi-upload-ui"></div>').css({
                marginBottom: '15px'
            });

            // Info-Banner mit erweiterten Infos
            const formatInfo = allowedFormats.length > 0
                ? `Formate: ${allowedFormats.join(', ')}`
                : '';
            const sizeInfo = maxSizeText
                ? `Max pro Datei: ${maxSizeText}`
                : `${formatSize(CONFIG.MAX_FILE_SIZE)} pro Datei`;
            const fileNameLengthInfo = maxFileNameLength
                ? `Dateiname max ${maxFileNameLength} Zeichen`
                : '';

            const detailsLine = [formatInfo, sizeInfo, `Max ${CONFIG.MAX_FILES} Dateien`, fileNameLengthInfo]
                .filter(x => x)
                .join(' • ');

            const $banner = $('<div class="multi-upload-banner"></div>').css({
                padding: '12px 15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px 8px 0 0',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '13px'
            }).html(`
                <div style="margin-bottom:6px">🔧 Multiple-Upload aktiv (${strategyText})</div>
                <div style="font-size:11px;font-weight:normal;opacity:0.9">
                    ${detailsLine}
                </div>
            `);

            // Datei-Liste Container
            const $fileList = $('<div class="multi-upload-file-list"></div>').css({
                border: '2px solid #667eea',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: '15px',
                background: '#f8f9fa',
                minHeight: '60px'
            });

            const $fileListContent = $('<div class="file-list-content"></div>');
            const $emptyState = $('<div class="empty-state"></div>').css({
                textAlign: 'center',
                color: '#6c757d',
                padding: '20px 10px',
                fontSize: '14px'
            }).html('📁 Keine Dateien ausgewählt');

            $fileListContent.append($emptyState);
            $fileList.append($fileListContent);

            // Button Container
            const $buttons = $('<div class="multi-upload-buttons"></div>').css({
                marginTop: '10px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
            });

            const $btnAdd = $('<button type="button" class="btn-add-files"></button>').css({
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                flex: '1',
                minWidth: '150px'
            }).html('➕ Dateien auswählen');

            const $btnClear = $('<button type="button" class="btn-clear-all"></button>').css({
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'none'
            }).html('🗑️ Alle löschen');

            $buttons.append($btnAdd, $btnClear);

            // Stats Container
            const $stats = $('<div class="multi-upload-stats"></div>').css({
                marginTop: '10px',
                padding: '8px 12px',
                background: '#e9ecef',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#495057',
                display: 'none'
            });

            $ui.append($banner, $fileList, $buttons, $stats);
            $container.find('label').after($ui);

            // Setup Event-Handlers
            setupUIHandlers($field, $fileListContent, $emptyState, $btnClear, $stats);

            log('✅ UI erstellt für:', fieldId);
        });
    }

    /**
     * Setup Event-Handler für UI
     */
    function setupUIHandlers($field, $fileListContent, $emptyState, $btnClear, $stats) {
        const fieldId = $field.attr('id');
        const $container = $field.closest('[id$="-xc"]');
        const $ui = $container.find('.multi-upload-ui');

        // "Dateien auswählen" Button
        $ui.find('.btn-add-files').on('click', function() {
            $field.trigger('click');
        });

        // "Alle löschen" Button
        $btnClear.on('click', function() {
            if (confirm('Alle Dateien löschen?')) {
                $field.val('');
                updateFileList($field, $fileListContent, $emptyState, $btnClear, $stats);
                log('🗑️ Alle Dateien gelöscht');
            }
        });

        // File-Change Handler
        $field.on('change', function() {
            updateFileList($field, $fileListContent, $emptyState, $btnClear, $stats);
        });

        // Initial Update
        updateFileList($field, $fileListContent, $emptyState, $btnClear, $stats);
    }

    /**
     * Aktualisiert die Datei-Liste im UI
     */
    function updateFileList($field, $fileListContent, $emptyState, $btnClear, $stats) {
        const files = Array.from($field[0].files || []);

        log('🔄 Aktualisiere UI:', files.length, 'Dateien');

        $fileListContent.empty();

        if (files.length === 0) {
            $fileListContent.append($emptyState);
            $btnClear.hide();
            $stats.hide();
            return;
        }

        // Zeige Dateien
        let totalSize = 0;
        files.forEach((file, index) => {
            totalSize += file.size;

            const $fileItem = $('<div class="file-item"></div>').css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                marginBottom: '8px',
                background: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '6px'
            });

            const $fileInfo = $('<div class="file-info"></div>').css({
                flex: '1',
                minWidth: '0'
            });

            const $fileName = $('<div class="file-name"></div>').css({
                fontWeight: 'bold',
                fontSize: '13px',
                color: '#212529',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }).text(file.name);

            const $fileSize = $('<div class="file-size"></div>').css({
                fontSize: '12px',
                color: '#6c757d',
                marginTop: '2px'
            }).text(formatSize(file.size));

            $fileInfo.append($fileName, $fileSize);

            const $btnRemove = $('<button type="button" class="btn-remove"></button>').css({
                padding: '6px 12px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginLeft: '10px'
            }).html('✕').attr('title', 'Datei entfernen');

            // Remove-Handler
            $btnRemove.on('click', function() {
                removeFile($field, index, $fileListContent, $emptyState, $btnClear, $stats);
            });

            $fileItem.append($fileInfo, $btnRemove);
            $fileListContent.append($fileItem);
        });

        // Zeige Stats
        $stats.html(`
            📊 <strong>${files.length}</strong> Datei(en) •
            <strong>${formatSize(totalSize)}</strong> gesamt •
            Noch <strong>${CONFIG.MAX_FILES - files.length}</strong> erlaubt
        `).show();

        $btnClear.show();
    }

    /**
     * Entfernt eine einzelne Datei
     */
    function removeFile($field, indexToRemove, $fileListContent, $emptyState, $btnClear, $stats) {
        const files = Array.from($field[0].files || []);

        log('🗑️ Entferne Datei:', indexToRemove, files[indexToRemove].name);

        // Erstelle neue FileList ohne die zu entfernende Datei
        const dt = new DataTransfer();
        files.forEach((file, index) => {
            if (index !== indexToRemove) {
                dt.items.add(file);
            }
        });

        $field[0].files = dt.files;
        updateFileList($field, $fileListContent, $emptyState, $btnClear, $stats);
    }

    /**
     * Versucht zu patchen (mit Retry)
     */
    function tryPatch(attempt = 1, maxAttempts = 10) {
        log(`🔄 Patch-Versuch ${attempt}/${maxAttempts}...`);

        if (patchFormcycleUpload()) {
            log('✅ Patch erfolgreich!');
            addValidation();
            createUI();
            return;
        }

        if (attempt < maxAttempts) {
            setTimeout(() => {
                tryPatch(attempt + 1, maxAttempts);
            }, CONFIG.PATCH_DELAY * attempt); // Exponentieller Backoff
        } else {
            log('❌ Patch fehlgeschlagen nach', maxAttempts, 'Versuchen');
            console.error('Code-Injection fehlgeschlagen: Formcycle AjaxUploadManager nicht verfügbar');
        }
    }

    // ============================================
    // EVENT HOOKS (Optional - für bessere Integration)
    // ============================================

    /**
     * Überwacht AJAX Upload Events
     */
    function hookUploadEvents() {
        if (!$.xutil || !$.xutil.ajaxUploadManager) return;

        const manager = $.xutil.ajaxUploadManager;

        // Prüfe ob Event-System verfügbar ist
        if (typeof manager.on !== 'function') {
            log('ℹ️ ajaxUploadManager hat kein Event-System (.on() nicht verfügbar)');
            return;
        }

        // Hook in 'begin' Event
        manager.on('begin', function(event) {
            log('📤 Upload gestartet:', event.fileName);
        });

        // Hook in 'success' Event
        manager.on('success', function(event) {
            log('✅ Upload erfolgreich:', event.fileName);
        });

        // Hook in 'error' Event
        manager.on('error', function(event) {
            log('❌ Upload fehlgeschlagen:', event.fileName, event.error);
        });

        // Hook in 'complete' Event
        manager.on('complete', function(event) {
            log('🎉 Alle Uploads abgeschlossen');
        });

        log('👂 Event-Hooks registriert');
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    function init() {
        console.clear();
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
        console.log('%c🔧 MULTIPLE-UPLOAD - CODE INJECTION MODE', 'color: #667eea; font-weight: bold; font-size: 16px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');

        if (typeof $ === 'undefined') {
            console.error('❌ jQuery nicht verfügbar!');
            return;
        }
        log('✅ jQuery:', $.fn.jquery);

        console.group('%c⚙️  Konfiguration', 'color: #2196F3; font-weight: bold');
        console.log('Max Dateigröße:', formatSize(CONFIG.MAX_FILE_SIZE));
        console.log('Max Gesamtgröße:', formatSize(CONFIG.MAX_TOTAL_SIZE));
        console.log('Max Anzahl:', CONFIG.MAX_FILES);
        console.log('Modus: Code Injection (Monkey Patching)');
        console.log('');
        console.log('Patch-Strategie:', CONFIG.PATCH_STRATEGY);
        if (CONFIG.PATCH_STRATEGY === 'custom-upload') {
            console.log('  → Patcht nur Felder mit CSS-Klasse "custom-upload"');
        } else if (CONFIG.PATCH_STRATEGY === 'specific') {
            console.log('  → Patcht nur:', CONFIG.SPECIFIC_FIELDS.join(', '));
        } else if (CONFIG.PATCH_STRATEGY === 'all') {
            console.log('  → Patcht ALLE Upload-Felder');
        }
        console.log('Respektiere XFC_METADATA.limits:', CONFIG.RESPECT_METADATA_LIMITS);

        // Zeige XFC_METADATA.limits wenn verfügbar
        if (window.XFC_METADATA && XFC_METADATA.limits) {
            console.log('');
            console.log('XFC_METADATA.limits gefunden:');
            console.log('  singleFileUpload:', XFC_METADATA.limits.singleFileUpload);
            if (XFC_METADATA.limits.maxFiles) {
                console.log('  maxFiles:', XFC_METADATA.limits.maxFiles);
            }
            if (XFC_METADATA.limits.maxFileSize) {
                console.log('  maxFileSize:', formatSize(XFC_METADATA.limits.maxFileSize));
            }
        }

        console.groupEnd();

        // Starte Patch-Versuche
        tryPatch();

        // Hook Events (nach erfolgreichem Patch)
        setTimeout(() => {
            if (patchApplied) {
                hookUploadEvents();
            }
        }, 1000);

        // Debug-Helper
        window.multiUploadDebug = {
            patchApplied: () => patchApplied,
            originalGetUpload: () => originalGetUpload,
            testGetUpload: function() {
                const $field = $('#xi-upl-1');
                if (!$field.length) {
                    console.error('Upload-Feld nicht gefunden');
                    return;
                }
                if (!$.xutil || !$.xutil.ajaxUploadManager) {
                    console.error('AjaxUploadManager nicht verfügbar');
                    return;
                }
                const result = $.xutil.ajaxUploadManager.getUpload($field[0]);
                console.log('getUpload() Ergebnis:', result);
                return result;
            },
            config: CONFIG
        };

        console.log('%c✅ Initialisierung abgeschlossen!', 'color: #28a745; font-weight: bold; font-size: 14px');
        console.log('%cWarte auf Formcycle AjaxUploadManager...', 'color: #999');
        console.log('%cDebug: multiUploadDebug.testGetUpload()', 'color: #999');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    }

    // Warte auf DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
