package de.xima.fc.plugin.multiupload;

import com.hp.gagawa.java.elements.Button;
import com.hp.gagawa.java.elements.Div;
import com.hp.gagawa.java.elements.Input;
import com.hp.gagawa.java.elements.Script;
import com.hp.gagawa.java.elements.Span;
import com.hp.gagawa.java.elements.Style;
import de.xima.fc.form.common.XPropertyEnum;
import de.xima.fc.form.common.models.IGetWidgetResourceParams;
import de.xima.fc.form.common.models.IXFormRenderConfig;
import de.xima.fc.form.common.models.IXFormRenderContext;
import de.xima.fc.form.common.models.IXItemPropertiesData;
import de.xima.fc.form.common.models.IXItemWidget;
import de.xima.fc.form.common.models.IXValuableItem;
import de.xima.fc.form.common.models.IXValidationParams;
import de.xima.fc.form.common.models.IXValidationResult;
import de.xima.fc.form.common.models.XItemPropertyDesc;
import de.xima.fc.form.common.models.XItemRenderCtx;
import de.xima.fc.form.common.models.XItemRenderData;
import de.xima.fc.form.common.models.XPropertyValue;
import de.xima.fc.form.common.models.XValidationResult;
import org.apache.commons.lang3.StringUtils;
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Native Multi-Upload Widget for XIMA FORMCYCLE 8.5.5+.
 * Provides HTML5 multiple-file selection, Drag &amp; Drop, incremental additions,
 * per-file removals, client-side live validation, and seamless integration with Formcycle.
 */
public class MultiUploadWidget implements IXItemWidget, IXValuableItem {

    private static final Logger LOGGER = LoggerFactory.getLogger(MultiUploadWidget.class);

    @Override
    public String getLabel(Locale locale) {
        return I18N.localize("widget.multi_upload.name", locale, "Multipler Upload");
    }

    @Override
    public String getIcon() {
        return Constants.ICON_NAME;
    }

    @Override
    public String getPrefix() {
        return Constants.WIDGET_NAME;
    }

    @Override
    public boolean isSubmitsValues() {
        return true;
    }

    @Override
    public String getCssData() {
        return MultiUploadPlugin.PLUGIN_CSS;
    }

    @Override
    public String getCssData(IGetWidgetResourceParams params) {
        return MultiUploadPlugin.PLUGIN_CSS;
    }

    @Override
    public String getJavaScriptData() {
        return MultiUploadPlugin.PLUGIN_JS;
    }

    @Override
    public String getJavaScriptData(IGetWidgetResourceParams params) {
        return MultiUploadPlugin.PLUGIN_JS;
    }

    /**
     * Removes auto-generated external resource includes for MultiUploadWidget from the
     * Formcycle render config. Inlining styles and runtime JS guarantees that the widget
     * is completely self-contained and avoids 404 / strict MIME-type blocking.
     */
    void cleanUpIncludes(IXFormRenderConfig config) {
        if (config == null) {
            return;
        }
        if (config.getCssIncludes() != null) {
            config.getCssIncludes().entrySet().removeIf(e ->
                (e.getKey() != null && (e.getKey().contains("MultiUploadWidget") || e.getKey().contains("fc-plugin-multi-upload") || e.getKey().contains("multi-upload"))) ||
                (e.getValue() != null && (e.getValue().contains("MultiUploadWidget") || e.getValue().contains("fc-plugin-multi-upload") || e.getValue().contains("multi-upload")))
            );
        }
        if (config.getJsIncludes() != null) {
            config.getJsIncludes().entrySet().removeIf(e ->
                (e.getKey() != null && (e.getKey().contains("MultiUploadWidget") || e.getKey().contains("fc-plugin-multi-upload") || e.getKey().contains("multi-upload"))) ||
                (e.getValue() != null && (e.getValue().contains("MultiUploadWidget") || e.getValue().contains("fc-plugin-multi-upload") || e.getValue().contains("multi-upload")))
            );
        }
    }

    @Override
    public ArrayList<XItemPropertyDesc> getAvailableProperties(Locale locale) {
        final ArrayList<XItemPropertyDesc> properties = new ArrayList<>();

        // Standard FORMCYCLE form item properties
        properties.add(new XItemPropertyDesc(XPropertyEnum.name));
        properties.add(new XItemPropertyDesc(XPropertyEnum.aliasname));
        properties.add(new XItemPropertyDesc(XPropertyEnum.id));
        properties.add(new XItemPropertyDesc(XPropertyEnum.label, I18N.localize("widget.multi_upload.default_label", locale, "Dateien hochladen")));
        properties.add(new XItemPropertyDesc(XPropertyEnum.labeldir));
        properties.add(new XItemPropertyDesc(XPropertyEnum.labelwidth));
        properties.add(new XItemPropertyDesc(XPropertyEnum.helptext));
        properties.add(new XItemPropertyDesc(XPropertyEnum.required));
        properties.add(new XItemPropertyDesc(XPropertyEnum.requiredif));
        properties.add(new XItemPropertyDesc(XPropertyEnum.cssclasses));
        properties.add(new XItemPropertyDesc(XPropertyEnum.cssclasseswrapper));
        properties.add(new XItemPropertyDesc(XPropertyEnum.flex));
        properties.add(new XItemPropertyDesc(XPropertyEnum.computedwidth));
        properties.add(new XItemPropertyDesc(XPropertyEnum.parentid));
        properties.add(new XItemPropertyDesc(XPropertyEnum.rowid));
        properties.add(new XItemPropertyDesc(XPropertyEnum.ishidden));
        properties.add(new XItemPropertyDesc(XPropertyEnum.hiddenif));
        properties.add(new XItemPropertyDesc(XPropertyEnum.hiddenifcomp));
        properties.add(new XItemPropertyDesc(XPropertyEnum.hiddenifvalue));
        properties.add(new XItemPropertyDesc(XPropertyEnum.readonlyif));
        properties.add(new XItemPropertyDesc(XPropertyEnum.statusdependent));
        properties.add(new XItemPropertyDesc(XPropertyEnum.viewstatus));
        properties.add(new XItemPropertyDesc(XPropertyEnum.usergrouppendent));
        properties.add(new XItemPropertyDesc(XPropertyEnum.viewusergroup));
        properties.add(new XItemPropertyDesc(XPropertyEnum.comment));

        // Multi Upload specific properties
        properties.add(new XItemPropertyDesc(Constants.PROP_MAX_FILE_SIZE, String.valueOf(Constants.DEFAULT_MAX_FILE_SIZE_MB)));
        properties.add(new XItemPropertyDesc(Constants.PROP_MAX_TOTAL_SIZE, String.valueOf(Constants.DEFAULT_MAX_TOTAL_SIZE_MB)));
        properties.add(new XItemPropertyDesc(Constants.PROP_MAX_FILES, String.valueOf(Constants.DEFAULT_MAX_FILES)));
        properties.add(new XItemPropertyDesc(Constants.PROP_ALLOWED_EXTENSIONS, Constants.DEFAULT_ALLOWED_EXTENSIONS));
        properties.add(new XItemPropertyDesc(Constants.PROP_DROPZONE_ENABLED, String.valueOf(Constants.DEFAULT_DROPZONE_ENABLED)));
        properties.add(new XItemPropertyDesc(Constants.PROP_THEME, Constants.DEFAULT_THEME));
        properties.add(new XItemPropertyDesc(Constants.PROP_BUTTON_TEXT, Constants.DEFAULT_BUTTON_TEXT));
        properties.add(new XItemPropertyDesc(Constants.PROP_ADD_MORE_TEXT, Constants.DEFAULT_ADD_MORE_TEXT));
        properties.add(new XItemPropertyDesc(Constants.PROP_CLEAR_ALL_TEXT, Constants.DEFAULT_CLEAR_ALL_TEXT));
        properties.add(new XItemPropertyDesc(Constants.PROP_CUSTOM_ERROR_MSG, ""));

        return properties;
    }

    @Override
    public void renderItemPreview(Div container, XItemRenderData renderData, XItemRenderCtx renderCtx, IXFormRenderContext formRenderCtx) {
        cleanUpIncludes(renderData != null ? renderData.getXFormRenderConfig() : null);

        final int maxFileSize = MultiUploadPlugin.resolveMaxFileSize(getRenderPropertyString(renderData, Constants.PROP_MAX_FILE_SIZE, ""));
        final int maxTotalSize = MultiUploadPlugin.resolveMaxTotalSize(getRenderPropertyString(renderData, Constants.PROP_MAX_TOTAL_SIZE, ""));
        final int maxFiles = MultiUploadPlugin.resolveMaxFiles(getRenderPropertyString(renderData, Constants.PROP_MAX_FILES, ""));
        final String extensions = MultiUploadPlugin.resolveAllowedExtensions(getRenderPropertyString(renderData, Constants.PROP_ALLOWED_EXTENSIONS, ""));
        final String buttonText = getRenderPropertyString(renderData, Constants.PROP_BUTTON_TEXT, Constants.DEFAULT_BUTTON_TEXT);

        // Preview Box in FORMCYCLE Designer Canvas
        final Div previewBox = new Div();
        previewBox.setStyle("display: flex; flex-direction: column; padding: 16px; " +
                "border: 2px dashed #6366f1; border-radius: 8px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; " +
                "color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.05);");

        // Embedded style so SVG icon renders perfectly in Designer Canvas
        final Style style = new Style("text/css");
        style.appendText(MultiUploadPlugin.PLUGIN_CSS);
        previewBox.appendChild(style);

        // Header Row
        final Div headerRow = new Div();
        headerRow.setStyle("display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 12px;");

        final Div leftSection = new Div();
        leftSection.setStyle("display: flex; align-items: center; gap: 12px;");

        final Div logoDiv = new Div();
        logoDiv.setCSSClass("fc-multi-upload-preview-logo");
        leftSection.appendChild(logoDiv);

        final Div titleContainer = new Div();
        final Span title = new Span();
        title.setStyle("font-weight: 600; font-size: 15px; color: #1e1b4b; display: block;");
        title.appendText("Multipler Datei-Upload");
        titleContainer.appendChild(title);

        final Span subtitle = new Span();
        subtitle.setStyle("font-size: 12px; color: #64748b; display: block; margin-top: 2px;");
        subtitle.appendText("Max. " + maxFiles + " Dateien | Je max. " + maxFileSize + " MB | Gesamt max. " + maxTotalSize + " MB");
        titleContainer.appendChild(subtitle);

        leftSection.appendChild(titleContainer);

        final Div badge = new Div();
        badge.setStyle("background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color: #ffffff; padding: 4px 10px; border-radius: 12px; " +
                "font-size: 11px; font-weight: 600; letter-spacing: 0.3px; white-space: nowrap; text-transform: uppercase;");
        badge.appendText("Multi-Upload");

        headerRow.appendChild(leftSection);
        headerRow.appendChild(badge);
        previewBox.appendChild(headerRow);

        // Mock Dropzone
        final Div dropzoneMock = new Div();
        dropzoneMock.setStyle("border: 1px dashed #cbd5e1; border-radius: 6px; padding: 20px 12px; text-align: center; " +
                "background-color: #ffffff; margin-bottom: 10px;");

        final Div dropText = new Div();
        dropText.setStyle("font-size: 13px; color: #475569; font-weight: 500; margin-bottom: 4px;");
        dropText.appendText("📁 Dateien per Drag & Drop hier ablegen");
        dropzoneMock.appendChild(dropText);

        final Div dropSub = new Div();
        dropSub.setStyle("font-size: 11px; color: #94a3b8; margin-bottom: 10px;");
        dropSub.appendText("Erlaubt: " + extensions);
        dropzoneMock.appendChild(dropSub);

        final Div mockButton = new Div();
        mockButton.setStyle("display: inline-block; padding: 6px 14px; background-color: #4f46e5; color: #ffffff; " +
                "font-size: 12px; font-weight: 500; border-radius: 4px; pointer-events: none;");
        mockButton.appendText(buttonText);
        dropzoneMock.appendChild(mockButton);

        previewBox.appendChild(dropzoneMock);

        container.appendChild(previewBox);
    }

    @Override
    public void renderItem(Div container, XItemRenderData renderData, XItemRenderCtx renderCtx, IXFormRenderContext formRenderCtx) {
        cleanUpIncludes(renderData != null ? renderData.getXFormRenderConfig() : null);

        final int maxFileSize = MultiUploadPlugin.resolveMaxFileSize(getRenderPropertyString(renderData, Constants.PROP_MAX_FILE_SIZE, ""));
        final int maxTotalSize = MultiUploadPlugin.resolveMaxTotalSize(getRenderPropertyString(renderData, Constants.PROP_MAX_TOTAL_SIZE, ""));
        final int maxFiles = MultiUploadPlugin.resolveMaxFiles(getRenderPropertyString(renderData, Constants.PROP_MAX_FILES, ""));
        final String allowedExtensions = MultiUploadPlugin.resolveAllowedExtensions(getRenderPropertyString(renderData, Constants.PROP_ALLOWED_EXTENSIONS, ""));
        final boolean dropzoneEnabled = Boolean.parseBoolean(getRenderPropertyString(renderData, Constants.PROP_DROPZONE_ENABLED, "true"));
        final String theme = getRenderPropertyString(renderData, Constants.PROP_THEME, Constants.DEFAULT_THEME);
        final String buttonText = getRenderPropertyString(renderData, Constants.PROP_BUTTON_TEXT, Constants.DEFAULT_BUTTON_TEXT);
        final String addMoreText = getRenderPropertyString(renderData, Constants.PROP_ADD_MORE_TEXT, Constants.DEFAULT_ADD_MORE_TEXT);
        final String clearAllText = getRenderPropertyString(renderData, Constants.PROP_CLEAR_ALL_TEXT, Constants.DEFAULT_CLEAR_ALL_TEXT);
        final String customErrorMsg = getRenderPropertyString(renderData, Constants.PROP_CUSTOM_ERROR_MSG, "");

        final String itemId = renderData != null ? renderData.getId() : "fc-multi-upload";
        final String itemName = renderData != null ? renderData.getName() : "multi_upload";

        final String containerId = "fc-mu-container-" + itemId;
        final String dropzoneId = "fc-mu-dropzone-" + itemId;
        final String fileListId = "fc-mu-file-list-" + itemId;
        final String alertId = "fc-mu-alert-" + itemId;
        final String progressId = "fc-mu-progress-" + itemId;
        final String countId = "fc-mu-count-" + itemId;

        // Outer Wrapper
        final Div wrapper = new Div();
        wrapper.setId(containerId);
        wrapper.setCSSClass("fc-multi-upload-container theme-" + theme + (renderData != null ? " " + renderData.getCssHtmlAttrString(renderCtx) : ""));

        // Build HTML5 Accept string (e.g. .pdf,.png,.jpg,.jpeg,.docx,.xlsx,.zip)
        final String acceptAttr = buildAcceptAttribute(allowedExtensions);

        // Self-contained CSS styles
        final Style clientStyle = new Style("text/css");
        clientStyle.appendText(generateClientCss(containerId));
        wrapper.appendChild(clientStyle);

        // Native HTML5 File Input (carries submitted files in native multipart submission)
        final Input fileInput = new Input();
        fileInput.setType("file");
        fileInput.setId(itemId);
        fileInput.setName(itemName);
        fileInput.setAttribute("data-name", itemName);
        fileInput.setAttribute("data-upload-mode", "native");
        fileInput.setAttribute("multiple", "multiple");
        if (StringUtils.isNotBlank(acceptAttr)) {
            fileInput.setAttribute("accept", acceptAttr);
        }
        fileInput.setCSSClass("XValueItem fc-multi-upload-native-input");
        fileInput.setStyle("position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;");
        wrapper.appendChild(fileInput);

        // Dropzone Area
        final Div dropzone = new Div();
        dropzone.setId(dropzoneId);
        dropzone.setCSSClass("fc-mu-dropzone" + (dropzoneEnabled ? "" : " dropzone-collapsed"));

        final Div dropIcon = new Div();
        dropIcon.setCSSClass("fc-mu-dropzone-icon");
        dropIcon.appendText("☁️");
        dropzone.appendChild(dropIcon);

        final Div dropTitle = new Div();
        dropTitle.setCSSClass("fc-mu-dropzone-title");
        dropTitle.appendText("Dateien hier ablegen");
        dropzone.appendChild(dropTitle);

        final Div dropSubtitle = new Div();
        dropSubtitle.setCSSClass("fc-mu-dropzone-subtitle");
        dropSubtitle.appendText("oder auf den Button klicken, um Dateien vom Gerät auszuwählen.");
        dropzone.appendChild(dropSubtitle);

        final Div dropConstraints = new Div();
        dropConstraints.setCSSClass("fc-mu-dropzone-constraints");
        dropConstraints.appendText("Erlaubt: " + allowedExtensions + " | Max. " + maxFiles + " Dateien (je max. " + maxFileSize + " MB, gesamt max. " + maxTotalSize + " MB)");
        dropzone.appendChild(dropConstraints);

        final Button btnSelect = new Button();
        btnSelect.setType("button");
        btnSelect.setCSSClass("fc-mu-btn fc-mu-btn-primary fc-mu-btn-select");
        btnSelect.appendText(buttonText);
        dropzone.appendChild(btnSelect);

        wrapper.appendChild(dropzone);

        // Action Toolbar (Buttons + Counter)
        final Div toolbar = new Div();
        toolbar.setCSSClass("fc-mu-toolbar");

        final Div toolbarButtons = new Div();
        toolbarButtons.setCSSClass("fc-mu-toolbar-buttons");

        final Button btnAddMore = new Button();
        btnAddMore.setType("button");
        btnAddMore.setCSSClass("fc-mu-btn fc-mu-btn-secondary fc-mu-btn-add");
        btnAddMore.appendText(addMoreText);
        toolbarButtons.appendChild(btnAddMore);

        final Button btnClearAll = new Button();
        btnClearAll.setType("button");
        btnClearAll.setCSSClass("fc-mu-btn fc-mu-btn-danger fc-mu-btn-clear");
        btnClearAll.setStyle("display: none;");
        btnClearAll.appendText(clearAllText);
        toolbarButtons.appendChild(btnClearAll);

        toolbar.appendChild(toolbarButtons);

        final Span counterSpan = new Span();
        counterSpan.setId(countId);
        counterSpan.setCSSClass("fc-mu-counter");
        counterSpan.appendText("0 / " + maxFiles + " Dateien");
        toolbar.appendChild(counterSpan);

        wrapper.appendChild(toolbar);

        // Quota / Total Size Progress Meter
        final Div progressContainer = new Div();
        progressContainer.setId(progressId);
        progressContainer.setCSSClass("fc-mu-progress-container");
        progressContainer.setStyle("display: none;");

        final Div progressBar = new Div();
        progressBar.setCSSClass("fc-mu-progress-track");
        final Div progressFill = new Div();
        progressFill.setCSSClass("fc-mu-progress-fill");
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);

        final Div progressText = new Div();
        progressText.setCSSClass("fc-mu-progress-label");
        progressText.appendText("0 MB von " + maxTotalSize + " MB");
        progressContainer.appendChild(progressText);

        wrapper.appendChild(progressContainer);

        // Validation / Warning Alert Box
        final Div alertBox = new Div();
        alertBox.setId(alertId);
        alertBox.setCSSClass("fc-mu-alert");
        alertBox.setAttribute("role", "alert");
        alertBox.setStyle("display: none;");
        wrapper.appendChild(alertBox);

        // Selected Files List Container
        final Div fileList = new Div();
        fileList.setId(fileListId);
        fileList.setCSSClass("fc-mu-file-list");
        wrapper.appendChild(fileList);

        // Client-side JavaScript Runtime Logic
        final Script clientScript = new Script("text/javascript");
        clientScript.appendText(generateClientScript(
                itemId,
                containerId,
                dropzoneId,
                fileListId,
                alertId,
                progressId,
                countId,
                maxFileSize,
                maxTotalSize,
                maxFiles,
                allowedExtensions,
                acceptAttr,
                customErrorMsg
        ));
        wrapper.appendChild(clientScript);

        container.appendChild(wrapper);
    }

    @Override
    public List<IXValidationResult> validate(IXValidationParams params) {
        // 1. Skip validation if current form action does not require it (e.g. Save Draft)
        if (!params.isShouldValidate()) {
            return Collections.singletonList(new XValidationResult(true));
        }

        final IXItemPropertiesData propData = params.getXItemPropertiesData();

        // 2. Skip validation if the element is currently hidden
        if (propData != null) {
            final XPropertyValue isHiddenVal = propData.get(XPropertyEnum.ishidden);
            if (isHiddenVal != null && isHiddenVal.getDefaultBoolean(false)) {
                return Collections.singletonList(new XValidationResult(true));
            }
        }

        final Locale locale = params.getLocale() != null ? params.getLocale() : Locale.GERMAN;

        // 3. Check mandatory constraint
        final boolean isRequired;
        if (propData != null && propData.contains(XPropertyEnum.required)) {
            final XPropertyValue reqVal = propData.get(XPropertyEnum.required);
            isRequired = reqVal != null && reqVal.getDefaultBoolean(false);
        } else {
            isRequired = false;
        }

        final String[] elementValues = params.getElementValues();
        final boolean hasValues = elementValues != null && elementValues.length > 0 && StringUtils.isNotBlank(elementValues[0]);

        if (isRequired && !hasValues) {
            final String customErrorMsg = getItemProperty(propData, Constants.PROP_CUSTOM_ERROR_MSG, "");
            final String msg = StringUtils.isNotBlank(customErrorMsg)
                    ? customErrorMsg
                    : I18N.localize("validation.multi_upload.required", locale, "Bitte wählen Sie mindestens eine Datei aus.");
            return Collections.singletonList(new XValidationResult(false, msg));
        }

        // 4. Check max files limit
        final int maxFiles = MultiUploadPlugin.resolveMaxFiles(getItemProperty(propData, Constants.PROP_MAX_FILES, ""));
        if (elementValues != null && elementValues.length > maxFiles) {
            final String msg = I18N.format("validation.multi_upload.too_many_files", locale,
                    "Zu viele Dateien ausgewählt. Es sind maximal {0} Dateien erlaubt.", maxFiles);
            return Collections.singletonList(new XValidationResult(false, msg));
        }

        return Collections.singletonList(new XValidationResult(true));
    }

    private static String buildAcceptAttribute(String allowedExtensions) {
        if (StringUtils.isBlank(allowedExtensions)) {
            return "";
        }
        final String[] parts = allowedExtensions.split("[,; ]+");
        final StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (StringUtils.isNotBlank(part)) {
                final String clean = part.trim().toLowerCase(Locale.ROOT);
                if (sb.length() > 0) {
                    sb.append(",");
                }
                if (!clean.startsWith(".")) {
                    sb.append(".").append(clean);
                } else {
                    sb.append(clean);
                }
            }
        }
        return sb.toString();
    }

    private static String getRenderPropertyString(XItemRenderData renderData, String propKey, String defaultValue) {
        if (renderData == null || !renderData.contains(propKey)) {
            return defaultValue;
        }
        final XPropertyValue val = renderData.get(propKey);
        return val != null ? StringUtils.defaultIfBlank(val.getString(), defaultValue) : defaultValue;
    }

    private static String getItemProperty(IXItemPropertiesData propData, String propKey, String defaultValue) {
        if (propData == null || !propData.contains(propKey)) {
            return defaultValue;
        }
        final XPropertyValue val = propData.get(propKey);
        return val != null ? StringUtils.defaultIfBlank(val.getString(), defaultValue) : defaultValue;
    }

    private static String generateClientCss(String containerId) {
        return "#" + containerId + " {\n" +
                "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n" +
                "  margin: 12px 0;\n" +
                "  position: relative;\n" +
                "  box-sizing: border-box;\n" +
                "}\n" +
                "#" + containerId + " * {\n" +
                "  box-sizing: border-box;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-dropzone {\n" +
                "  border: 2px dashed #6366f1;\n" +
                "  border-radius: 10px;\n" +
                "  background-color: #f8fafc;\n" +
                "  padding: 24px 16px;\n" +
                "  text-align: center;\n" +
                "  transition: all 0.2s ease-in-out;\n" +
                "  cursor: pointer;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-dropzone:hover,\n" +
                "#" + containerId + " .fc-mu-dropzone.fc-dragover {\n" +
                "  background-color: #eef2ff;\n" +
                "  border-color: #4f46e5;\n" +
                "  transform: scale(1.005);\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-dropzone-icon {\n" +
                "  font-size: 32px;\n" +
                "  line-height: 1;\n" +
                "  margin-bottom: 8px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-dropzone-title {\n" +
                "  font-size: 15px;\n" +
                "  font-weight: 600;\n" +
                "  color: #1e293b;\n" +
                "  margin-bottom: 4px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-dropzone-subtitle {\n" +
                "  font-size: 13px;\n" +
                "  color: #64748b;\n" +
                "  margin-bottom: 8px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-dropzone-constraints {\n" +
                "  font-size: 11px;\n" +
                "  color: #94a3b8;\n" +
                "  margin-bottom: 14px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn {\n" +
                "  display: inline-flex;\n" +
                "  align-items: center;\n" +
                "  gap: 6px;\n" +
                "  padding: 8px 16px;\n" +
                "  font-size: 13px;\n" +
                "  font-weight: 500;\n" +
                "  border-radius: 6px;\n" +
                "  cursor: pointer;\n" +
                "  border: 1px solid transparent;\n" +
                "  transition: all 0.15s ease-in-out;\n" +
                "  outline: none;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-primary {\n" +
                "  background-color: #4f46e5;\n" +
                "  color: #ffffff;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-primary:hover {\n" +
                "  background-color: #4338ca;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-secondary {\n" +
                "  background-color: #f1f5f9;\n" +
                "  color: #334155;\n" +
                "  border-color: #cbd5e1;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-secondary:hover {\n" +
                "  background-color: #e2e8f0;\n" +
                "  color: #0f172a;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-danger {\n" +
                "  background-color: #fee2e2;\n" +
                "  color: #991b1b;\n" +
                "  border-color: #fecaca;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-danger:hover {\n" +
                "  background-color: #fecaca;\n" +
                "  color: #7f1d1d;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-toolbar {\n" +
                "  display: flex;\n" +
                "  align-items: center;\n" +
                "  justify-content: space-between;\n" +
                "  margin-top: 12px;\n" +
                "  gap: 12px;\n" +
                "  flex-wrap: wrap;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-toolbar-buttons {\n" +
                "  display: flex;\n" +
                "  align-items: center;\n" +
                "  gap: 8px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-counter {\n" +
                "  font-size: 12px;\n" +
                "  font-weight: 600;\n" +
                "  padding: 4px 10px;\n" +
                "  background-color: #f1f5f9;\n" +
                "  color: #475569;\n" +
                "  border-radius: 12px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-progress-container {\n" +
                "  margin-top: 10px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-progress-track {\n" +
                "  width: 100%;\n" +
                "  height: 6px;\n" +
                "  background-color: #e2e8f0;\n" +
                "  border-radius: 3px;\n" +
                "  overflow: hidden;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-progress-fill {\n" +
                "  height: 100%;\n" +
                "  width: 0%;\n" +
                "  background-color: #22c55e;\n" +
                "  transition: width 0.3s ease, background-color 0.3s ease;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-progress-label {\n" +
                "  font-size: 11px;\n" +
                "  color: #64748b;\n" +
                "  margin-top: 4px;\n" +
                "  text-align: right;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-alert {\n" +
                "  margin-top: 10px;\n" +
                "  padding: 10px 14px;\n" +
                "  background-color: #fef2f2;\n" +
                "  border: 1px solid #fecaca;\n" +
                "  border-radius: 6px;\n" +
                "  color: #991b1b;\n" +
                "  font-size: 12px;\n" +
                "  line-height: 1.4;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-file-list {\n" +
                "  display: flex;\n" +
                "  flex-direction: column;\n" +
                "  gap: 8px;\n" +
                "  margin-top: 12px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-file-item {\n" +
                "  display: flex;\n" +
                "  align-items: center;\n" +
                "  justify-content: space-between;\n" +
                "  padding: 10px 14px;\n" +
                "  background-color: #ffffff;\n" +
                "  border: 1px solid #e2e8f0;\n" +
                "  border-radius: 6px;\n" +
                "  transition: border-color 0.15s ease;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-file-item:hover {\n" +
                "  border-color: #cbd5e1;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-file-info {\n" +
                "  display: flex;\n" +
                "  align-items: center;\n" +
                "  gap: 10px;\n" +
                "  min-width: 0;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-file-icon {\n" +
                "  font-size: 20px;\n" +
                "  flex-shrink: 0;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-file-name {\n" +
                "  font-size: 13px;\n" +
                "  font-weight: 500;\n" +
                "  color: #1e293b;\n" +
                "  white-space: nowrap;\n" +
                "  overflow: hidden;\n" +
                "  text-overflow: ellipsis;\n" +
                "  max-width: 320px;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-file-size {\n" +
                "  font-size: 12px;\n" +
                "  color: #64748b;\n" +
                "  margin-left: 8px;\n" +
                "  flex-shrink: 0;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-remove {\n" +
                "  background: none;\n" +
                "  border: none;\n" +
                "  color: #94a3b8;\n" +
                "  font-size: 18px;\n" +
                "  cursor: pointer;\n" +
                "  padding: 4px 8px;\n" +
                "  line-height: 1;\n" +
                "  border-radius: 4px;\n" +
                "  transition: color 0.15s ease, background-color 0.15s ease;\n" +
                "}\n" +
                "#" + containerId + " .fc-mu-btn-remove:hover {\n" +
                "  color: #ef4444;\n" +
                "  background-color: #fee2e2;\n" +
                "}\n";
    }

    private static String generateClientScript(
            String inputId,
            String containerId,
            String dropzoneId,
            String fileListId,
            String alertId,
            String progressId,
            String countId,
            int maxFileSizeMb,
            int maxTotalSizeMb,
            int maxFiles,
            String allowedExtensions,
            String acceptAttr,
            String customErrorMsg
    ) {
        final StringBuilder js = new StringBuilder();
        js.append("(function() {\n");
        js.append("  'use strict';\n");
        js.append("  function init() {\n");
        js.append("    var container = document.getElementById('").append(containerId).append("');\n");
        js.append("    var input = document.getElementById('").append(inputId).append("');\n");
        js.append("    var dropzone = document.getElementById('").append(dropzoneId).append("');\n");
        js.append("    var fileList = document.getElementById('").append(fileListId).append("');\n");
        js.append("    var alertBox = document.getElementById('").append(alertId).append("');\n");
        js.append("    var progressCont = document.getElementById('").append(progressId).append("');\n");
        js.append("    var counter = document.getElementById('").append(countId).append("');\n");
        js.append("    if (!container || !input) return;\n");
        js.append("    if (input._fcMultiUploadInitialized) return;\n");
        js.append("    input._fcMultiUploadInitialized = true;\n");
        js.append("\n");
        js.append("    var MAX_FILE_SIZE = ").append(maxFileSizeMb).append(" * 1024 * 1024;\n");
        js.append("    var MAX_TOTAL_SIZE = ").append(maxTotalSizeMb).append(" * 1024 * 1024;\n");
        js.append("    var MAX_FILES = ").append(maxFiles).append(";\n");
        js.append("    var ALLOWED_EXTS = ").append(buildExtensionsArrayJson(allowedExtensions)).append(";\n");
        js.append("    var ACCEPT_ATTR = '").append(Encode.forJavaScript(acceptAttr)).append("';\n");
        js.append("    var CUSTOM_ERR = '").append(Encode.forJavaScript(customErrorMsg)).append("';\n");
        js.append("\n");
        js.append("    var selectedFiles = [];\n");
        js.append("    var fileIdCounter = 0;\n");
        js.append("\n");
        js.append("    function formatSize(bytes) {\n");
        js.append("      if (!bytes || bytes === 0) return '0 B';\n");
        js.append("      if (bytes < 1024) return bytes + ' B';\n");
        js.append("      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';\n");
        js.append("      return (bytes / 1048576).toFixed(1) + ' MB';\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function getFileExtension(filename) {\n");
        js.append("      if (!filename || filename.indexOf('.') === -1) return '';\n");
        js.append("      return '.' + filename.split('.').pop().toLowerCase();\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function getFileIcon(filename) {\n");
        js.append("      var ext = getFileExtension(filename);\n");
        js.append("      if (ext === '.pdf') return '📄';\n");
        js.append("      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].indexOf(ext) !== -1) return '🖼️';\n");
        js.append("      if (['.zip', '.rar', '.7z', '.tar', '.gz'].indexOf(ext) !== -1) return '📦';\n");
        js.append("      if (['.doc', '.docx', '.odt'].indexOf(ext) !== -1) return '📝';\n");
        js.append("      if (['.xls', '.xlsx', '.csv', '.ods'].indexOf(ext) !== -1) return '📊';\n");
        js.append("      return '📎';\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function getTotalSize() {\n");
        js.append("      return selectedFiles.reduce(function(sum, f) { return sum + (f.size || 0); }, 0);\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function showAlert(messages) {\n");
        js.append("      if (!alertBox) return;\n");
        js.append("      if (!messages || messages.length === 0) {\n");
        js.append("        alertBox.style.display = 'none';\n");
        js.append("        alertBox.innerHTML = '';\n");
        js.append("        return;\n");
        js.append("      }\n");
        js.append("      alertBox.innerHTML = messages.map(function(m) { return '<div>⚠️ ' + m + '</div>'; }).join('');\n");
        js.append("      alertBox.style.display = 'block';\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function updateSync() {\n");
        js.append("      try {\n");
        js.append("        var dt = new DataTransfer();\n");
        js.append("        for (var i = 0; i < selectedFiles.length; i++) {\n");
        js.append("          dt.items.add(selectedFiles[i]);\n");
        js.append("        }\n");
        js.append("        input.files = dt.files;\n");
        js.append("      } catch (err) {\n");
        js.append("        if (window.console && window.console.warn) console.warn('DataTransfer API update error:', err);\n");
        js.append("      }\n");
        js.append("      if (window.$ && typeof $.fn.trigger === 'function') {\n");
        js.append("        $(input).trigger('input').trigger('change');\n");
        js.append("      } else {\n");
        js.append("        input.dispatchEvent(new Event('input', { bubbles: true }));\n");
        js.append("        input.dispatchEvent(new Event('change', { bubbles: true }));\n");
        js.append("      }\n");
        js.append("      renderUI();\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function addFileList(files) {\n");
        js.append("      if (!files || files.length === 0) return;\n");
        js.append("      var rejected = [];\n");
        js.append("      for (var i = 0; i < files.length; i++) {\n");
        js.append("        var file = files[i];\n");
        js.append("        var errors = [];\n");
        js.append("        if (file.size > MAX_FILE_SIZE) {\n");
        js.append("          errors.push('Datei ist zu groß (' + formatSize(file.size) + ', max. ' + formatSize(MAX_FILE_SIZE) + ')');\n");
        js.append("        }\n");
        js.append("        if (file.size === 0) {\n");
        js.append("          errors.push('Datei ist leer (0 Bytes)');\n");
        js.append("        }\n");
        js.append("        if (ALLOWED_EXTS.length > 0) {\n");
        js.append("          var ext = getFileExtension(file.name);\n");
        js.append("          if (ALLOWED_EXTS.indexOf(ext) === -1) {\n");
        js.append("            errors.push('Dateityp ' + ext + ' nicht erlaubt');\n");
        js.append("          }\n");
        js.append("        }\n");
        js.append("        var isDup = selectedFiles.some(function(sf) { return sf.name === file.name && sf.size === file.size; });\n");
        js.append("        if (isDup) {\n");
        js.append("          errors.push('Bereits ausgewählt');\n");
        js.append("        }\n");
        js.append("        if (selectedFiles.length >= MAX_FILES) {\n");
        js.append("          errors.push('Maximale Anzahl von ' + MAX_FILES + ' Dateien erreicht');\n");
        js.append("        }\n");
        js.append("        if (errors.length === 0) {\n");
        js.append("          file._muId = ++fileIdCounter;\n");
        js.append("          selectedFiles.push(file);\n");
        js.append("        } else {\n");
        js.append("          rejected.push(file.name + ': ' + errors.join(', '));\n");
        js.append("        }\n");
        js.append("      }\n");
        js.append("      var currentTotal = getTotalSize();\n");
        js.append("      if (currentTotal > MAX_TOTAL_SIZE) {\n");
        js.append("        rejected.push('Gesamtgröße überschritten (' + formatSize(currentTotal) + ' von max. ' + formatSize(MAX_TOTAL_SIZE) + ')');\n");
        js.append("      }\n");
        js.append("      showAlert(rejected);\n");
        js.append("      updateSync();\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function removeFile(muId) {\n");
        js.append("      selectedFiles = selectedFiles.filter(function(f) { return f._muId !== muId; });\n");
        js.append("      updateSync();\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function clearAll() {\n");
        js.append("      selectedFiles = [];\n");
        js.append("      showAlert([]);\n");
        js.append("      updateSync();\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function renderUI() {\n");
        js.append("      var count = selectedFiles.length;\n");
        js.append("      var totalSize = getTotalSize();\n");
        js.append("      if (counter) counter.innerText = count + ' / ' + MAX_FILES + ' Dateien';\n");
        js.append("      var btnClear = container.querySelector('.fc-mu-btn-clear');\n");
        js.append("      if (btnClear) btnClear.style.display = count > 0 ? 'inline-flex' : 'none';\n");
        js.append("      if (progressCont) {\n");
        js.append("        if (count > 0) {\n");
        js.append("          progressCont.style.display = 'block';\n");
        js.append("          var pct = Math.min(100, Math.round((totalSize / MAX_TOTAL_SIZE) * 100));\n");
        js.append("          var fill = progressCont.querySelector('.fc-mu-progress-fill');\n");
        js.append("          if (fill) {\n");
        js.append("            fill.style.width = pct + '%';\n");
        js.append("            if (pct > 80) fill.style.backgroundColor = '#ef4444';\n");
        js.append("            else if (pct > 60) fill.style.backgroundColor = '#f59e0b';\n");
        js.append("            else fill.style.backgroundColor = '#22c55e';\n");
        js.append("          }\n");
        js.append("          var lbl = progressCont.querySelector('.fc-mu-progress-label');\n");
        js.append("          if (lbl) lbl.innerText = formatSize(totalSize) + ' von ' + formatSize(MAX_TOTAL_SIZE) + ' (' + pct + '%)';\n");
        js.append("        } else {\n");
        js.append("          progressCont.style.display = 'none';\n");
        js.append("        }\n");
        js.append("      }\n");
        js.append("      if (fileList) {\n");
        js.append("        fileList.innerHTML = '';\n");
        js.append("        for (var i = 0; i < selectedFiles.length; i++) {\n");
        js.append("          var file = selectedFiles[i];\n");
        js.append("          var item = document.createElement('div');\n");
        js.append("          item.className = 'fc-mu-file-item';\n");
        js.append("          var info = document.createElement('div');\n");
        js.append("          info.className = 'fc-mu-file-info';\n");
        js.append("          var icon = document.createElement('span');\n");
        js.append("          icon.className = 'fc-mu-file-icon';\n");
        js.append("          icon.innerText = getFileIcon(file.name);\n");
        js.append("          var name = document.createElement('span');\n");
        js.append("          name.className = 'fc-mu-file-name';\n");
        js.append("          name.innerText = file.name;\n");
        js.append("          name.title = file.name;\n");
        js.append("          var size = document.createElement('span');\n");
        js.append("          size.className = 'fc-mu-file-size';\n");
        js.append("          size.innerText = '(' + formatSize(file.size) + ')';\n");
        js.append("          info.appendChild(icon);\n");
        js.append("          info.appendChild(name);\n");
        js.append("          info.appendChild(size);\n");
        js.append("          item.appendChild(info);\n");
        js.append("          var rmBtn = document.createElement('button');\n");
        js.append("          rmBtn.type = 'button';\n");
        js.append("          rmBtn.className = 'fc-mu-btn-remove';\n");
        js.append("          rmBtn.innerHTML = '&times;';\n");
        js.append("          rmBtn.title = 'Datei entfernen';\n");
        js.append("          (function(id) {\n");
        js.append("            rmBtn.addEventListener('click', function(e) {\n");
        js.append("              e.preventDefault();\n");
        js.append("              e.stopPropagation();\n");
        js.append("              removeFile(id);\n");
        js.append("            });\n");
        js.append("          })(file._muId);\n");
        js.append("          item.appendChild(rmBtn);\n");
        js.append("          fileList.appendChild(item);\n");
        js.append("        }\n");
        js.append("      }\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    function openFileDialog() {\n");
        js.append("      var tempInput = document.createElement('input');\n");
        js.append("      tempInput.type = 'file';\n");
        js.append("      tempInput.multiple = true;\n");
        js.append("      if (ACCEPT_ATTR) tempInput.accept = ACCEPT_ATTR;\n");
        js.append("      tempInput.addEventListener('change', function() {\n");
        js.append("        if (tempInput.files && tempInput.files.length > 0) {\n");
        js.append("          addFileList(tempInput.files);\n");
        js.append("        }\n");
        js.append("      });\n");
        js.append("      tempInput.click();\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    // Attach button click events (using type='button' prevents accidental form submits)\n");
        js.append("    var btnSelect = container.querySelector('.fc-mu-btn-select');\n");
        js.append("    if (btnSelect) btnSelect.addEventListener('click', function(e) { e.preventDefault(); openFileDialog(); });\n");
        js.append("    var btnAdd = container.querySelector('.fc-mu-btn-add');\n");
        js.append("    if (btnAdd) btnAdd.addEventListener('click', function(e) { e.preventDefault(); openFileDialog(); });\n");
        js.append("    var btnClear = container.querySelector('.fc-mu-btn-clear');\n");
        js.append("    if (btnClear) btnClear.addEventListener('click', function(e) { e.preventDefault(); clearAll(); });\n");
        js.append("\n");
        js.append("    // Drag and Drop\n");
        js.append("    if (dropzone) {\n");
        js.append("      dropzone.addEventListener('click', function(e) {\n");
        js.append("        if (e.target.tagName !== 'BUTTON') {\n");
        js.append("          openFileDialog();\n");
        js.append("        }\n");
        js.append("      });\n");
        js.append("      ['dragenter', 'dragover'].forEach(function(evt) {\n");
        js.append("        dropzone.addEventListener(evt, function(e) {\n");
        js.append("          e.preventDefault();\n");
        js.append("          e.stopPropagation();\n");
        js.append("          dropzone.classList.add('fc-dragover');\n");
        js.append("        }, false);\n");
        js.append("      });\n");
        js.append("      ['dragleave', 'dragend', 'drop'].forEach(function(evt) {\n");
        js.append("        dropzone.addEventListener(evt, function(e) {\n");
        js.append("          e.preventDefault();\n");
        js.append("          e.stopPropagation();\n");
        js.append("          dropzone.classList.remove('fc-dragover');\n");
        js.append("        }, false);\n");
        js.append("      });\n");
        js.append("      dropzone.addEventListener('drop', function(e) {\n");
        js.append("        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {\n");
        js.append("          addFileList(e.dataTransfer.files);\n");
        js.append("        }\n");
        js.append("      }, false);\n");
        js.append("    }\n");
        js.append("\n");
        js.append("    // Initial change listener on native input (e.g. if files are passed programmatically)\n");
        js.append("    input.addEventListener('change', function() {\n");
        js.append("      if (input.files && input.files.length > 0 && selectedFiles.length === 0) {\n");
        js.append("        addFileList(input.files);\n");
        js.append("      }\n");
        js.append("    });\n");
        js.append("  }\n");
        js.append("\n");
        js.append("  if (document.readyState === 'loading') {\n");
        js.append("    document.addEventListener('DOMContentLoaded', init);\n");
        js.append("  } else {\n");
        js.append("    init();\n");
        js.append("  }\n");
        js.append("})();\n");
        return js.toString();
    }

    private static String buildExtensionsArrayJson(String allowedExtensions) {
        if (StringUtils.isBlank(allowedExtensions)) {
            return "[]";
        }
        final String[] parts = allowedExtensions.split("[,; ]+");
        final StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (String part : parts) {
            if (StringUtils.isNotBlank(part)) {
                String clean = part.trim().toLowerCase(Locale.ROOT);
                if (!clean.startsWith(".")) {
                    clean = "." + clean;
                }
                if (!first) {
                    sb.append(", ");
                }
                sb.append("'").append(Encode.forJavaScript(clean)).append("'");
                first = false;
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
