import { html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { inputs } from "../utils/inputs";
import TWElement from "./tw";
class InlineForm extends TWElement {
    constructor() {
        super(...arguments);
        this.expanded = false;
        this.formSlot = createRef();
    }
    async submit(ev) {
        const fd = new FormData();
        for (let i of inputs(this.formSlot.value.assignedElements())) {
            if (i.reportValidity()) {
                fd.append(i.name, i.value);
            }
            else {
                return;
            }
        }
        ev.preventDefault();
        const rsp = await fetch(this.action, {
            method: "POST",
            body: fd,
        });
        if (rsp.status === 200) {
            // TODO(rdo) all good actually, show pop-up
            window.location.replace(rsp.headers.get("Location"));
        }
        else if (rsp.status === 400) {
            // return error to UI
        }
        else {
            console.warn("unknown response status (API error):", rsp.statusText);
        }
    }
    render() {
        if (!this.expanded) {
            return html `
        <button
          class="py-3 px-4 flex items-center bg-yellow-400 text-neutral-900 rounded text-sm font-medium"
          @click=${() => {
                this.expanded = !this.expanded;
            }}
        >
          ${this.value}
        </button>
      `;
        }
        return html `
      <form
        class="flex items-center text-sm font-medium"
        method="post"
        @submit=${this.submit.bind(this)}
      >
        <slot ${ref(this.formSlot)}>No expanded content</slot>

        <div class="ml-4 flex gap-2">
          <input
            type="submit"
            class="py-3 px-4 flex items-center bg-yellow-400 text-neutral-900 rounded text-sm font-medium cursor-pointer"
            value="${this.value}"
          />
          <button
            class="py-3 px-4 flex items-center bg-neutral-200 dark:bg-neutral-700 rounded text-sm font-medium"
            @click=${() => {
            this.expanded = !this.expanded;
        }}
          >
            Cancel
          </button>
        </div>
      </form>
    `;
    }
}
InlineForm.properties = {
    value: { type: String },
    action: { type: String },
    expanded: { type: Boolean, state: true },
};
customElements.define("wt-inlineform", InlineForm);
//# sourceMappingURL=inline-form.js.map