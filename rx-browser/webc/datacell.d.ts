interface WASMElement {
  go: any;
  // defined in main_js.go
  updateGo: (event: number, entity: number, w: JSWorld) => void;
  // defined by component and mandatory for main_js.go to work
  buildView: (prog: Uint8Array) => void;
}

/**
 * Context that is computed with JS code
 * and consumed for WASM code
 *
 * Values should ideally be arrays of numbers or numbers
 * except for registers
 *
 * The JSWorld is then parsed in "main_js.go" and fed to the engine
 *
 * Attributes of the JSWorld are computed in the event listeners when possible,
 * in order to be as fresh as possible and to avoid race conditions,
 * but some attributes may be instance attributes of the datacell
 * (eg mouse position)
 *
 * @example Create a DOM element in WASM at current mouse position
 * the mouse position is computed in JS
 */
interface JSWorld {
  /**
   * Selected text in Lioli coordinates
   */
  select: [start: number, end: number];
  /**
   * Click position of the in Lioli coordinates
   */
  point: number;
  /**
   * Mouse position in viewport coordinate
   * (not affected by scroll)
   */
  mouse: [number, number];
  /**
   * True if key was pressed at event-time
   */
  modifiers: [
    ctrlKey: boolean,
    shiftKey: boolean,
    altKey: boolean,
    metaKey: boolean,
  ];
  /**
   * data-ri attributes closest to the event
   * interpretation of those values is up to the parent entity
   *
   * Can be overriden by some events to have a different meaning
   * eg see drop event
   */
  registers: [string, string, string, string];
}
