import { html, nothing } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { acceptDrop } from "./drop";
import { getPivotCreationData, hasPivotCreationData, getPivotDragData, isRegisteredPivot, hasDefinition, } from "./pivot-events";
import { pivotDragInProgress } from "./pivot-drag-in-progress";
import TWElement from "./tw";
const hasFileData = (e) => {
    return e.dataTransfer?.types.includes("Files");
};
const FILE_EXTENSION = "csv";
const FILE_EXTENSION_LENGTH = `.${FILE_EXTENSION}`.length;
class PivotDropzone extends TWElement {
    constructor() {
        super(...arguments);
        this.pivots = [];
        this.status = "";
        this.pivotDragInProgress = false;
        this.isPivotInDropzone = (e) => {
            const data = getPivotDragData(e);
            if (!!data && hasDefinition(data)) {
                const { pivotid } = data;
                return this.pivots.find((el) => el.pivotid === pivotid);
            }
        };
        this.onDragIn = (e) => {
            acceptDrop(e, this.isValidDrop);
            this.status = "dragover";
        };
        this.onDragOut = (e) => {
            acceptDrop(e, this.isValidDrop);
            this.status = "";
        };
    }
    connectedCallback() {
        super.connectedCallback();
        pivotDragInProgress.register(this);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        pivotDragInProgress.unregister(this);
    }
    isValidDrop(e) {
        // NOTE: in dragover/dragevent we can't read data
        // however we can assess the dragged data type
        // either a custom type controlled by us (pivot creation data)
        // or type "File"
        if (hasPivotCreationData(e))
            return true;
        if (hasFileData(e))
            return true;
        if (isRegisteredPivot(e))
            return true;
        return false;
    }
    addPivotFromKnowledgeSection(e) {
        const data = getPivotDragData(e);
        if (!!data && hasDefinition(data)) {
            const { pivotid, args, name } = data;
            this.pivots = [
                ...this.pivots,
                {
                    name: name,
                    pivotid,
                    args: args,
                },
            ];
            this.status = "";
        }
    }
    uploadPivots(e) {
        this.status = "";
        const selectionData = getPivotCreationData(e);
        if (selectionData) {
            const rq = new URLSearchParams();
            rq.append("query", selectionData.value);
            rq.append("action", "edit-piql");
            fetch("/api/pivot?" + rq.toString())
                .then((response) => response.json())
                .then((p) => {
                this.pivots = [...this.pivots, p];
            });
        }
        const files = e.dataTransfer?.files;
        if (!files) {
            console.error("no data files provided, moving on");
            return;
        }
        for (const f of files) {
            let fd = new FormData();
            fd.append("file", f);
            fd.append("name", FILE_EXTENSION);
            fetch("/importcsv", {
                method: "POST",
                body: fd,
            })
                .then((response) => response.json())
                .then((data) => {
                const { pivot, args } = data;
                this.pivots = [
                    ...this.pivots,
                    {
                        name: f.name.slice(0, -FILE_EXTENSION_LENGTH),
                        pivotid: pivot,
                        args,
                    },
                ];
            })
                .catch((err) => {
                console.error("Posting data was not successful:" + err);
            });
        }
    }
    async addPivot(e) {
        e.preventDefault();
        e.stopPropagation();
        pivotDragInProgress.broadcast(e);
        if (this.isPivotInDropzone(e)) {
            return;
        }
        else if (isRegisteredPivot(e)) {
            this.addPivotFromKnowledgeSection(e);
        }
        else {
            this.uploadPivots(e);
        }
    }
    get dropzoneClasses() {
        const STATIC_CLASSES = "m-2 border-slate-500 border-2 border-dashed rounded-2xl dark:border-slate-100";
        if (this.isAtRest) {
            return STATIC_CLASSES + " border-none bg-transparent";
        }
        if (this.status === "dragover") {
            return STATIC_CLASSES + " bg-neutral-100 dark:bg-neutral-600";
        }
        else if (this.status === "") {
            return STATIC_CLASSES + " bg-neutral-200 dark:bg-neutral-900";
        }
    }
    get isAtRest() {
        return !this.pivotDragInProgress && this.pivots.length > 0;
    }
    render() {
        let pivots = [];
        for (const p of this.pivots) {
            pivots.push(html `<wt-pivot class="mr-1 mt-2" pivotid=${p.pivotid} args=${p.args} name=${p.name}></wt-pivot>`);
        }
        const pivotsDragOverClass = {
            // We want blur effect only when the dragover is made with pivots
            "blur-[2px]": this.status === "dragover" && this.pivotDragInProgress,
            "h-32": this.pivotDragInProgress,
            "h-24": !this.pivotDragInProgress,
        };
        const uploadForm = html `
      <form
        class="absolute flex justify-center items-center h-full w-full z-10"
      >
        <input
          class="hidden"
          type="file"
          name="file"
          accept=".csv"
          enctype="multipart/form-data"
        />
        <label for="file" class="py-3 text-l text-gray-700 dark:text-slate-100"
          >Drop here to create a pivot</label
        >
      </form>
    `;
        return html `
      <div
        class="${this.dropzoneClasses} relative"
        @dragover=${this.onDragIn}
        @dragenter=${this.onDragIn}
        @dragleave=${this.onDragOut}
        @dragend=${this.onDragOut}
        @drop=${this.addPivot}
      >
        ${!this.isAtRest ? uploadForm : nothing}
        <div
          class="flex flex-wrap overflow-y-auto w-full mx-2 mb-3 transition-height duration-75 ease-in ${classMap(pivotsDragOverClass)}"
        >
          ${pivots}
        </div>
      </div>
    `;
    }
}
PivotDropzone.properties = {
    status: { state: true },
    pivots: { state: true },
    pivotDragInProgress: { state: true },
};
customElements.define("wt-pivot-dropzone", PivotDropzone);
//# sourceMappingURL=pivot-dropzone.js.map