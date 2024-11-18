/**
 * MouseStatus is a simple counter, useful to know if the mouse is currently pressed
 */
export class MouseStatus {
    constructor(host) {
        this.isup = false;
        (this.host = host).addController(this);
        this.isup = true;
    }
    hostConnected() {
        this.host.addEventListener("mousedown", (event) => {
            this.isup = false;
        });
        this.host.addEventListener("mouseup", (event) => {
            this.isup = true;
            this.host.requestUpdate();
        });
    }
}
/**
 * FocusStatus will set hasfocus to true
 * Get focus by clicking the element
 * Lose focus by clicking outside the element AND its children
 *
 * @example Clicking the text editor will get the focus
 * Clicking on the tooltip menu will keep the focus
 * Clicking outside of both will lose the focus
 *
 * /!\ If we later move the tooltip-editor to the body,
 * via a portal or another solution
 * where it's not a children of the editor anymore
 * we will need to improve this solution
 */
export class FocusStatus {
    constructor(host) {
        this.hasfocus = false;
        (this.host = host).addController(this);
    }
    hostConnected() {
        this.host.addEventListener("focus", (event) => {
            this.hasfocus = true;
        });
        this.host.addEventListener("blur", (event) => {
            // focus is lost for a component that is not a child of the menu
            // NOTE: if the tooltip is not a child of the editor anymore,
            // we might want to handle this logic differently and check if the target is children of the tooltip
            const leavingEditor = !event.relatedTarget || event.relatedTarget && !this.host.contains(event.relatedTarget);
            if (leavingEditor) {
                this.hasfocus = false;
                this.host.requestUpdate();
            }
        });
    }
}
//# sourceMappingURL=notebook-editor-controllers.js.map