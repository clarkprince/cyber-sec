/**
 * @param evtName
 * @returns A typed function that dispatches a custom event
 * @example
 * const dispatchToggleView = customEventDispatcher<{view: "table" | "text"}>("wt-toggle-view")
 * // in viewtoggle.ts
 * dispatchToggleView({view:"table"})
 * // in notebook.ts
 * document.addEventListener("wt-toggle-view", (evt) => {
 *      console.log("Got details:", evt.detail)
 * })
 */
export function customEventDispatcher(evtName) {
    const dispatchCustomEvent = (detail, target) => {
        const evt = new CustomEvent(evtName, {
            bubbles: true, composed: true,
            detail
        });
        const _target = target || window;
        _target.dispatchEvent(evt);
    };
    return dispatchCustomEvent;
}
/**
 *
 * @param evtName
 * @returns A typed function that checks if the event is having a certain custom name
 */
export function customEventChecker(evtName) {
    const checkCustomEvent = (evt) => {
        return evt.type === evtName;
    };
    return checkCustomEvent;
}
//# sourceMappingURL=events.js.map