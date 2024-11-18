import { html } from "lit";
import { componentLogger } from "../utils/debugger";
import { setPivotDragData } from "./pivot-events";
import TWElement from "./tw";
const debugPivot = componentLogger("pivot");
/**
 * A transform is represented as a button that can be dragged in position.
 *
 * The transform can contain an arbitrary (rich text) comment to enrich the information.
 * The link between the comment and transform is maintained server-side, but passed to the client for display.
 */
class Pivot extends TWElement {
    constructor() {
        super(...arguments);
        this.startDrag = (ev) => {
            setPivotDragData(ev, {
                pivotid: this.pivotid,
                args: this.args,
                name: this.name,
                type: "pivot:piql:piql",
                note: "",
            });
            debugPivot("Setting pivot data:", ev.dataTransfer.getData("application/json"));
            ev.dataTransfer.dropEffect = "link";
        };
        this.endDrag = (ev) => {
            debugPivot("Ending pivot drag event:", ev.dataTransfer.getData("application/json"));
        };
    }
    render() {
        return html `
      <button
        draggable="true"
        class="px-3 py-1 flex items-center bg-yellow-500 text-neutral-900 dark:bg-neutral-100 border border-yellow-500 rounded-2xl text-xs font-medium cursor-pointer"
        draggable="true"
        role="button"
        @dragstart=${this.startDrag}
        @dragend=${this.endDrag}
      >
        <span>${this.name}</span>
        <svg viewBox="0 0 28 15" width="14px" class="ml-1">
          <circle cx="6" cy="4" r="2"></circle>
          <circle cx="14" cy="4" r="2"></circle>
          <circle cx="22" cy="4" r="2"></circle>
          <circle cx="6" cy="13" r="2"></circle>
          <circle cx="14" cy="13" r="2"></circle>
          <circle cx="22" cy="13" r="2"></circle>
        </svg>
      </button>
    `;
    }
}
Pivot.properties = {
    pivotid: { type: String },
    name: { type: String },
    args: { type: Array },
    note: { type: String }, // TODO(rdo) probably a slot?
};
customElements.define("wt-pivot", Pivot);
//# sourceMappingURL=pivot.js.map