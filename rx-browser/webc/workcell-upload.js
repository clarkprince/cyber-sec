import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { getPivotCreationData, hasPivotCreationData, } from "./pivot-events";
import TWElement from "./tw";
// acceptDrop prevents the drag event propagation, optionally only if pred is provided.
// This has the effect of allowing the drag event to happen.
const acceptDrop = (e, pred) => {
    if (!pred || pred(e)) {
        e.preventDefault();
        e.stopImmediatePropagation();
    }
};
function fileFromSelectionData(data) {
    // TODO: this value could be used to initialize the form and let user improve the name?
    // const pivotname = `Filter by ${data.path}=${data.value}`
    const filename = `${data.path.replace(".", "_")}-${data.value}.csv`;
    // first row = join path
    // following rows = join values
    const filecontent = `${data.path}\n${data.value}`;
    const csv = new File([filecontent], filename);
    return csv;
}
const hasFileData = (e) => {
    return e.dataTransfer?.types.includes("Files");
};
const hasSuffix = (s, suffix) => {
    if (suffix.length > s.length) {
        return false;
    }
    return s.substring(s.length - suffix.length) == suffix;
};
const FILE_EXTENSION = "csv";
const FILE_EXTENSION_LENGTH = `.${FILE_EXTENSION}`.length;
class UploadForm extends TWElement {
    constructor() {
        super(...arguments);
        this.pivots = [];
        this.status = "";
        this.onDragIn = (e) => {
            acceptDrop(e, this.isValidDrop);
            this.status = "dragover";
        };
        this.onDragOut = (e) => {
            acceptDrop(e, this.isValidDrop);
            this.status = "";
        };
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
        return false;
    }
    getFiles(e) {
        const selectionData = getPivotCreationData(e);
        if (selectionData) {
            return [fileFromSelectionData(selectionData)];
        }
        return e.dataTransfer?.files;
    }
    async uploadCSV(e) {
        e.preventDefault();
        e.stopPropagation();
        const files = this.getFiles(e);
        if (!files) {
            console.error("no data files provided, moving on");
            return;
        }
        for (const f of files) {
            if (!hasSuffix(f.name, FILE_EXTENSION)) {
                console.error("invalid extension, please provide CSV files only");
                return;
            }
            let fd = new FormData();
            fd.append("file", f);
            fd.append("name", FILE_EXTENSION);
            fetch("/importcsv", {
                method: "POST",
                body: fd,
            })
                .then((response) => response.json())
                .then((data) => {
                const { pivot, rightPath } = data;
                this.pivots = [
                    ...this.pivots,
                    { name: f.name.slice(0, -FILE_EXTENSION_LENGTH), id: pivot, rightPath },
                ];
                this.status = "";
            })
                .catch((err) => {
                console.error("Posting data was not successful:" + err);
            });
        }
    }
    render() {
        let pivots = [];
        for (const p of this.pivots) {
            pivots.push(html `<wt-pivot
        class="mr-1"
        type="pivot"
        pivotid=${p.id}
        rightpath=${p.rightPath}
        name=${p.name}
      ></wt-pivot>`);
        }
        const overclass = {
            "dark:bg-neutral-600": this.status == "dragover",
            "bg-neutral-100": this.status == "dragover",
            "dark:bg-neutral-900": this.status == "",
            "bg-neutral-200": this.status == "",
        };
        return html `<div class="relative h-28">
      <div class="flex absolute top-0">${pivots}</div>
      <div
        id="drop-area"
        class="w-[42rem] absolute bottom-0 border-slate-500 border-2 border-dashed rounded-2xl ${classMap(overclass)} dark:border-slate-100 dark:text-slate-100"
        @dragover=${this.onDragIn}
        @dragenter=${this.onDragIn}
        @dragleave=${this.onDragOut}
        @dragend=${this.onDragOut}
        @drop=${this.uploadCSV}
      >
        <form class="flex justify-center">
          <input
            class="hidden"
            type="file"
            name="file"
            accept=".csv"
            enctype="multipart/form-data"
          />
          <label for="file" class="py-3 text-xl">Add a pivot</label>
        </form>
      </div>
    </div>`;
    }
}
UploadForm.properties = {
    status: { state: true },
    pivots: { state: true },
};
customElements.define("wt-uploader", UploadForm);
