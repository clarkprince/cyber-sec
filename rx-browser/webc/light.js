import { LitElement } from "lit";
/**
 * LightElements: like lit, but with light DOM instead
 */
export default class LightElement extends LitElement {
    createRenderRoot() {
        return this;
    }
}
//# sourceMappingURL=light.js.map