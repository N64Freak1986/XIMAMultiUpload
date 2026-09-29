/**
 * FORMCYCLE MULTIPLE UPLOAD - COMPLETE VERSION
 *
 * Features:
 * - Multiple File Selection
 * - Einzelne Dateien entfernen (X-Button)
 * - Weitere Dateien hinzufügen
 * - Live-Update der Dateiliste
 * - Gesamtgröße-Anzeige
 * - Validierung vor Upload
 */

(function($) {
    'use strict';

    console.clear();
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    console.log('%c🚀 FORMCYCLE MULTIPLE UPLOAD - COMPLETE', 'color: #667eea; font-weight: bold; font-size: 16px');
    console.log('%c   Mit Hinzufügen/Entfernen von Dateien', 'color: #667eea; font-size: 14px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    console.log('');

    if (!$ || !$('#xi-upl-1').length) {
        console.error('❌ jQuery oder Upload-Feld nicht gefunden!');
        return;
    }

    const $uploadField = $('#xi-upl-1');
    console.log('✅ jQuery:', $.fn.jquery);
    console.log('✅ Upload-Feld:', $uploadField.attr('id'));
    console.log('');

    // ============================================
    // KONFIGURATION
    // ============================================
    const CONFIG = {
        MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10 MB
        MAX_TOTAL_SIZE: 100 * 1024 * 1024,    // 100 MB
        MAX_FILES: 10,
        DEBUG: true
    };

    console.log('⚙️  Konfiguration:');
    console.log('   Max Dateigröße:', (CONFIG.MAX_FILE_SIZE / (1024*1024)).toFixed(0), 'MB');
    console.log('   Max Gesamtgröße:', (CONFIG.MAX_TOTAL_SIZE / (1024*1024)).toFixed(0), 'MB');
    console.log('   Max Anzahl:', CONFIG.MAX_FILES);
    console.log('');

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let selectedFiles = []; // Array von File-Objekten
    let fileIdCounter = 0;

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

    function getExistingUploadedFiles() {
        const names = [];
        const $container = $('#xi-upl-1-xc');

        $container.find('.xm-upl-wrapper .xm-upl-label').each(function() {
            const text = $(this).text().trim();
            if (text &&
                !text.toLowerCase().includes('ausgewählt') &&
                !text.toLowerCase().includes('selected')) {
                names.push(text);
            }
        });

        return names;
    }

    function getTotalSize() {
        return selectedFiles.reduce((sum, f) => sum + f.size, 0);
    }

    // ============================================
    // FILE MANAGEMENT
    // ============================================

    function addFiles(files) {
        const existingUploaded = getExistingUploadedFiles();
        const existingSelected = selectedFiles.map(f => f.name);
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
            if (existingUploaded.includes(file.name)) {
                errors.push('Bereits hochgeladen');
            }
            if (existingSelected.includes(file.name)) {
                errors.push('Bereits ausgewählt');
            }
            if (selectedFiles.length >= CONFIG.MAX_FILES) {
                errors.push(`Max ${CONFIG.MAX_FILES} Dateien`);
            }

            if (errors.length === 0) {
                // Füge interne ID hinzu
                file._multiUploadId = fileIdCounter++;
                selectedFiles.push(file);
                added.push(file);
            } else {
                rejected.push({ file: file, errors: errors });
            }
        }

        // Prüfe Gesamtgröße
        const totalSize = getTotalSize();
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            log('⚠️  Gesamtgröße überschritten:', formatSize(totalSize));
        }

        if (added.length > 0) {
            log('✅ Hinzugefügt:', added.length, 'Datei(en)');
            added.forEach(f => log(`   + ${f.name} (${formatSize(f.size)})`));
        }

        if (rejected.length > 0) {
            log('❌ Abgelehnt:', rejected.length, 'Datei(en)');
            rejected.forEach(r => log(`   - ${r.file.name}: ${r.errors.join(', ')}`));
        }

        updateFileInput();
        updateUI();

        return { added, rejected };
    }

    function removeFile(fileId) {
        const index = selectedFiles.findIndex(f => f._multiUploadId === fileId);
        if (index > -1) {
            const removed = selectedFiles.splice(index, 1)[0];
            log('🗑️  Entfernt:', removed.name);
            updateFileInput();
            updateUI();
            return true;
        }
        return false;
    }

    function clearAllFiles() {
        selectedFiles = [];
        updateFileInput();
        updateUI();
        log('🗑️  Alle Dateien entfernt');
    }

    function updateFileInput() {
        // Aktualisiere das Input-Element mit DataTransfer API
        try {
            const dt = new DataTransfer();
            selectedFiles.forEach(file => {
                dt.items.add(file);
            });
            $uploadField[0].files = dt.files;
            log('📝 FileInput aktualisiert:', selectedFiles.length, 'Datei(en)');
        } catch (e) {
            log('⚠️  DataTransfer API nicht verfügbar:', e.message);
        }
    }

    // ============================================
    // UI COMPONENTS
    // ============================================

    function createUI() {
        const $container = $('#xi-upl-1-xc');
        $container.find('.multi-complete-ui').remove();

        const $ui = $('<div class="multi-complete-ui"></div>').css({
            marginTop: '15px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });

        // Header mit "Weitere hinzufügen" Button
        const $header = $('<div class="multi-header"></div>').css({
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px 8px 0 0',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        });

        $header.html(
            '<div>🎯 Multiple-Upload <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:3px;font-size:12px">AKTIV</span></div>' +
            '<button type="button" class="btn-add-more" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);color:white;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:500">➕ Weitere hinzufügen</button>'
        );

        // Status Bar mit Gesamtgröße
        const $status = $('<div class="multi-status"></div>').css({
            padding: '12px 15px',
            background: '#f8f9fa',
            borderLeft: '2px solid #667eea',
            borderRight: '2px solid #667eea',
            fontSize: '13px'
        });

        // Dateiliste
        const $fileList = $('<div class="multi-file-list"></div>').css({
            maxHeight: '300px',
            overflowY: 'auto',
            borderLeft: '2px solid #667eea',
            borderRight: '2px solid #667eea',
            background: '#fff'
        });

        // Footer
        const $footer = $('<div class="multi-footer"></div>').css({
            padding: '12px 15px',
            background: '#e7f3ff',
            borderRadius: '0 0 8px 8px',
            borderLeft: '2px solid #667eea',
            borderRight: '2px solid #667eea',
            borderBottom: '2px solid #667eea',
            fontSize: '12px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        });

        $footer.html(
            '<div>💡 <strong>Tipp:</strong> Strg/Cmd+Klick für mehrere Dateien</div>' +
            '<button type="button" class="btn-clear-all" style="background:#dc3545;border:none;color:white;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:500">🗑️ Alle löschen</button>'
        );

        $ui.append($header).append($status).append($fileList).append($footer);
        $container.append($ui);

        // Event Handlers
        $header.find('.btn-add-more').on('click', function() {
            $uploadField.click();
        });

        $footer.find('.btn-clear-all').on('click', function() {
            if (confirm(`Wirklich alle ${selectedFiles.length} Datei(en) entfernen?`)) {
                clearAllFiles();
            }
        });

        updateUI();
    }

    function updateUI() {
        const $status = $('.multi-status');
        const $fileList = $('.multi-file-list');

        if (!$status.length || !$fileList.length) return;

        // Update Status
        const totalSize = getTotalSize();
        const count = selectedFiles.length;
        const sizePercent = (totalSize / CONFIG.MAX_TOTAL_SIZE) * 100;

        let emoji = '📦';
        let color = '#28a745';
        if (sizePercent > 80) { emoji = '🔴'; color = '#dc3545'; }
        else if (sizePercent > 60) { emoji = '🟡'; color = '#ffc107'; }

        $status.html(
            `<div style="margin-bottom:8px">` +
            `<span style="color:${color};font-weight:bold;font-size:14px">${emoji} ${count} / ${CONFIG.MAX_FILES}</span> Dateien ausgewählt` +
            `</div>` +
            `<div style="font-size:12px;color:#666">` +
            `📦 Gesamtgröße: <strong style="color:${color}">${formatSize(totalSize)}</strong> / ${formatSize(CONFIG.MAX_TOTAL_SIZE)} ` +
            `<span style="color:#999">(${sizePercent.toFixed(1)}%)</span>` +
            `</div>`
        );

        // Update File List
        $fileList.empty();

        if (selectedFiles.length === 0) {
            $fileList.html(
                '<div style="padding:30px;text-align:center;color:#999;font-size:13px">' +
                '📂 Keine Dateien ausgewählt<br>' +
                '<span style="font-size:12px">Klicken Sie auf "Weitere hinzufügen" oder auf das Upload-Feld</span>' +
                '</div>'
            );
        } else {
            selectedFiles.forEach((file, index) => {
                const $item = $('<div class="file-item"></div>').css({
                    padding: '10px 15px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    transition: 'background 0.2s'
                }).hover(
                    function() { $(this).css('background', '#f8f9fa'); },
                    function() { $(this).css('background', 'white'); }
                );

                const shortName = file.name.length > 45
                    ? file.name.substr(0, 42) + '...'
                    : file.name;

                $item.html(
                    `<div style="flex:1">` +
                    `<div style="font-weight:500;margin-bottom:2px">📄 ${shortName}</div>` +
                    `<div style="font-size:11px;color:#999">${formatSize(file.size)}</div>` +
                    `</div>` +
                    `<button type="button" class="btn-remove" data-file-id="${file._multiUploadId}" style="background:#dc3545;border:none;color:white;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:500">✕ Entfernen</button>`
                );

                $item.find('.btn-remove').on('click', function() {
                    const fileId = parseInt($(this).data('file-id'));
                    removeFile(fileId);
                });

                $fileList.append($item);
            });
        }

        // Update "Alle löschen" Button Sichtbarkeit
        $('.btn-clear-all').toggle(selectedFiles.length > 0);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    function onFileChange(event) {
        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        log('📂 Neue Dateiauswahl:', files.length, 'Datei(en)');

        const result = addFiles(Array.from(files));

        // Zeige Feedback
        if (result.added.length > 0) {
            console.log('%c✅ ' + result.added.length + ' Datei(en) hinzugefügt', 'color: #28a745; font-weight: bold');
        }

        if (result.rejected.length > 0) {
            console.group('%c⚠️ ' + result.rejected.length + ' Datei(en) abgelehnt', 'color: #ff9800; font-weight: bold');
            result.rejected.forEach(r => {
                console.log(`❌ ${r.file.name}: ${r.errors.join(', ')}`);
            });
            console.groupEnd();

            // Zeige Warnung
            showRejectedFilesWarning(result.rejected);
        }

        // Wichtig: Input-Feld zurücksetzen für "Weitere hinzufügen"
        // Wird durch updateFileInput() überschrieben
    }

    function showRejectedFilesWarning(rejected) {
        const $container = $('#xi-upl-1-xc');
        $container.find('.multi-warning').remove();

        const $warning = $('<div class="multi-warning"></div>').css({
            marginTop: '10px',
            padding: '12px 15px',
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#856404'
        });

        let html = `<div style="font-weight:bold;margin-bottom:8px">⚠️ ${rejected.length} Datei(en) wurden nicht hinzugefügt:</div>`;
        html += '<ul style="margin:0;padding-left:20px">';
        rejected.forEach(r => {
            html += `<li>${r.file.name}: ${r.errors.join(', ')}</li>`;
        });
        html += '</ul>';

        $warning.html(html);
        $container.find('.multi-complete-ui').after($warning);

        setTimeout(() => {
            $warning.fadeOut(400, function() { $(this).remove(); });
        }, 8000);
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    log('⚙️  Initialisiere...');

    // Multiple-Attribut
    $uploadField.prop('multiple', true);
    log('✅ Multiple-Attribut gesetzt');

    // Event Handler
    $uploadField.off('change.multicomplete').on('change.multicomplete', onFileChange);
    log('✅ Change-Event registriert');

    // UI erstellen
    createUI();
    log('✅ UI erstellt');

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('%c✅ COMPLETE VERSION AKTIVIERT!', 'color: #28a745; font-weight: bold; font-size: 16px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('');
    console.log('%c📖 FEATURES:', 'color: #2196F3; font-weight: bold; font-size: 14px');
    console.log('%c   ✅ Mehrere Dateien auswählen', 'color: #666');
    console.log('%c   ➕ Weitere Dateien hinzufügen', 'color: #666');
    console.log('%c   ✕ Einzelne Dateien entfernen', 'color: #666');
    console.log('%c   🗑️ Alle Dateien löschen', 'color: #666');
    console.log('%c   📊 Live Gesamtgröße-Anzeige', 'color: #666');
    console.log('%c   🎨 Interaktive Dateiliste', 'color: #666');
    console.log('');

    // Debug Helper
    window.multiUploadDebug = {
        getSelectedFiles: () => selectedFiles,
        getCount: () => selectedFiles.length,
        getTotalSize: () => formatSize(getTotalSize()),
        clear: clearAllFiles
    };

})(jQuery);
