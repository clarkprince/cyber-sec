import { css, html, nothing } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
// TODO: craft a schema specific to this search input
// this one is for the notebook and is too complete
import schema from "./editor/schema";
import TWElement from "./tw";
import icons from "./icons";
class WtSearch extends TWElement {
    constructor() {
        super();
        this.inputBox = createRef();
        this.startDate = createRef();
        this.endDate = createRef();
        this.isLoading = false;
        this.searchResponse = {
            results: [],
            authors: [],
            start: "",
            end: "",
            datasources: [],
        };
    }
    firstUpdated() {
        if (sessionStorage.getItem("searchQuery")) {
            this.inputBox.value.value = sessionStorage.getItem("searchQuery") || "";
        }
        if (sessionStorage.getItem("searchResponse")) {
            this.searchResponse = JSON.parse(sessionStorage.getItem("searchResponse") || "");
            this.applyFacets();
        }
        else {
            this.getDefaultFilters();
        }
    }
    // wait x seconds before searching
    // as a debounce mechanism to prevent too many requests
    async performSearch() {
        // clear the results from the previous search
        this.searchResponse = {
            results: [],
            authors: [],
            start: "",
            end: "",
            datasources: [],
        };
        this.error = "";
        this.isLoading = true;
        sessionStorage.removeItem("searchResponse");
        sessionStorage.removeItem("searchQuery");
        // check if query is empty
        const query = this.inputBox.value;
        if (!query || query.value === "") {
            this.isLoading = false;
            this.getDefaultFilters();
            return;
        }
        // clear the previous timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(async () => {
            // perform the search
            await this.search();
            this.isLoading = false;
        }, 500);
    }
    async search() {
        const query = this.shadowRoot.querySelector('input[name="query"]');
        const start = this.shadowRoot.querySelector('input[name="startdate"]');
        const end = this.shadowRoot.querySelector('input[name="enddate"]');
        const author = this.shadowRoot.querySelector('select[name="author"]');
        const datasource = this.shadowRoot.querySelector('select[name="datasource"]');
        try {
            const resp = await fetch("/search/query", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: query.value,
                    start: start.value,
                    end: end.value,
                    author: author.value,
                    datasource: datasource.value,
                }),
            });
            this.searchResponse = await resp.json();
            this.applyFacets();
            // store the search response in session storage
            // so that we can retrieve it when the user reopens the search page
            sessionStorage.setItem("searchResponse", JSON.stringify(this.searchResponse));
            sessionStorage.setItem("searchQuery", query.value);
        }
        catch (err) {
            this.error = "The search failed, update your query to try again.";
        }
    }
    async getDefaultFilters() {
        const resp = await fetch("/search/filters");
        this.searchResponse = await resp.json();
        this.applyFacets();
    }
    applyFacets() {
        const authors = this.shadowRoot.querySelector('select[name="author"]');
        const datasources = this.shadowRoot.querySelector('select[name="datasource"]');
        if (this.searchResponse.start) {
            this.startDate.value.valueAsDate = new Date(this.searchResponse.start);
        }
        if (this.searchResponse.end) {
            this.endDate.value.valueAsDate = new Date(this.searchResponse.end);
        }
        // TODO(pck) this should follow the rendering flow!!
        if (this.searchResponse.authors) {
            const currentAuthor = authors.value;
            authors.innerHTML = '<option value="">All</option>';
            this.searchResponse.authors.forEach((user) => {
                let option = document.createElement("option");
                option.value = user.ID;
                option.innerText = user.Name;
                authors.appendChild(option);
            });
            authors.value = currentAuthor;
        }
        if (this.searchResponse.datasources) {
            const currentDatasources = datasources.value;
            datasources.innerHTML = '<option value="">All</option>';
            this.searchResponse.datasources.forEach((datasource) => {
                let option = document.createElement("option");
                option.value = datasource.Key;
                option.innerText = datasource.Title;
                datasources.appendChild(option);
            });
            datasources.value = currentDatasources;
        }
    }
    pills(searchResults) {
        let datasources = nothing;
        if (searchResults.datasources) {
            datasources = searchResults.datasources.map((datasource) => {
                return html `
                    <div class="pr-1 mb-1 flex flex-initial items-center bg-white border-2 border-zinc-300 rounded cursor-pointer text-xs">
                        <svg width="16" height="16" viewBox="0 0 24 24" class="fill-zinc-400 shrink-0">
                        ${icons.data}
                        </svg>
                        <span class="pl-1 text-zinc-600">${datasource.Title}</span>
                        </div>
                    </div>
                    `;
            });
        }
        let pivots = nothing;
        if (searchResults.pivots && searchResults.pivots.length > 0) {
            pivots = searchResults.pivots.map((pivot) => {
                return html `
          <div
            class="pr-1 mb-1 flex flex-initial items-center bg-white border-2 border-zinc-300 rounded cursor-pointer text-xs"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              class="fill-zinc-400 shrink-0"
            >
              ${icons.pivot}
            </svg>
            <span class="pl-1 text-zinc-600">${pivot.name}</span>
          </div>
        `;
            });
        }
        return html `
      <div class="flex flex-wrap">
        <span class="mr-3">${datasources}</span>
        <span class="flex gap-1">${pivots}</span>
      </div>
    `;
    }
    render() {
        const resultsHTML = this.searchResponse.results.map((result) => {
            return html `
          <a href="/notebook/${result.ID}" target="_blank">
            <div
              class="py-3 px-4 mb-1 border-b-1 border-zinc-200 rounded-md text-neutral-800 dark:text-neutral-200 dark:bg-neutral-700"
            >
              <div>${this.pills(result)}</div>
              <div class="text-base font-semibold">Title: ${result.Title}</div>
              <div class="flex text-sm mb-3">
                <div class="mr-4">
                  <span class="font-semibold">Author: </span>${result.Owner
                .Name}
                </div>
                <div>
                  <span class="font-semibold">Date: </span>
                  ${new Date(result.Created).toDateString()}
                </div>
              </div>
              <wt-search-result notebook="${result.ID}"></wt-search-result>
            </div>
          </a>
        `;
        });
        return html `
      <div
        role="search"
        id="search"
        class="overflow-auto min-h-[400px] center-float h-2/3 w-2/3 z-50 p-6 text-sm shadow-md border dark:border-neutral-700 rounded-sm bg-zinc-50 dark:bg-neutral-800 dark:text-neutral-50"
      >
        <input
          ${ref(this.inputBox)}
          type="text"
          name="query"
          class="w-full p-3 border border-zinc-200 bg-zinc-50 rounded-sm focus:outline-0 dark:bg-neutral-600 dark:bg-text-200"
          aria-label="Search input"
          placeholder="IP Blocked Russia"
          @input="${() => this.performSearch()}"
        />
        <div class="flex h-full">
          <div class="w-1/4 mt-6 mr-5 mb-12">
            <div class="mb-3">
              <label
                class="block smallcaps mb-2 text-neutral-800 dark:text-neutral-200 "
                >Date</label
              >
              <div class="flex justify-between">
                <input
                  ${ref(this.startDate)}
                  type="date"
                  name="startdate"
                  class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 mr-4 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500"
                  @input="${() => this.performSearch()}"
                />
                <input
                  ${ref(this.endDate)}
                  type="date"
                  name="enddate"
                  class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500"
                  @input="${() => this.performSearch()}"
                />
              </div>
            </div>
            <div class="mb-3">
              <label
                class="block smallcaps mb-2 text-neutral-800 dark:text-neutral-200 text"
                >Author</label
              >
              <select
                name="author"
                class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 w-full focus:outline-0 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500"
                @input="${() => this.performSearch()}"
              >
                <option value="">All</option>
              </select>
            </div>
            <div class="mb-3">
              <label
                class="block smallcaps mb-2 text-neutral-800 dark:text-neutral-200 "
                >Data Sources</label
              >
              <select
                name="datasource"
                class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 w-full focus:outline-0 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500"
                @input="${() => this.performSearch()}"
              >
                <option value="">All</option>
              </select>
            </div>
          </div>
          <div
            class="w-3/4 border-l-2 border-neutral-200 dark:border-neutral-600 mt-4 mb-12 pl-5 overflow-auto"
          >
            ${resultsHTML.length > 0
            ? resultsHTML
            : this.isLoading
                ? html `Loading...`
                : html `No match … 😔`}
            ${this.error?.length > 0
            ? html `<p class="text-orange-600 dark:text-amber-400">
                  ${this.error}
                </p>`
            : nothing}
            <div></div>
          </div>
        </div>
      </div>
    `;
    }
}
WtSearch.properties = {
    searchResponse: { state: true },
    error: { state: true },
    isLoading: { state: true },
};
const prosestyle = css `
  .ProseMirror {
    word-wrap: break-word;
    white-space: normal;
  }

  .ProseMirror pre {
    white-space: pre-wrap;
  }
`;
class SearchResult extends TWElement {
    constructor() {
        super();
        this.firstUpdated = () => {
            this.readExistingData();
        };
        this.edstate = EditorState.create({ schema: schema });
        this.view = new EditorView(this, {
            state: this.edstate,
            editable: () => false,
        });
    }
    async readExistingData() {
        const response = await fetch(`/api/notebook/editor?action=read&notebook=${this.notebook}`);
        let content = await response.json();
        let doc = schema.nodeFromJSON(content);
        this.edstate = EditorState.create({ doc });
    }
    render() {
        this.view.updateState(this.edstate);
        return html `
      <div class="dark:text-neutral-200 text-base font-light">
        ${this.view.dom}
      </div>
    `;
    }
}
SearchResult.properties = {
    notebook: { type: String },
    edstate: { state: true },
};
SearchResult.styles = [prosestyle, css `{position: static}`];
customElements.define("wt-search", WtSearch);
customElements.define("wt-search-result", SearchResult);
//# sourceMappingURL=search.js.map