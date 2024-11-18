import { html } from "lit-html";
import { classMap } from 'lit/directives/class-map.js';
import TWElement from "./tw"

class Collapse extends TWElement {
    static properties = {
        _isOpen: { state: true }
    }

    constructor() {
        super();
        this._isOpen = false;
    }

    toggle(e) {
        e.preventDefault();
        this._isOpen = !this._isOpen
    }

    render() {
        return html`
            <a role="button" class="px-3 h-10 flex items-center justify-between bg-neutral-200 dark:bg-neutral-800 rounded-sm text-neutral-800 dark:text-gray-100 text-sm font-medium group " @click="${this.toggle}">
                <slot name="link"></slot>
                <svg height="16" viewBox="0 0 15 16" class="${classMap({ 'rotate-180': this._isOpen })} group-hover:rotate-180 transition-transform">
                    <path d="M3.125 10.0139L7.5 5.63892L11.875 10.0139" stroke="#F2F2F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
            <div class="${classMap({ 'hidden': !this._isOpen })} p-2">
                <slot name="content"></slot>
            </div>
        `
    }
}

customElements.define("wt-collapse", Collapse)
