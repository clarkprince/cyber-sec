import Go from "./wasm_exec.mjs";
import {
  EventsCodes,
  World,
  registers,
  modifiers,
  FourArgs,
} from "./datacell-abi";
import { locateEntity } from "./coordinates";
import {
  getPivotDragData,
  removePivotDragImage,
  setPivotDragData,
  setPivotDragImage,
  hasPivotData,
} from "./pivot-events";
import { acceptDrop } from "../utils/drop";
import { OpType } from "../rx/optype_abi";
import { triggerDownload } from "../../internal/sys/pipe";
import { IntentType } from "../rx/intenttype_abi";
import { dispatchManifestChange } from "./manifest-events.js";
import { listFlags } from "../utils/flags.js";

const WASM_URL = "/assets/rxnb.wasm"; // per server configuration
const DEBOUNCE_TIMEOUT = 60; // ms time range. Tuned to ~1 event / rendering cycle at 16 fps

const RequestPProfEvent = "request-pprof";
const DebugGrammarEvent = "debug-grammar";

interface updateGo {
  (event: EventsCodes, entity: number, world: World): void;
  (event: EventsCodes.Seppuku): void;
}

/**
 * DataCell is the wrapper around the Go WASM code.
 * It works as a shim to collect events and viewport information,
 * then pass to the engine for rendering.
 *
 * # Concurrency model
 *
 * The view is protected by an optimistic locking scheme:
 * an event is only processed if from the current gen.
 *
 * This guaranties that the tree structure in the view is the same than the one which raises the event.
 * Other properties (mouse position, viewport, scroll, …) are not tracked, and should be captured in the handler if desired.
 *
 * Note that changes to the gen can happen from Go, without JS calls:
 * this is the case when the network triggers the change.
 */
export default class DataCell extends HTMLElement {
  static module: Promise<WebAssembly.Module>;

  endStyle: HTMLElement;
  mouse: [x: number, y: number];
  go: Go;
  shadowRoot: ShadowRoot; // asserted in constructor

  gen = 0;
  debounce: boolean = false; // protects debounce process
  mxevent: boolean = false; // protects event loop task

  activeModule: Promise<void>;
  _tripModule: () => void;
  running = true;

  modifiers: modifiers = [false, false, false];

  // this is installed during the module instanciation
  // see main_js.go
  updateGo: updateGo;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    for (const sheet of document.styleSheets) {
      if (!sheet.href) {
        continue;
      }

      let link = document.createElement("link");
      link.href = sheet.href;
      link.rel = "stylesheet";

      shadow.appendChild(link);
    }

    this.endStyle = shadow.lastChild as HTMLElement;

    if (!DataCell.module) {
      console.time("compile module");
      DataCell.module = WebAssembly.compileStreaming(fetch(WASM_URL));
      console.timeEnd("compile module");
    }
    this.mouse = [0, 0];
    this.activeModule = new Promise((resolve) => (this._tripModule = resolve));
  }

  connectedCallback() {
    /**
     * Side-effect: will add WASM Scope-tied methods to "this"
     * @see main_js.go
     */
    this.loopCell(["-manifest=" + this.getAttribute("manifest")]);
    this.shadowRoot.addEventListener("click", this);
    this.shadowRoot.addEventListener("dblclick", this);
    this.shadowRoot.addEventListener("contextmenu", this);
    this.shadowRoot.addEventListener("change", this);
    // "blur" and "focus" don't bubble, "focusout" does
    // => "focusout" is what we want to listen for cell children being focused
    this.shadowRoot.addEventListener("focusout", this);
    this.shadowRoot.addEventListener("dragover", this);
    this.shadowRoot.addEventListener("dragenter", this);
    this.shadowRoot.addEventListener("drop", this);
    this.shadowRoot.addEventListener("dragend", this);
    this.shadowRoot.addEventListener("dragstart", this);
    this.shadowRoot.addEventListener(RequestPProfEvent, this);
    this.shadowRoot.addEventListener(DebugGrammarEvent, this);
    // document-tied events, must be removed in disconnectedCallback
    document.addEventListener("mousemove", this);
    document.addEventListener("keydown", this);
    document.addEventListener("wheel", this, { passive: false });
  }

  disconnectedCallback() {
    this.running = false;

    (async () => {
      await this.activeModule;
      this.updateGo(EventsCodes.Seppuku);
    })();
    document.removeEventListener("mousemove", this);
    document.removeEventListener("keydown", this);
    document.removeEventListener("wheel", this);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    console.warn("deprecated code path in observing cell ID");
    // full reload of the cell if one of these attributes change
    if (name !== "cell" || oldValue || !newValue) {
      console.debug("attribute changed", name);
      return;
    }

    // attribute change is possible very early in the rendering cycle
    // better wait until the module is ready to get it
    (async () => {
      await this.activeModule;
      let entity = this.shadowRoot!.activeElement?.closest("[id]");
      if (!entity) {
        entity = this.shadowRoot!.querySelector("[id]");
      }
      if (!entity) {
        this.running = false;
        this.updateGo(EventsCodes.Seppuku);
        return;
      }
      this.passEvent(EventsCodes.CellIDChange, entity, {
        registers: [newValue, "", "", ""],
      });
    })();
  }

  // note: this probably will need hoisting the manifest so we can update it without conflict
  updateManifest = (mfst: string) => {
    this.setAttribute("manifest", mfst);
    dispatchManifestChange(mfst, this);
  };

  loopCell = async (args: any[]) => {
    let finalCountDown = 20; // tadada ta, tadada da da da
    while (this.running && finalCountDown > 0) {
      finalCountDown--;
      this.go = new Go(
        args,
        {
          // keep the localStorage item name to lowercase "debug"
          // for consistency with NPM "debug" package
          DEBUG: localStorage.getItem("debug"),
          FLAGS: Object.keys(await listFlags()).join(","),
          LOGLEVEL: localStorage.getItem("LOGLEVEL") || "",
          WIDTH: window.screen.width.toString(),
          HEIGHT: window.screen.height.toString(),
          // trace gc action to prevent stop-the-world problems
          GODEBUG: "gctrace=1",
        },
        this as any,
      );

      await DataCell.module
        .then((module) => WebAssembly.instantiate(module, this.go.importObject))
        .then((obj) => this.go.run(obj, this._tripModule));

      this.activeModule = new Promise((resolve) => {
        this._tripModule = resolve;
      });
    }
  };

  async handleEvent(event: Event) {
    if (isClick(event) || isRightClick(event) || isDoubleClick(event)) {
      {
        // ignore clicks while in Regexp filter form or in pattern editor
        // TODO: clear that up. Mixes logic and rendering.
        const reinputs = [
          ...this.shadowRoot!.querySelectorAll('input[type="text"]')!,
          ...this.shadowRoot!.querySelectorAll("textarea"),
        ];
        for (const reinput of reinputs) {
          if (event.composedPath().includes(reinput)) {
            return;
          }
        }
      }

      {
        // Caught click while some content is highlighted, ignores it
        // TODO: fix know bug: document.getSelection() doesn't work as expected in Chrome with Shadow DOM
        const sel = document.getSelection();
        if (sel && sel.anchorOffset !== sel.focusOffset) {
          return;
        }
      }
      event.preventDefault();

      // capture the mouse, in case the events gets delayed too much
      const mouse: [x: number, y: number] = [event.clientX, event.clientY];
      const ll = await locateEntity(...mouse, this.shadowRoot!);
      if (ll == null) {
        return;
      }
      const [target, point] = ll;

      // order matters: since the event detail can be used to differentiate,
      // a double click is a click with a count of 2.
      let code: IntentType;
      if (isDoubleClick(event)) {
        code = EventsCodes.DoubleClick;
      } else if (isClick(event)) {
        code = EventsCodes.Click;
      } else if (isRightClick(event)) {
        return; // we don’t handle it for now
      }

      this.modifiers = getModifiers(event as MouseEvent);

      const [act, name, buffer, _] = await new Promise<FourArgs>(
        (continuation) =>
          this.passEvent(code, parentEntity(target), { point, continuation }),
      );
      if (act === "trigger-download") {
        triggerDownload(name, buffer);
      } else {
        // do nothing
      }
    } else if (event.type === "change") {
      this.passEvent(EventsCodes.Change, parentEntity(event.target), {
        registers: [(event.target as HTMLInputElement).value || "", "", "", ""],
      });
    } else if (event.type === "focusout") {
      // remove this condition if needing to track 'blur' event
      const val = (event.target as any)?.value;
      this.passEvent(EventsCodes.Blur, parentEntity(event.target), {
        registers: [val || "", "", "", ""],
      });
    } else if (isMouseMove(event)) {
      this.mouse = [event.clientX, event.clientY];
    } else if (isKeyDown(event)) {
      /** Key presses */
      if (!this.mouseInCell) {
        return;
      }

      const entity = this.shadowRoot
        .elementFromPoint(this.mouse[0], this.mouse[1])!
        .closest("[id]");
      if (!entity) {
        console.warn("no entity found, cannot attach event");
        return;
      }

      switch (event.code) {
        case "Escape":
          this.passEvent(EventsCodes.EscPress, entity);
          break;
        case "ArrowDown":
          event.preventDefault();
          this.passEvent(EventsCodes.Scroll, entity, {
            registers: ["1", "", "", ""],
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          this.passEvent(EventsCodes.Scroll, entity, {
            registers: ["-1", "", "", ""],
          });
          break;
        case "F10":
          if (!event.ctrlKey) {
            console.debug("no meta key");
            return;
          }
          event.preventDefault();
          this.passEvent(
            EventsCodes.ShowDebugMenu,
            this.shadowRoot.querySelector("[id]")!,
          );
        default:
          return;
      }
    } else if (isDragOver(event)) {
      if (!acceptDrop(event, (e) => hasPivotData(e))) {
        return;
      }
      // we need to set those because of the prevent default, and mouse move is not fired during a drag
      this.mouse = [event.clientX, event.clientY];

      if (this.debounce) {
        return;
      } else {
        this.debounce = true;
        setTimeout(() => {
          this.debounce = false;
        }, DEBOUNCE_TIMEOUT);
      }

      const entity = (event.target as HTMLElement | SVGElement).closest("[id]");
      // silence drops over empty zones (but should we not fold this into accepting the drop in the first place?)
      if (!entity) return;

      // NOTE: this may rerender the dropzone, thus breaking drop events
      // a drop event is only fired if valid dragenter/dragover have been seen before
      // and the DOM element for the dropzone is not rerendered in between
      this.passEvent(EventsCodes.DragOver, entity);
    } else if (isDragEnter(event)) {
      acceptDrop(event, (e) => hasPivotData(e));
    } else if (isDrop(event)) {
      if (!acceptDrop(event, (e) => hasPivotData(e))) {
        return;
      }

      removePivotDragImage(); // TODO(rdo) break that strong coupling

      const pivotData = getPivotDragData(event);
      if (!pivotData) {
        console.warn("Did not get pivot data, ignore drop");
        return;
      }

      const ll = await locateEntity(...this.mouse, this.shadowRoot);
      if (ll == null) {
        return;
      }
      const [target, point] = ll;
      this.passEvent(EventsCodes.Drop, parentEntity(target), {
        point,
        registers: [JSON.stringify(pivotData), "", "", ""],
      });
    } else if (isDragEnd(event)) {
      removePivotDragImage();
      const elem = event.target as HTMLElement | null;
      if (!elem) {
        return;
      }

      const entity = elem.closest("[id]")!;
      this.passEvent(EventsCodes.DragEnd, entity);
    } else if (isDragStart(event)) {
      const elem = event.target as HTMLElement | null;
      if (!elem) {
        return;
      }

      const entity = elem.closest("[id]")!;

      const [q, _t] = await new Promise<FourArgs>((continuation) =>
        this.passEvent(EventsCodes.DragStart, entity, { continuation }),
      );
      setPivotDragData(event, q);
      setPivotDragImage(event, JSON.parse(q));
    } else if (isWheel(event)) {
      if (!this.mouseInCell) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation(); // prevent scroll capture by browser

      if (this.debounce) {
        return;
      }

      const direction = event.deltaY > 0 ? "10" : "-10";

      if (this.debounce) {
        return;
      } else {
        this.debounce = true;
        setTimeout(() => {
          this.debounce = false;
        }, DEBOUNCE_TIMEOUT);
      }

      const entity = this.shadowRoot
        .elementFromPoint(event.clientX, event.clientY)!
        .closest("[id]");
      if (!entity) {
        // if scroll does not happen in a part of the UI that is recorded
        return;
      }
      this.passEvent(EventsCodes.Scroll, entity, {
        registers: [direction, "", "", ""],
      });
    } else {
      console.log("Unknown event", event);
    }
  }

  /** mouseInCell is true if the pointer position is withing the boundary of the cell */
  get mouseInCell(): boolean {
    // global events, only accept if this is within the cell
    const vp = this.getBoundingClientRect();
    return (
      this.mouse[0] > vp.left &&
      this.mouse[0] < vp.right &&
      this.mouse[1] > vp.top &&
      this.mouse[1] < vp.bottom
    );
  }

  /**
   * buildView is called by the Go code each time the view needs to be updated.
   *
   * instructions to rebuild the view are given in parr, following the XAS virtual machine format.
   * all operatiors are done in a document fragment, avoiding conflict with the existing nodes.
   */
  buildView = (parr: Uint8Array) => {
    // Use fat arrow syntax to make sure "this" is bound to instance
    const program = new DataView(parr.buffer);

    // offsets
    const instr_size = 1;
    const str_size = 2;

    const decoder = new TextDecoder("utf-8");

    let ip = 0;
    const ndoc = new DocumentFragment();
    let anchor: DocumentFragment | Element | any = ndoc; // covers initialization weirdness
    let next = anchor.firstChild;
    const loadString = () => {
      const len = program.getUint16(ip);
      ip += str_size;
      const txt = decoder.decode(new DataView(program.buffer, ip, len));
      ip += len;
      return txt;
    };

    while (ip < program.byteLength) {
      const instr = program.getUint8(ip);
      ip += instr_size;
      switch (instr) {
        case OpType.OpTerm:
          for (
            let p = this.endStyle.nextSibling;
            p !== null;
            p = p.nextSibling
          ) {
            p.remove();
          }
          this.shadowRoot.appendChild(ndoc);
          this.gen++;
          return;
        case OpType.OpCreateElement:
          {
            const tag = loadString();
            let n: Element;
            if (tag === "svg" || tag === "path") {
              n = document.createElementNS("http://www.w3.org/2000/svg", tag);
            } else {
              n = document.createElement(tag);
            }
            if (next) {
              next.replaceWith(n);
            } else {
              anchor.appendChild(n);
            }
            next = n.firstChild;
            anchor = n;
          }
          break;
        case OpType.OpReuse:
          {
            const ntt = loadString();
            const n = this.shadowRoot.getElementById(ntt);
            if (next) {
              next.replaceWith(n);
            } else if (n) {
              anchor.appendChild(n);
            } else {
              throw new Error(`Couldn't reuse node of id '${ntt}', not found`);
            }
            next = n!.nextSibling;
          }
          break;
        case OpType.OpReID:
          {
            const from = loadString();
            const to = loadString();
            const n = ndoc.getElementById(from);
            n!.id = to;
          }
          break;
        case OpType.OpSetClass:
          {
            const cname = loadString();
            anchor.setAttribute("class", cname);
          }
          break;
        case OpType.OpSetID:
          {
            const ntt = loadString();
            anchor.id = ntt;
          }
          break;
        case OpType.OpSetAttr:
          {
            const anm = loadString();
            const avl = loadString();
            // setAttribute lets us use the normal HTML name of the attribute
            anchor.setAttribute(anm, avl);
          }
          break;
        case OpType.OpAddText:
          {
            const txt = loadString();
            if (next) {
              next.replaceWith(txt);
            } else {
              anchor.appendChild(document.createTextNode(txt));
            }
          }
          break;
        case OpType.OpNext:
          {
            next = anchor.nextSibling;
            anchor = anchor.parentElement;
          }
          break;
      }
    }

    throw new Error("invalid XAS code, no term instructions");
  };

  /**
   * DOM element corresponding to an entity that is known by the wasm engine rx
   * Use an attribute-based selector such as ".closest("[id]")" to find the right element.
   */
  passEvent = (
    eventType: EventsCodes,
    entityNode: Element,
    world: Partial<World> = {},
  ) => {
    if (
      !(entityNode instanceof HTMLElement || entityNode instanceof SVGElement)
    ) {
      throw new Error("event raised from entity which is not an HTML element");
    }

    // capture both entity and gen to prevent desync
    let entity = 0;
    if (entityNode.id === "") {
      console.warn(
        `entityId received an entityNode without id attribute: ${entityNode}`,
      );
      return;
    } else {
      entity = parseInt(entityNode.id);
      if (isNaN(entity)) {
        throw new Error(
          `node is using a non-number id "${entityNode.id}". Use "GiveKey()" in Go code to generate a valid id for an input`,
        );
      }
    }

    const gen = this.gen;
    if (!this.shadowRoot.getElementById(entity.toString())) {
      // event was fired from a node has been deleted since
      // this is possible if the event is fired between the call to updateGo and the time the new rendering is done
      return;
    }

    if (this.mxevent) {
      // another event is being processed
      return;
    }

    this.mxevent = true;
    const sched = async () => {
      try {
        const evt = {
          gen: gen,
          code: eventType,
          entity: entity,
          world,
        };
        const jsWorld = await this.buildJSWorld(evt.world);
        await this.activeModule; // Go is ready to accept args

        // all must be sync below this point
        if (evt.gen === this.gen) {
          this.updateGo(eventType, entity, jsWorld);
        } else {
          // drop this event
        }
      } finally {
        this.mxevent = false;
      }
    };

    // note that the call, while using the async syntax, can actually be synchronous if the LioLi computation is synchronous.
    // this is the case if the [viewportToLioLi] is not using the visual debugger.
    // keeping this synchronous is required when we handle drag start event, where the payload and image must be found in the same loop.
    //
    // [dnd] https://html.spec.whatwg.org/multipage/dnd.html#concept-dnd-rw
    sched();
  };

  /** buildJSWorld completes the information already collected in the event */
  buildJSWorld = async (eventJsWorld: Partial<World> = {}): Promise<World> => {
    const jsWorld = {
      point:
        eventJsWorld.point ??
        ((await locateEntity(...this.mouse, this.shadowRoot)) || [null, 0])[1],
      mouse: this.mouse,
      registers: getRegisters(),
      modifiers: this.modifiers,
      // jsWorld computed in event listener has priority
      // over jsWorld computed based on instance attributes
      // as other value may be subject to race conditions
      ...eventJsWorld,
      gen: this.gen,
    };
    return jsWorld;
  };
}

customElements.define("wt-data", DataCell);

function getRegisters(targetNode?): registers {
  const registers = Array(4).fill("") as registers;
  if (!targetNode) {
    return registers;
  }

  for (let ri = 1; ri <= 4; ri++) {
    const registryNode = targetNode.closest(`[data-r${ri}]`);
    if (registryNode) {
      registers[ri - 1] = registryNode.dataset[`r${ri}`];
    }
  }
  return registers;
}

function parentEntity(targetNode: EventTarget | null): HTMLElement {
  if (
    !(targetNode instanceof HTMLElement || targetNode instanceof SVGElement)
  ) {
    console.error(targetNode);
    throw new Error("invalid target node");
  }
  const closest = targetNode?.closest("[id]");
  if (!closest) {
    console.error({ targetNode });
    throw new Error(
      "Found no entity for current target. If you are using the visual debugger, you might have clicked on a floating visual element.",
    );
  }
  return closest as HTMLElement;
}

// support for Mac command key [ev.metaKey]
function getModifiers(ev?: MouseEvent): modifiers {
  if (!ev) return Array(3).fill(false) as modifiers;
  return [ev.ctrlKey || ev.metaKey, ev.shiftKey, ev.altKey];
}

// Typescript checks with inference
const isClick = (ev: Event): ev is MouseEvent => ev.type === "click";
const isDoubleClick = (ev: Event): ev is MouseEvent =>
  ev.type === "dblclick" || (isClick(ev) && ev.detail == 2);
const isRightClick = (ev: Event): ev is MouseEvent => ev.type === "contextmenu";
const isMouseMove = (ev: Event): ev is MouseEvent => ev.type === "mousemove";
const isWheel = (ev: Event): ev is WheelEvent => ev.type === "wheel";
const isDragStart = (ev: Event): ev is DragEvent => ev.type === "dragstart";
const isDragOver = (ev: Event): ev is DragEvent => ev.type === "dragover";
const isDragEnter = (ev: Event): ev is DragEvent => ev.type === "dragenter";
const isDrop = (ev: Event): ev is DragEvent => ev.type === "drop";
const isDragEnd = (ev: Event): ev is DragEvent => ev.type === "dragend";
const isKeyDown = (ev: Event): ev is KeyboardEvent => ev.type === "keydown";
