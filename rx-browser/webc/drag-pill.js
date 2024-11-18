import { html } from 'lit';
import TWElement from './tw';
import { askCreateCell, setDatasourceDragData } from "./notebook-body-events";
class DragPill extends TWElement {
    constructor() {
        super(...arguments);
        this.startDrag = (e) => {
            console.debug("catch a drag start event");
            setDatasourceDragData(e, this.data);
            e.dataTransfer.dropEffect = 'link';
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.data = {
            type: this.type,
            dataSource: this.dataSource,
            title: this.title
        };
    }
    async firstUpdated() {
        this.addEventListener('dragstart', this.startDrag);
        this.addEventListener('dblclick', this.createDataCell);
    }
    createDataCell() {
        if (this.data.type === 'datasource') {
            askCreateCell('wt-data', this.data.title, this);
        }
    }
    // note about drag: as of 2022-10-12 the drag event is not correctly handled with slots.
    // this mean we have to hack our way through this:
    //  - modify the slotted children, so they are marked as draggable
    //  - listen at the element level (not Shadow DOM) for dragstart, as slot signals flow differently
    //
    // if you find a better way to do this, be my guest.
    markChildrenAsDraggable(e) {
        e.target.assignedNodes({ flatten: true }).map((n) => n.draggable = true);
    }
    render() {
        return html `            
            <button type="button" class="px-3 py-1 flex items-center bg-yellow-400 rounded-2xl text-neutral-900 text-xs font-medium" draggable="true">
                <slot name="pretty-name" @slotchange=${this.markChildrenAsDraggable}></slot>
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
DragPill.properties = {
    type: { type: String },
    dataSource: { type: String },
    title: { type: String },
    // description: { type: String }
};
customElements.define('wt-drag-pill', DragPill);
//# sourceMappingURL=drag-pill.js.map