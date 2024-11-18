import { html } from "lit";
import { when } from "lit/directives/when.js";
import TWElement from "./tw";
import icons from "./icons";
class CopyButton extends TWElement {
    constructor() {
        super(...arguments);
        this.showpopup = false;
        this.popup = () => html `
    <div class="absolute border border-zinc-200 bg-white p-1">
      Value copied to clipboard!
    </div>
  `;
    }
    toclipboard() {
        navigator.clipboard.writeText(this.copyvalue);
        this.showpopup = true;
        window.setTimeout(() => (this.showpopup = false), 2000);
    }
    render() {
        return html `
      <div class="inline-flex items-bottom relative">
        <svg
          class="w-4 h-4 ml-1 mr-2 fill-none stroke-zinc-800 cursor-pointer"
          @click="${this.toclipboard}"
        >
          ${icons.copy}
        </svg>
        <slot>no content to copy</slot>
      </div>
      ${when(this.showpopup, this.popup)}
    `;
    }
}
CopyButton.properties = {
    copyvalue: {},
    showpopup: { state: true },
};
customElements.define("wt-copybutton", CopyButton);
//# sourceMappingURL=copy-button.js.map