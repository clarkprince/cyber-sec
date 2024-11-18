import { html } from "lit";
import icons from "./icons";
import { dispatchCreateCell } from "./notebook-body-events";
import TWElement from "./tw";
const emptyState = html `<p class="my-8">
  No Data Source yet,
  <a class="text-blue-600" href="/datasources"> click to create one.</a>
</p>`;
class SourceList extends TWElement {
    constructor() {
        super();
        this.sources = [];
        this.list = [];
        this.searchList = [];
        this.searchValue = "";
        this.loading = true;
    }
    firstUpdated() {
        this.fetchList();
    }
    async fetchList() {
        try {
            this.sources = await fetch("/datasources/list").then((r) => r.json());
        }
        catch (err) {
            console.error(err);
            this.error = err.message;
        }
        finally {
            this.loading = false;
            this.getStreamList();
        }
    }
    getStreamList() {
        for (const src of this.sources) {
            for (const stream of src.Streams) {
                this.list.push({
                    id: stream.ID,
                    title: src.Title,
                    name: stream.Name,
                    description: src.Description,
                });
            }
        }
    }
    search(e) {
        console.log("Entered search");
        this.searchValue = e.target.value.toLowerCase();
        this.searchList = [];
        for (const el of this.list) {
            const name = el.name.toLowerCase();
            const title = el.title.toLowerCase();
            const description = el.description.toLowerCase();
            if (name.includes(this.searchValue) ||
                title.includes(this.searchValue) ||
                description.includes(this.searchValue)) {
                this.searchList.push(el);
            }
        }
        return this.searchList;
    }
    createCell(title, dataSource) {
        dispatchCreateCell({
            title,
            dataSource,
        }, this);
    }
    render() {
        let results = [];
        let searchResults = [];
        if (this.searchValue) {
            for (const el of this.searchList) {
                searchResults.push(html `
          <li class="border-b-1 border-zinc-600 cursor-pointer">
            <a
              class="vbox gap-1"
              @click="${() => this.createCell(el.name, el.id)}"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                class="fill-zinc-400 shrink-0"
              >
                ${icons.data}
              </svg>
              <p class="font-bold mr-5">${el.title}</p>
              <p>(${el.name})</p>
              ${el.description &&
                    html `<p
                class="ml-5 text-sm italic text-zinc-500 dark:text-neutral-400"
              >
                — ${el.description}
              </p>`}
            </a>
          </li>
        `);
            }
        }
        else {
            for (const el of this.list) {
                results.push(html `
          <li class="border-b-1 border-zinc-600 cursor-pointer">
            <a
              class="vbox gap-1"
              @click="${() => this.createCell(el.name, el.id)}"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                class="fill-zinc-400 shrink-0"
              >
                ${icons.data}
              </svg>
              <p class="font-bold mr-5">${el.title}</p>
              <p>(${el.name})</p>
              ${el.description &&
                    html `<p
                class="ml-5 text-sm italic text-zinc-500 dark:text-neutral-400"
              >
                — ${el.description}
              </p>`}
            </a>
          </li>
        `);
            }
        }
        const hasData = !this.loading && !this.error;
        return html `
      <div
        class="center-float h-2/3 w-1/3 z-50 p-6 text-sm shadow-md dark:border-neutral-700 rounded-sm bg-zinc-50 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-200 flex flex-col justify-stretch overflow-auto"
      >
        <input
          class="bg-zinc-50 dark:bg-neutral-800 border-b-2 border-zinc-200"
          name="filter"
          placeholder=".*"
          @keyup="${this.search.bind(this)}"
        />
        ${this.error &&
            html `<p class="my-8">
          Error while listing data sources:${this.error}. Refresh the page to
          try again.
        </p>`}
        ${hasData &&
            (this.searchValue
                ? searchResults.length > 0
                    ? html `<ul class="mt-4">
                ${searchResults}
              </ul>`
                    : "Nothing found"
                : results.length > 0
                    ? html `<ul class="mt-4">
              ${results}
            </ul>`
                    : emptyState)}
      </div>
    `;
    }
}
SourceList.properties = {
    sources: { state: true },
    list: { state: true },
    searchList: { state: true },
    searchValue: { state: true },
};
customElements.define("wt-notebook-datasources", SourceList);
//# sourceMappingURL=notebook-datasources.js.map