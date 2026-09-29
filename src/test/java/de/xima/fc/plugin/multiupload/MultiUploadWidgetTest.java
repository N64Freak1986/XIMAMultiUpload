package de.xima.fc.plugin.multiupload;

import com.hp.gagawa.java.elements.Div;
import de.xima.fc.form.common.XPropertyEnum;
import de.xima.fc.form.common.models.AXItemPropertiesData;
import de.xima.fc.form.common.models.IFormContainerMetaData;
import de.xima.fc.form.common.models.IXFormRenderConfig;
import de.xima.fc.form.common.models.IXItemPropertiesData;
import de.xima.fc.form.common.models.IXValidationParams;
import de.xima.fc.form.common.models.IXValidationResult;
import de.xima.fc.form.common.models.IXProcessUploadParams;
import de.xima.fc.form.common.models.IXProcessUploadResult;
import de.xima.fc.form.common.models.IXUpload;
import de.xima.fc.form.common.models.XItemPropertyDesc;
import de.xima.fc.form.common.models.XItemRenderData;
import de.xima.fc.form.common.models.XPropertyValue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.Serializable;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MultiUploadWidgetTest {

    private MultiUploadWidget widget;

    @BeforeEach
    void setUp() {
        widget = new MultiUploadWidget();
        MultiUploadPlugin.setBundleProperties(new Properties());
    }

    @Test
    void testBasicMetadata() {
        assertEquals("Multipler Upload", widget.getLabel(Locale.GERMAN));
        assertEquals("Multiple Upload", widget.getLabel(Locale.ENGLISH));
        assertEquals(Constants.ICON_NAME, widget.getIcon());
        assertEquals(Constants.WIDGET_NAME, widget.getPrefix());
        assertTrue(widget.isSubmitsValues());
        assertNotNull(widget.getCssData());
        assertNotNull(widget.getCssData(null));
        assertNotNull(widget.getJavaScriptData());
        assertNotNull(widget.getJavaScriptData(null));
    }

    @Test
    void testAvailableProperties() {
        ArrayList<XItemPropertyDesc> properties = widget.getAvailableProperties(Locale.GERMAN);
        assertNotNull(properties);
        assertFalse(properties.isEmpty());

        List<String> names = new ArrayList<>();
        for (XItemPropertyDesc desc : properties) {
            names.add(desc.getName());
        }

        // Standard properties
        assertTrue(names.contains(XPropertyEnum.name.name()));
        assertTrue(names.contains(XPropertyEnum.label.name()));
        assertTrue(names.contains(XPropertyEnum.required.name()));
        assertTrue(names.contains(XPropertyEnum.ishidden.name()));

        // Multi upload specific properties
        assertTrue(names.contains(Constants.PROP_MAX_FILE_SIZE));
        assertTrue(names.contains(Constants.PROP_MAX_TOTAL_SIZE));
        assertTrue(names.contains(Constants.PROP_MAX_FILES));
        assertTrue(names.contains(Constants.PROP_ALLOWED_EXTENSIONS));
        assertTrue(names.contains(Constants.PROP_DROPZONE_ENABLED));
        assertTrue(names.contains(Constants.PROP_THEME));
        assertTrue(names.contains(Constants.PROP_BUTTON_TEXT));
        assertTrue(names.contains(Constants.PROP_ADD_MORE_TEXT));
        assertTrue(names.contains(Constants.PROP_CLEAR_ALL_TEXT));
        assertTrue(names.contains(Constants.PROP_CUSTOM_ERROR_MSG));
    }

    @Test
    void testCleanUpIncludesSuppressesExternalWidgetUrls() {
        final LinkedHashMap<String, String> cssMap = new LinkedHashMap<>();
        final LinkedHashMap<String, String> jsMap = new LinkedHashMap<>();

        String cssUrl = "https://example.com/form/includes/ressource/852/2458/plugin/form-element-widget/de.xima.fc.plugin%3A%3Afc-plugin-multi-upload/fc-plugin-multi-upload/MultiUploadWidget.css";
        String jsUrl = "https://example.com/form/includes/ressource/852/2458/plugin/form-element-widget/de.xima.fc.plugin%3A%3Afc-plugin-multi-upload/fc-plugin-multi-upload/MultiUploadWidget.js";
        String otherCss = "https://example.com/form/includes/ressource/852/2458/plugin/other/other.css";

        cssMap.put(cssUrl, cssUrl);
        cssMap.put(otherCss, otherCss);
        jsMap.put(jsUrl, jsUrl);

        IXFormRenderConfig mockConfig = (IXFormRenderConfig) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{IXFormRenderConfig.class},
                (proxy, method, args) -> {
                    if ("getCssIncludes".equals(method.getName())) return cssMap;
                    if ("getJsIncludes".equals(method.getName())) return jsMap;
                    return null;
                }
        );

        widget.cleanUpIncludes(mockConfig);

        assertEquals(1, cssMap.size());
        assertTrue(cssMap.containsKey(otherCss));
        assertFalse(cssMap.containsKey(cssUrl));

        assertEquals(0, jsMap.size());
        assertFalse(jsMap.containsKey(jsUrl));
    }

    @Test
    void testRenderItemPreviewGeneratesDesignerCanvas() {
        Div container = new Div();
        widget.renderItemPreview(container, null, null, null);
        String html = container.write();

        assertNotNull(html);
        assertTrue(html.contains("Multipler Datei-Upload"));
        assertTrue(html.contains("fc-multi-upload-preview-logo"));
        assertTrue(html.contains("Multi-Upload"));
        assertTrue(html.contains("Dateien per Drag & Drop hier ablegen"));
    }

    @Test
    void testRenderItemGeneratesLiveFormMarkup() {
        Div container = new Div();
        widget.renderItem(container, null, null, null);
        String html = container.write();

        assertNotNull(html);
        assertTrue(html.contains("fc-multi-upload-container"));
        assertTrue(html.contains("data-upload-mode=\"native\""));
        assertTrue(html.contains("multiple=\"multiple\""));
        assertTrue(html.contains("fc-mu-dropzone"));
        assertTrue(html.contains("fc-mu-btn-add"));
        assertTrue(html.contains("fc-mu-btn-clear"));
        assertTrue(html.contains("DataTransfer"));
    }

    @Test
    void testValidateBypassedWhenShouldValidateIsFalse() {
        TestValidationParams params = new TestValidationParams();
        params.setShouldValidate(false);

        List<IXValidationResult> results = widget.validate(params);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertTrue(results.get(0).isValid());
    }

    @Test
    void testValidateBypassedWhenHidden() {
        TestValidationParams params = new TestValidationParams();
        params.setShouldValidate(true);

        AXItemPropertiesData propData = new AXItemPropertiesData(new HashMap<>());
        propData.put(XPropertyEnum.ishidden.name(), new XPropertyValue(XPropertyEnum.ishidden.name(), true));
        propData.put(XPropertyEnum.required.name(), new XPropertyValue(XPropertyEnum.required.name(), true));
        params.setItemPropertiesData(propData);
        params.setElementValues(new String[0]); // No value, but hidden!

        List<IXValidationResult> results = widget.validate(params);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertTrue(results.get(0).isValid());
    }

    @Test
    void testValidateMandatoryField() {
        TestValidationParams params = new TestValidationParams();
        params.setShouldValidate(true);

        AXItemPropertiesData propData = new AXItemPropertiesData(new HashMap<>());
        propData.put(XPropertyEnum.required.name(), new XPropertyValue(XPropertyEnum.required.name(), true));
        propData.set("name", "mu_field");
        params.setItemPropertiesData(propData);

        // 1. Missing values -> invalid
        params.setElementValues(new String[0]);
        List<IXValidationResult> results = widget.validate(params);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertFalse(results.get(0).isValid());

        // 2. Value present -> valid
        params.setElementValues(new String[]{"file1.pdf"});
        results = widget.validate(params);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertTrue(results.get(0).isValid());
    }

    @Test
    void testValidateMaxFilesLimit() {
        TestValidationParams params = new TestValidationParams();
        params.setShouldValidate(true);

        AXItemPropertiesData propData = new AXItemPropertiesData(new HashMap<>());
        propData.put(Constants.PROP_MAX_FILES, new XPropertyValue(Constants.PROP_MAX_FILES, "3"));
        params.setItemPropertiesData(propData);

        // 4 files with limit 3 -> invalid
        params.setElementValues(new String[]{"f1.pdf", "f2.pdf", "f3.pdf", "f4.pdf"});
        List<IXValidationResult> results = widget.validate(params);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertFalse(results.get(0).isValid());
        assertTrue(results.get(0).getMessage().contains("maximal 3 Dateien"));

        // 3 files with limit 3 -> valid
        params.setElementValues(new String[]{"f1.pdf", "f2.pdf", "f3.pdf"});
        results = widget.validate(params);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertTrue(results.get(0).isValid());
    }

    @Test
    void testProcessUploadWithNull() throws IOException {
        assertNull(widget.processUpload(null));

        IXProcessUploadParams emptyParams = (IXProcessUploadParams) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{IXProcessUploadParams.class},
                (proxy, method, args) -> null
        );
        assertNull(widget.processUpload(emptyParams));
    }

    @Test
    void testProcessUploadWithValidUpload() throws IOException {
        IXUpload mockUpload = (IXUpload) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{IXUpload.class},
                (proxy, method, args) -> "dummy"
        );
        IXProcessUploadParams params = (IXProcessUploadParams) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{IXProcessUploadParams.class},
                (proxy, method, args) -> {
                    if ("getUpload".equals(method.getName())) return mockUpload;
                    if ("getPostProcessorChain".equals(method.getName())) return Collections.emptyList();
                    return null;
                }
        );

        IXProcessUploadResult result = widget.processUpload(params);
        assertNotNull(result);
        assertSame(mockUpload, result.getFileItemReplacement());
    }

    static class TestValidationParams implements IXValidationParams {
        private boolean shouldValidate = true;
        private String[] elementValues = new String[0];
        private IXItemPropertiesData itemPropertiesData;
        private Map<String, List<String[]>> fieldValuesMap = new HashMap<>();
        private Locale locale = Locale.GERMAN;

        public void setShouldValidate(boolean shouldValidate) { this.shouldValidate = shouldValidate; }
        public void setElementValues(String[] elementValues) { this.elementValues = elementValues; }
        public void setItemPropertiesData(IXItemPropertiesData itemPropertiesData) { this.itemPropertiesData = itemPropertiesData; }
        public void setFieldValuesMap(Map<String, List<String[]>> fieldValuesMap) { this.fieldValuesMap = fieldValuesMap; }
        public void setLocale(Locale locale) { this.locale = locale; }

        @Override public boolean isShouldValidate() { return shouldValidate; }
        @Override public String[] getElementValues() { return elementValues; }
        @Override public IXItemPropertiesData getXItemPropertiesData() { return itemPropertiesData; }
        @Override public Map<String, List<String[]>> getFieldValuesMap() { return fieldValuesMap; }
        @Override public Locale getLocale() { return locale; }
        @Override public List<String[]> getValues() { return Collections.emptyList(); }
        @Override public List<String[]> getValues(String key) { return fieldValuesMap.get(key); }
        @Override public boolean isValuesEmpty(List<String[]> values) { return values == null || values.isEmpty(); }
        @Override public Map<Serializable, Serializable> getFRQSessionAttributes() { return Collections.emptyMap(); }
        @Override public IXFormRenderConfig getFormRenderConfig() { return null; }
        @Override public Map<String, ? extends IFormContainerMetaData> getDynContainerMap() { return Collections.emptyMap(); }
        @Override public long getClientId() { return 1L; }
        @Override public String getI18nValue(String i18nKey) { return i18nKey; }
        @Override public int getOrdinalIndex() { return 0; }
        @Override public int getRepetitionIndex() { return 0; }
    }
}
