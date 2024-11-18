import { SavedPivot } from "./models";

const PIVOT_DATA = "pivotcreation";

// Dual type to support refactoring in progress, where this is moved to an opaque type

// Matches the "Pivot" type in the backend
export type AppliedPivotDrag = SavedPivot & {
  on: string[];
};

export type PivotDragData = SavedPivot | AppliedPivotDrag; //PivotDefinition | PivotPiQLQuery// | AppliedPivot

export function pivotLabel(p: PivotDragData) {
  return p.name || p.value;
}

export const getPivotDragData = (ev: DragEvent): PivotDragData | null => {
  const pl = ev.dataTransfer?.getData(PIVOT_DATA);
  if (!pl) {
    return null;
  }
  return JSON.parse(pl);
};
export const hasPivotData = (ev: DragEvent) => {
  return !!ev.dataTransfer?.types.includes(PIVOT_DATA);
};

export const setPivotDragData = (ev: DragEvent, data: string) => {
  if (!ev.dataTransfer) {
    throw new Error(
      "setPivotCreationData can only be called in a dragStart event",
    );
  }
  ev.dataTransfer.clearData();
  ev.dataTransfer.effectAllowed = "copy";
  // using a custom format let's us check the validity of the drop during dragover/dragenter
  // @see https://stackoverflow.com/questions/28487352/dragndrop-datatransfer-getdata-empty
  ev.dataTransfer.setData(PIVOT_DATA, data);
};

export function setPivotDragImage(
  ev: DragEvent,
  data: PivotDragData /*PivotPiQLQuery*/,
) {
  if (!ev.dataTransfer) {
    throw new Error(
      "setPivotCreationDragImage can only be called in a dragStart event",
    );
  }
  // add some logic for a nice dragImage
  const dragImage = document.createElement("span");
  dragImage.dataset.testId = "dragImage-pivotcreation";
  dragImage.className =
    "bg-zinc-50 text-zinc-200 rounded-sm px-1" + " dragImage-" + PIVOT_DATA;
  const max = 60;
  const text = pivotLabel(data);
  const shortText = text.length < max ? text : text.slice(0, max - 3) + "...";
  dragImage.textContent = shortText;
  document.body.appendChild(dragImage);
  const imageRect = dragImage.getBoundingClientRect();
  ev.dataTransfer.setDragImage(
    dragImage,
    imageRect.width / 2,
    imageRect.height / 2,
  );
}

/**
 * Noop if there is nothing to remove
 * To be called on dragend for element that can receive a pivot
 * @param {*} ev
 */
export function removePivotDragImage() {
  document.querySelectorAll(".dragImage-" + PIVOT_DATA).forEach((e) => {
    document.body.removeChild(e);
  });
}
