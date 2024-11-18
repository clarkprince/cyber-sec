
/**
 * acceptDrop prevents the drag event propagation, optionally only if pred is provided.
 * This has the effect of allowing the drag event to happen.
 * Return whether the event was accepted or not
 */
export function acceptDrop(e: DragEvent, pred?: (e: DragEvent) => boolean) {
    if (!pred || pred(e)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return true
    }
    return false
};