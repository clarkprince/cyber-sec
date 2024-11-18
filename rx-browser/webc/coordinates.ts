import { hasFlag } from "../utils/flags";
import { distanceToRectBounds } from "./positioning";

function findClosestElement(
  possibleElements: NodeListOf<Element>,
  x: number,
  y: number,
) {
  let closestElement: HTMLElement | null = null;
  let minDistance = +Infinity;
  for (const elem of possibleElements) {
    const rects = elem.getClientRects();
    for (const rect of rects) {
      const d = distanceToRectBounds([x, y], rect);
      if (d < minDistance) {
        minDistance = d;
        closestElement = elem as HTMLElement;
      }
    }
  }
  if (!closestElement) {
    throw new Error("Couldn't get closestElement");
  }
  return closestElement;
}

export const notInLioLi = -1;

/**
 * locateEntity finds the closest element that raised the issue.
 * This is done through a mix of geometric and tree walking:
 *
 *  1. The algoritm look up from the element under the mouse pointer
 *  2. If the HTML node is a Lioli element (annotated with a `data-offset` attribute), it is returned
 *  3. If the HTML node is a Lioli record (annotated with a `data-record` attribute),
 *     then the lioli element located closest (in geometrical term) to the pointer is returned
 *  4. If the node is an entity (has an id), it is returned
 *
 * @see https://developer.mozilla.org/fr/docs/Web/API/Document/elementsFromPoint
 */
export const locateEntity = async (
  x: number,
  y: number,
  doc: DocumentOrShadowRoot = document,
  pdbgArg?,
): Promise<[HTMLElement, number] | null> => {
  const nodes = doc.elementsFromPoint(x, y) as HTMLElement[];
  const pdbg =
    pdbgArg || ((await hasFlag("visualdebug")) ? visualdebug : nopDebugger);
  pdbg.init();

  let offsetElement: HTMLElement | null = null;
  for (const n of nodes) {
    await pdbg.debug(n);
    if ("offset" in n.dataset) {
      // easy case: we got a direct hit on a LioLi member
      offsetElement = n;
      break;
    } else if ("record" in n.dataset) {
      // more interesting case: click happened somewhere in the paragraph containing the record
      // use min distance to locate the element
      const possibleElements = n.querySelectorAll("[data-offset]");
      if (!possibleElements.length) {
        console.warn(
          "Warning: found a record with no selectable element, was it parsed correctlty?",
          { n },
        );
        return null;
      }
      offsetElement = findClosestElement(possibleElements, x, y);
      break;
    } else if (n.id !== "") {
      // clicked an entity (or child of an entity) that is not a record or a node of a record
      // -> click events should be associated to this entity, return now
      return [n, notInLioLi];
    }
  }
  // clicked something that is neither part of the lioli or a known entity, nothing to do
  if (!offsetElement) {
    return null;
  }
  const offset = offsetElement.dataset["offset"];
  if (!offset) {
    throw new Error(`Selected element has no offset`);
  }
  const position = parseInt(offset);
  await pdbg.debug(offsetElement, position);
  return [offsetElement, position];
};

interface PositionDebugger {
  init(): void;
  debug(node: Element, position: number): Promise<void>;
}

const nopDebugger: PositionDebugger = {
  init() {},
  async debug() {},
};

export const visualdebug: PositionDebugger = {
  init() {
    this.debugClassName = "debug-node";
    this.viz = document.createElement("p");
    this.viz.classList.add(
      this.debugClassName,
      "bg-orange-700",
      "p-1",
      "absolute",
      "-top-3",
      "-left-1",
    );
  },

  async debug(node: Element, position?: number) {
    const isDebugNode = node.classList.contains(this.debugClassName);
    if (isDebugNode) {
      return;
    }
    console.warn(
      "visual debugger can add temporary nodes in the DOM, remember this fact when inspecting the DOM",
    );
    node.classList.add("border", "border-orange-700", "relative");
    this.viz.innerText = position || "";
    // appending multiple times is a noop (will just move the node)
    node.appendChild(this.viz);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    try {
      node.removeChild(this.viz);
    } catch (err: any) {
      // if appending multiple times, we can remove only once
      // a NotFoundError is normal here
      if (err.name !== "NotFoundError") {
        throw err;
      }
    }
    node.classList.remove("border", "border-orange-700", "relative");
  },
};
