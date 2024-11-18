import { html, nothing } from "lit-html";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { until } from "lit/directives/until.js";
import { createRef, ref } from "lit/directives/ref.js";
import { hasFlag } from "../utils/flags";
import { getCellDragData, getDatasourceDragData, hasCellData, hasDatasourceData, setCellDragData, } from "./notebook-body-events";
import { notify } from "./notification";
import TWElement from "./tw";
import { manifestChangeEvt } from "./manifest-events";
import "./pivot-pill";
import icons from "./icons";
import { fetchNotebook, fetchPivot } from "./api";
async function saveNotebook(updatedNotebook) {
    const rsp = await fetch("/api/notebook?action=save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNotebook),
    });
    if (rsp.status !== 200) {
        notify(updatedNotebook.ID, "the notebook could not be saved, retrying usually helps", true);
    }
}
function isDrop(ev) {
    return ev.type === "drop";
}
class NotebookBody extends TWElement {
    constructor() {
        super();
        // other state
        this.panel = "none";
        /** Native JS Map are bad for reactivity (not immutable) hence the object */
        this.pivots = {};
        /** track which cell menu is opened, using the cell ID */
        this.openedCellMenu = "";
        // opens/closes the snapshot submenu
        this.snapshotMenu = false;
        this.snapshots = [];
        this.adjustCellFlag = false;
        this.cellRefs = new Map();
    }
    firstUpdated() {
        this.fetchNotebook();
        /**
         * Notebook will rerender on manifest changes triggered by cells
         */
        this.shadowRoot?.addEventListener(manifestChangeEvt, (ev) => {
            const manifest = JSON.parse(ev.detail);
            // TODO: this leads to cascading requests (manifest, then pivots)
            // we could try populating the manifest in the backend
            if (manifest.Pivots !== null) {
                for (const pivot of manifest.Pivots) {
                    this.loadPivot(pivot);
                }
            }
            // be careful to create a new object to trigger re-render
            this.notebook = {
                ...this.notebook,
                Cells: this.notebook.Cells.map((cell) => {
                    if (cell.ID !== manifest.ID) {
                        return cell;
                    }
                    cell = { ...manifest };
                    return cell;
                }),
            };
        });
    }
    closePanels() {
        this.panel = "none";
    }
    openSearchPanel() {
        this.panel = "search";
    }
    openDataSourcePanel() {
        this.panel = "sources";
    }
    async loadPivot(p) {
        const pivot = await fetchPivot(p.Pivot);
        if (!pivot)
            return;
        this.pivots = { ...this.pivots, [pivot.pivotid]: { ...pivot, ...p } };
    }
    async cellDataFromDrop(ev) {
        if (hasCellData(ev)) {
            // duplicating a cell
            const cell = getCellDragData(ev);
            if (!cell?.DataSource)
                return null;
            return {
                dataSource: cell?.DataSource,
                title: cell?.Title || "cell",
            };
        }
        else if (hasDatasourceData(ev)) {
            // creating a new cell from a datasource, can be a file
            const data = await getDatasourceDragData(ev, this.notebook.ID);
            if (!data) {
                // dropped something that is not a data source
                console.warn("Dropped something that is not a datasource definition on notebook-body");
                return null;
            }
            return data;
        }
        return null;
    }
    /**
     * Will create a new cell from a datasource
     * or duplicate and existing cell
     */
    async createCell(ev) {
        ev.preventDefault();
        let data;
        if (isDrop(ev)) {
            data = await this.cellDataFromDrop(ev);
        }
        else {
            data = ev.detail;
        }
        if (!data) {
            console.warn("got a cell creation event but no data");
            return;
        }
        this.notebook.Cells = [
            ...this.notebook.Cells,
            {
                Title: data.title,
                DataSource: data.dataSource,
                ID: null,
                Pivots: [],
                Notebook: this.notebook.ID,
                CheckCell: false,
                Snapshot: null,
                Position: {
                    Col: 3,
                    Height: 0,
                    Row: this.notebook.Cells.length + 1,
                },
            },
        ];
        await this.saveNotebook();
    }
    async removeCell(cell) {
        if (!cell)
            return;
        if (!confirm("Are you sure you want to delete this cell?"))
            return;
        this.notebook.Cells = this.notebook.Cells.filter((c) => c.ID !== cell);
        await this.saveNotebook();
    }
    async adjustCell(ev, cell, action) {
        if (!cell)
            return;
        this.openedCellMenu = "";
        switch (action) {
            case "up":
                this.moveCell(cell, -1);
                break;
            case "down":
                this.moveCell(cell, 1);
                break;
            case "width":
                this.adjustWidth(cell, ev);
                break;
            case "height":
                this.adjustHeight(cell, ev);
                break;
        }
        await this.saveNotebook();
    }
    moveCell(cell, direction) {
        const cells = this.notebook.Cells;
        const index = cells.indexOf(cell);
        if (!cell.Position.Row ||
            cell.Position.Row === 0 ||
            cells.filter((c) => c.Row === 0).length == cells.length) {
            this.adjustRowForCells(cells, 0, 1);
        }
        if (this.isValidRange(index, direction, cells.length)) {
            // neighbor where their row is the same as the cell's row + direction
            const neighbors = cells.filter((c) => c.Position.Row === cell.Position.Row + direction);
            if (neighbors.length === 0) {
                if ((cell.Position.Row === 1 && direction === -1) ||
                    (cell.Position.Row === cells.length &&
                        direction === 1 &&
                        cell.Position.Col !== 3)) {
                    cell.Position.Col = 3;
                    cell.Position.Row = 1;
                    this.adjustRowForCells(cells, index + 1, direction);
                }
                cells.sort((a, b) => a.Position.Row - b.Position.Row);
                return;
            }
            // size of cells in the same row
            const ncol = neighbors.reduce((acc, c) => acc + c.Position.Col, 0);
            if (ncol > 0 && ncol < 3) {
                cell.Position.Col = 3 - ncol;
                cell.Position.Row += direction;
                this.adjustRowForCells(cells, index + 1, direction);
            }
            else {
                this.swapCells(cells, index, index + 1, direction);
            }
        }
        else {
            cell.Position.Col = 3;
            if (cell.Position.Row === 1 && direction === 1) {
                cell.Position.Row += direction;
                this.adjustRowForCells(cells, index + 1, direction);
            }
            else if (cell.Position.Row === 1 && direction === -1) {
                this.adjustRowForCells(cells, index + 1, 1);
            }
        }
        cells.sort((a, b) => a.Position.Row - b.Position.Row);
    }
    isValidRange(index, direction, cellCount) {
        return (index >= 0 && index + direction >= 0 && index + direction < cellCount);
    }
    swapCells(cells, index1, index2, direction) {
        if (index1 < 0 ||
            index1 >= cells.length ||
            index2 < 0 ||
            index2 >= cells.length) {
            console.error("Invalid indices provided for cell swapping.");
            return;
        }
        const temp = cells[index1];
        temp.Col = 3;
        cells[index1].Position.Row += direction;
        cells[index2].Position.Row -= direction;
        cells[index1] = cells[index2];
        cells[index2] = temp;
    }
    adjustRowForCells(cells, startIndex, direction) {
        for (let i = startIndex; i < cells.length; i++) {
            cells[i].Position.Row += direction;
        }
    }
    adjustWidth(cell, ev) {
        if (!cell.Position.Col || cell.Position.Col === 0)
            cell.Position.Col = 3;
        cell.Position.Col =
            ev.ctrlKey || ev.metaKey
                ? Math.min(3, cell.Position.Col + 1)
                : Math.max(1, cell.Position.Col - 1);
    }
    adjustHeight(cell, ev) {
        const ranges = [6, 20, 28, 36, 44, 56];
        if (!cell.Position.Height || cell.Position.Height === 0)
            cell.Position.Height = 44;
        const index = ranges.indexOf(cell.Position.Height);
        if (index >= 0) {
            if (ev.ctrlKey || ev.metaKey) {
                if (index < ranges.length - 1)
                    cell.Position.Height = ranges[index + 1];
            }
            else if (index > 0) {
                cell.Position.Height = ranges[index - 1];
            }
        }
    }
    // asynchronously save the metadata of the notebook
    // cells will be save separately, see main_js.go (cell.WireEngine(ngx))
    async saveNotebook() {
        this.notebook.Rev++;
        const updatedNotebook = {
            // don't forget to merge in existing fields
            ...this.notebook,
            Rev: this.notebook.Rev,
        };
        await saveNotebook(updatedNotebook);
        // refetch in the background
        // (UI state is already up to date, so we should have an optimistic UI)
        this.fetchNotebook();
    }
    toggleUrgent() {
        this.notebook = { ...this.notebook, Urgent: !this.notebook.Urgent };
        this.saveNotebook();
    }
    toggleResolved() {
        this.notebook = { ...this.notebook, Resolved: !this.notebook.Resolved };
        this.saveNotebook();
    }
    async fetchNotebook() {
        const nb = await fetchNotebook(this.notebookId);
        this.notebook = nb; // TODO: handle null notebook
        return;
    }
    async exportNotebook() {
        const status = this.validateNotebook();
        if (status != null) {
            notify(this.notebookId, status, true);
            return;
        }
        const rsp = await fetch(`/api/nbar?action=export&notebook=${this.notebookId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (rsp.status !== 200) {
            notify(this.notebookId, "the notebook could not be exported", true);
        }
        else {
            const blob = await rsp.blob();
            const url = window.URL.createObjectURL(blob);
            const filename = `${this.notebook.ID}.nbar`;
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        }
    }
    validateNotebook() {
        // check if notebook has a title
        if (!this.notebook.Title) {
            return "Notebook must have a title";
        }
        // check if notebook has at least one cell
        if (this.notebook.Cells.length === 0) {
            return "Notebook must have at least one cell";
        }
    }
    async fetchSnapshots(cell) {
        if (!cell)
            return;
        this.snapshots = [
            "Loading.."
        ];
        const rsp = await fetch(`/api/notebook/snapshot?action=list`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cell: cell,
            }),
        });
        if (rsp.status == 200) {
            const data = await rsp.json();
            this.snapshots = JSON.parse(data);
            if (this.snapshots.length == 0) {
                this.snapshots = [
                    "No snapshots found."
                ];
            }
        }
        else {
            notify(this.notebookId, "the snapshots could not be fetched", true);
        }
    }
    loadSnapshot(snapshot) { }
    async saveSnapshot(cell) {
        const rsp = await fetch(`/api/notebook/snapshot?action=save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cell: cell,
            }),
        });
        if (rsp.status == 200) {
            const data = await rsp.json();
            this.snapshots = [...this.snapshots, data.snapshot];
        }
        else {
            notify(this.notebookId, "the snapshot could not be saved", true);
        }
    }
    render() {
        if (!this.notebook)
            return; // waiting for state to be initialized
        document.title = this.notebook.Title;
        const adjustCellMenu = async (cell) => {
            const on = await hasFlag("adjust-cell");
            if (on) {
                return html `
        <div class="flex items-center justify-between pt-2 pb-1">
        Move
        <span class="flex items-center justify-between">
          <svg
            width="18"
            height="18"
            viewBox="0 0 40 40"
            class="dark:fill-white cursor-pointer mr-2" 
            aria-label="move-up"
            @click="${(e) => {
                    this.adjustCell(e, cell, "up");
                }}"
          >
            ${icons.up}
          </svg>
            <svg
            width="18"
            height="18"
            viewBox="0 0 40 40"
            class="dark:fill-white cursor-pointer"
            aria-label="move-down"
            @click="${(e) => {
                    this.adjustCell(e, cell, "down");
                }}"
          >
            ${icons.down}
          </svg>
        <span>
      </div>
      <div class="flex items-center justify-between">
          Resize
          <span class="flex items-center justify-between">
            <svg
              width="18"
              height="18"
              viewBox="0 0 40 40"
              class="dark:fill-white cursor-pointer mr-2"
              aria-label="adjust-width"
              @click="${(e) => {
                    this.adjustCell(e, cell, "width");
                }}"
            >
              ${icons.width}
            </svg>
            <svg
              width="18"
              height="18"
              viewBox="0 0 40 40"
              class="dark:fill-white cursor-pointer"
              aria-label="adjust-height"
              @click="${(e) => {
                    this.adjustCell(e, cell, "height");
                }}"
            >
              ${icons.height}
            </svg>
          </span>
      </div>
      <div class="border-b border-zinc-300 bg-white dark:bg-neutral-600 p-2 mb-1"></div>
        `;
            }
            else {
                return html ``;
            }
        };
        const snapshotAndEnforce = async (cell) => {
            const on = await hasFlag("snapshot-and-enforce");
            if (on) {
                return html `<div
            class="flex items-center justify-between cursor-pointer pb-1"
            @click=${async () => {
                    cell.CheckCell = !cell.CheckCell;
                    await this.saveNotebook();
                }}
          >
            ${cell.CheckCell ? "Enforced" : "Enforce"}
            <span class="flex items-center justify-between">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                class="dark:fill-white mr-1"
              >
                ${icons.shield}
              </svg>
              ${cell.CheckCell
                    ? html `
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      class="dark:fill-white mr-1"
                    >
                      ${icons.times}
                    </svg>
                  `
                    : html ``}
            </span>
          </div>
          <div>
            <div
              class="flex items-center justify-between cursor-pointer pb-2"
              @click=${async () => {
                    this.snapshotMenu = !this.snapshotMenu;
                    await this.fetchSnapshots(cell);
                }}
            >
              ${cell.Snapshot
                    ? html `Snapshot Taken:
                  ${new Date(cell.Snapshot).toLocaleString()}`
                    : "Snapshot"}
              <div class="flex items-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  class="dark:fill-white mr-1 ml-2"
                >
                  ${icons.lock}
                </svg>
                ${cell.Snapshot
                    ? html ` <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      class="dark:fill-white mr-1"
                      @click=${async () => {
                        cell.Snapshot = null;
                        await this.saveNotebook();
                    }}
                    >
                      ${icons.times}
                    </svg>`
                    : html ``}
              </div>
            </div>
            ${this.snapshotMenu
                    ? html `
                  <div
                    class="absolute top-32 right-full w-48 bg-white border border-neutral-100 p-2 dark:bg-neutral-700 dark:border-neutral-500 -translate-y-full"
                  >
                    ${repeat(this.snapshots, (snapshot) => snapshot, (snapshot, _) => html `
                        <div
                          class="flex items-center justify-between cursor-pointer pt-1"
                          @click=${async () => {
                        this.loadSnapshot(snapshot);
                    }}
                        >
                          Taken: ${snapshot}
                        </div>
                      `)}
                    ${cell.Snapshot
                        ? html ``
                        : html `
                          <hr class="mt-3" />
                          <div
                            class="pt-1 cursor-pointer"
                            @click=${() => {
                            this.saveSnapshot(cell);
                        }}
                          >
                            New Snapshot
                          </div>
                        `}
                  </div>
                `
                    : html ``}
          </div>
          <hr />`;
            }
            return "";
        };
        const cellMenu = (cell) => {
            return html `
        <div
          class="absolute z-10 bottom-1 right-14
                          border-b border-zinc-300 bg-white dark:bg-neutral-600 p-2 drop-shadow rounded flex flex-col min-w-[16rem] text-sm font-semibold text-zinc-600 dark:text-neutral-200"
        >
          ${until(adjustCellMenu(cell))} ${until(snapshotAndEnforce(cell))}
          <div
            class="flex items-center justify-between cursor-pointer text-sm font-semibold text-zinc-600 dark:text-neutral-200 pt-2"
            aria-label="delete-cell"
            @click="${() => {
                this.removeCell(cell.ID);
            }}"
          >
            Delete

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              class="dark:fill-white"
            >
              ${icons.delete}
            </svg>
          </div>
        </div>
      `;
        };
        const current_cells = repeat(this.notebook.Cells, (cell) => cell.ID, (cell, _) => {
            if (cell.ID) {
                const cellRef = createRef();
                this.cellRefs.set(cell.ID, cellRef);
                const cellWidth = this.adjustCellFlag
                    ? cell.Position.Col &&
                        cell.Position.Col > 0 &&
                        cell.Position.Col < 3
                        ? `w-${cell.Position.Col}/3 pr-2`
                        : "w-full"
                    : "";
                const cellHeight = this.adjustCellFlag
                    ? cell.Position.Height && cell.Position.Height > 0
                        ? `h-[${cell.Position.Height}rem]`
                        : "h-[44rem]"
                    : "";
                return html `<div class="${cellWidth}" aria-label="cell-wrapper">
            <div
              aria-label="cell-body-wrapper"
              class="${cellHeight} overflow-hidden mb-5 hover:shadow border border-zinc-200 dark:border-neutral-700 shadow-sm dark:shadow-none dark:hover:bg-neutral-800 dark:bg-transparent rounded relative shrink-0"
            >
              <wt-data
                ${ref(cellRef)}
                id=${cell.ID}
                class="w-full"
                manifest="${JSON.stringify(cell)}"
              ></wt-data>
              <button
                @click=${() => {
                    if (this.openedCellMenu == cell.ID)
                        this.openedCellMenu = "";
                    else
                        this.openedCellMenu = cell.ID;
                }}
                aria-label="cell-menu"
                class="absolute bottom-4 right-6 cursor-pointer z-10
                                        rounded-sm text-xs p-1 border border-zinc-300 black dark:bg-neutral-600 dark:white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  class="dark:fill-white"
                >
                  ${icons.ellipsis}
                </svg>
              </button>
              ${when(this.openedCellMenu == cell.ID, () => cellMenu(cell))}
            </div>
          </div>`;
            }
        });
        const navigationArticles = [
            ["Explore", icons.datasource, this.openDataSourcePanel.bind(this)],
            ["Find", icons.search, this.openSearchPanel.bind(this)],
            ["Connect", icons.connectors, null],
            ["Help", icons.help, null],
        ].map(([name, icon, action]) => html `<article class="mt-1">
          <a href="#" class="vbox pl-2 text-xs" @click="${action}">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="mb-0.5 fill-zinc-400 stroke-zinc-400"
            >
              ${icon}
            </svg>
            <span class="text-sm font text-zinc-600 dark:text-neutral-200 pl-2 "
              >${name}</span
            >
          </a>
        </article>`);
        const overview = this.notebook.Cells.map((cell) => {
            return html ` <!-- cell-overview -->
        <article class="mb-2 flex flex-col">
          <button
            aria-label="Click to scroll"
            title="Click to scroll"
            @click=${() => {
                if (cell.ID) {
                    this.cellRefs
                        .get(cell.ID)
                        ?.value?.scrollIntoView({ behavior: "smooth" });
                }
            }}
            draggable=${true}
            @dragstart=${(e) => {
                setCellDragData(e, cell);
            }}
          >
            <h2
              class="vbox italic text-zinc-600 dark:text-neutral-200 dark:font-semibold"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                class="fill-zinc-400 shrink-0"
              >
                ${icons.cell}
              </svg>
              <span class="truncate">${cell.Title}</span>
            </h2>

            <p>${cell.Datasource}</p>
          </button>

          <ul class="flex flex-col gap-1">
            ${cell.Pivots?.map((p) => {
                if (p.Pivot in this.pivots) {
                    return html `<wt-pivot-pill
                  cls="w-full"
                  .pivot=${this.pivots[p.Pivot]}
                ></wt-pivot-pill>`;
                }
                else {
                    return html `<wt-pivot-pill
                  cls="w-full"
                  pivotid=${p.Pivot}
                  .loading=${true}
                ></wt-pivot-pill>`;
                }
            })}
          </ul>
        </article>`;
        });
        let overlay = nothing;
        if (this.panel === "search") {
            overlay = html `<div
          class="center-float h-screen w-screen bg-zinc-500/60 z-10"
          @click=${this.closePanels.bind(this)}
        ></div>
        <wt-search></wt-search> `;
        }
        else if (this.panel === "sources") {
            overlay = html `<div
          class="center-float h-screen w-screen bg-zinc-500/60 z-10"
          @click=${this.closePanels.bind(this)}
        ></div>
        <wt-notebook-datasources
          @create-cell=${(ev) => {
                this.createCell(ev);
                this.closePanels();
            }}
        >
        </wt-notebook-datasources>`;
        }
        const title = html ` <div
      class="mb-5 w-full flex items-center justify-between"
    >
      <input
        type="text"
        class="w-4/5 text-2xl px-3 py-3 border-none bg-transparent text-neutral-900 dark:text-neutral-200 dark:border dark:border-neutral-700 dark:hover:bg-neutral-800"
        placeholder="Event - ${new Date(this.notebook.Created).toString()}"
        value=${this.notebook.Title}
        @blur=${(e) => {
            this.notebook.Title = e.target?.value;
            this.saveNotebook();
        }}
        aria-label="notebook-title"
      />
      <div>
        <button
          type="button"
          class="py-3 px-4 bg-yellow-400 rounded text-neutral-900 text-sm font-medium mr-1"
          @click="${this.exportNotebook}"
        >
          Export
        </button>
        <button
          type="button"
          class="py-3 px-4 bg-yellow-400 rounded text-neutral-900 text-sm font-medium"
          data-testid="share-button"
          onclick="navigator.clipboard.writeText(window.location.href)"
        >
          Share
        </button>
      </div>
    </div>`;
        const topbar = html ` <div
      class="mb-5 px-3 flex items-center text-sm dark:text-neutral-300"
    >
      <p class="mr-6 flex items-center">
        <svg
          width="16"
          viewBox="0 0 24 24"
          class="mr-2 fill-none stroke-neutral-900 dark:stroke-neutral-100"
        >
          ${icons.user}
        </svg>
        ${this.owner}
      </p>
      <p class="mr-6 flex items-center">
        <svg
          width="17"
          viewBox="0 0 17 18"
          class="mr-2 fill-neutral-900 stroke-neutral-900 dark:fill-neutral-100 dark:stroke-neutral-100"
        >
          ${icons.calendar}
        </svg>
        ${this.created}
      </p>
      <button
        type="button"
        class="mr-6 flex items-center ${this.notebook.Urgent
            ? "text-red-500"
            : ""}"
        @click="${this.toggleUrgent.bind(this)}"
      >
        <svg
          width="17"
          viewBox="0 0 17 18"
          class="mr-2 ${this.notebook.Urgent
            ? "fill-red-500"
            : "fill-neutral-900 dark:fill-neutral-100"}"
        >
          ${icons.urgent}
        </svg>
        ${this.notebook.Urgent ? "Urgent" : "Routine"}
      </button>
      <button
        type="button"
        class="mr-6 flex items-center ${this.notebook.Resolved
            ? "text-green-600"
            : ""}"
        @click="${this.toggleResolved.bind(this)}"
      >
        <svg
          width="16"
          viewBox="0 0 22 19"
          class="mr-2 ${this.notebook.Resolved
            ? "fill-green-600"
            : "fill-neutral-900 dark:fill-neutral-100"}"
        >
          ${icons.tick}
        </svg>
        ${this.notebook.Resolved ? "Resolved" : "In Progress"}
      </button>
    </div>`;
        const checkAdjustCellFlag = async () => {
            const on = await hasFlag("adjust-cell");
            this.adjustCellFlag = on;
        };
        until(checkAdjustCellFlag());
        return html `
      <!-- notebook-body -->
      <div class="h-screen w-screen flex md:max-w-[100vw] top-0 left-0 z-20">
        <nav
          class="pt-4 flex flex-col shrink-0 w-48 bg-zinc-50 dark:bg-neutral-900 border-r border-zinc-200 dark:border-transparent"
        >
          <section class="px-4 mb-5">${navigationArticles}</section>

          <section class="px-2 flex flex-col items-left">${overview}</section>
        </nav>

        <!-- cells-wrapper -->
        <div class="grow overflow-y-auto">
          <div
            class="p-7 flex flex-col h-full"
            @dragover=${(ev) => {
            ev.preventDefault();
        }}
            @drop=${(ev) => {
            this.createCell(ev);
        }}
            data-testid="notebook-cells-wrapper"
          >
            ${title} ${topbar}
            <wt-editor
              notebook="${this.notebook.ID}"
              class="w-3/4 max-w-[45rem] mb-5 border border-zinc-200 relative rounded shrink-0 min-h-4 max-h-80 focus:h-80 transition-height duration-500 ease-in-out"
              @create-cell=${(ev) => {
            this.createCell(ev);
        }}
            >
            </wt-editor>
            ${this.adjustCellFlag
            ? html `<div class="flex flex-wrap">${current_cells}</div>`
            : current_cells}
          </div>
        </div>
      </div>

      ${overlay}
    `;
    }
}
NotebookBody.properties = {
    notebookId: { type: String, attribute: "notebook-id" },
    notebook: { state: true },
    owner: { type: String },
    created: { type: String },
    panel: { state: true },
    pivots: { state: true },
    openedCellMenu: { state: true },
    snapshotMenu: { state: true },
    snapshots: { state: true },
};
customElements.define("wt-notebook-body", NotebookBody);
//# sourceMappingURL=notebook-body.js.map