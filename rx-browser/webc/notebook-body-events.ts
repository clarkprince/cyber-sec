import { customEventDispatcher } from "../utils/events";
import { uploadFile, filesAttached } from "./file-upload";
import { Cell } from "./models";

export const dispatchCreateCell = customEventDispatcher<{
  title: string;
  dataSource: string;
}>("create-cell");

const DATASOURCE_LOAD = "datasourceload";

export interface DatasourceDef {
  dataSource: string;
  title: string;
}
export function setDatasourceDragData(
  ev: DragEvent,
  datasourceDef: DatasourceDef,
) {
  ev.dataTransfer!.setData(DATASOURCE_LOAD, JSON.stringify(datasourceDef));
}

export function hasDatasourceData(ev: DragEvent) {
  const types = ev.dataTransfer?.types;
  if (!types) return false;
  if (types.includes(DATASOURCE_LOAD)) return true;

  return filesAttached(ev).length > 0;
}
export async function getDatasourceDragData(ev: DragEvent, notebookId: string) {
  const datasourceDefStr = ev.dataTransfer?.getData(DATASOURCE_LOAD);
  let datasourceDef: DatasourceDef | null = null;
  if (filesAttached(ev).length > 0) {
    datasourceDef = await uploadFile(ev, notebookId);
  } else {
    if (!datasourceDefStr) {
      return null;
    }
    datasourceDef = JSON.parse(datasourceDefStr);
  }
  return datasourceDef;
}

const revisionEventName = "wt-increment-revision";

export function increv(target: HTMLElement) {
  const evt = new CustomEvent(revisionEventName, {
    bubbles: true,
    composed: true,
  });
  const _target = target || window;
  _target.dispatchEvent(evt);
}

const CELL_DATA = "celldata";

// TODO: this derive from Go
export interface CellDragData extends Cell {}
export function setCellDragData(ev: DragEvent, data: CellDragData) {
  if (!ev.dataTransfer) {
    throw new Error("setCellDragData can only be called in a dragStart event");
  }
  ev.dataTransfer.clearData();
  ev.dataTransfer.effectAllowed = "copy";
  ev.dataTransfer.setData(CELL_DATA, JSON.stringify(data));
}
export function hasCellData(ev: DragEvent) {
  return !!ev.dataTransfer?.types.includes(CELL_DATA);
}
export function getCellDragData(ev: DragEvent): CellDragData | null {
  const cell = ev.dataTransfer?.getData(CELL_DATA);
  if (!cell) {
    return null;
  }
  return JSON.parse(cell);
}
