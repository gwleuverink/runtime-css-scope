export default class StyleScopeFactory {
    constructor(el) {
        this.el = el;
    }

    build() {
        let scopeId = this.el.getAttribute('x-scope')
        if (scopeId) {
            return scopeId
        }

        scopeId = this.generateScopeId(this.el.innerHTML) // A checksum of the original style content

        const scopedAttrSelector = `[data-scope-${scopeId}]`
        const scopedRules = this.generateScopedRules(this.el.sheet, scopedAttrSelector)
        this.replaceRuleObjects(this.el.sheet, scopedRules)
        this.el.setAttribute('x-scope', scopeId) // Guards the sheet from being scoped more than once

        this.el.innerHTML = this.sheetToString(this.el.sheet)
        return scopeId
    }

    /**
     * This method generates an array of scoped CSS text strings
     * 
     * This library currently supports normal CSS rules and @media rules
     * The following rule types are skipped on purpose since it is
     * not relevant for this library:
     * 
     * CSSImportRule, CSSMediaRule, CSSFontFaceRule, CSSPageRule, CSSKeyframesRule, CSSKeyframeRule, 
     * CSSNamespaceRule, CSSCounterStyleRule, CSSSupportsRule, CSSDocumentRule, CSSFontFeatureValuesRule, 
     * CSSViewportRule, CSSRegionStyleRule, CSSUnknownRule, CSSCharsetRule
     * 
     * If you need any of these to  be supported, please open an issue on GitHub and provide a practical example.
     * 
     * @param CSSStyleSheet sheet 
     * @param String scopedAttrSelector 
     */
    generateScopedRules(sheet, scopedAttrSelector) {
        const rules = sheet.rules || sheet.cssRules;

        // Replace every rule with a freshly scoped rule
        const scopedRules = Object.values(rules).map((rule, index) => {
            
            if (rule instanceof CSSMediaRule) {
                // Handle media queries recursively
                return `@media ${rule.conditionText} { ${this.generateScopedRules(rule, scopedAttrSelector)} }`
            }
            else if (rule instanceof CSSStyleRule) {
                return this.scopeCssSelectorString(rule.selectorText, scopedAttrSelector) + `{${rule.style.cssText}}`
            }
            return rule.cssText
        })

        return scopedRules
    }


    /**
     * Applies scope id to a CSS selector
     * 
     * @param String selectorText 
     * @param String scopeAttr 
     */
    scopeCssSelectorString(selectorText, scopeAttr) {
        return selectorText
            .split(',') // The selectorText can consist of multiple css selectors
            .reduce((carry, selector) => {

                if (selector.includes('::')) {
                    return carry + this.scopeCssPseudoElementSelector(selector, scopeAttr)
                }

                if (selector.includes(':')) {
                    return carry + this.scopeCssPseudoClassSelector(selector, scopeAttr)
                }

                // It's a normal selector. Scope is added last
                return carry + selector.trim() + scopeAttr + ', '
            }, '')
            .trim()
            .slice(0, -1) // Always strip the last comma + whitespace
    }

    /**
     * Insert the scope attr before ::
     * 
     * @param String selector 
     * @param String scopeAttr 
     */
    scopeCssPseudoElementSelector(selector, scopeAttr) {
        const exploded = selector.split('::')
        exploded.splice(1, 0, scopeAttr + '::')
        return exploded.join('') + ', ';
    }

    /**
     * Insert the scope attr before :
     * 
     * @param String selector
     * @param String scopeAttr
     */
    scopeCssPseudoClassSelector(selector, scopeAttr) {
        const exploded = selector.split(':')
        exploded.splice(1, 0, scopeAttr + ':')
        return exploded.join('') + ', ';
    }


    /**
     * Generate a checksum to be used as the CSS scope ID
     * @param String css 
     */
    generateScopeId(css) {
        return Math.random().toString(36).slice(6)
    }

    /**
     * Replace a given stylesheet's rules
     * 
     * @param CSSStyleSheet sheet 
     * @param Array newRules 
     */
    replaceRuleObjects(sheet, newRules) {
        const rules = sheet.rules || sheet.cssRules
        Object.values(rules).forEach((rule, index) => {
            sheet.insertRule(newRules[index], index)
            sheet.removeRule(index + 1)
        })
    }

    // Stolen from CSSOM. https://github.com/NV/CSSOM/blob/120908d4214bd4732713e3490ee6c8212931678c/lib/CSSStyleSheet.js#L69-L80
    sheetToString(sheet) {
        var result = "";
        var rules = sheet.rules || sheet.cssRules;
        for (var i = 0; i < rules.length; i++) {
            result += rules[i].cssText + "\n";
        }
        return result;
    }
}
