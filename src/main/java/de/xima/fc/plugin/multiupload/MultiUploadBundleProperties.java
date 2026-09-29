package de.xima.fc.plugin.multiupload;

import de.xima.fc.interfaces.plugin.lifecycle.helper.IPluginResourceHelper;
import de.xima.fc.plugin.config.IBundleConfigParam;
import de.xima.fc.plugin.config.IBundleProperties;
import de.xima.fc.plugin.models.config.BundleConfigParam;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Global bundle properties for the Multi Upload Plugin.
 * Allows configuring default file limits, extensions, and global auto-enhancement
 * centrally in the FORMCYCLE plugin administration (System or Client level).
 */
public class MultiUploadBundleProperties implements IBundleProperties {

    @Override
    public Map<String, IBundleConfigParam> getConfigProperties(IPluginResourceHelper resHelper, Locale locale) {
        final Map<String, IBundleConfigParam> map = new LinkedHashMap<>();

        map.put(Constants.BUNDLE_PROP_DEFAULT_MAX_FILE_SIZE, new BundleConfigParam(
                Constants.BUNDLE_PROP_DEFAULT_MAX_FILE_SIZE,
                I18N.localize("bundle.prop.default_max_file_size", locale, "Standard Max. Dateigröße pro Datei (in MB, z. B. 10)"),
                false,
                false,
                String.valueOf(Constants.DEFAULT_MAX_FILE_SIZE_MB)
        ));

        map.put(Constants.BUNDLE_PROP_DEFAULT_MAX_TOTAL_SIZE, new BundleConfigParam(
                Constants.BUNDLE_PROP_DEFAULT_MAX_TOTAL_SIZE,
                I18N.localize("bundle.prop.default_max_total_size", locale, "Standard Max. Gesamtgröße aller Dateien (in MB, z. B. 100)"),
                false,
                false,
                String.valueOf(Constants.DEFAULT_MAX_TOTAL_SIZE_MB)
        ));

        map.put(Constants.BUNDLE_PROP_DEFAULT_MAX_FILES, new BundleConfigParam(
                Constants.BUNDLE_PROP_DEFAULT_MAX_FILES,
                I18N.localize("bundle.prop.default_max_files", locale, "Standard Maximale Dateianzahl (z. B. 10)"),
                false,
                false,
                String.valueOf(Constants.DEFAULT_MAX_FILES)
        ));

        map.put(Constants.BUNDLE_PROP_DEFAULT_ALLOWED_EXTENSIONS, new BundleConfigParam(
                Constants.BUNDLE_PROP_DEFAULT_ALLOWED_EXTENSIONS,
                I18N.localize("bundle.prop.default_allowed_extensions", locale, "Standard Erlaubte Dateiendungen (z. B. .pdf, .jpg, .png, .docx, .zip)"),
                false,
                false,
                Constants.DEFAULT_ALLOWED_EXTENSIONS
        ));

        map.put(Constants.BUNDLE_PROP_ENABLE_GLOBAL_AUTO_ENHANCE, new BundleConfigParam(
                Constants.BUNDLE_PROP_ENABLE_GLOBAL_AUTO_ENHANCE,
                I18N.localize("bundle.prop.enable_global_auto_enhance", locale, "Bestehende Standard-Upload-Felder mit CSS-Klasse 'custom-upload' oder 'fc-multi-upload' automatisch erweitern (true/false)"),
                false,
                false,
                "true"
        ));

        return map;
    }
}
