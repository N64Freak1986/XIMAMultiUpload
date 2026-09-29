/**
 * FORMCYCLE API DIAGNOSE-SCRIPT
 *
 * Dieses Script untersucht die verfügbaren Formcycle-APIs
 * und zeigt, welche Upload-Mechanismen verfügbar sind.
 *
 * ANLEITUNG:
 * 1. Öffnen Sie: https://formulare.kempten.de/frontend-server/form/provide/10056/
 * 2. Drücken Sie F12 (Browser-Console)
 * 3. Kopieren und einfügen Sie diesen Code
 * 4. Drücken Sie Enter
 */

(function($) {
    console.clear();
    console.log('%c==============================================', 'color: #ff9800; font-weight: bold; font-size: 16px');
    console.log('%c🔍 FORMCYCLE API DIAGNOSE', 'color: #ff9800; font-weight: bold; font-size: 16px');
    console.log('%c==============================================', 'color: #ff9800; font-weight: bold; font-size: 16px');
    console.log('');

    // ============================================
    // 1. JQUERY CHECK
    // ============================================
    console.log('%c1️⃣  jQuery', 'color: #2196F3; font-weight: bold; font-size: 14px');
    if (typeof $ === 'undefined') {
        console.log('   ❌ jQuery nicht verfügbar');
    } else {
        console.log('   ✅ jQuery verfügbar:', $.fn.jquery);
        console.log('   📦 jQuery Object:', $);
    }
    console.log('');

    // ============================================
    // 2. FORMCYCLE XUTIL CHECK
    // ============================================
    console.log('%c2️⃣  Formcycle $.xutil', 'color: #2196F3; font-weight: bold; font-size: 14px');
    if (!$.xutil) {
        console.log('   ❌ $.xutil nicht verfügbar');
    } else {
        console.log('   ✅ $.xutil verfügbar');
        console.log('   📦 $.xutil:', $.xutil);
        console.log('   📋 Verfügbare Properties:');
        Object.keys($.xutil).forEach(key => {
            console.log(`      • ${key}:`, typeof $.xutil[key]);
        });
    }
    console.log('');

    // ============================================
    // 3. AJAX UPLOAD MANAGER CHECK
    // ============================================
    console.log('%c3️⃣  AjaxUploadManager', 'color: #2196F3; font-weight: bold; font-size: 14px');
    if (!$.xutil || !$.xutil.ajaxUpload) {
        console.log('   ❌ $.xutil.ajaxUpload NICHT verfügbar');
        console.log('   ℹ️  Dies bedeutet:');
        console.log('      • Formcycle-Version < 8.4.2 ODER');
        console.log('      • Anderer Upload-Mechanismus wird verwendet');
    } else {
        console.log('   ✅ $.xutil.ajaxUpload verfügbar');
        console.log('   📦 $.xutil.ajaxUpload:', $.xutil.ajaxUpload);
        console.log('   📋 Verfügbare Methods:');
        Object.keys($.xutil.ajaxUpload).forEach(key => {
            console.log(`      • ${key}:`, typeof $.xutil.ajaxUpload[key]);
        });
    }
    console.log('');

    // ============================================
    // 4. ALTERNATIVE UPLOAD APIS
    // ============================================
    console.log('%c4️⃣  Alternative Upload-APIs', 'color: #2196F3; font-weight: bold; font-size: 14px');

    const possibleApis = [
        '$.xutil.upload',
        '$.xutil.fileUpload',
        '$.xutil.multiUpload',
        '$.fn.upload',
        '$.fn.fileupload',
        'window.XFC',
        'window.xfc',
        'window.FormCycle',
        'window.formcycle'
    ];

    possibleApis.forEach(apiPath => {
        const parts = apiPath.split('.');
        let obj = window;
        let found = true;

        for (let part of parts) {
            if (part === 'window') continue;
            if (part.startsWith('$')) {
                obj = $;
                continue;
            }
            if (obj && obj[part]) {
                obj = obj[part];
            } else {
                found = false;
                break;
            }
        }

        if (found && obj) {
            console.log(`   ✅ ${apiPath}:`, typeof obj);
            if (typeof obj === 'object') {
                console.log(`      📋 Properties:`, Object.keys(obj).slice(0, 10).join(', '));
            }
        } else {
            console.log(`   ❌ ${apiPath}: nicht verfügbar`);
        }
    });
    console.log('');

    // ============================================
    // 5. XFC (FORMCYCLE FRAMEWORK) CHECK
    // ============================================
    console.log('%c5️⃣  XFC Framework', 'color: #2196F3; font-weight: bold; font-size: 14px');
    if (typeof XFC === 'undefined') {
        console.log('   ❌ XFC nicht verfügbar');
    } else {
        console.log('   ✅ XFC verfügbar');
        console.log('   📦 XFC:', XFC);
        console.log('   📋 XFC Properties:');
        Object.keys(XFC).forEach(key => {
            console.log(`      • ${key}:`, typeof XFC[key]);
        });
    }
    console.log('');

    // ============================================
    // 6. UPLOAD-FELD ANALYSE
    // ============================================
    console.log('%c6️⃣  Upload-Feld: xi-upl-1', 'color: #2196F3; font-weight: bold; font-size: 14px');
    const $uploadField = $('#xi-upl-1');

    if ($uploadField.length === 0) {
        console.log('   ❌ Upload-Feld nicht gefunden');
    } else {
        console.log('   ✅ Upload-Feld gefunden');
        console.log('   📋 Attribute:');
        const attrs = ['id', 'name', 'type', 'class', 'data-name', 'data-upload-mode', 'data-x-upload-modern-enabled'];
        attrs.forEach(attr => {
            const value = $uploadField.attr(attr);
            if (value) {
                console.log(`      • ${attr}: "${value}"`);
            }
        });

        console.log('   📋 jQuery Data:');
        const dataKeys = Object.keys($uploadField.data());
        if (dataKeys.length > 0) {
            dataKeys.forEach(key => {
                console.log(`      • ${key}:`, $uploadField.data(key));
            });
        } else {
            console.log('      (keine data-Attribute gefunden)');
        }

        console.log('   📋 Event Handlers:');
        const events = $._data($uploadField[0], 'events');
        if (events) {
            Object.keys(events).forEach(eventType => {
                console.log(`      • ${eventType}: ${events[eventType].length} handler(s)`);
            });
        } else {
            console.log('      (keine Events registriert)');
        }

        console.log('   📋 Properties:');
        console.log('      • multiple:', $uploadField.prop('multiple'));
        console.log('      • accept:', $uploadField.prop('accept'));
        console.log('      • disabled:', $uploadField.prop('disabled'));
    }
    console.log('');

    // ============================================
    // 7. ALLE UPLOAD-FELDER
    // ============================================
    console.log('%c7️⃣  Alle Upload-Felder im Formular', 'color: #2196F3; font-weight: bold; font-size: 14px');
    const $allUploads = $('input[type="file"]');
    console.log(`   📎 Gefunden: ${$allUploads.length} Upload-Feld(er)`);

    $allUploads.each(function(index) {
        const $field = $(this);
        console.log(`   ${index + 1}. ID: "${$field.attr('id')}" | Name: "${$field.attr('name')}" | Mode: "${$field.attr('data-upload-mode')}"`);
    });
    console.log('');

    // ============================================
    // 8. FORMCYCLE VERSION
    // ============================================
    console.log('%c8️⃣  Formcycle Version', 'color: #2196F3; font-weight: bold; font-size: 14px');

    // Versuche Version aus verschiedenen Quellen zu ermitteln
    const versionSources = [
        { name: 'XFC.version', value: typeof XFC !== 'undefined' && XFC.version },
        { name: 'XFC.VERSION', value: typeof XFC !== 'undefined' && XFC.VERSION },
        { name: '$.xutil.version', value: $.xutil && $.xutil.version },
        { name: 'Meta-Tag', value: $('meta[name="generator"]').attr('content') },
        { name: 'Body data-version', value: $('body').attr('data-version') }
    ];

    let versionFound = false;
    versionSources.forEach(source => {
        if (source.value) {
            console.log(`   ✅ ${source.name}: ${source.value}`);
            versionFound = true;
        }
    });

    if (!versionFound) {
        console.log('   ⚠️  Version konnte nicht automatisch ermittelt werden');
        console.log('   💡 Versuchen Sie manuell in der Console:');
        console.log('      • XFC.version');
        console.log('      • $.xutil.version');
        console.log('      • $("meta[name=\'generator\']").attr("content")');
    }
    console.log('');

    // ============================================
    // 9. EMPFEHLUNGEN
    // ============================================
    console.log('%c9️⃣  Empfehlungen', 'color: #28a745; font-weight: bold; font-size: 14px');

    if (!$.xutil || !$.xutil.ajaxUpload) {
        console.log('   ⚠️  $.xutil.ajaxUpload ist NICHT verfügbar');
        console.log('');
        console.log('   📋 LÖSUNGSANSÄTZE:');
        console.log('');
        console.log('   A) NATIVE HTML5 APPROACH (Empfohlen für ältere Formcycle-Versionen)');
        console.log('      • Setze multiple-Attribut: $("#xi-upl-1").prop("multiple", true)');
        console.log('      • Verwende native change-Events');
        console.log('      • Kein Progress-Tracking, aber funktioniert überall');
        console.log('');
        console.log('   B) JQUERY FILE UPLOAD PLUGIN (Falls verfügbar)');
        console.log('      • Prüfe ob $.fn.fileupload existiert');
        console.log('      • Nutze jQuery File Upload Plugin APIs');
        console.log('');
        console.log('   C) FORMCYCLE UPGRADE');
        console.log('      • Upgrade auf Formcycle >= 8.4.2');
        console.log('      • Dann ist $.xutil.ajaxUpload verfügbar');
        console.log('');
        console.log('   💡 NÄCHSTER SCHRITT:');
        console.log('      Führen Sie aus: simplifiedMultipleUpload()');
        console.log('      (Funktion wird unten definiert)');
    } else {
        console.log('   ✅ Alles OK! $.xutil.ajaxUpload ist verfügbar.');
        console.log('   ✅ Das Original-Script sollte funktionieren.');
    }
    console.log('');

    // ============================================
    // 10. VEREINFACHTE LÖSUNG (FALLBACK)
    // ============================================
    console.log('%c🔧 VEREINFACHTE LÖSUNG DEFINIERT', 'color: #9c27b0; font-weight: bold; font-size: 14px');
    console.log('   Diese Funktion aktiviert Multiple-Upload OHNE $.xutil.ajaxUpload');
    console.log('');

    window.simplifiedMultipleUpload = function() {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9c27b0; font-weight: bold');
        console.log('%c🚀 VEREINFACHTE MULTIPLE-UPLOAD AKTIVIERUNG', 'color: #9c27b0; font-weight: bold; font-size: 14px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9c27b0; font-weight: bold');
        console.log('');

        const $uploadField = $('#xi-upl-1');

        if ($uploadField.length === 0) {
            console.error('❌ Upload-Feld xi-upl-1 nicht gefunden!');
            return;
        }

        // 1. Multiple-Attribut setzen
        $uploadField.prop('multiple', true);
        console.log('✅ Multiple-Attribut gesetzt');

        // 2. Info-Box erstellen
        const $container = $uploadField.closest('.xm-container-upload, .XUpload').parent();
        $container.find('.simple-multi-info').remove();

        const $info = $('<div class="simple-multi-info"></div>').css({
            marginTop: '10px',
            padding: '12px 15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }).html(
            '🎯 <strong>Multiple-Upload aktiviert!</strong><br>' +
            '<span style="font-size: 13px; opacity: 0.9;">Sie können jetzt mehrere Dateien auswählen (Strg+Klick / Cmd+Klick)</span>'
        );

        $uploadField.after($info);
        console.log('✅ Info-Box erstellt');

        // 3. Change-Event für Feedback
        $uploadField.on('change.multiupload', function() {
            const files = this.files;
            if (files && files.length > 0) {
                console.log(`✅ ${files.length} Datei(en) ausgewählt:`);
                for (let i = 0; i < files.length; i++) {
                    const size = files[i].size;
                    const sizeStr = size < 1024 ? size + ' B' :
                                   size < 1024*1024 ? (size/1024).toFixed(1) + ' KB' :
                                   (size/(1024*1024)).toFixed(1) + ' MB';
                    console.log(`   ${i+1}. ${files[i].name} (${sizeStr})`);
                }

                // Visuelles Feedback
                $info.html(
                    `✅ <strong>${files.length} Datei(en) ausgewählt!</strong><br>` +
                    '<span style="font-size: 13px; opacity: 0.9;">Upload wird verarbeitet...</span>'
                );

                setTimeout(() => {
                    $info.html(
                        '🎯 <strong>Multiple-Upload aktiviert!</strong><br>' +
                        '<span style="font-size: 13px; opacity: 0.9;">Sie können jetzt mehrere Dateien auswählen (Strg+Klick / Cmd+Klick)</span>'
                    );
                }, 3000);
            }
        });
        console.log('✅ Change-Event registriert');

        console.log('');
        console.log('%c✅ AKTIVIERUNG ABGESCHLOSSEN!', 'color: #28a745; font-weight: bold; font-size: 14px');
        console.log('%cTesten Sie jetzt:', 'color: #666');
        console.log('%c1. Klicken Sie auf das Upload-Feld', 'color: #666');
        console.log('%c2. Wählen Sie mehrere Dateien mit Strg/Cmd+Klick', 'color: #666');
        console.log('%c3. Die Console zeigt alle ausgewählten Dateien', 'color: #666');
        console.log('');
    };

    console.log('   💡 Funktion definiert: simplifiedMultipleUpload()');
    console.log('   📝 Führen Sie aus: simplifiedMultipleUpload()');
    console.log('');

    // ============================================
    // ZUSAMMENFASSUNG
    // ============================================
    console.log('%c==============================================', 'color: #ff9800; font-weight: bold; font-size: 16px');
    console.log('%c📊 ZUSAMMENFASSUNG', 'color: #ff9800; font-weight: bold; font-size: 16px');
    console.log('%c==============================================', 'color: #ff9800; font-weight: bold; font-size: 16px');
    console.log('');

    if ($.xutil && $.xutil.ajaxUpload) {
        console.log('%c✅ FORMCYCLE 8.4.2+ ERKANNT', 'color: #28a745; font-weight: bold');
        console.log('   Das Original-Script sollte funktionieren!');
    } else {
        console.log('%c⚠️  ÄLTERE FORMCYCLE-VERSION', 'color: #ff9800; font-weight: bold');
        console.log('   Verwenden Sie die vereinfachte Lösung:');
        console.log('');
        console.log('%c   simplifiedMultipleUpload()', 'background: #f0f0f0; color: #333; padding: 5px 10px; border-radius: 3px; font-family: monospace');
        console.log('');
    }

    console.log('');

})(jQuery);
