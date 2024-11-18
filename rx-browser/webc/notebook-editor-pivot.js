import { html } from "lit";
import { acceptDrop } from "./drop";
import { getPivotDragData, hasDefinition, hasPivotData, safePivotVal } from "./pivot-events";
export function acceptPivotDrop(e) {
    return acceptDrop(e, (e) => {
        if (hasPivotData(e)) {
            console.log("dropped a pivot", e);
            return true;
        }
        // TODO: allow to drop cell from the left menu
        // they are not yet draggable
        console.log("got invalid drop in text editor, refusing");
        return false;
    });
}
export function insertPivot(e) {
    const pivot = getPivotDragData(e);
    return function (state, dispatch) {
        if (!pivot)
            throw new Error("No pivot found in drag event");
        const { anchor } = state.tr.selection;
        if (dispatch) {
            const pivotText = safePivotVal(pivot);
            if (!pivotText)
                return false;
            const pill = state.schema.nodes.pill.create({
                label: pivotText,
                // entity id
                "data-id": hasDefinition(pivot) && pivot.pivotid,
                // pivot:piql:piql or datacell
                "data-type": pivot.type,
            });
            dispatch(state.tr.insert(anchor, pill));
            return true;
        }
        // ?why dispatch can be undefined?
        return false;
    };
}
/**
 * data-node-type attribute allow to parse back a serialized text
 * it is more future-proof than using a custom element name
 */
const DATA_NODE_TYPE = "data-node-type";
const NODE_TYPE = "pill";
function pickDataAttrs(attrs) {
    return Object.fromEntries(Object.entries(attrs).filter(([a, v]) => a.startsWith("data-")));
}
export const pivotNodes = {
    // generic pill, we might want to extend to support applied pivots with id for instance
    pill: {
        // TODO: we may want to let the user alter the pivot?
        atom: true,
        // TODO: not sure if it means draggable within the editor or out of it or both
        draggable: true,
        // TODO: not sure about the difference between group:"inline" and inline: true
        group: "inline",
        inline: true,
        // TODO: not sure of the impact?
        selectable: true,
        attrs: {
            label: {},
            "data-id": {},
            "data-type": {}
            // trick to get TS validation for the field names
        },
        toDOM(node) {
            return [
                "wt-editor-pivot-pill",
                //"span",
                {
                    class: "mx-1 p-1 border-2 dark:border border-zinc-300 text-xs rounded cursor-pointer",
                    ...pickDataAttrs(node.attrs),
                    [DATA_NODE_TYPE]: NODE_TYPE,
                },
                // accessing undefined attributes will trigger an obscure error, typing is important
                node.attrs.label
            ];
        },
        parseDOM: [{
                attrs: {
                    // identify pills via special field NODE_TYPE
                    [DATA_NODE_TYPE]: NODE_TYPE
                }
            }]
    }
};
class PivotPill extends HTMLElement {
    // TODO: assess the difference between a NodeView (specific to ProseMirror) and a custom element
    constructor() {
        super();
        this.applyPivot = (ev) => {
            console.log("double client on pivot", this.dataset);
            // TODO: call a controller to communicate with the datacell
        };
        this.ondblclick = this.applyPivot;
    }
    createRenderRoot() {
        // no shadow DOM, otherwise the inline display is broken
        return this;
    }
    render() {
        // just render the inner content, no slots without shadow DOM
        return html ``;
    }
}
customElements.define("wt-editor-pivot-pill", PivotPill);
//# sourceMappingURL=notebook-editor-pivot.js.map