import { html, nothing } from "lit";
import TWElement from "./tw";
import { removePivotDragImage, setPivotDragData, setPivotDragImage, } from "./pivot-events";
/**
 * UI component to display a pivot pill
 *
 * At the time of writing (r1562) this component is not used in the Go-WASM code
 * which has its own way of computing pivot values, handling drag event and displaying them
 * This component is used outside of the datacell: text editor, left menu
 */
class PivotPill extends TWElement {
    constructor() {
        super();
    }
    render() {
        if (this.loading) {
            return html `<div
        class=${`inline-block mx-1 py-1 border-2 dark:border border-zinc-300 text-xs rounded cursor-pointer px-1 ${this.cls || ""}`}
        title=${`Pivot id: ${this.pivotid}`}
        draggable="false"
      >
        Loading pivot...
      </div>`;
        }
        const { pivot } = this;
        const on = ("on" in pivot && pivot.on?.length > 0 && pivot.on[0]) || "";
        const prettyOn = on.startsWith("$.") ? on.slice(2) : on;
        const leftOp = on
            ? html `<div
          class="p-1 self-stretch bg-zinc-200 dark:bg-neutral-700 dark:border-r smallcaps"
        >
          ${prettyOn}
        </div>`
            : nothing;
        return html `<div
      class=${`inline-block border-2 dark:border border-zinc-300 text-xs rounded-sm cursor-pointer ${this.cls || ""}`}
      draggable="true"
      data-value=${pivot.value}
      data-on=${"on" in pivot && pivot.on}
      @dragstart=${(e) => {
            setPivotDragData(e, JSON.stringify(this.pivot));
            setPivotDragImage(e, this.pivot);
        }}
      @dragend=${removePivotDragImage}
    >
      <div class="flex items-center">
        ${leftOp}
        <div class="px-1 truncate">${pivot.name || pivot.value}</div>
      </div>
    </div>`;
    }
}
PivotPill.properties = {
    pivot: { type: Object },
    loading: { type: Boolean },
    pivotid: { type: String },
    cls: { type: String },
};
customElements.define("wt-pivot-pill", PivotPill);
//# sourceMappingURL=pivot-pill.js.map