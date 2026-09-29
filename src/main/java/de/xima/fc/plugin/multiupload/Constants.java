package de.xima.fc.plugin.multiupload;

/**
 * Constants and configuration defaults for the FORMCYCLE Multi Upload Plugin.
 */
public final class Constants {

    private Constants() {
        // utility class
    }

    public static final String PLUGIN_NAME = "fc-plugin-multi-upload";
    public static final String WIDGET_NAME = "multiupload";
    public static final String ICON_NAME = "ico-fc-multi-upload";

    // Form element widget property keys (configured in the FORMCYCLE Designer)
    public static final String PROP_MAX_FILE_SIZE = "multiUploadMaxFileSize";
    public static final String PROP_MAX_TOTAL_SIZE = "multiUploadMaxTotalSize";
    public static final String PROP_MAX_FILES = "multiUploadMaxFiles";
    public static final String PROP_ALLOWED_EXTENSIONS = "multiUploadAllowedExtensions";
    public static final String PROP_DROPZONE_ENABLED = "multiUploadDropzoneEnabled";
    public static final String PROP_THEME = "multiUploadTheme";
    public static final String PROP_BUTTON_TEXT = "multiUploadButtonText";
    public static final String PROP_ADD_MORE_TEXT = "multiUploadAddMoreText";
    public static final String PROP_CLEAR_ALL_TEXT = "multiUploadClearAllText";
    public static final String PROP_CUSTOM_ERROR_MSG = "multiUploadCustomErrorMsg";

    // Global bundle property keys (configured in FORMCYCLE Administration -> Plugins)
    public static final String BUNDLE_PROP_DEFAULT_MAX_FILE_SIZE = "fc.plugin.multiupload.defaultMaxFileSize";
    public static final String BUNDLE_PROP_DEFAULT_MAX_TOTAL_SIZE = "fc.plugin.multiupload.defaultMaxTotalSize";
    public static final String BUNDLE_PROP_DEFAULT_MAX_FILES = "fc.plugin.multiupload.defaultMaxFiles";
    public static final String BUNDLE_PROP_DEFAULT_ALLOWED_EXTENSIONS = "fc.plugin.multiupload.defaultAllowedExtensions";
    public static final String BUNDLE_PROP_ENABLE_GLOBAL_AUTO_ENHANCE = "fc.plugin.multiupload.enableGlobalAutoEnhance";

    // Default configuration values
    public static final int DEFAULT_MAX_FILE_SIZE_MB = 10;
    public static final int DEFAULT_MAX_TOTAL_SIZE_MB = 100;
    public static final int DEFAULT_MAX_FILES = 10;
    public static final String DEFAULT_ALLOWED_EXTENSIONS = ".pdf, .png, .jpg, .jpeg, .docx, .xlsx, .zip";
    public static final boolean DEFAULT_DROPZONE_ENABLED = true;
    public static final String DEFAULT_THEME = "modern";
    public static final String DEFAULT_BUTTON_TEXT = "Dateien auswählen";
    public static final String DEFAULT_ADD_MORE_TEXT = "➕ Weitere hinzufügen";
    public static final String DEFAULT_CLEAR_ALL_TEXT = "🗑️ Alle löschen";
}
