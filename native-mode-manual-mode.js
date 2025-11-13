/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FORMCYCLE MULTIPLE UPLOAD - MANUAL MODE (Option 3)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * MANUELLER MODUS - Akzeptiert Formcycle-Limitierung
 *
 * ✅ Einfachste Lösung - nutzt Formcycle wie designed
 * ✅ User uploaded mehrmals manuell (1 Datei pro Klick)
 * ✅ Tracked alle Uploads
 * ✅ Zeigt verbleibende Kapazität
 * ✅ Warnt bei Limits
 * ✅ Keine Tricks - funktioniert zuverlässig!
 *
 * WIE ES FUNKTIONIERT:
 * 1. User klickt "Ändern/Hinzufügen"
 * 2. Wählt 1 Datei (oder mehrere, aber nur 1 wird uploaded)
 * 3. Formcycle uploaded automatisch
 * 4. UI tracked den Upload
 * 5. Repeat für weitere Dateien
 *
 * TRADE-OFF: User muss mehrmals klicken, aber es ist ZUVERLÄSSIG!
 *
 * Version: 1.0 (Manual Mode)
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

    const $uploadField = $('#xi-upl-1');
    const $container = $('#xi-upl-1-xc');

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[MANUAL-MODE]', ...args);
        }
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Liest hochgeladene Dateien aus DOM
     */
    function getUploadedFiles() {
        const files = [];

        $container.find('.xm-upl-wrapper').each(function() {
            const $wrapper = $(this);

            // Skip unsere eigene UI
            if ($wrapper.closest('.multi-upload-info').length > 0) {
                return;
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
                        sizeText: sizeText
                    });
                }
            }
        });

        // Fallback
        if (files.length === 0) {
            $container.find('.xm-upl-label').each(function() {
                const $label = $(this);
                if ($label.closest('.multi-upload-info').length > 0) return;

                const name = $label.text().trim();
                if (isValidFileName(name)) {
                    files.push({ name: name, size: 0, sizeText: '' });
                }
            });
        }

        return files;
    }

    function isValidFileName(text) {
        return text &&
               text !== '' &&
               text !== 'keine Datei ausgewählt' &&
               text !== 'No file selected' &&
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
     * Prüft ob noch Uploads möglich sind
     */
    function canUpload() {
        const uploaded = getUploadedFiles();
        const remaining = CONFIG.MAX_FILES - uploaded.length;
        const totalSize = uploaded.reduce((sum, f) => sum + f.size, 0);

        return {
            allowed: uploaded.length < CONFIG.MAX_FILES,
            uploaded: uploaded,
            count: uploaded.length,
            remaining: remaining,
            totalSize: totalSize,
            percentFiles: (uploaded.length / CONFIG.MAX_FILES) * 100,
            percentSize: (totalSize / CONFIG.MAX_TOTAL_SIZE) * 100
        };
    }

    /**
     * Zeigt Warnung
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
     * Zeigt Info
     */
    function showInfo(message, type = 'info') {
        $('.multi-upload-message').remove();

        const colors = {
            info: { bg: '#e7f3ff', border: '#2196F3', text: '#1565C0' },
            success: { bg: '#d4edda', border: '#28a745', text: '#155724' }
        };

        const color = colors[type] || colors.info;

        const $message = $('<div class="multi-upload-message"></div>').css({
            background: color.bg,
            border: `2px solid ${color.border}`,
            borderRadius: '8px',
            padding: '12px 15px',
            marginBottom: '15px',
            fontSize: '13px',
            color: color.text
        });

        $message.html(message);
        $container.prepend($message);

        setTimeout(() => $message.fadeOut(500, () => $message.remove()), 4000);
    }

    /**
     * Erstellt UI
     */
    function createUI() {
        $('.multi-upload-info').remove();

        const $ui = $('<div class="multi-upload-info"></div>').css({
            marginBottom: '15px',
            border: '2px solid #667eea',
            borderRadius: '8px',
            overflow: 'hidden'
        });

        // Header
        const $header = $('<div></div>').css({
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center'
        }).html('🎯 Multiple-Upload (Manueller Modus)');

        // Content
        const $content = $('<div class="multi-content"></div>').css({
            padding: '15px',
            background: '#fff'
        });

        $ui.append($header).append($content);
        $container.prepend($ui);

        updateUI();
    }

    /**
     * Updated UI
     */
    function updateUI() {
        const $content = $('.multi-content');
        if (!$content.length) return;

        const status = canUpload();

        log('🔄 Update UI:', status.count, 'hochgeladen,', status.remaining, 'verbleibend');

        let html = '';

        // Status-Anzeige
        const emoji = status.percentFiles > 80 ? '🔴' : status.percentFiles > 60 ? '🟡' : '📦';
        const color = status.percentFiles > 80 ? '#dc3545' : status.percentFiles > 60 ? '#ffc107' : '#28a745';

        html += `<div style="padding:12px;background:#f8f9fa;border-radius:6px;margin-bottom:15px">`;
        html += `<div style="font-weight:bold;color:${color};margin-bottom:8px;font-size:15px">${emoji} ${status.count} / ${CONFIG.MAX_FILES} Dateien hochgeladen</div>`;

        // Progress-Bar
        html += `<div style="margin-bottom:10px">`;
        html += `<div style="font-size:12px;color:#666;margin-bottom:4px">Anzahl: ${status.percentFiles.toFixed(0)}%</div>`;
        html += `<div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden">`;
        html += `<div style="width:${status.percentFiles}%;height:100%;background:${color};transition:width 0.3s"></div>`;
        html += `</div></div>`;

        // Größe
        html += `<div>`;
        html += `<div style="font-size:12px;color:#666;margin-bottom:4px">Größe: ${formatSize(status.totalSize)} / ${formatSize(CONFIG.MAX_TOTAL_SIZE)} (${status.percentSize.toFixed(0)}%)</div>`;
        html += `<div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden">`;
        html += `<div style="width:${status.percentSize}%;height:100%;background:${color};transition:width 0.3s"></div>`;
        html += `</div></div>`;

        html += `</div>`;

        // Anleitung
        html += `<div style="padding:12px;background:#e7f3ff;border-radius:6px;margin-bottom:15px">`;
        html += `<div style="font-weight:bold;margin-bottom:8px">📖 So funktioniert's:</div>`;
        html += `<ol style="margin:0;padding-left:20px;font-size:13px">`;
        html += `<li>Klicken Sie unten auf "<strong>Ändern</strong>" oder "<strong>Hinzufügen</strong>"</li>`;
        html += `<li>Wählen Sie <strong>1 Datei</strong> aus (wird automatisch hochgeladen)</li>`;
        html += `<li>Wiederholen Sie für weitere Dateien</li>`;
        html += `</ol>`;
        html += `</div>`;

        // Verbleibende Kapazität
        if (status.remaining > 0) {
            html += `<div style="padding:12px;background:#d4edda;border-radius:6px;margin-bottom:15px;text-align:center">`;
            html += `<div style="font-size:24px;margin-bottom:5px">✅</div>`;
            html += `<div style="font-weight:bold;color:#155724">Noch <span style="font-size:18px">${status.remaining}</span> Datei(en) möglich</div>`;
            html += `</div>`;
        } else {
            html += `<div style="padding:12px;background:#fff3cd;border-radius:6px;margin-bottom:15px;text-align:center">`;
            html += `<div style="font-size:24px;margin-bottom:5px">🚫</div>`;
            html += `<div style="font-weight:bold;color:#856404">Maximum erreicht!</div>`;
            html += `<div style="font-size:12px;margin-top:5px">Bitte entfernen Sie Dateien, um weitere hochzuladen.</div>`;
            html += `</div>`;
        }

        // Hochgeladene Dateien
        if (status.uploaded.length > 0) {
            html += `<div>`;
            html += `<div style="font-weight:bold;margin-bottom:8px;font-size:13px">Hochgeladene Dateien:</div>`;
            html += `<div style="max-height:250px;overflow-y:auto;border:1px solid #e0e0e0;border-radius:6px">`;

            status.uploaded.forEach((file, index) => {
                const bgColor = index % 2 === 0 ? '#fafafa' : '#fff';
                const shortName = file.name.length > 50 ? file.name.substr(0, 47) + '...' : file.name;

                html += `<div style="padding:10px 12px;background:${bgColor};display:flex;align-items:center;gap:10px">`;
                html += `<div style="font-size:20px">📄</div>`;
                html += `<div style="flex:1">`;
                html += `<div style="font-weight:500;font-size:13px">${shortName}</div>`;
                if (file.sizeText) {
                    html += `<div style="font-size:11px;color:#999">${file.sizeText}</div>`;
                }
                html += `</div>`;
                html += `<div style="color:#28a745;font-size:12px">✓</div>`;
                html += `</div>`;
            });

            html += `</div></div>`;
        } else {
            html += `<div style="text-align:center;color:#999;padding:30px">`;
            html += `<div style="font-size:48px;margin-bottom:10px">📭</div>`;
            html += `<div>Noch keine Dateien hochgeladen</div>`;
            html += `</div>`;
        }

        $content.html(html);
    }

    /**
     * Überwacht DOM für neue Uploads
     */
    function watchForUploads() {
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;

            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            const $node = $(node);

                            // Skip unsere eigene UI
                            if ($node.hasClass('multi-upload-info') ||
                                $node.closest('.multi-upload-info').length > 0) {
                                return;
                            }

                            // Prüfe auf Upload-Elemente
                            if ($node.hasClass('xm-upl-wrapper') ||
                                $node.find('.xm-upl-wrapper').length > 0 ||
                                $node.find('.xm-upl-label').length > 0) {
                                shouldUpdate = true;

                                // Zeige Info
                                const status = canUpload();
                                if (status.allowed) {
                                    showInfo(`✅ Datei hochgeladen! Noch ${status.remaining} möglich.`, 'success');
                                } else {
                                    showWarning('Maximum von 10 Dateien erreicht!');
                                }
                            }
                        }
                    });
                }
            });

            if (shouldUpdate) {
                log('🔄 Neue Datei erkannt - Update UI');
                setTimeout(() => updateUI(), 200);
            }
        });

        observer.observe($container[0], {
            childList: true,
            subtree: true
        });

        log('👁️  Upload-Observer aktiv');
    }

    // ============================================
    // INITIALISIERUNG
    // ============================================

    function init() {
        console.clear();
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
        console.log('%c🚀 MULTIPLE-UPLOAD - MANUAL MODE', 'color: #667eea; font-weight: bold; font-size: 16px');
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

        console.group('%c⚙️  Konfiguration', 'color: #2196F3; font-weight: bold');
        console.log('Max Dateigröße:', formatSize(CONFIG.MAX_FILE_SIZE));
        console.log('Max Gesamtgröße:', formatSize(CONFIG.MAX_TOTAL_SIZE));
        console.log('Max Anzahl:', CONFIG.MAX_FILES);
        console.log('Modus: Manuell (1 Datei pro Klick)');
        console.groupEnd();

        createUI();
        watchForUploads();

        window.multiUploadDebug = {
            getUploaded: getUploadedFiles,
            canUpload: canUpload,
            config: CONFIG
        };

        console.log('%c✅ Initialisierung erfolgreich!', 'color: #28a745; font-weight: bold; font-size: 14px');
        console.log('%cDebug: multiUploadDebug.getUploaded()', 'color: #999');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-weight: bold');
    }

    if (document.readyState === 'loading') {
        $(document).ready(init);
    } else {
        init();
    }

})();
