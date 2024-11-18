import { html } from "lit-html";
import { map } from "lit/directives/map.js";
import { range } from "lit/directives/range.js";
import { when } from "lit/directives/when.js";
import { TemplateResult, render } from "lit";
import { hasFlag } from "../utils/flags";
import { inputs } from "../utils/inputs";
import { Alert } from "./alert";
import {
  DatasourceChangeEvent,
  datasourceChangeEvt,
} from "./datasource-events";
import TWElement from "./tw";

//TODO: before removing flag change the amount of DSs per page to a more appropriate one
const pageLength = 6;

class DatasourceList extends TWElement {
  static properties = {
    tabs: { type: Array },
    tabsCaptions: { type: Array, attribute: "tabs-captions" },
    buttons: { state: true },
    cells: { state: true },
    newCellFlag: { state: true },
    isAlert: { type: Boolean },
    currentPages: { state: true },
  };

  tabs: any;
  tabsCaptions: any;
  buttons: any;
  cells;
  newCellFlag: boolean;
  isAlert: boolean;
  doUpdate: boolean;
  currentPages: any;

  constructor() {
    super();
    this.cells = [];
    this.newCellFlag = false;
    this.isAlert = false;
    this.currentPages = [];
  }

  async firstUpdated() {
    if (await hasFlag("organizing_notebooks")) {
      this.shadowRoot?.addEventListener(datasourceChangeEvt, (ev) => {
        const dsForm = ev as DatasourceChangeEvent;
        if (dsForm.detail) {
          const dsFormElements: any = JSON.parse(dsForm.detail);
          for (const data of dsFormElements) {
            if (data.name === "type") {
              this.cells = [
                ...this.cells,
                { type: data.value, data: dsFormElements },
              ];
              this.doUpdate = true;
            }
          }
        }
      });
    }

    hasFlag("DSTabsPagination").then((hasFlag) => {
      if (!hasFlag) {
        //TODO: when flag is removed transfer buttons to render() function
        this.buttons = html`
          <div class="mb-14 w-fit flex overflow-hidden rounded">
            ${this.tabsCaptions.map(
              (v, i) =>
                html`<button
                  class="${i == 0
                    ? "bg-yellow-400 text-neutral-900"
                    : "border-l border-neutral-300 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-700 dark:text-white"} py-2.5 px-4 flex items-center transition-colors duration-300 text-sm font-medium"
                  type="button"
                  data-tab="tab${i}"
                  @click=${this.tabChange.bind(this)}
                >
                  ${v}
                </button>`,
            )}
          </div>
        `;

        for (let i = 0; i < this.tabsCaptions.length; i++) {
          this.currentPages.push(0);
        }

        this.querySelectorAll(`[slot*="tab"]`).forEach((el, i) => {
          const datasources = el.querySelectorAll(`wt-datasource`);
          const datasourcesTotal = datasources.length;
          if (datasourcesTotal > pageLength) {
            const pagesAmount = Math.ceil(datasourcesTotal / pageLength);
            let pagesButtons: TemplateResult<1>[] = [];
            for (let j = 0; j < pagesAmount; j++) {
              pagesButtons.push(html`
                <button
                  type="button"
                  data-tab="tab${i}"
                  data-page="${j}"
                  class="${j == 0
                    ? "rounded-l bg-yellow-400 text-neutral-900"
                    : "border-l border-neutral-300 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-700 dark:text-white"} ${j ==
                  pagesAmount - 1
                    ? "rounded-r"
                    : ""} py-2.5 px-4 flex items-center transition-colors duration-300 text-sm font-medium"
                  @click=${this.pageChange.bind(this)}
                >
                  ${j + 1}
                </button>
              `);
            }
            const pagesButtonsBlock = html`
              <div class="mt-3 w-full flex justify-end">${pagesButtons}</div>
            `;
            render(pagesButtonsBlock, el as HTMLElement);

            datasources.forEach((element, index) => {
              if (index >= pageLength) {
                element.classList.add("hidden");
              }
            });
          }
        });
      }
    });
  }

  async updated() {
    if ((await hasFlag("organizing_notebooks")) && this.doUpdate) {
      for (const cell of this.cells) {
        const slotElement: HTMLSlotElement | null | undefined =
          this.shadowRoot?.querySelector(`slot[name="${cell.type}"]`);
        if (slotElement) {
          for (let elk of inputs(
            slotElement.assignedElements({ flatten: true }),
          )) {
            for (const data of cell.data) {
              if (data.name !== "key" && data.name === elk.name) {
                elk.value = data.value;
              }
            }
          }
        }
      }
    }
    this.doUpdate = false;
  }

  get slots() {
    return this._slottedChildren("wt-datasource");
  }

  setAlert() {
    const alert = new Alert("danger", "Please save created datasource first");
    alert.open();
    return alert.render();
  }

  select(e) {
    if (!this.newCellFlag) {
      this.newCellFlag = true;
      this.cells = [...this.cells, { type: e.target.value }];
    } else {
      this.isAlert = true;
    }
  }

  tabChange(e: Event) {
    const tab = (e.target as HTMLElement).dataset.tab;

    this.querySelectorAll(`[slot*="tab"]`).forEach((el) => {
      el.classList.remove("fade-in");
      el.classList.add("fade-out");
      el.classList.remove("active");
    });
    this.querySelector(`[slot="${tab}"]`)?.classList.add("active", "fade-in");
    this.querySelector(`[slot="${tab}"]`)?.classList.remove(
      "hidden",
      "fade-out",
    );

    this.setButtonActive(e);
  }

  pageChange(e) {
    const tab = (e.target as HTMLElement).dataset.tab;
    const page = parseInt((e.target as HTMLElement).dataset.page!);

    this.querySelectorAll(`[slot="${tab}"] wt-datasource`).forEach((el, i) => {
      if (i < (page + 1) * pageLength && i >= page * pageLength) {
        el.classList.remove("hidden", "fade-out");
        el.classList.add("fade-in");
      } else {
        el.classList.remove("fade-in");
        el.classList.add("fade-out");
      }
    });

    this.setButtonActive(e);
  }

  setButtonActive(e) {
    e.target.parentNode.querySelectorAll("button").forEach((el) => {
      el.classList.remove("bg-yellow-400", "text-neutral-900");
      el.classList.add(
        "bg-neutral-200",
        "dark:bg-neutral-700",
        "dark:text-white",
      );
    });
    e.target.classList.add("bg-yellow-400", "text-neutral-900");
    e.target.classList.remove(
      "bg-neutral-200",
      "dark:bg-neutral-700",
      "dark:text-white",
    );
  }

  render() {
    let newCells: any[] = [];
    // let buttons: any;
    for (const cell of this.cells) {
      newCells.push(html`<slot name="${cell.type}"></slot>`);
    }

    return html`
      <div class="p-14 dark:bg-neutral-900 mb-8">
        ${this.buttons}

        <div class="relative">
          ${map(
            range(this.tabsCaptions.length),
            (i) => html`<slot name="tab${i}"></slot>`,
          )}
        </div>

        <div class="mb-4 flex items-center gap-x-6">
          <p class="mb-0 dark:text-white text-xl font-light">
            Connect another source
          </p>
          <slot name="select" @change=${this.select.bind(this)}></slot>
        </div>

        ${newCells}
        ${when(this.isAlert, this.setAlert.bind(this), () => {
          return html``;
        })}
      </div>
    `;
  }
}

customElements.define("wt-datasource-list", DatasourceList);
