/**
 * Button to select table or text view for lioli
 */
import { html } from "lit";
import TWElement from "./tw";
import { dispatchToggleView } from "./viewtoggle-events";
import { clsx } from "../utils/classNames";
class DarkLightIcon extends TWElement {
    render() {
        return html `<picture>
        <source
          srcSet=${this.darksrc}
          media="(prefers-color-scheme: dark)"/>
        <img 
        class="select-none"
        src=${this.lightsrc}
        alt=${this.alt}>
      </picture>`;
    }
}
DarkLightIcon.properties = {
    lightsrc: {},
    darksrc: {},
    alt: {}
};
customElements.define("wt-darklight-icon", DarkLightIcon);
class ViewToggle extends TWElement {
    renderButton({ view, icon }) {
        const active = this.view === view;
        const lightsrc = `/assets/icons/${icon}-black.svg`;
        const darksrc = `/assets/icons/${icon}-white.svg`;
        return html `
            <button class=${clsx("rounded p-1 \
            bg-gray-200 dark:bg-gray-600 \
            black dark:white", !active && "hover:bg-gray-400 dark:hover:bg-gray-800", active && "bg-blue-400 dark:bg-blue-800")}
        @click=${(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            dispatchToggleView({ view }, this);
        }}>
            <wt-darklight-icon lightsrc=${lightsrc} darksrc=${darksrc} alt=${`Switch to ${view} view`} /></wt-darklight-icon>
        </button>
                    `;
    }
    render() {
        return html `
                <div class="m-4 rounded bg-gray-200 dark:bg-gray-600 border border-neutral-300">
                    ${this.renderButton({ view: "text", icon: "textview" })}
            ${this.renderButton({ view: "table", icon: "tableview" })}
        </div>
            `;
    }
}
ViewToggle.properties = {
    "view": {}
};
customElements.define("wt-viewtoggle", ViewToggle);
//# sourceMappingURL=viewtoggle.js.map