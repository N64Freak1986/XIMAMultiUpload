/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FORMCYCLE MULTIPLE UPLOAD - CUSTOM AJAX UPLOAD (Option 2)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * VOLLSTÄNDIG EIGENER UPLOAD-MECHANISMUS
 *
 * ✅ Komplette Kontrolle über den Upload-Prozess
 * ✅ Sammelt mehrere Dateien OHNE Auto-Upload
 * ✅ Uploaded jede Datei einzeln via AJAX zu Formcycle
 * ✅ Add/Remove Funktionalität
 * ✅ Progress-Tracking pro Datei
 * ✅ Validierung vor Upload
 * ✅ Bypassed Formcycle Native Mode komplett
 *
 * WIE ES FUNKTIONIERT:
 * 1. Verstecke natives Upload-Feld komplett
 * 2. Custom Button sammelt Dateien in Array
 * 3. Zeige Liste mit Add/Remove Buttons
 * 4. Bei "Hochladen": Upload jede Datei einzeln via AJAX
 * 5. Verwende Formcycle's AJAX-Upload-Endpoint
 * 6. Zeige Progress pro Datei
 *
 * Version: 1.0 (Custom AJAX Upload)
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
        UPLOAD_ENDPOINT: '/frontend-server/form/ajaxupload/',
        DEBUG: true
    };

    // ============================================
    // GLOBALE VARIABLEN
    // ============================================

    const $uploadField = $('#xi-upl-1');
    const $container = $('#xi-upl-1-xc');

    let selectedFiles = [];  // Gesammelte Dateien (noch nicht hochgeladen)
    let uploadedFiles = [];  // Erfolgreich hochgeladene Dateien
    let fileIdCounter = 0;

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[AJAX-UPLOAD]', ...args);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Fügt Dateien zur Liste hinzu (mit Validierung)
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
            const existingNames = [...selectedFiles, ...uploadedFiles].map(f => f.name);
            if (existingNames.includes(file.name)) {
                errors.push('Bereits vorhanden');
            }

            // Anzahl-Check
            if (selectedFiles.length + uploadedFiles.length >= CONFIG.MAX_FILES) {
                errors.push('Maximum erreicht');
            }

            if (errors.length === 0) {
                file._multiUploadId = fileIdCounter++;
                file._status = 'pending';  // pending, uploading, uploaded, error
                file._progress = 0;
                selectedFiles.push(file);
                added.push(file);
                log('✅ Hinzugefügt:', file.name);
            } else {
                rejected.push({ file: file, errors: errors });
                log('❌ Abgelehnt:', file.name, errors);
            }
        }

        updateUI();

        if (rejected.length > 0) {
            showErrors(rejected);
        }

        return { added, rejected };
    }

    /**
     * Entfernt eine Datei aus der Liste
     */
    function removeFile(fileId) {
        const index = selectedFiles.findIndex(f => f._multiUploadId === fileId);
        if (index > -1) {
            const removed = selectedFiles.splice(index, 1)[0];
            log('🗑️ Entfernt:', removed.name);
            updateUI();
            return true;
        }
        return false;
    }

    /**
     * Löscht alle Dateien
     */
    function clearAllFiles() {
        selectedFiles = [];
        log('🗑️ Alle Dateien gelöscht');
        updateUI();
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
     * Uploaded eine einzelne Datei via AJAX
     */
    function uploadFile(file) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fieldName', 'upl2');  // xi-upl-1 hat name="upl2"

            // Formcycle Session-Daten
            if (window.XFC_METADATA) {
                formData.append('frid', XFC_METADATA.currentSessionFRID);
            }

            log('📤 Uploade:', file.name);

            $.ajax({
                url: CONFIG.UPLOAD_ENDPOINT,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    const xhr = new XMLHttpRequest();

                    // Progress-Tracking
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            const percent = (e.loaded / e.total) * 100;
                            file._progress = percent;
                            updateFileProgress(file._multiUploadId, percent);
                        }
                    }, false);

                    return xhr;
                },
                success: function(response) {
                    log('✅ Upload erfolgreich:', file.name, response);
                    file._status = 'uploaded';
                    file._progress = 100;
                    resolve({ file: file, response: response });
                },
                error: function(xhr, status, error) {
                    log('❌ Upload fehlgeschlagen:', file.name, error);
                    file._status = 'error';
                    file._errorMessage = error || 'Unbekannter Fehler';
                    reject({ file: file, error: error });
                }
            });
        });
    }

    /**
     * Uploaded alle ausgewählten Dateien
     */
    async function uploadAllFiles() {
        if (selectedFiles.length === 0) {
            log('⚠️ Keine Dateien zum Upload');
            return;
        }

        log('🚀 Starte Upload von', selectedFiles.length, 'Datei(en)');

        // Disable Upload-Button
        $('.btn-upload-all').prop('disabled', true).css({
            background: '#ccc',
            cursor: 'not-allowed'
        });

        const results = {
            success: [],
            failed: []
        };

        // Upload jede Datei einzeln (sequenziell)
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            file._status = 'uploading';
            updateUI();

            try {
                const result = await uploadFile(file);
                results.success.push(result);

                // Verschiebe zu uploadedFiles
                uploadedFiles.push(file);
            } catch (error) {
                results.failed.push(error);
            }
        }

        // Entferne erfolgreich hochgeladene aus selectedFiles
        selectedFiles = selectedFiles.filter(f => f._status !== 'uploaded');

        log('✅ Upload abgeschlossen:', results.success.length, 'erfolgreich,', results.failed.length, 'fehlgeschlagen');

        updateUI();

        // Zeige Zusammenfassung
        showUploadSummary(results);
    }

    /**
     * Zeigt Upload-Zusammenfassung
     */
    function showUploadSummary(results) {
        $('.multi-upload-summary').remove();

        const $summary = $('<div class="multi-upload-summary"></div>').css({
            background: results.failed.length === 0 ? '#d4edda' : '#fff3cd',
            border: `2px solid ${results.failed.length === 0 ? '#28a745' : '#ffc107'}`,
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            fontSize: '14px',
            fontWeight: '500'
        });

        let html = '';
        if (results.success.length > 0) {
            html += `✅ <strong>${results.success.length} Datei(en)</strong> erfolgreich hochgeladen`;
        }
        if (results.failed.length > 0) {
            if (html) html += '<br>';
            html += `❌ <strong>${results.failed.length} Datei(en)</strong> fehlgeschlagen`;
        }

        $summary.html(html);
        $container.prepend($summary);

        setTimeout(() => $summary.fadeOut(500, () => $summary.remove()), 5000);
    }

    /**
     * Updated Progress für einzelne Datei
     */
    function updateFileProgress(fileId, percent) {
        const $progress = $(`.file-item[data-file-id="${fileId}"] .file-progress-bar`);
        if ($progress.length) {
            $progress.css('width', percent + '%');
        }

        const $percent = $(`.file-item[data-file-id="${fileId}"] .file-progress-percent`);
        if ($percent.length) {
            $percent.text(Math.round(percent) + '%');
        }
    }

    /**
     * Erstellt UI
     */
    function createUI() {
        // Verstecke natives Upload-Feld
        $uploadField.css({
            position: 'absolute',
            left: '-9999px',
            opacity: '0',
            pointerEvents: 'none'
        });
        $('#xi-upl-1-label').css('display', 'none');

        // Entferne alte UI
        $('.multi-upload-container').remove();

        const $ui = $('<div class="multi-upload-container"></div>').css({
            marginBottom: '15px'
        });

        // Header mit Buttons
        const $header = $('<div class="multi-header"></div>').css({
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
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
        }).html('📤 Alle hochladen');

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
            $uploadField.click();
        });

        $uploadBtn.on('click', function() {
            uploadAllFiles();
        });

        // File-Select Handler
        $uploadField.off('change.ajaxupload').on('change.ajaxupload', function(e) {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                log('📁 Dateien ausgewählt:', files.length);
                addFiles(files);
            }
            // Reset input
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

        const totalSelected = selectedFiles.length;
        const totalUploaded = uploadedFiles.length;
        const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0) +
                         uploadedFiles.reduce((sum, f) => sum + f.size, 0);

        log('🔄 Update UI:', totalSelected, 'ausgewählt,', totalUploaded, 'hochgeladen');

        let html = '';

        // Status-Anzeige
        html += `<div style="padding:12px;background:#f8f9fa;border-radius:6px;margin-bottom:15px">`;
        html += `<div style="font-weight:bold;margin-bottom:8px">`;
        html += `📦 ${totalSelected} ausgewählt | ✅ ${totalUploaded} hochgeladen | 📊 ${totalSelected + totalUploaded} / ${CONFIG.MAX_FILES}`;
        html += `</div>`;
        html += `<div style="font-size:12px;color:#666">`;
        html += `Gesamtgröße: ${formatSize(totalSize)} / ${formatSize(CONFIG.MAX_TOTAL_SIZE)}`;
        html += `</div>`;
        html += `</div>`;

        // Hochgeladene Dateien
        if (uploadedFiles.length > 0) {
            html += `<div style="margin-bottom:15px">`;
            html += `<div style="font-weight:bold;margin-bottom:8px;color:#28a745">✅ Hochgeladen:</div>`;
            uploadedFiles.forEach(file => {
                html += `<div style="padding:8px;background:#d4edda;border-radius:4px;margin-bottom:5px;display:flex;align-items:center;gap:10px">`;
                html += `<div>📄</div>`;
                html += `<div style="flex:1;font-size:13px">${file.name}</div>`;
                html += `<div style="font-size:11px;color:#155724">${formatSize(file.size)}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        // Ausgewählte Dateien (noch nicht hochgeladen)
        if (selectedFiles.length > 0) {
            html += `<div style="margin-bottom:15px">`;
            html += `<div style="font-weight:bold;margin-bottom:8px;color:#667eea">📋 Zum Hochladen:</div>`;

            selectedFiles.forEach(file => {
                const statusColor = file._status === 'uploading' ? '#ffc107' :
                                   file._status === 'error' ? '#dc3545' : '#667eea';

                html += `<div class="file-item" data-file-id="${file._multiUploadId}" style="padding:10px;background:#f8f9fa;border-radius:4px;margin-bottom:8px;border-left:4px solid ${statusColor}">`;
                html += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">`;
                html += `<div>📄</div>`;
                html += `<div style="flex:1">`;
                html += `<div style="font-size:13px;font-weight:500">${file.name}</div>`;
                html += `<div style="font-size:11px;color:#666">${formatSize(file.size)}</div>`;
                html += `</div>`;

                if (file._status === 'pending') {
                    html += `<button type="button" class="btn-remove-file" data-file-id="${file._multiUploadId}" style="background:#dc3545;border:none;color:white;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">✕</button>`;
                } else if (file._status === 'uploading') {
                    html += `<div style="color:#ffc107;font-size:11px">⏳ Uploading...</div>`;
                } else if (file._status === 'error') {
                    html += `<div style="color:#dc3545;font-size:11px">❌ Fehler</div>`;
                }

                html += `</div>`;

                // Progress-Bar für uploading
                if (file._status === 'uploading') {
                    html += `<div style="margin-top:5px">`;
                    html += `<div style="background:#e0e0e0;height:6px;border-radius:3px;overflow:hidden">`;
                    html += `<div class="file-progress-bar" style="width:${file._progress}%;height:100%;background:#ffc107;transition:width 0.3s"></div>`;
                    html += `</div>`;
                    html += `<div class="file-progress-percent" style="font-size:10px;color:#666;margin-top:2px">${Math.round(file._progress)}%</div>`;
                    html += `</div>`;
                }

                html += `</div>`;
            });

            html += `</div>`;

            // Clear All Button
            html += `<button type="button" class="btn-clear-all" style="background:#dc3545;border:none;color:white;padding:8px 15px;border-radius:4px;cursor:pointer;font-size:12px;width:100%">🗑️ Alle entfernen</button>`;
        } else {
            html += `<div style="text-align:center;color:#999;padding:30px">`;
            html += `<div style="font-size:48px;margin-bottom:10px">📭</div>`;
            html += `<div>Keine Dateien ausgewählt</div>`;
            html += `<div style="font-size:11px;margin-top:5px">Klicken Sie "Dateien hinzufügen"</div>`;
            html += `</div>`;
        }

        $content.html(html);

        // Event Handlers für Remove-Buttons
        $('.btn-remove-file').on('click', function() {
            const fileId = parseInt($(this).data('file-id'));
            removeFile(fileId);
        });

        $('.btn-clear-all').on('click', function() {
            if (confirm('Wirklich alle Dateien entfernen?')) {
                clearAllFiles();
            }
        });

        // Upload-Button State
        $('.btn-upload-all').prop('disabled', selectedFiles.length === 0).css({
            background: selectedFiles.length === 0 ? '#ccc' : '#28a745',
            cursor: selectedFiles.length === 0 ? 'not-allowed' : 'pointer'
        });
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    function init() {
        console.clear();
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
        console.log('%c🚀 MULTIPLE-UPLOAD - CUSTOM AJAX MODE', 'color: #667eea; font-weight: bold; font-size: 16px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');

        if (typeof $ === 'undefined') {
            console.error('❌ jQuery nicht verfügbar!');
            return;
        }
        log('✅ jQuery:', $.fn.jquery);

        if (!$uploadField.length) {
            console.error('❌ Upload-Feld nicht gefunden!');
            return;
        }
        log('✅ Upload-Feld gefunden');

        // Multiple-Attribut
        $uploadField.prop('multiple', true);

        console.group('%c⚙️  Konfiguration', 'color: #2196F3; font-weight: bold');
        console.log('Max Dateigröße:', formatSize(CONFIG.MAX_FILE_SIZE));
        console.log('Max Gesamtgröße:', formatSize(CONFIG.MAX_TOTAL_SIZE));
        console.log('Max Anzahl:', CONFIG.MAX_FILES);
        console.log('Upload-Endpoint:', CONFIG.UPLOAD_ENDPOINT);
        console.groupEnd();

        createUI();

        window.multiUploadDebug = {
            selectedFiles: () => selectedFiles,
            uploadedFiles: () => uploadedFiles,
            config: CONFIG,
            uploadAll: uploadAllFiles
        };

        console.log('%c✅ Initialisierung erfolgreich!', 'color: #28a745; font-weight: bold; font-size: 14px');
        console.log('%cDebug: multiUploadDebug.selectedFiles()', 'color: #999');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    }

    if (document.readyState === 'loading') {
        $(document).ready(init);
    } else {
        init();
    }

})();
