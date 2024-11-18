import { customEventDispatcher } from "../utils/events";

export const datasourceChangeEvt = "datasource-change";
export type DatasourceChangeEvent = CustomEvent<string>;
export const dispatchDatasourceChange =
  customEventDispatcher<string>(datasourceChangeEvt);
