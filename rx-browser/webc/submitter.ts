// TODO(rdo) move mixin when ready to its own file, for reuse
type Constructor<T> = new (...args: any[]) => T; // placeholder type, ensure class below

const IncludeStyleSheets = <T extends Constructor<HTMLElement>>(base: T) =>
  class extends base {
    // both asserted in constructor
    endStyle: HTMLElement;
    shadowRoot: ShadowRoot;

    constructor(...args: any[]) {
      super(...args);
      const shadow = this.attachShadow({ mode: "open" });
      for (const sheet of document.styleSheets) {
        if (!sheet.href) {
          continue;
        }

        let link = document.createElement("link");
        link.href = sheet.href;
        link.rel = "stylesheet";

        shadow.appendChild(link);
      }
      this.endStyle = shadow.lastChild as HTMLElement;
    }
  };

/**
 * Submitter behaves like an interactive version of HTML form.
 * As opposed to a regular <form> element, form submission is always done asynchronously, and results injected in the page.
 * Data is only ever synchronized one way to the server (write-behind), but an error will be raised if the server data has been updated.
 *
 * This element is currently fairly minimalist, future extension should strive to be compatible with:
 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
 *  - https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 *
 * TODO(rdo): ETag management to detect stale data
 * TODO(rdo): integration with extended form elements
 */
class Submitter extends IncludeStyleSheets(HTMLElement) {
  form: HTMLFormElement;

  connectedCallback() {
    if (!this.action) {
      console.error(`Submitter element added without an action property. No data will be sent.
This is likely a programming error`);
      return;
    }

    this.form = document.createElement("form");
    for (const elt of Array.from(this.children)) {
      this.form.appendChild(elt);
    }
    this.form.addEventListener("submit", this.submit.bind(this));
    this.shadowRoot.addEventListener("change", this.submit.bind(this));
    this.shadowRoot.appendChild(this.form);
  }

  get action() {
    return this.getAttribute("action");
  }

  async submit(ev: Event) {
    if (!this.action) return;

    console.debug("submit sent", ev.target, this.form.elements);
    await fetch(this.action, {
      method: "POST",
      body: new FormData(this.form),
    });
  }
}

type allKindsOfInputs =
  | HTMLButtonElement
  | HTMLInputElement
  | HTMLOutputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

customElements.define("wt-submit", Submitter);
