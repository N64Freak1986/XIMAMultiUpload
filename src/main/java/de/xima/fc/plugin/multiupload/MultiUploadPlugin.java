package de.xima.fc.plugin.multiupload;

import de.xima.fc.form.common.models.IXItemWidget;
import de.xima.fc.interfaces.plugin.lifecycle.IPluginInitializeData;
import de.xima.fc.interfaces.plugin.lifecycle.IPluginInstallData;
import de.xima.fc.interfaces.plugin.lifecycle.IPluginShutdownData;
import de.xima.fc.interfaces.plugin.lifecycle.IPluginUninstallData;
import de.xima.fc.interfaces.plugin.param.form.IPluginFormElementGetResourceParams;
import de.xima.fc.interfaces.workflow.IResourceDescriptor;
import de.xima.fc.plugin.exception.FCPluginException;
import de.xima.fc.plugin.interfaces.form.IPluginFormElementWidget;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

/**
 * FORMCYCLE Plugin entrypoint registering the Multi-Upload form widget.
 * Implements IPluginFormElementWidget for FORMCYCLE 8.5.5+.
 */
public class MultiUploadPlugin implements IPluginFormElementWidget {

    private static final long serialVersionUID = 1L;
    private static final Logger LOGGER = LoggerFactory.getLogger(MultiUploadPlugin.class);

    private static volatile Properties bundleProperties = new Properties();
    private volatile String version = "1.0.0";

    @Override
    public void initialize(IPluginInitializeData initializeData) throws FCPluginException {
        if (initializeData != null) {
            if (initializeData.getProperties() != null) {
                bundleProperties = new Properties();
                bundleProperties.putAll(initializeData.getProperties());
                LOGGER.info("Multi Upload bundle properties loaded: count={}", bundleProperties.size());
            }
            if (initializeData.getManifest() != null) {
                final String manifestVersion = initializeData.getManifest().getVersion();
                if (manifestVersion != null) {
                    this.version = manifestVersion;
                }
            }
        }
        LOGGER.info("Multi Upload FORMCYCLE Plugin v{} initialized successfully.", this.version);
    }

    public static Properties getBundleProperties() {
        return bundleProperties;
    }

    public static void setBundleProperties(Properties properties) {
        if (properties != null) {
            bundleProperties = new Properties();
            bundleProperties.putAll(properties);
        } else {
            bundleProperties = new Properties();
        }
    }

    public static String getBundleProperty(String... keys) {
        if (bundleProperties == null || keys == null) {
            return null;
        }
        for (String key : keys) {
            if (key != null) {
                String val = bundleProperties.getProperty(key);
                if (StringUtils.isNotBlank(val)) {
                    return val.trim();
                }
            }
        }
        return null;
    }

    public static int resolveMaxFileSize(String elementValue) {
        if (StringUtils.isNotBlank(elementValue)) {
            try {
                return Integer.parseInt(elementValue.trim());
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        final String global = getBundleProperty(Constants.BUNDLE_PROP_DEFAULT_MAX_FILE_SIZE);
        if (StringUtils.isNotBlank(global)) {
            try {
                return Integer.parseInt(global.trim());
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        return Constants.DEFAULT_MAX_FILE_SIZE_MB;
    }

    public static int resolveMaxTotalSize(String elementValue) {
        if (StringUtils.isNotBlank(elementValue)) {
            try {
                return Integer.parseInt(elementValue.trim());
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        final String global = getBundleProperty(Constants.BUNDLE_PROP_DEFAULT_MAX_TOTAL_SIZE);
        if (StringUtils.isNotBlank(global)) {
            try {
                return Integer.parseInt(global.trim());
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        return Constants.DEFAULT_MAX_TOTAL_SIZE_MB;
    }

    public static int resolveMaxFiles(String elementValue) {
        if (StringUtils.isNotBlank(elementValue)) {
            try {
                return Integer.parseInt(elementValue.trim());
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        final String global = getBundleProperty(Constants.BUNDLE_PROP_DEFAULT_MAX_FILES);
        if (StringUtils.isNotBlank(global)) {
            try {
                return Integer.parseInt(global.trim());
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        return Constants.DEFAULT_MAX_FILES;
    }

    public static String resolveAllowedExtensions(String elementValue) {
        if (StringUtils.isNotBlank(elementValue)) {
            return elementValue.trim();
        }
        final String global = getBundleProperty(Constants.BUNDLE_PROP_DEFAULT_ALLOWED_EXTENSIONS);
        if (StringUtils.isNotBlank(global)) {
            return global.trim();
        }
        return Constants.DEFAULT_ALLOWED_EXTENSIONS;
    }

    public static boolean isGlobalAutoEnhanceEnabled() {
        final String global = getBundleProperty(Constants.BUNDLE_PROP_ENABLE_GLOBAL_AUTO_ENHANCE);
        return StringUtils.isBlank(global) || Boolean.parseBoolean(global.trim());
    }

    @Override
    public void install(IPluginInstallData installData) throws FCPluginException {
        LOGGER.info("Multi Upload FORMCYCLE Plugin installed.");
    }

    @Override
    public void shutdown(IPluginShutdownData shutdownData) throws FCPluginException {
        LOGGER.info("Multi Upload FORMCYCLE Plugin shut down.");
    }

    @Override
    public void uninstall(IPluginUninstallData uninstallData) throws FCPluginException {
        LOGGER.info("Multi Upload FORMCYCLE Plugin uninstalled.");
    }

    @Override
    public String getName() {
        return Constants.PLUGIN_NAME;
    }

    @Override
    public String getDisplayName(Locale locale) {
        return I18N.localize("plugin.multi_upload.name", locale, "Multipler Upload Plugin");
    }

    @Override
    public String getDescription(Locale locale) {
        return I18N.localize("plugin.multi_upload.desc", locale,
                "Natives Multi-File-Upload Widget und Formular-Erweiterung für XIMA FORMCYCLE.");
    }

    public static final String PLUGIN_CSS =
            "/* Multi Upload Element Icon for FORMCYCLE Designer & Palette */\n" +
            ".drawer-panel__designer-item .ico-fc-multi-upload,\n" +
            ".xm-element-icon .ico-fc-multi-upload,\n" +
            ".ico-fc-multi-upload {\n" +
            "    display: inline-block !important;\n" +
            "    width: 20px !important;\n" +
            "    height: 20px !important;\n" +
            "    min-width: 20px !important;\n" +
            "    min-height: 20px !important;\n" +
            "    vertical-align: middle !important;\n" +
            "    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%236366f1' d='M26 18a6 6 0 0 1-5.3 5.95v-2.02a4 4 0 0 0 3.3-3.93 4 4 0 0 0-4-4h-1.5a1 1 0 0 1-.95-.68A7.01 7.01 0 0 0 4.1 16.2 5 5 0 0 0 6 25.95v2.02A7 7 0 0 1 3.03 14.5 9 9 0 0 1 20.35 10 6 6 0 0 1 26 18z'/%3E%3Cpath fill='%234338ca' d='M15 17.41V29h2V17.41l3.3 3.3 1.4-1.42L16 13.59l-5.7 5.7 1.4 1.42 3.3-3.3z'/%3E%3Cpath fill='%2306b6d4' d='M27 6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0V8h5v5a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1z'/%3E%3C/svg%3E\") !important;\n" +
            "    background-repeat: no-repeat !important;\n" +
            "    background-position: center !important;\n" +
            "    background-size: contain !important;\n" +
            "    font-size: 0 !important;\n" +
            "    color: transparent !important;\n" +
            "}\n" +
            ".drawer-panel__designer-item .ico-fc-multi-upload:before,\n" +
            ".xm-element-icon .ico-fc-multi-upload:before,\n" +
            ".ico-fc-multi-upload:before {\n" +
            "    content: '' !important;\n" +
            "    display: none !important;\n" +
            "    font-size: 0 !important;\n" +
            "}\n" +
            ".fc-multi-upload-preview-logo {\n" +
            "    display: inline-block !important;\n" +
            "    width: 32px !important;\n" +
            "    height: 32px !important;\n" +
            "    min-width: 32px !important;\n" +
            "    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%236366f1' d='M26 18a6 6 0 0 1-5.3 5.95v-2.02a4 4 0 0 0 3.3-3.93 4 4 0 0 0-4-4h-1.5a1 1 0 0 1-.95-.68A7.01 7.01 0 0 0 4.1 16.2 5 5 0 0 0 6 25.95v2.02A7 7 0 0 1 3.03 14.5 9 9 0 0 1 20.35 10 6 6 0 0 1 26 18z'/%3E%3Cpath fill='%234338ca' d='M15 17.41V29h2V17.41l3.3 3.3 1.4-1.42L16 13.59l-5.7 5.7 1.4 1.42 3.3-3.3z'/%3E%3Cpath fill='%2306b6d4' d='M27 6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0V8h5v5a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1z'/%3E%3C/svg%3E\") !important;\n" +
            "    background-repeat: no-repeat !important;\n" +
            "    background-position: center !important;\n" +
            "    background-size: contain !important;\n" +
            "}\n";

    public static final String PLUGIN_JS =
            "/** FORMCYCLE Multi Upload Widget Runtime loaded */\n" +
            "(function() {\n" +
            "  if (window.console && window.console.debug) {\n" +
            "    window.console.debug('Multi Upload Widget runtime registered.');\n" +
            "  }\n" +
            "})();\n";

    @Override
    public List<Class<? extends IXItemWidget>> getWidgets(Locale locale) {
        return Collections.singletonList(MultiUploadWidget.class);
    }

    private static class StaticResourceDescriptor implements IResourceDescriptor {
        private final URI uri;
        private final String content;

        StaticResourceDescriptor(String uriString, String content) {
            this.uri = URI.create(uriString);
            this.content = content != null ? content : "";
        }

        @Override
        public URI getAbsoluteUri() {
            return uri;
        }

        @Override
        public InputStream open() {
            return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
        }

        @Override
        public Charset getCharset() {
            return StandardCharsets.UTF_8;
        }
    }

    @Override
    public IResourceDescriptor getCssResource() {
        return new StaticResourceDescriptor("fcplugin://multi-upload/plugin.css", PLUGIN_CSS);
    }

    @Override
    public IResourceDescriptor getCssResource(IPluginFormElementGetResourceParams params) {
        return getCssResource();
    }

    @Override
    public IResourceDescriptor getCssForDesignerUiResource() {
        return new StaticResourceDescriptor("fcplugin://multi-upload/designer.css", PLUGIN_CSS);
    }

    @Override
    public IResourceDescriptor getCssForDesignerUiResource(IPluginFormElementGetResourceParams params) {
        return getCssForDesignerUiResource();
    }

    @Override
    public IResourceDescriptor getJavaScriptResource() {
        return new StaticResourceDescriptor("fcplugin://multi-upload/plugin.js", PLUGIN_JS);
    }

    @Override
    public IResourceDescriptor getJavaScriptResource(IPluginFormElementGetResourceParams params) {
        return getJavaScriptResource();
    }

    @Override
    public String getCssData() {
        return PLUGIN_CSS;
    }

    @Override
    public String getCssDataForDesignerUi() {
        return PLUGIN_CSS;
    }

    @Override
    public String getJavaScriptData() {
        return PLUGIN_JS;
    }
}
