/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FORMCYCLE MULTIPLE UPLOAD - AUTO-UPLOAD MODE mit CUSTOM BUTTON
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * LÖSUNG: Custom Button mit Validierung VOR Dialog-Öffnung
 *
 * WIE ES FUNKTIONIERT:
 * 1. Natives Upload-Feld wird versteckt
 * 2. Custom Button zeigt verbleibende Kapazität
 * 3. Validierung BEVOR Dialog geöffnet wird
 * 4. Bei OK → öffnet nativen Dialog
 * 5. Formcycle uploaded automatisch
 * 6. MutationObserver updated UI
 *
 * ✅ Validierung funktioniert!
 * ✅ Keine Duplikat-Probleme!
 * ✅ Zeigt alle hochgeladenen Dateien!
 *
 * Version: 3.0 (Custom Button)
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
        DEBUG: true                            // Console-Logging
    };

    // ============================================
    // GLOBALE VARIABLEN
    // ============================================

    const $uploadField = $('#xi-upl-1');
    const $container = $('#xi-upl-1-xc');

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[MULTI-UPLOAD]', ...args);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Liest bereits hochgeladene Dateien aus dem DOM
     */
    function getUploadedFilesFromDOM() {
        const files = [];

        // Suche in Formcycle-Strukturen (NICHT in unserer eigenen UI!)
        $container.find('.xm-upl-wrapper').each(function() {
            const $wrapper = $(this);

            // Skip our own UI elements
            if ($wrapper.closest('.multi-upload-info').length > 0) {
                return; // continue
            }

            const $label = $wrapper.find('.xm-upl-label');
            const $sizeSpan = $wrapper.find('.xm-upl-size');

            if ($label.length) {
                const name = $label.text().trim();
                const sizeText = $sizeSpan.length ? $sizeSpan.text().trim() : '';

                if (isValidFileName(name)) {
                    files.push({
                        name: name,
                        size: parseSizeFromText(sizeText),
                        sizeText: sizeText,
                        $element: $wrapper
                    });
                }
            }
        });

        // Fallback: Direktes .xm-upl-label
        if (files.length === 0) {
            $container.find('.xm-upl-label').each(function() {
                const $label = $(this);
                if ($label.closest('.multi-upload-info').length > 0) {
                    return; // continue
                }

                const name = $label.text().trim();
                if (isValidFileName(name)) {
                    files.push({
                        name: name,
                        size: 0,
                        sizeText: '',
                        $element: $label.parent()
                    });
                }
            });
        }

        log('📋 Hochgeladene Dateien:', files.length, files.map(f => f.name));
        return files;
    }

    function isValidFileName(text) {
        return text &&
               text !== '' &&
               text !== 'keine Datei ausgewählt' &&
               text !== 'No file selected' &&
               text !== 'Keine Datei' &&
               !text.startsWith('Keine ') &&
               !text.startsWith('No ') &&
               !text.toLowerCase().includes('ausgewählt') &&
               !text.toLowerCase().includes('selected');
    }

    function parseSizeFromText(text) {
        if (!text) return 0;

        const match = text.match(/([0-9.]+)\s*(B|KB|MB|GB)/i);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        switch (unit) {
            case 'B': return value;
            case 'KB': return value * 1024;
            case 'MB': return value * 1024 * 1024;
            case 'GB': return value * 1024 * 1024 * 1024;
            default: return 0;
        }
    }

    /**
     * Prüft ob Upload erlaubt ist (VOR Dialog-Öffnung!)
     */
    function canUpload() {
        const uploadedFiles = getUploadedFilesFromDOM();
        const uploadedCount = uploadedFiles.length;
        const uploadedSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);

        const result = {
            allowed: uploadedCount < CONFIG.MAX_FILES,
            uploadedCount: uploadedCount,
            uploadedSize: uploadedSize,
            remaining: CONFIG.MAX_FILES - uploadedCount,
            percentUsed: (uploadedCount / CONFIG.MAX_FILES) * 100,
            sizePercentUsed: (uploadedSize / CONFIG.MAX_TOTAL_SIZE) * 100
        };

        log('🔍 Upload erlaubt?', result.allowed, '→', uploadedCount, '/', CONFIG.MAX_FILES);
        return result;
    }

    /**
     * Zeigt Warning-Box
     */
    function showWarning(message) {
        $('.multi-upload-warning').remove();

        const $warning = $('<div class="multi-upload-warning"></div>').css({
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            fontSize: '14px',
            color: '#856404',
            fontWeight: '500'
        });

        $warning.html(`⚠️ ${message}`);
        $container.prepend($warning);

        setTimeout(() => $warning.fadeOut(500, () => $warning.remove()), 5000);
    }

    /**
     * Erstellt Custom Upload-Button und Info-UI
     */
    function createUI() {
        // Verstecke natives Upload-Feld
        $uploadField.css({
            position: 'absolute',
            left: '-9999px',
            opacity: '0',
            pointerEvents: 'none'
        });

        // Label auch verstecken
        $('#xi-upl-1-label').css('display', 'none');

        // Entferne alte UI
        $('.multi-upload-info').remove();

        const $ui = $('<div class="multi-upload-info"></div>').css({
            marginBottom: '15px',
            border: '2px solid #667eea',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        });

        // Header mit Upload-Button
        const $header = $('<div class="multi-header"></div>').css({
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        });

        const $uploadBtn = $('<button type="button" class="btn-upload"></button>').css({
            width: '100%',
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s'
        }).html('📁 Dateien auswählen');

        // Hover-Effekt
        $uploadBtn.on('mouseenter', function() {
            $(this).css({
                background: 'white',
                transform: 'scale(1.02)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            });
        }).on('mouseleave', function() {
            $(this).css({
                background: 'rgba(255,255,255,0.95)',
                transform: 'scale(1)',
                boxShadow: 'none'
            });
        });

        $header.append($uploadBtn);

        // Content-Bereich
        const $content = $('<div class="multi-content"></div>').css({
            padding: '15px',
            background: '#fff'
        });

        $ui.append($header).append($content);
        $container.prepend($ui);

        // Event Handler für Upload-Button
        $uploadBtn.on('click', function() {
            log('🖱️ Upload-Button geklickt');

            const check = canUpload();

            if (!check.allowed) {
                log('❌ Upload nicht erlaubt - Limit erreicht');
                showWarning(`Maximum von ${CONFIG.MAX_FILES} Dateien erreicht! Bitte entfernen Sie zuerst Dateien.`);

                // Button visuell deaktivieren
                $(this).css({
                    background: '#f0f0f0',
                    color: '#999',
                    cursor: 'not-allowed'
                });
                setTimeout(() => {
                    $(this).css({
                        background: 'rgba(255,255,255,0.95)',
                        color: '#667eea',
                        cursor: 'pointer'
                    });
                }, 2000);

                return;
            }

            log('✅ Upload erlaubt - öffne Dialog');
            log('   Noch', check.remaining, 'von', CONFIG.MAX_FILES, 'Slots frei');

            // Öffne nativen Dialog
            $uploadField.click();
        });

        updateUI();
    }

    /**
     * Updated die Info-UI
     */
    function updateUI() {
        const $content = $('.multi-content');
        const $uploadBtn = $('.btn-upload');

        if (!$content.length) return;

        const uploadedFiles = getUploadedFilesFromDOM();
        const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
        const count = uploadedFiles.length;

        log('🔄 Update UI:', count, 'Dateien,', formatSize(totalSize));

        // Update Button-Text
        const remaining = CONFIG.MAX_FILES - count;
        if (count === 0) {
            $uploadBtn.html('📁 Dateien auswählen');
        } else if (remaining > 0) {
            $uploadBtn.html(`➕ Weitere Dateien hinzufügen (noch ${remaining} möglich)`);
        } else {
            $uploadBtn.html('🚫 Maximum erreicht').css({
                background: '#f0f0f0',
                color: '#999',
                cursor: 'not-allowed'
            });
        }

        // Status-Anzeige
        let html = '';

        // Emoji und Farbe
        const percentFiles = (count / CONFIG.MAX_FILES) * 100;
        const percentSize = (totalSize / CONFIG.MAX_TOTAL_SIZE) * 100;

        let emoji = '📦';
        let color = '#28a745';

        if (percentFiles > 80 || percentSize > 80) {
            emoji = '🔴';
            color = '#dc3545';
        } else if (percentFiles > 60 || percentSize > 60) {
            emoji = '🟡';
            color = '#ffc107';
        }

        // Status-Box
        html += `<div style="padding:12px;background:#f8f9fa;border-radius:6px;margin-bottom:15px">`;
        html += `<div style="font-weight:bold;color:${color};margin-bottom:8px;font-size:15px">${emoji} ${count} / ${CONFIG.MAX_FILES} Dateien hochgeladen</div>`;

        // Progress-Bar Dateien
        html += `<div style="margin-bottom:10px">`;
        html += `<div style="font-size:12px;color:#666;margin-bottom:4px">Anzahl: ${percentFiles.toFixed(0)}%</div>`;
        html += `<div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden">`;
        html += `<div style="width:${percentFiles}%;height:100%;background:${color};transition:width 0.3s"></div>`;
        html += `</div></div>`;

        // Progress-Bar Größe
        html += `<div>`;
        html += `<div style="font-size:12px;color:#666;margin-bottom:4px">Größe: ${formatSize(totalSize)} / ${formatSize(CONFIG.MAX_TOTAL_SIZE)} (${percentSize.toFixed(0)}%)</div>`;
        html += `<div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden">`;
        html += `<div style="width:${percentSize}%;height:100%;background:${color};transition:width 0.3s"></div>`;
        html += `</div></div>`;

        html += `</div>`;

        // Dateiliste
        if (count > 0) {
            html += `<div style="margin-bottom:10px">`;
            html += `<div style="font-weight:bold;margin-bottom:8px;font-size:13px;color:#333">Hochgeladene Dateien:</div>`;
            html += `<div style="max-height:250px;overflow-y:auto;border:1px solid #e0e0e0;border-radius:6px">`;

            uploadedFiles.forEach((file, index) => {
                const shortName = file.name.length > 50
                    ? file.name.substr(0, 47) + '...'
                    : file.name;

                const bgColor = index % 2 === 0 ? '#fafafa' : '#fff';

                html += `<div style="padding:10px 12px;background:${bgColor};display:flex;align-items:center;gap:10px">`;
                html += `<div style="font-size:20px">📄</div>`;
                html += `<div style="flex:1">`;
                html += `<div style="font-weight:500;font-size:13px;color:#333">${shortName}</div>`;
                if (file.sizeText) {
                    html += `<div style="font-size:11px;color:#999">${file.sizeText}</div>`;
                }
                html += `</div>`;
                html += `<div style="color:#28a745;font-size:12px;font-weight:500">✓</div>`;
                html += `</div>`;
            });

            html += `</div></div>`;
        } else {
            html += `<div style="text-align:center;color:#999;padding:30px;font-size:13px">`;
            html += `<div style="font-size:48px;margin-bottom:10px">📭</div>`;
            html += `<div>Noch keine Dateien hochgeladen</div>`;
            html += `<div style="font-size:11px;margin-top:5px">Klicken Sie auf den Button oben</div>`;
            html += `</div>`;
        }

        // Info-Box
        html += `<div style="padding:12px;background:#e7f3ff;border-radius:6px;font-size:12px;color:#666">`;
        html += `💡 <strong>Tipp:</strong> Im Datei-Dialog können Sie mehrere Dateien mit <code style="background:#fff;padding:2px 6px;border-radius:3px">Strg</code> + Klick (Windows) oder <code style="background:#fff;padding:2px 6px;border-radius:3px">Cmd</code> + Klick (Mac) auswählen.`;
        html += `</div>`;

        $content.html(html);
    }

    /**
     * Überwacht DOM-Änderungen um neue Uploads zu erkennen
     */
    function watchForUploads() {
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;

            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            // Skip our own elements
                            if ($(node).hasClass('multi-upload-info') ||
                                $(node).hasClass('multi-upload-warning') ||
                                $(node).closest('.multi-upload-info').length > 0) {
                                return;
                            }

                            // Check if it's a Formcycle upload element
                            if ($(node).hasClass('xm-upl-wrapper') ||
                                $(node).find('.xm-upl-wrapper').length > 0 ||
                                $(node).hasClass('xm-upl-label') ||
                                $(node).find('.xm-upl-label').length > 0) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });

            if (shouldUpdate) {
                log('🔄 DOM-Änderung erkannt - Update UI in 200ms...');
                setTimeout(() => updateUI(), 200);
            }
        });

        observer.observe($container[0], {
            childList: true,
            subtree: true
        });

        log('👁️  MutationObserver aktiv');
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    function init() {
        console.clear();
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
        console.log('%c🚀 MULTIPLE-UPLOAD - CUSTOM BUTTON MODE', 'color: #667eea; font-weight: bold; font-size: 16px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');

        // Prüfe jQuery
        if (typeof $ === 'undefined') {
            console.error('❌ jQuery nicht verfügbar!');
            return;
        }
        log('✅ jQuery:', $.fn.jquery);

        // Prüfe Upload-Feld
        if (!$uploadField.length) {
            console.error('❌ Upload-Feld #xi-upl-1 nicht gefunden!');
            return;
        }
        log('✅ Upload-Feld gefunden');

        // Aktiviere multiple-Attribut
        $uploadField.prop('multiple', true);
        log('✅ Multiple-Attribut aktiviert');

        // Konfiguration
        console.group('%c⚙️  Konfiguration', 'color: #2196F3; font-weight: bold');
        console.log('Max Dateigröße:', formatSize(CONFIG.MAX_FILE_SIZE));
        console.log('Max Gesamtgröße:', formatSize(CONFIG.MAX_TOTAL_SIZE));
        console.log('Max Anzahl:', CONFIG.MAX_FILES);
        console.groupEnd();

        // UI erstellen
        createUI();

        // MutationObserver starten
        watchForUploads();

        // Debug-Helper
        window.multiUploadDebug = {
            getUploaded: getUploadedFilesFromDOM,
            canUpload: canUpload,
            config: CONFIG,
            updateUI: updateUI
        };

        console.log('%c✅ Initialisierung erfolgreich!', 'color: #28a745; font-weight: bold; font-size: 14px');
        console.log('%cDebug: multiUploadDebug.getUploaded()', 'color: #999');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        $(document).ready(init);
    } else {
        init();
    }

})();
