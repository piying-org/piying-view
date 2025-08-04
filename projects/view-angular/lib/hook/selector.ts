import { CssSelector } from './directive_matching';
// packages/compiler/src/core.ts
/**
 * Flags used to generate R3-style CSS Selectors. They are pasted from
 * core/src/render3/projection.ts because they cannot be referenced directly.
 */
const enum SelectorFlags {
  /** Indicates this is the beginning of a new negative selector */
  NOT = 0b0001,

  /** Mode for matching attributes */
  ATTRIBUTE = 0b0010,

  /** Mode for matching tag names */
  ELEMENT = 0b0100,

  /** Mode for matching class names */
  CLASS = 0b1000,
}

// These are a copy the CSS types from core/src/render3/interfaces/projection.ts
// They are duplicated here as they cannot be directly referenced from core.
type R3CssSelector = (string | SelectorFlags)[];
type R3CssSelectorList = R3CssSelector[];

function parserSelectorToSimpleSelector(selector: CssSelector): R3CssSelector {
  const classes =
    selector.classNames && selector.classNames.length
      ? [SelectorFlags.CLASS, ...selector.classNames]
      : [];
  const elementName =
    selector.element && selector.element !== '*' ? selector.element : '';
  return [elementName, ...selector.attrs, ...classes];
}

function parserSelectorToNegativeSelector(
  selector: CssSelector,
): R3CssSelector {
  const classes =
    selector.classNames && selector.classNames.length
      ? [SelectorFlags.CLASS, ...selector.classNames]
      : [];

  if (selector.element) {
    return [
      SelectorFlags.NOT | SelectorFlags.ELEMENT,
      selector.element,
      ...selector.attrs,
      ...classes,
    ];
  } else if (selector.attrs.length) {
    return [
      SelectorFlags.NOT | SelectorFlags.ATTRIBUTE,
      ...selector.attrs,
      ...classes,
    ];
  } else {
    return selector.classNames && selector.classNames.length
      ? [SelectorFlags.NOT | SelectorFlags.CLASS, ...selector.classNames]
      : [];
  }
}

function parserSelectorToR3Selector(selector: CssSelector): R3CssSelector {
  const positive = parserSelectorToSimpleSelector(selector);

  const negative: R3CssSelectorList =
    selector.notSelectors && selector.notSelectors.length
      ? selector.notSelectors.map((notSelector) =>
          parserSelectorToNegativeSelector(notSelector),
        )
      : [];

  return positive.concat(...negative);
}

export function parseSelectorToR3Selector(
  selector: string | null,
): R3CssSelectorList {
  return selector
    ? CssSelector.parse(selector).map(parserSelectorToR3Selector)
    : [];
}
