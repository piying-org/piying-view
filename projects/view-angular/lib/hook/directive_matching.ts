//packages/compiler/src/directive_matching.ts
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const _SELECTOR_REGEXP = new RegExp(
  '(\\:not\\()|' + // 1: ":not("
    '(([\\.\\#]?)[-\\w]+)|' + // 2: "tag"; 3: "."/"#";
    // "-" should appear first in the regexp below as FF31 parses "[.-\w]" as a range
    // 4: attribute; 5: attribute_string; 6: attribute_value
    '(?:\\[([-.\\w*\\\\$]+)(?:=(["\']?)([^\\]"\']*)\\5)?\\])|' + // "[name]", "[name=value]",
    // "[name="value"]",
    // "[name='value']"
    '(\\))|' + // 7: ")"
    '(\\s*,\\s*)', // 8: ","
  'g',
);

/**
 * These offsets should match the match-groups in `_SELECTOR_REGEXP` offsets.
 */
const enum SelectorRegexp {
  ALL = 0, // The whole match
  NOT = 1,
  TAG = 2,
  PREFIX = 3,
  ATTRIBUTE = 4,
  ATTRIBUTE_STRING = 5,
  ATTRIBUTE_VALUE = 6,
  NOT_END = 7,
  SEPARATOR = 8,
}
/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
  element: string | null = null;
  classNames: string[] = [];
  /**
   * The selectors are encoded in pairs where:
   * - even locations are attribute names
   * - odd locations are attribute values.
   *
   * Example:
   * Selector: `[key1=value1][key2]` would parse to:
   * ```
   * ['key1', 'value1', 'key2', '']
   * ```
   */
  attrs: string[] = [];
  notSelectors: CssSelector[] = [];

  static parse(selector: string): CssSelector[] {
    const results: CssSelector[] = [];
    const _addResult = (res: CssSelector[], cssSel: CssSelector) => {
      if (
        cssSel.notSelectors.length > 0 &&
        !cssSel.element &&
        cssSel.classNames.length == 0 &&
        cssSel.attrs.length == 0
      ) {
        cssSel.element = '*';
      }
      res.push(cssSel);
    };
    let cssSelector = new CssSelector();
    let match: string[] | null;
    let current = cssSelector;
    let inNot = false;
    _SELECTOR_REGEXP.lastIndex = 0;
    while ((match = _SELECTOR_REGEXP.exec(selector))) {
      if (match[SelectorRegexp.NOT]) {
        if (inNot) {
          throw new Error('Nesting :not in a selector is not allowed');
        }
        inNot = true;
        current = new CssSelector();
        cssSelector.notSelectors.push(current);
      }
      const tag = match[SelectorRegexp.TAG];
      if (tag) {
        const prefix = match[SelectorRegexp.PREFIX];
        if (prefix === '#') {
          // #hash
          current.addAttribute('id', tag.slice(1));
        } else if (prefix === '.') {
          // Class
          current.addClassName(tag.slice(1));
        } else {
          // Element
          current.setElement(tag);
        }
      }
      const attribute = match[SelectorRegexp.ATTRIBUTE];

      if (attribute) {
        current.addAttribute(
          current.unescapeAttribute(attribute),
          match[SelectorRegexp.ATTRIBUTE_VALUE],
        );
      }
      if (match[SelectorRegexp.NOT_END]) {
        inNot = false;
        current = cssSelector;
      }
      if (match[SelectorRegexp.SEPARATOR]) {
        if (inNot) {
          throw new Error('Multiple selectors in :not are not supported');
        }
        _addResult(results, cssSelector);
        cssSelector = current = new CssSelector();
      }
    }
    _addResult(results, cssSelector);
    return results;
  }

  /**
   * Unescape `\$` sequences from the CSS attribute selector.
   *
   * This is needed because `$` can have a special meaning in CSS selectors,
   * but we might want to match an attribute that contains `$`.
   * [MDN web link for more
   * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
   * @param attr the attribute to unescape.
   * @returns the unescaped string.
   */
  unescapeAttribute(attr: string): string {
    let result = '';
    let escaping = false;
    for (let i = 0; i < attr.length; i++) {
      const char = attr.charAt(i);
      if (char === '\\') {
        escaping = true;
        continue;
      }
      if (char === '$' && !escaping) {
        throw new Error(
          `Error in attribute selector "${attr}". ` +
            `Unescaped "$" is not supported. Please escape with "\\$".`,
        );
      }
      escaping = false;
      result += char;
    }
    return result;
  }

  /**
   * Escape `$` sequences from the CSS attribute selector.
   *
   * This is needed because `$` can have a special meaning in CSS selectors,
   * with this method we are escaping `$` with `\$'.
   * [MDN web link for more
   * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
   * @param attr the attribute to escape.
   * @returns the escaped string.
   */
  escapeAttribute(attr: string): string {
    return attr.replace(/\\/g, '\\\\').replace(/\$/g, '\\$');
  }

  setElement(element: string | null = null) {
    this.element = element;
  }

  addAttribute(name: string, value: string = '') {
    this.attrs.push(name, (value && value.toLowerCase()) || '');
  }

  addClassName(name: string) {
    this.classNames.push(name.toLowerCase());
  }

  toString(): string {
    let res: string = this.element || '';
    if (this.classNames) {
      this.classNames.forEach((klass) => (res += `.${klass}`));
    }
    if (this.attrs) {
      for (let i = 0; i < this.attrs.length; i += 2) {
        const name = this.escapeAttribute(this.attrs[i]);
        const value = this.attrs[i + 1];
        res += `[${name}${value ? '=' + value : ''}]`;
      }
    }
    this.notSelectors.forEach((notSelector) => (res += `:not(${notSelector})`));
    return res;
  }
}
