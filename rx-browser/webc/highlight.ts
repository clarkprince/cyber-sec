/**
 * Selection here means DOM selection
 * it's a low-level frontend feature
 * @see https://developer.mozilla.org/en/docs/Web/API/Selection
 * = highlighted content in the DOM
 * => we can use the wording "highlight" or "DOM selection" to limit confusion
 *
 * Should not be confused with selection in the lioli
 * which is higher level
 * = selected text nodes
 *
 * Or with ProseMirror selection in the text editor
 * = highlighted text but with an API specific to prose mirror
 */

type DOMSelection = Selection;

/**
 * Get current DOM selection
 * = highlighted text
 * in a cross-browser fashion
 *
 * NOTE: when focusing out of an element and the highlight disappear,
 * getSelection() is only emptied on next tick ( use setTimeout with 1 ms for instance)
 *
 * NOTE: when used in a Lit element
 * do NOT pass "this.renderRoot",
 * as it can be either a ShadowRoot or the parent DOM component
 * Instead, you want to pass ShadowRoot (this.shadowRoot) if you use a shadow DOM,
 * or window.document otherwise
 * (so not the parent element but the whole document, because selections are global)
 *
 * ShadowRoot.getSelection is not standard
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot
 * Chrome should support it via shadowRoot.getSelection()
 * while document.getSelection() will be irrelevant
 * Firefox should support it via document.getSelection()
 * and will correctly pierce the shadowRoot
 */
export function getShadowSelection(shadowRoot: ShadowRoot): Selection | null {
  if ("getSelection" in shadowRoot) {
    console.debug("browser implement getSelection on shadow root");
    return (
      shadowRoot as ShadowRoot & { getSelection: () => Selection }
    ).getSelection() as Selection;
  } else {
    console.debug("browser implement getSelection directly on document");
    return document.getSelection();
  }
}
export function isEmptyShadowSelection(shadowRoot: ShadowRoot) {
  const sel = getShadowSelection(shadowRoot);
  if (!sel) return true;
  return isEmptySelection(sel);
}

export function isEmptySelection(sel: Selection) {
  return (
    !(sel.anchorNode && sel.focusNode) ||
    (sel.anchorNode === sel.focusNode && sel.anchorOffset === sel.focusOffset)
  );
}
