import { LitElement } from "lit";

/**
 * TWElement: share the CSS stylesheet with the parent
 */
class TWElement extends LitElement {
  renderRoot: ShadowRoot;

  createRenderRoot() {
    const root = super.createRenderRoot();
    // @ts-ignore
    for (const sheet of document.styleSheets) {
      let link = document.createElement("link");
      link.href = sheet.href || "";
      link.rel = "stylesheet";

      root.appendChild(link);
    }
    return root;
  }

  _slottedChildren(selector?: string, slot?: string) {
    let sel = "slot";
    if (slot) {
      sel += " [name=" + slot + "]";
    }
    const slotElement = this.shadowRoot!.querySelector(
      sel,
    ) as HTMLSlotElement | null;
    const children = slotElement!.assignedElements({ flatten: true });
    if (!selector) {
      return children;
    }

    return children.filter((e) => e.matches(selector));
  }

  // testPeek matches a selector in shadow root
  testPeek(selector: string) {
    const n = this.renderRoot.querySelector(selector);
    if (n == null) {
      throw new Error("no node matching selector " + selector);
    }

    return n;
  }
  // testPeekAll matches a selector in shadow root
  testPeekAll(selector: string) {
    return this.renderRoot.querySelectorAll(selector);
  }
}

export default TWElement;
