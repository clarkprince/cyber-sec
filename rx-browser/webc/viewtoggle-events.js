import { customEventChecker, customEventDispatcher } from "../utils/events";
export const toggleViewEventName = "wt-toggle-view";
export const dispatchToggleView = customEventDispatcher(toggleViewEventName);
export const isToggleViewEvent = customEventChecker(toggleViewEventName);
//# sourceMappingURL=viewtoggle-events.js.map