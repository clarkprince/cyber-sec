class PivotDragInProgress {
    constructor() {
        this.listeners = new Set();
        this.inProgress = false;
    }
    ;
    register(l) {
        l.pivotDragInProgress = this.inProgress;
        this.listeners.add(l);
    }
    unregister(l) {
        this.listeners.delete(l);
    }
    broadcast(e) {
        if (e.type === "dragenter") {
            if (!this.inProgress)
                this.inProgress = true;
        }
        else if (e.type === "dragend" || e.type === "drop") {
            if (this.inProgress)
                this.inProgress = false;
        }
        else {
            console.warn("Unexpected drag event type of a pivot was broadcasted to pivotDragInProgress: ", e.type);
            return;
        }
        for (const l of this.listeners) {
            l.pivotDragInProgress = this.inProgress;
        }
    }
}
export const pivotDragInProgress = new PivotDragInProgress();
//# sourceMappingURL=pivot-drag-in-progress.js.map