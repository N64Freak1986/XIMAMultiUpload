# XIMA FORMCYCLE 8.5+ Plugin-Entwicklungsleitfaden (Developer Guide)

Dieser Leitfaden dient als Standardreferenz und Best-Practice-Dokumentation für die Entwicklung von Erweiterungen und Formular-Widgets für **XIMA FORMCYCLE ab Version 8.5**. Er fasst alle Erkenntnisse, Architekturmuster, Fallstricke und praxiserprobte Lösungen zusammen.

---

## 1. Architekturübersicht

Ein Formular-Widget-Plugin für FORMCYCLE besteht typischerweise aus folgenden Kernkomponenten:

```
+-----------------------------------------------------------------------+
|                       XIMA FORMCYCLE Runtime                          |
+------------------------------------+----------------------------------+
                                     |
           +-------------------------+-------------------------+
           |                                                   |
           v                                                   v
+-------------------------------+             +-------------------------------+
|    FriendlyCaptchaPlugin      |             |     FriendlyCaptchaWidget     |
| (IPluginFormElementWidget)    |             | (IXItemWidget, IXValuableItem)|
+-------------------------------+             +-------------------------------+
| - Lifecycle (init, shutdown)  |             | - renderItem (Live-Formular)  |
| - getWidgets()                |             | - renderItemPreview (Designer)|
| - Resource Descriptors (CSS)  |             | - validate (Server-Prüfung)   |
| - Bundle-Properties (Global)  |             | - getAvailableProperties      |
+-------------------------------+             +-------------------------------+
                                                               |
                                              +----------------v---------------+
                                              |    FriendlyCaptchaService      |
                                              +--------------------------------+
                                              | - HTTPS API Call (V1 & V2)     |
                                              | - Timeout & Error Codes        |
                                              +--------------------------------+
```

### 1.1 Maven Abhängigkeiten & BOM
Verwenden Sie immer den XIMA FORMCYCLE BOM-Import in `dependencyManagement`, um Versionskonflikte zu vermeiden:

```xml
<properties>
    <xfc.version>8.5.5</xfc.version>
    <java.version>11</java.version>
    <maven.compiler.source>11</maven.compiler.source>
    <maven.compiler.target>11</maven.compiler.target>
    <maven.compiler.release>11</maven.compiler.release>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>de.xima.fc</groupId>
            <artifactId>fc</artifactId>
            <version>${xfc.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Wichtigste bereitgestellte Abhängigkeiten (`scope: provided`):
- `de.xima.fc:fc-plugin-common`: Plugin-Interfaces, Lifecycle-Klassen.
- `de.xima.fc:fc-logic`: Form-Modelle, Render-Kontexte, Validierungs-Interfaces.
- `com.hp.gagawa:gagawa`: HTML-Generierungs-Bibliothek von FORMCYCLE.
- `org.apache.commons:commons-lang3`: String- und Utility-Funktionen.
- `org.slf4j:slf4j-api`: Logging.

---

## 2. Häufige Fallstricke & Best Practices

### 2.1 Der 404- und Strict-MIME-Type-Fallstrick bei externen Widget-Includes

#### Das Problem:
FORMCYCLE ruft standardmäßig beim Rendern von Formularen für jedes Widget URLs nach folgendem Muster auf:
```
/form/includes/ressource/{clientId}/{projectId}/plugin/form-element-widget/{pluginId}/{pluginName}/{WidgetName}.css
/form/includes/ressource/{clientId}/{projectId}/plugin/form-element-widget/{pluginId}/{pluginName}/{WidgetName}.js
```
Wenn der Server (z. B. auf Cloud-Installationen oder mandantenspezifischen Instanzen) diese Servlet-Ressource nicht findet, liefert er **HTTP 404 mit leerem Body und ohne `Content-Type`-Header** aus.
Moderne Browser blockieren dies sofort mit Fehlern wie:
> *Refused to apply style ... because its MIME type ('') is not a supported stylesheet MIME type, and strict MIME checking is enabled.*
> *GET ... net::ERR_ABORTED 404 (Not Found)*

#### Die Lösung: Automatische Bereinigung via `cleanUpIncludes()`
In `renderItem()` und `renderItemPreview()` hat das Widget über `renderData.getXFormRenderConfig()` direkten Zugriff auf die noch nicht gerenderten Includes:

```java
private void cleanUpIncludes(IXFormRenderConfig config) {
    if (config == null) {
        return;
    }
    if (config.getCssIncludes() != null) {
        config.getCssIncludes().entrySet().removeIf(e ->
            (e.getKey() != null && (e.getKey().contains("FriendlyCaptchaWidget") || e.getKey().contains("fc-plugin-friendly-captcha"))) ||
            (e.getValue() != null && (e.getValue().contains("FriendlyCaptchaWidget") || e.getValue().contains("fc-plugin-friendly-captcha")))
        );
    }
    if (config.getJsIncludes() != null) {
        config.getJsIncludes().entrySet().removeIf(e ->
            (e.getKey() != null && (e.getKey().contains("FriendlyCaptchaWidget") || e.getKey().contains("fc-plugin-friendly-captcha"))) ||
            (e.getValue() != null && (e.getValue().contains("FriendlyCaptchaWidget") || e.getValue().contains("fc-plugin-friendly-captcha")))
        );
    }
}
```

Rufen Sie diese Methode jeweils zu Beginn von `renderItem` und `renderItemPreview` auf:
```java
@Override
public void renderItem(Div container, XItemRenderData renderData, XItemRenderCtx renderCtx, IXFormRenderContext formRenderCtx) {
    cleanUpIncludes(renderData != null ? renderData.getXFormRenderConfig() : null);
    // ...
}
```

Da FORMCYCLE den HTML-`<head>` erst **nach** den Widgets erzeugt, werden keine fehlerhaften `<link>`- oder `<script>`-Tags in die Seite geschrieben!

---

### 2.2 Völlige Autarkie durch Inline-Styling & Inline-Scripting

Binden Sie benötigtes CSS und JS direkt im Widget-Wrapper über Gagawa ein:

```java
// CSS direkt einbetten
final Style clientStyle = new Style("text/css");
clientStyle.appendText(".my-widget-container { margin: 8px 0; display: block; }");
wrapper.appendChild(clientStyle);

// Script direkt einbetten
final Script scriptLoader = new Script("text/javascript");
scriptLoader.appendText("(function() { /* Widget Runtime Logic */ })();");
wrapper.appendChild(scriptLoader);
```

**Vorteile:**
1. Keine externen HTTP-Requests an den Formcycle-Server für das Widget.
2. Keine Caching-Probleme bei Plugin-Updates.
3. 100%ige Funktionsfähigkeit auch hinter Firewalls oder restriktiven Reverse-Proxies.

---

### 2.3 Eigene SVG-Logos & Icons im Designer (Palette, Elementbaum, Canvas)

#### Das Problem:
FORMCYCLE verwendet für seine UI Font-Icons (FontAwesome / Icomoon). Wenn ein Plugin ein eigenes Icon registriert (`getIcon() -> "ico-fc-friendly-captcha"`), zeigt der Designer oft nur ein leeres Quadrat oder ein falsches Zeichen an, weil die Icon-Schriftart die Glyphe nicht kennt.

#### Die Lösung: Reines SVG als CSS Background-Image
Überschreiben Sie die Font-Icon-Klasse mit `font-size: 0 !important; color: transparent !important;` und setzen Sie ein Base64- oder URL-encoded SVG als Hintergrundgrafik:

```css
.drawer-panel__designer-item .ico-fc-friendly-captcha,
.xm-element-icon .ico-fc-friendly-captcha,
.ico-fc-friendly-captcha {
    display: inline-block !important;
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    min-height: 20px !important;
    vertical-align: middle !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E...%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: contain !important;
    font-size: 0 !important;
    color: transparent !important;
}

/* Pseudo-Element ::before deaktivieren, damit kein Font-Zeichen gezeichnet wird */
.drawer-panel__designer-item .ico-fc-friendly-captcha:before,
.xm-element-icon .ico-fc-friendly-captcha:before,
.ico-fc-friendly-captcha:before {
    content: '' !important;
    display: none !important;
    font-size: 0 !important;
}
```

Stellen Sie dieses CSS über `getCssForDesignerUiResource()` in Ihrer Plugin-Klasse bereit:
```java
@Override
public IResourceDescriptor getCssForDesignerUiResource() {
    return new StaticResourceDescriptor("fcplugin://my-plugin/designer.css", PLUGIN_CSS);
}
```

---

### 2.4 Wertebindung & Formularübermittlung (`IXValuableItem`)

Damit FORMCYCLE den Wert des Widgets (z. B. ein Verifikations-Token) verarbeitet, muss das Widget `IXValuableItem` implementieren:

```java
public class MyWidget implements IXItemWidget, IXValuableItem {
    @Override
    public boolean isSubmitsValues() {
        return true;
    }
```

Beim Rendern muss ein verstecktes Input-Feld mit den FORMCYCLE-Standardklassen generiert werden:
```java
final Input hiddenInput = new Input();
hiddenInput.setType("hidden");
hiddenInput.setId(renderData.getId());
hiddenInput.setName(renderData.getName());
hiddenInput.setAttribute("data-name", renderData.getName());
// Wichtig: XValueItem ist die interne FORMCYCLE-Klasse für serialisierbare Werte
hiddenInput.setCSSClass(renderData.getCssHtmlAttrString(renderCtx) + " XValueItem");
wrapper.appendChild(hiddenInput);
```

#### Event-Triggering für FORMCYCLE Dynamik:
Wenn der Wert per JavaScript aktualisiert wird, müssen die `input`- und `change`-Events für jQuery ausgelöst werden, damit Formcycle-Bedingungen (`hiddenif`, `readonlyif`) reagieren:

```javascript
field.value = token;
if (window.$ && typeof $.fn.trigger === 'function') {
    $(field).trigger('input').trigger('change');
}
```

---

### 2.5 Server-seitige Validierung (`validate`)

Die Methode `validate(IXValidationParams params)` wird auf dem Server aufgerufen, wenn das Formular abgeschickt wird.

#### Beachten Sie diese 3 kritischen Checks:

1. **Aktionen ohne Validierungspflicht überspringen (`isShouldValidate`):**
   ```java
   if (!params.isShouldValidate()) {
       return Collections.singletonList(new XValidationResult(true));
   }
   ```
   *Hintergrund:* Aktionen wie "Entwurf speichern" oder "Zwischenspeichern" fordern keine Validierung an. Ein Blockieren würde den Benutzer einschränken.

2. **Ausgeblendete Elemente nicht validieren (`ishidden`):**
   ```java
   final IXItemPropertiesData propData = params.getXItemPropertiesData();
   if (propData != null) {
       final XPropertyValue isHiddenVal = propData.get(XPropertyEnum.ishidden);
       if (isHiddenVal != null && isHiddenVal.getDefaultBoolean(false)) {
           return Collections.singletonList(new XValidationResult(true));
       }
   }
   ```
   *Hintergrund:* Wenn das Widget in einem mehrseitigen Formular auf einer nicht angezeigten Seite liegt, darf es das Absenden nicht verhindern.

3. **Fallback-Werte aus der Feld-Map prüfen:**
   ```java
   String token = null;
   if (params.getElementValues() != null && params.getElementValues().length > 0) {
       token = params.getElementValues()[0];
   }
   // Fallback auf Alias-Namen
   if (StringUtils.isBlank(token) && params.getFieldValuesMap() != null) {
       List<String[]> aliasVals = params.getFieldValuesMap().get("myCustomFieldAlias");
       if (aliasVals != null && !aliasVals.isEmpty()) {
           token = aliasVals.get(0)[0];
       }
   }
   ```

---

### 2.6 Konfigurationshierarchie: Global vs. Formularelement

Nutzer möchten Standard-Einstellungen (wie API-Keys) einmalig zentral für den gesamten Mandanten hinterlegen, aber in Ausnahmefällen an einzelnen Formularen überschreiben können.

Muster für die Auflösung:
```java
public static String resolveConfig(String elementValue, String bundleKey, String defaultValue) {
    // 1. Wenn am Element explizit ein Wert eingetragen ist -> Element gewinnt
    if (StringUtils.isNotBlank(elementValue)) {
        return elementValue.trim();
    }
    // 2. Wenn in den Plugin-Bundle-Properties global ein Wert hinterlegt ist -> Global gewinnt
    String global = getBundleProperty(bundleKey);
    if (StringUtils.isNotBlank(global)) {
        return global.trim();
    }
    // 3. Fallback auf Default-Wert
    return defaultValue;
}
```

---

## 3. Testen & Mocking von FORMCYCLE-Schnittstellen

Da viele FORMCYCLE-Klassen Interfaces sind (`IXFormRenderConfig`, `IXValidationParams`), lassen sie sich in Unit-Tests elegant über Java Dynamic Proxies mocken, ohne schwere Mocking-Frameworks einbinden zu müssen:

```java
IXFormRenderConfig mockConfig = (IXFormRenderConfig) Proxy.newProxyInstance(
    getClass().getClassLoader(),
    new Class<?>[]{IXFormRenderConfig.class},
    (proxy, method, args) -> {
        if ("getCssIncludes".equals(method.getName())) return cssMap;
        if ("getJsIncludes".equals(method.getName())) return jsMap;
        return null;
    }
);
```

---

## 4. Build- & Packaging-Checkliste

- [ ] **Java 11 Bytecode:** Sicherstellen, dass `maven.compiler.release` auf `11` gesetzt ist.
- [ ] **MANIFEST.MF:** `Plugin-Key`, `Plugin-Version`, `formcycle-version-requirement: 8.5.5`.
- [ ] **Fat-JAR:** Externe Hilfsbibliotheken (falls nicht in Formcycle vorhanden) ins JAR packen (`maven-assembly-plugin`).
- [ ] **Internationalisierung:** `i18n.properties`, `i18n_de.properties`, `i18n_en.properties` in `src/main/resources`.
- [ ] **Unit-Tests:** 100% Testabdeckung für API-Aufrufe, Timeout-Handling, Replay-Schutz und Fehlercodes.
