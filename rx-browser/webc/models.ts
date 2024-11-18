type Ulid = string;

// PIVOTS
/**
 * TODO: there is also an AppliedPivot type in "pivot-events",
 * with a slightly different API
 * need to deuplicated or properly named
 */
export interface AppliedPivot {
  Pivot: string; // id
  on: string[];
}
type PivotType = "pivot:piql:piql"; /** | csv | starklark etc. */
type PivotDefinition = {
  /**
   * it's a valid ULID =>
   * will be a string full of zeroes for unsaved pivots
   */
  pivotid: string;
  /** Not used at the moment, can be used to store column names when creating from CSV */
  args: string[];
  name: string;
  /** Free-text to describe the pivot */
  note: string;
  type: PivotType;
};

type PivotPiQLQuery = {
  value: string;
  type: "pivot:piql:piql";
};
// WIP: use those type in the drag event + use to display in the editor
export type SavedPivot = PivotDefinition &
  PivotPiQLQuery /** | PivotCsv | PivotStarlark */;

// NOTEBOOKS AND CELLS

// partial implementation of msg/cell.go#Manifest
// only use fields we care about – the rest is passed through
export interface Cell {
  ID: string | null;
  Notebook: string;
  DataSource: Ulid;
  Title: string;
  Pivots: AppliedPivot[]; //[]PivotApplication from Go
  CheckCell: boolean;
  Snapshot: string | null;
  Position: Position;
  [prop: string]: any;
}
export interface Playbook {
  ID: Ulid;
  /**
   * For convenience, if undefined, set it to an empty string when fetching the notebook
   */
  Title: string;
  Rev: number;
  Urgent: boolean;
  Resolved: boolean;
  /**
   * For convenience, if undefined, set it to an empty array when fetching the notebook
   */
  Cells: Array<Cell>;
  // Date string
  Created: string;
  // + unlisted fields that must be passed back-and-forth to backend during updates
  [prop: string]: any;
}
/** @deprecated Use Playbook */
export type Notebook = Playbook;

// USER
export interface User {
  ID: Ulid;
  Domain: Ulid;
  Name: string;
  /** Email or other id */
  ExternalID: string;
  /** URL of picture */
  Picture: string;
  /** ? */
  Labels: Array<string> | null;
}

export interface Position {
  Col: number;
  Height: number;
  Row: number;
}
