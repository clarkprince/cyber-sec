/**
 * Helpers for customized built-in Element
 * (as opposed to Lit/autonomous components)
 */
export function applyClasses(e: Element, classStr: string) {
  e.classList.add(...classStr.split(" ").map(c => c.trim()))
}