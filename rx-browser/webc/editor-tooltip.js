import "./floating-div";
import { html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { classMap } from "lit/directives/class-map.js";
import TWElement from "./tw";
import { findDisplaySpace, VisualRectDebugger } from "./positioning";
import debounce from "../utils/debounce";
import { clsx } from "../utils/classNames";
import { applyClasses } from "../utils/customElements";
class Tooltip extends TWElement {
    constructor() {
        super();
        this.tooltip = createRef();
        /**
         * Create a debounced function to move the tooltip
         *
         * This is necessary because we use "fixed" position at this point
         * Moving to "absolute" position and rendering the tooltip in document.body
         * could help getting rid of this code
         */
        this.scrollHandler = () => {
            // 75ms = a bit more than 13fps
            const freqMs = 75;
            // hide immediately
            const debouncedHide = debounce(this.hideTooltipDuringMove, freqMs, true);
            // reposition and show if not scrolled since X ms
            const debouncedPosition = debounce(this.positionTooltip, freqMs);
            const debouncedShow = debounce(this.showTooltipDuringMove, freqMs);
            const handleScroll = (e) => {
                if (!this.visible) {
                    // ignore scroll event if tooltip is not visible
                    console.log("not visible, ignore scroll");
                    return;
                }
                debouncedHide();
                debouncedPosition();
                debouncedShow();
            };
            return handleScroll;
        };
        this.positionTooltip = () => {
            if (!this.tooltip.value) {
                console.log("no tooltip ref yet");
                return;
            }
            const { from, to } = this.edstate.selection;
            const coord_from = this.view.coordsAtPos(from);
            const coord_to = this.view.coordsAtPos(to);
            const sel = new DOMRect(coord_from.left, coord_from.top, coord_to.right - coord_from.left, coord_to.bottom - coord_to.top);
            // NOTE: after you just mounted the tooltip for the first time,
            // this rect might be messed up
            // That's why we mount the tooltip early and keep it invisible with CSS
            const tooltipRect = this.tooltip.value.getBoundingClientRect();
            // in viewport coordinates
            // (= fixed positioning, ideal for floating elements but be careful with scrolling)
            const { left, top } = findDisplaySpace([sel.right - sel.width / 2, sel.bottom - sel.height / 2], tooltipRect, sel, { debug: new VisualRectDebugger() });
            this.tooltip.value.style.setProperty("inset", `${top.toString()}px ${left.toString()}px`);
        };
        this.hideTooltipDuringMove = () => {
            if (!this.tooltip.value) {
                return;
            }
            this.tooltip.value.style.setProperty("opacity", "0");
        };
        this.showTooltipDuringMove = () => {
            if (!this.tooltip.value) {
                return;
            }
            this.tooltip.value.style.setProperty("opacity", "1");
        };
        this.handleScroll = this.scrollHandler();
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('scroll', this.handleScroll);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('scroll', this.handleScroll);
    }
    updated() {
        this.positionTooltip();
    }
    render() {
        // select-none prevents a click on the menu to lose highlighted text
        // overflow-hidden respects parent rounded border when hovering a child, 
        // but we should double check the effect on nexted menus
        return html `
      <div 
        ${ref(this.tooltip)} 
        id="wt-editor-tooltip" 
        class=${classMap({
            "select-none fixed z-10 transition-opacity duration-150 ease-in-out w-36 h-6 \
        flex justify-between items-center \
        bg-slate-800 border-gray-600	\
        dark:bg-slate-800\
        overflow-hidden rounded": true,
            "visible": this.visible,
            "invisible": !this.visible
        })}>
        <slot></slot>
      </div>
    `;
    }
}
Tooltip.properties = {
    // ProseMirror view
    view: {},
    // ProseMirror state
    edstate: {},
    // The tooltip is expected to be rendered by the parent
    // but just hidden with CSS
    // this helps positioning it right on first render
    // by computing its exact size
    visible: { type: Boolean }
};
customElements.define("wt-editor-tooltip", Tooltip);
export function tooltipImg(attrs) {
    return html `<img src=${attrs.src} alt=${attrs.alt} draggable="false" class=${clsx("w-3 select-none", attrs.class)} >`;
}
export function tooltipButton(attrs, events, children) {
    return html `
    <button class=${clsx("hover:bg-slate-700 dark:hover:bg-slate-700 py-1 px-2 h-full", attrs.class)}
            @click=${events.click}>
      ${children}
    </button>
  `;
}
// TODO: syntax below is cleaner but not supported by Safari
//
// we might either favour function syntax above (heavier, less standard)
// or involve a polyfill for safari
// @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements Customized built-in elements
//
// NOTE: this feature IS standard, Safari just don't want to implement it
// @see https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements
//
// @example <button is="wt-editor-tool-ip"></button> Behaves like a button but has correct styling guaranteed
//
// NOTE: I've alread added the polyfill "custom-element.min.js" in base.html
// if we drop this pattern, don't forget to remove the polyfill too
/**
 * Extending HTMLImageElement
 * @example <img is="wt-editor-tooltip-img">
 */
class TooltipImg extends HTMLImageElement {
    connectedCallback() {
        // super.connectedCallback() <- need only if inheriting LitElement
        applyClasses(this, "w-3 select-none");
        this.setAttribute("draggable", "false");
    }
}
customElements.define("wt-editor-tooltip-img", TooltipImg, { extends: "img" });
class TooltipButton extends HTMLButtonElement {
    static get observedAttributes() {
        return ["active"];
    }
    connectedCallback() {
        console.log("button is active", this.active);
        // super.connectedCallback() <- need only if inheriting LitElement
        applyClasses(this, "hover:bg-slate-700 dark:hover:bg-slate-700 py-1 px-2 h-full");
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active") {
            this.active = newValue === "true" ? true : false;
            if (this.active) {
                this.classList.add("bg-blue-800");
            }
            else {
                this.classList.remove("bg-blue-800");
            }
        }
    }
}
customElements.define("wt-editor-tooltip-button", TooltipButton, { extends: "button" });
// Autonomous version:
// it's cross-browser
// but styling is broken due to shadow DOM
class TooltipImgAutonomousVersion extends TWElement {
    /**
   * NOTE: Customized Built-in Elements with is= syntax
   * would be more appropriate here
   * but Safary won't implement them
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements Customized built-in elements
     */
    render() {
        return html `<img 
    class=${clsx("w3 select-none", this.class)} 
      draggable="false" 
      src=${this.src} 
      alt=${this.alt || this.src}>`;
    }
}
customElements.define("wt-editor-tooltip-img-autonomous", TooltipImgAutonomousVersion);
class TooltipButtonAutonomousVersion extends TWElement {
    render() {
        return html `<button
    @click=${this.click}
    class=${clsx("hover:bg-slate-700 dark:hover:bg-slate-700 py-1 px-2 h-full", this.class)}
    >
    <slot></slot>
      </button>`;
    }
}
customElements.define("wt-editor-tooltip-button-autonomous", TooltipButtonAutonomousVersion);
//# sourceMappingURL=editor-tooltip.js.map