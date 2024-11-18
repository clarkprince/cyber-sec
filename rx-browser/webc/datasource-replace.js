import { html } from "lit";
import TWElement from "./tw";
import { fetchNotebook } from "./api";
class DatasourceReplace extends TWElement {
    constructor() {
        super();
        this.datasources = [];
        this.datasourcelist = [];
    }
    firstUpdated() {
        this.fetchNotebook();
        this.fetchDatasources();
    }
    async fetchNotebook() {
        if (!this.notebookId) {
            return;
        }
        const nb = await fetchNotebook(this.notebookId);
        this.notebook = nb;
        return;
    }
    async fetchDatasources() {
        if (!this.notebook) {
            this.notebook = JSON.parse(this.nb);
        }
        try {
            this.datasources = await fetch("/datasources/list").then((r) => r.json());
        }
        catch (err) {
            console.error(err);
        }
        finally {
            this.getStreamList();
        }
    }
    getStreamList() {
        let ds = [];
        for (const src of this.datasources) {
            for (const stream of src.Streams) {
                ds.push({
                    id: stream.ID,
                    title: src.Title,
                });
            }
        }
        this.datasourcelist = ds;
    }
    saveNotebook() {
        if (this.isAudit) {
            // send to audit
            this.dispatchEvent(new CustomEvent("replace-datasource", {
                detail: {
                    notebook: this.notebook,
                },
            }));
            this.close();
            return;
        }
        fetch("/api/nbar?action=replace", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.notebook),
        });
        this.close();
        window.location.reload();
    }
    replaceDatasource(c, ev) {
        for (const cell of this.notebook.Cells) {
            if (cell.ID == c) {
                cell.DataSource = ev.target.value;
            }
        }
    }
    getCells() {
        let cells = [];
        if (this.notebook) {
            let c = 1;
            for (const cell of this.notebook.Cells) {
                cells.push(html ` <div
            class="flex justify-between items-center py-4 border-b border-solid dark:border-neutral-600"
          >
            <div class="text-base">
              ${cell.Title ? cell.Title : "Cell #" + c}
            </div>
            <select
              class="border border-zinc-200 bg-zinc-50 rounded-md p-2 focus:outline-0 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500 py-2 px-2 w-2/5"
              @input="${(ev) => this.replaceDatasource(cell.ID, ev)}"
            >
              <option value="">Select Datasource</option>
              ${this.datasourcelist.map((ds) => html `<option value="${ds.id}">${ds.title}</option>`)}
            </select>
          </div>`);
                c++;
            }
        }
        return html `${cells}`;
    }
    close() {
        this.remove();
    }
    render() {
        return html ` <div
      id="datasource-replace"
      class="center-float w-2/5 h-3/4 z-50 p-6 text-sm shadow-md border dark:border-neutral-700 rounded-sm bg-zinc-50 dark:bg-neutral-800 dark:text-neutral-50"
    >
      <h1 class="text-2xl">Replace Datasources</h1>
      <div class="py-4 h-3/4 overflow-auto">${this.getCells()}</div>
      <div class="flex justify-end absolute bottom-4 right-4">
        <button
          class="py-3 px-6 flex items-center bg-yellow-400 rounded text-neutral-900 text-sm font-medium cursor-pointer mr-2"
          @click=${this.close}
        >
          Cancel
        </button>
        <button
          class="py-3 px-6 flex items-center bg-yellow-400 rounded text-neutral-900 text-sm font-medium cursor-pointer"
          @click=${this.saveNotebook}
        >
          Replace
        </button>
      </div>
    </div>`;
    }
}
DatasourceReplace.properties = {
    notebookId: { type: String },
    notebook: { state: true },
    datasourcelist: { state: true },
    isAudit: { type: Boolean },
    nb: { type: String },
};
customElements.define("wt-datasource-replace", DatasourceReplace);
//# sourceMappingURL=datasource-replace.js.map