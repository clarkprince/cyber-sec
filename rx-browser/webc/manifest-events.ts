import { customEventDispatcher } from "../utils/events";

export const manifestChangeEvt = "manifest-change";
export type ManifestChangeEvent = CustomEvent<string>;
export const dispatchManifestChange =
  customEventDispatcher<string>(manifestChangeEvt);
