package de.xima.fc.plugin.multiupload;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

/**
 * Localization helper for the Multi Upload Plugin.
 */
public final class I18N {

    private static final Logger LOGGER = LoggerFactory.getLogger(I18N.class);
    private static final String BUNDLE_BASE_NAME = "i18n";

    private I18N() {
        // utility class
    }

    public static String localize(String key, Locale locale, String fallback) {
        if (key == null) {
            return fallback != null ? fallback : "";
        }
        final Locale effectiveLocale = locale != null ? locale : Locale.GERMAN;
        try {
            final ResourceBundle bundle = ResourceBundle.getBundle(BUNDLE_BASE_NAME, effectiveLocale);
            if (bundle != null && bundle.containsKey(key)) {
                return bundle.getString(key);
            }
        } catch (MissingResourceException e) {
            LOGGER.debug("Missing resource bundle or key '{}' for locale '{}'", key, effectiveLocale);
        }
        return fallback != null ? fallback : key;
    }

    public static String format(String key, Locale locale, String fallback, Object... args) {
        final String template = localize(key, locale, fallback);
        if (args == null || args.length == 0) {
            return template;
        }
        try {
            return MessageFormat.format(template, args);
        } catch (Exception e) {
            LOGGER.warn("Failed to format message '{}': {}", template, e.getMessage());
            return template;
        }
    }
}
