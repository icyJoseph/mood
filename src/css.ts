const styleSheetLookUpFactory = () => {
  const table = new WeakMap<Document, HTMLStyleElement>();

  const styleSheetLookUp = (host: Document): HTMLStyleElement => {
    const maybe = table.get(host);

    if (maybe) {
      return maybe;
    }

    const stylesheet = host.createElement("style");

    {
      // start tracking this host->stylesheet relation
      table.set(host, stylesheet);
    }

    {
      // side effect
      host.head.appendChild(stylesheet);
    }

    return stylesheet;
  };

  return styleSheetLookUp;
};

const styleSheetLookUp = styleSheetLookUpFactory();

const parseCSSRules = (host: Document, css: string) => {
  const parser = host.implementation.createHTMLDocument("");
  const parserSheet = host.createElement("style");
  parserSheet.textContent = css;
  parser.body.appendChild(parserSheet);

  const rules = parserSheet.sheet?.cssRules;

  return rules;
};

/**
 * Takes in a host Document, makes sure to reuse the same style tag
 * inside the head of the host, and creates a list of CSS rules to apply
 * on host. It cleans up the style tag on host head, and inserts the new rules.
 */
export function injectCSS(host: Document, css: string) {
  const stylesheet = styleSheetLookUp(host);

  const rules = parseCSSRules(host, css);

  // Remove all rules and insert the new rules using CSSOM
  while (stylesheet.sheet?.cssRules.length) {
    stylesheet.sheet.deleteRule(stylesheet.sheet.cssRules.length - 1);
  }

  if (!rules) return;

  for (let i = 0; i < rules.length; i++) {
    const rule = rules.item(i);

    stylesheet.sheet?.insertRule(
      rule.cssText,
      stylesheet.sheet.cssRules.length
    );
  }
}
