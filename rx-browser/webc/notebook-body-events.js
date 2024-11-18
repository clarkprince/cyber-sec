import { customEventDispatcher } from "../utils/events";
import { uploadFile, filesAttached } from "./file-upload";
export const dispatchCreateCell = customEventDispatcher("create-cell");
const DATASOURCE_LOAD = "datasourceload";
export function setDatasourceDragData(ev, datasourceDef) {
    ev.dataTransfer.setData(DATASOURCE_LOAD, JSON.stringify(datasourceDef));
}
export function hasDatasourceData(ev) {
    const types = ev.dataTransfer?.types;
    if (!types)
        return false;
    if (types.includes(DATASOURCE_LOAD))
        return true;
    return filesAttached(ev).length > 0;
}
export async function getDatasourceDragData(ev, notebookId) {
    const datasourceDefStr = ev.dataTransfer?.getData(DATASOURCE_LOAD);
    let datasourceDef = null;
    if (filesAttached(ev).length > 0) {
        datasourceDef = await uploadFile(ev, notebookId);
    }
    else {
        if (!datasourceDefStr) {
            return null;
        }
        datasourceDef = JSON.parse(datasourceDefStr);
    }
    return datasourceDef;
}
const revisionEventName = "wt-increment-revision";
export function increv(target) {
    const evt = new CustomEvent(revisionEventName, {
        bubbles: true,
        composed: true,
    });
    const _target = target || window;
    _target.dispatchEvent(evt);
}
const CELL_DATA = "celldata";
export function setCellDragData(ev, data) {
    if (!ev.dataTransfer) {
        throw new Error("setCellDragData can only be called in a dragStart event");
    }
    ev.dataTransfer.clearData();
    ev.dataTransfer.effectAllowed = "copy";
    ev.dataTransfer.setData(CELL_DATA, JSON.stringify(data));
}
export function hasCellData(ev) {
    return !!ev.dataTransfer?.types.includes(CELL_DATA);
}
export function getCellDragData(ev) {
    const cell = ev.dataTransfer?.getData(CELL_DATA);
    if (!cell) {
        return null;
    }
    return JSON.parse(cell);
}
//# sourceMappingURL=notebook-body-events.js.map