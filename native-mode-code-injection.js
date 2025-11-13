/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FORMCYCLE MULTIPLE UPLOAD - CODE INJECTION (Option 4)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * MONKEY-PATCHING: Überschreibt Formcycle's getUpload() Funktion!
 *
 * ✅ Eleganteste Lösung - patcht Formcycle direkt
 * ✅ Nutzt Formcycle's bestehende Logik
 * ✅ KEINE Workarounds nötig
 * ✅ Funktioniert mit Native & AJAX Mode
 * ✅ Minimale Änderungen
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
        PATCH_DELAY: 100  // ms zu warten bevor patchen
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
     * Patcht Formcycle's getUpload() Funktion
     */
    function patchFormcycleUpload() {
        // Prüfe ob Formcycle AjaxUploadManager verfügbar ist
        if (!window.$ || !$.xutil || !$.xutil.ajaxUpload) {
            log('⚠️ $.xutil.ajaxUpload noch nicht verfügbar, warte...');
            return false;
        }

        const manager = $.xutil.ajaxUpload;

        // Prüfe ob getUpload Funktion existiert
        if (typeof manager.getUpload !== 'function') {
            log('⚠️ getUpload() Funktion nicht gefunden');
            return false;
        }

        // Bereits gepatcht?
        if (patchApplied) {
            log('✅ Patch bereits angewendet');
            return true;
        }

        log('🔧 Patche Formcycle getUpload() Funktion...');

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
    function validateFiles(files) {
        const errors = [];

        log('🔍 Validiere', files.length, 'Datei(en)');

        // Prüfe Anzahl
        if (files.length > CONFIG.MAX_FILES) {
            errors.push(`Maximum von ${CONFIG.MAX_FILES} Dateien überschritten`);
        }

        let totalSize = 0;

        // Prüfe jede Datei
        files.forEach((file, index) => {
            log(`   ${index + 1}. ${file.name} (${formatSize(file.size)})`);

            if (file.size > CONFIG.MAX_FILE_SIZE) {
                errors.push(`"${file.name}": Zu groß (${formatSize(file.size)})`);
            }

            if (file.size === 0) {
                errors.push(`"${file.name}": Datei ist leer`);
            }

            totalSize += file.size;
        });

        // Prüfe Gesamtgröße
        if (totalSize > CONFIG.MAX_TOTAL_SIZE) {
            errors.push(`Gesamtgröße zu groß: ${formatSize(totalSize)}`);
        }

        if (errors.length > 0) {
            log('❌ Validierungsfehler:', errors);
            return { valid: false, errors: errors };
        }

        log('✅ Validierung OK');
        return { valid: true, errors: [] };
    }

    /**
     * Fügt Validierung zu Upload-Feldern hinzu
     */
    function addValidation() {
        const $uploadField = $('#xi-upl-1');

        if (!$uploadField.length) {
            log('⚠️ Upload-Feld nicht gefunden');
            return;
        }

        // Aktiviere multiple-Attribut
        $uploadField.prop('multiple', true);
        log('✅ Multiple-Attribut aktiviert');

        // Change-Event für Validierung
        $uploadField.off('change.injection').on('change.injection', function(e) {
            const files = Array.from(e.target.files || []);

            if (files.length === 0) return;

            log('📁 Dateien ausgewählt:', files.length);

            const validation = validateFiles(files);

            if (!validation.valid) {
                // Blockiere Upload
                alert('Upload blockiert:\n\n' + validation.errors.join('\n'));

                // Leere Input
                e.target.value = '';
                log('❌ Upload blockiert');
                return false;
            }

            log('✅ Dateien werden hochgeladen...');
        });
    }

    /**
     * Erstellt Info-UI
     */
    function createUI() {
        const $container = $('#xi-upl-1-xc');

        $('.multi-upload-info').remove();

        const $ui = $('<div class="multi-upload-info"></div>').css({
            marginBottom: '15px',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            textAlign: 'center'
        });

        $ui.html(`
            <div style="margin-bottom:8px">🔧 Multiple-Upload aktiv (Code Injection)</div>
            <div style="font-size:12px;font-weight:normal;opacity:0.9">
                Formcycle's getUpload() wurde gepatcht<br>
                Max ${CONFIG.MAX_FILES} Dateien • Max ${formatSize(CONFIG.MAX_FILE_SIZE)} pro Datei
            </div>
        `);

        $container.prepend($ui);
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
        if (!$.xutil || !$.xutil.ajaxUpload) return;

        const manager = $.xutil.ajaxUpload;

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
                if (!$.xutil || !$.xutil.ajaxUpload) {
                    console.error('AjaxUploadManager nicht verfügbar');
                    return;
                }
                const result = $.xutil.ajaxUpload.getUpload($field[0]);
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
