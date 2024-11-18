import { html } from "lit";
import { when } from "lit/directives/when.js";
import TWElement from "./tw";
export class Alert extends TWElement {
    constructor(type, text) {
        super();
        this.type = type;
        this.text = text;
        this.display = false;
    }
    open() {
        this.display = true;
    }
    close() {
        this.display = false;
    }
    defaultView() {
        return html `
      <div
        class="px-4 py-3 flex items-center justify-between fixed left-1/2 bottom-16 z-20 -translate-x-1/2 bg-red-100 border border-red-500 rounded"
      >
        <p class="text-red-500">${this.text}</p>
      </div>
    `;
    }
    // TODO in future might want to use different templates depending on alert's type. Also text is going to be more complicated than a simple string
    render() {
        return when(this.display, this.defaultView.bind(this), () => {
            return html ``;
        });
    }
}
Alert.properties = {
    type: { type: String },
    text: { type: String },
    display: { type: Boolean },
};
customElements.define("wt-alert", Alert);
//# sourceMappingURL=alert.js.map