class DragInProgress {
    constructor() {
        this.listeners = new Set();
        this.inProgress = false;
    }
    ;
    register(l) {
        l.dragInProgress = this.inProgress;
        this.listeners.add(l);
    }
    unregister(l) {
        this.listeners.delete(l);
    }
    broadcast(e) {
        if (e.type === "dragstart" || e.type === "dragenter" && !this.inProgress) {
            this.inProgress = true;
        }
        else if (e.type === "dragend" || e.type === "drop" || e.type === "dragleave" && this.inProgress) {
            this.inProgress = false;
        }
        else {
            console.warn("Unexpected drag event type was broadcasted to dragInProgress: ", e.type);
            return;
        }
        for (const l of this.listeners) {
            l.dragInProgress = this.inProgress;
        }
    }
}
export const dragInProgress = new DragInProgress();
//# sourceMappingURL=drag-in-progress.js.map