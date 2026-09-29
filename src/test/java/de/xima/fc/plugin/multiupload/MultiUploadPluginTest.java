package de.xima.fc.plugin.multiupload;

import de.xima.fc.form.common.models.IXItemWidget;
import de.xima.fc.interfaces.workflow.IResourceDescriptor;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MultiUploadPluginTest {

    private MultiUploadPlugin plugin;

    @BeforeEach
    void setUp() {
        plugin = new MultiUploadPlugin();
        MultiUploadPlugin.setBundleProperties(new Properties());
    }

    @Test
    void testPluginMetadata() {
        assertEquals(Constants.PLUGIN_NAME, plugin.getName());
        assertEquals("Multipler Upload Plugin", plugin.getDisplayName(Locale.GERMAN));
        assertEquals("Multiple Upload Plugin", plugin.getDisplayName(Locale.ENGLISH));
        assertNotNull(plugin.getDescription(Locale.GERMAN));

        List<Class<? extends IXItemWidget>> widgets = plugin.getWidgets(Locale.GERMAN);
        assertNotNull(widgets);
        assertEquals(1, widgets.size());
        assertEquals(MultiUploadWidget.class, widgets.get(0));
    }

    @Test
    void testResources() throws Exception {
        IResourceDescriptor cssRes = plugin.getCssResource();
        assertNotNull(cssRes);
        assertEquals(StandardCharsets.UTF_8, cssRes.getCharset());
        try (InputStream in = cssRes.open()) {
            String css = IOUtils.toString(in, StandardCharsets.UTF_8);
            assertTrue(css.contains("ico-fc-multi-upload"));
        }

        IResourceDescriptor jsRes = plugin.getJavaScriptResource();
        assertNotNull(jsRes);
        try (InputStream in = jsRes.open()) {
            String js = IOUtils.toString(in, StandardCharsets.UTF_8);
            assertTrue(js.contains("Multi Upload Widget runtime"));
        }

        IResourceDescriptor designerCss = plugin.getCssForDesignerUiResource();
        assertNotNull(designerCss);
        try (InputStream in = designerCss.open()) {
            String css = IOUtils.toString(in, StandardCharsets.UTF_8);
            assertTrue(css.contains("ico-fc-multi-upload"));
        }
    }

    @Test
    void testConfigResolutionDefaults() {
        assertEquals(Constants.DEFAULT_MAX_FILE_SIZE_MB, MultiUploadPlugin.resolveMaxFileSize(""));
        assertEquals(Constants.DEFAULT_MAX_TOTAL_SIZE_MB, MultiUploadPlugin.resolveMaxTotalSize(""));
        assertEquals(Constants.DEFAULT_MAX_FILES, MultiUploadPlugin.resolveMaxFiles(""));
        assertEquals(Constants.DEFAULT_ALLOWED_EXTENSIONS, MultiUploadPlugin.resolveAllowedExtensions(""));
        assertTrue(MultiUploadPlugin.isGlobalAutoEnhanceEnabled());
    }

    @Test
    void testConfigResolutionElementOverrides() {
        assertEquals(25, MultiUploadPlugin.resolveMaxFileSize("25"));
        assertEquals(250, MultiUploadPlugin.resolveMaxTotalSize("250"));
        assertEquals(5, MultiUploadPlugin.resolveMaxFiles("5"));
        assertEquals(".pdf, .docx", MultiUploadPlugin.resolveAllowedExtensions(".pdf, .docx"));
    }

    @Test
    void testConfigResolutionBundleFallback() {
        Properties bundleProps = new Properties();
        bundleProps.setProperty(Constants.BUNDLE_PROP_DEFAULT_MAX_FILE_SIZE, "50");
        bundleProps.setProperty(Constants.BUNDLE_PROP_DEFAULT_MAX_TOTAL_SIZE, "500");
        bundleProps.setProperty(Constants.BUNDLE_PROP_DEFAULT_MAX_FILES, "20");
        bundleProps.setProperty(Constants.BUNDLE_PROP_DEFAULT_ALLOWED_EXTENSIONS, ".png, .jpg");
        bundleProps.setProperty(Constants.BUNDLE_PROP_ENABLE_GLOBAL_AUTO_ENHANCE, "false");
        MultiUploadPlugin.setBundleProperties(bundleProps);

        // When element value is empty, bundle property wins
        assertEquals(50, MultiUploadPlugin.resolveMaxFileSize(""));
        assertEquals(500, MultiUploadPlugin.resolveMaxTotalSize(""));
        assertEquals(20, MultiUploadPlugin.resolveMaxFiles(""));
        assertEquals(".png, .jpg", MultiUploadPlugin.resolveAllowedExtensions(""));
        assertFalse(MultiUploadPlugin.isGlobalAutoEnhanceEnabled());

        // But explicit element value still takes precedence over bundle property
        assertEquals(15, MultiUploadPlugin.resolveMaxFileSize("15"));
    }
}
