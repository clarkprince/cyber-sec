// Interface to communicate with Go objects
//
// This file will eventually be automatically generated from the Go code
// @see EventType automated generation

export type registers = [r1: string, r2: string, r3: string, r4: string];
export type modifiers = [ctrl: boolean, shift: boolean, alt: boolean];

export type World = {
  registers: registers;
  mouse: [x: number, y: number];
  modifiers: modifiers;
  point?: number;
  gen: number;
  continuation?: (args: FourArgs) => void;
};

export type FourArgs = [r1: any, r2: any, r3: any, r4: any];

// Re-export types autogenerated by Go
export { IntentType as EventsCodes } from "../rx/intenttype_abi";