/**
 * FORMCYCLE MULTIPLE UPLOAD - ENHANCED UX VERSION
 *
 * Features:
 * - Schöne Dateiliste mit Status (✅ Upload / ❌ Blockiert)
 * - Gesamtgröße-Anzeige
 * - Live-Preview welche Dateien hochgeladen werden
 * - Nur invalide Dateien werden blockiert, valide durchgelassen
 * - Detaillierte Fehlerinfos pro Datei
 */

(function($) {
    'use strict';

    console.clear();
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    console.log('%c🚀 FORMCYCLE MULTIPLE UPLOAD - ENHANCED UX', 'color: #667eea; font-weight: bold; font-size: 16px');
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

    function getExistingFiles() {
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

    // ============================================
    // VALIDIERUNG MIT DETAILS
    // ============================================

    function validateFilesDetailed(files) {
        const existingFiles = getExistingFiles();
        const existingCount = existingFiles.length;

        const validFiles = [];
        const invalidFiles = [];
        let totalSize = 0;

        log('📋 Validiere', files.length, 'Datei(en)');
        log('   Bereits hochgeladen:', existingCount);

        // Prüfe jede Datei einzeln
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileInfo = {
                file: file,
                name: file.name,
                size: file.size,
                valid: true,
                errors: []
            };

            // Dateigröße
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                fileInfo.valid = false;
                fileInfo.errors.push(`Zu groß (${formatSize(file.size)} > ${formatSize(CONFIG.MAX_FILE_SIZE)})`);
            }

            // Leer-Datei
            if (file.size === 0) {
                fileInfo.valid = false;
                fileInfo.errors.push('Datei ist leer (0 Bytes)');
            }

            // Duplikat
            if (existingFiles.includes(file.name)) {
                fileInfo.valid = false;
                fileInfo.errors.push('Bereits vorhanden');
            }

            // Dateiname zu lang
            if (file.name.length > 100) {
                fileInfo.valid = false;
                fileInfo.errors.push(`Dateiname zu lang (${file.name.length} Zeichen)`);
            }

            if (fileInfo.valid) {
                validFiles.push(fileInfo);
                totalSize += file.size;
            } else {
                invalidFiles.push(fileInfo);
            }
        }

        // Prüfe Gesamtanzahl
        const totalAfterUpload = existingCount + validFiles.length;
        if (totalAfterUpload > CONFIG.MAX_FILES) {
            const overflow = totalAfterUpload - CONFIG.MAX_FILES;
            // Markiere die letzten X Dateien als invalid
            for (let i = validFiles.length - overflow; i < validFiles.length; i++) {
                validFiles[i].valid = false;
                validFiles[i].errors.push(`Max ${CONFIG.MAX_FILES} Dateien (${existingCount} bereits vorhanden)`);
                invalidFiles.push(validFiles[i]);
            }
            validFiles.splice(validFiles.length - overflow);
        }

        // Prüfe Gesamtgröße
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            return {
                valid: false,
                validFiles: [],
                invalidFiles: [...validFiles, ...invalidFiles],
                totalSize: totalSize,
                error: `Gesamtgröße überschritten: ${formatSize(totalSize)} > ${formatSize(CONFIG.MAX_TOTAL_SIZE)}`
            };
        }

        return {
            valid: validFiles.length > 0,
            validFiles: validFiles,
            invalidFiles: invalidFiles,
            totalSize: totalSize,
            error: null
        };
    }

    // ============================================
    // ENHANCED UI COMPONENTS
    // ============================================

    function createEnhancedUI() {
        const $container = $('#xi-upl-1-xc');
        $container.find('.multi-enhanced-ui').remove();

        const $ui = $('<div class="multi-enhanced-ui"></div>').css({
            marginTop: '15px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });

        // Header
        const $header = $('<div class="multi-header"></div>').css({
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px 8px 0 0',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }).html(
            '🎯 Multiple-Upload <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:3px;font-size:12px">AKTIV</span>'
        );

        // Status Bar
        const $status = $('<div class="multi-status-bar"></div>').css({
            padding: '12px 15px',
            background: '#f8f9fa',
            borderLeft: '2px solid #667eea',
            borderRight: '2px solid #667eea',
            fontSize: '13px'
        });

        updateStatusBar($status);

        // Help Text
        const $help = $('<div class="multi-help"></div>').css({
            padding: '12px 15px',
            background: '#e7f3ff',
            borderRadius: '0 0 8px 8px',
            borderLeft: '2px solid #667eea',
            borderRight: '2px solid #667eea',
            borderBottom: '2px solid #667eea',
            fontSize: '12px',
            color: '#666'
        }).html(
            '💡 <strong>Mehrere Dateien auswählen:</strong> Strg+Klick (Win) oder Cmd+Klick (Mac)'
        );

        $ui.append($header).append($status).append($help);
        $container.append($ui);
    }

    function updateStatusBar($statusBar) {
        if (!$statusBar) {
            $statusBar = $('.multi-status-bar');
        }

        const existing = getExistingFiles();
        const count = existing.length;

        let emoji = '📦';
        let color = '#28a745';
        if (count >= CONFIG.MAX_FILES * 0.8) { emoji = '🔴'; color = '#dc3545'; }
        else if (count >= CONFIG.MAX_FILES * 0.6) { emoji = '🟡'; color = '#ffc107'; }

        let html = `<div style="margin-bottom:8px"><span style="color:${color};font-weight:bold;font-size:14px">${emoji} ${count} / ${CONFIG.MAX_FILES}</span> Dateien hochgeladen</div>`;

        if (existing.length > 0) {
            html += '<div style="font-size:12px;color:#666">';
            existing.forEach((name, i) => {
                const shortName = name.length > 35 ? name.substr(0, 32) + '...' : name;
                html += `<div style="padding:2px 0">• ${shortName}</div>`;
            });
            html += '</div>';
        }

        $statusBar.html(html);
    }

    function showFilePreview(validation) {
        const $container = $('#xi-upl-1-xc');
        $container.find('.multi-file-preview').remove();

        const $preview = $('<div class="multi-file-preview"></div>').css({
            marginTop: '15px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });

        // Header
        const $previewHeader = $('<div></div>').css({
            padding: '12px 15px',
            background: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold',
            fontSize: '14px'
        }).html(`📋 Ausgewählte Dateien (${validation.validFiles.length + validation.invalidFiles.length})`);

        $preview.append($previewHeader);

        // Gesamtgröße
        const $totalSize = $('<div></div>').css({
            padding: '10px 15px',
            background: '#fff',
            borderBottom: '1px solid #ddd',
            fontSize: '13px',
            fontWeight: '500'
        });

        const sizePercent = (validation.totalSize / CONFIG.MAX_TOTAL_SIZE) * 100;
        let sizeColor = '#28a745';
        if (sizePercent > 80) sizeColor = '#dc3545';
        else if (sizePercent > 60) sizeColor = '#ffc107';

        $totalSize.html(
            `📦 Gesamtgröße: <span style="color:${sizeColor};font-weight:bold">${formatSize(validation.totalSize)}</span> ` +
            `/ ${formatSize(CONFIG.MAX_TOTAL_SIZE)} ` +
            `<span style="color:#999;font-size:12px">(${sizePercent.toFixed(1)}%)</span>`
        );

        $preview.append($totalSize);

        // Valide Dateien
        if (validation.validFiles.length > 0) {
            const $validSection = $('<div></div>').css({
                padding: '12px 15px',
                background: '#d4edda',
                borderBottom: '1px solid #c3e6cb'
            });

            $validSection.append(
                $('<div></div>').css({
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#155724',
                    fontSize: '13px'
                }).html(`✅ ${validation.validFiles.length} Datei(en) werden hochgeladen:`)
            );

            validation.validFiles.forEach(fileInfo => {
                const $file = $('<div></div>').css({
                    padding: '6px 10px',
                    background: 'white',
                    marginBottom: '4px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                });

                const shortName = fileInfo.name.length > 40
                    ? fileInfo.name.substr(0, 37) + '...'
                    : fileInfo.name;

                $file.html(
                    `<span style="color:#155724">📄 ${shortName}</span>` +
                    `<span style="color:#666;font-size:11px">${formatSize(fileInfo.size)}</span>`
                );

                $validSection.append($file);
            });

            $preview.append($validSection);
        }

        // Invalide Dateien
        if (validation.invalidFiles.length > 0) {
            const $invalidSection = $('<div></div>').css({
                padding: '12px 15px',
                background: '#fff3cd'
            });

            $invalidSection.append(
                $('<div></div>').css({
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#856404',
                    fontSize: '13px'
                }).html(`⚠️ ${validation.invalidFiles.length} Datei(en) werden NICHT hochgeladen:`)
            );

            validation.invalidFiles.forEach(fileInfo => {
                const $file = $('<div></div>').css({
                    padding: '8px 10px',
                    background: 'white',
                    marginBottom: '6px',
                    borderRadius: '4px',
                    borderLeft: '3px solid #ffc107'
                });

                const shortName = fileInfo.name.length > 40
                    ? fileInfo.name.substr(0, 37) + '...'
                    : fileInfo.name;

                $file.html(
                    `<div style="font-size:12px;color:#856404;font-weight:500;margin-bottom:4px">❌ ${shortName}</div>` +
                    `<div style="font-size:11px;color:#999;margin-left:20px">${fileInfo.errors.join(', ')}</div>`
                );

                $invalidSection.append($file);
            });

            $preview.append($invalidSection);
        }

        // Globaler Fehler
        if (validation.error) {
            const $error = $('<div></div>').css({
                padding: '12px 15px',
                background: '#f8d7da',
                color: '#721c24',
                fontSize: '13px',
                fontWeight: 'bold'
            }).html(`🚫 ${validation.error}`);

            $preview.append($error);
        }

        $container.find('.multi-enhanced-ui').after($preview);

        // Auto-Hide nach 15 Sekunden
        setTimeout(() => {
            $preview.fadeOut(400, function() { $(this).remove(); });
        }, 15000);
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
        const validation = validateFilesDetailed(files);

        log('📊 Validierungsergebnis:');
        log('   Valide:', validation.validFiles.length);
        log('   Invalide:', validation.invalidFiles.length);
        log('   Gesamtgröße:', formatSize(validation.totalSize));

        // Zeige Preview
        showFilePreview(validation);

        // Console-Ausgabe
        if (validation.validFiles.length > 0) {
            console.group('%c✅ ' + validation.validFiles.length + ' Datei(en) werden hochgeladen', 'color: #28a745; font-weight: bold; font-size: 14px');
            validation.validFiles.forEach(f => {
                console.log(`   📄 ${f.name} (${formatSize(f.size)})`);
            });
            console.groupEnd();
        }

        if (validation.invalidFiles.length > 0) {
            console.group('%c⚠️ ' + validation.invalidFiles.length + ' Datei(en) werden NICHT hochgeladen', 'color: #ff9800; font-weight: bold; font-size: 14px');
            validation.invalidFiles.forEach(f => {
                console.log(`   ❌ ${f.name}: ${f.errors.join(', ')}`);
            });
            console.groupEnd();
        }

        console.log('');
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    log('⚙️  Initialisiere Upload-Feld...');

    // Multiple-Attribut setzen
    $uploadField.prop('multiple', true);
    log('✅ Multiple-Attribut gesetzt');

    // Event-Handler
    $uploadField.off('change.multienhanced').on('change.multienhanced', onFileChange);
    log('✅ Change-Event registriert');

    // UI erstellen
    createEnhancedUI();
    log('✅ Enhanced UI erstellt');

    // Existing files
    const existing = getExistingFiles();
    if (existing.length > 0) {
        log('📋 Bereits hochgeladen:', existing.length, 'Datei(en)');
        existing.forEach((name, i) => log(`   ${i+1}. ${name}`));
    } else {
        log('📋 Noch keine Dateien hochgeladen');
    }

    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('%c✅ ENHANCED UX AKTIVIERT!', 'color: #28a745; font-weight: bold; font-size: 16px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #28a745; font-weight: bold');
    console.log('');
    console.log('%c📖 FEATURES:', 'color: #2196F3; font-weight: bold; font-size: 14px');
    console.log('%c   ✅ Dateiliste mit Status (valide/invalide)', 'color: #666');
    console.log('%c   📊 Gesamtgröße-Anzeige mit Prozent', 'color: #666');
    console.log('%c   🎨 Farbcodierte Dateien (grün/gelb)', 'color: #666');
    console.log('%c   💡 Detaillierte Fehlerinfos pro Datei', 'color: #666');
    console.log('');

})(jQuery);
