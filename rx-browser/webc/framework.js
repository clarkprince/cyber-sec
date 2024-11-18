import { html, nothing } from "lit";
import TWElement from "./tw";
import { notify } from "./notification";
class Framework extends TWElement {
    constructor() {
        super();
        this.framework = null;
        this.firstUpdated = () => {
            this.getFramework();
        };
    }
    async getFramework() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        if (id) {
            const r = await fetch("/api/framework?action=read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            if (r.status !== 200) {
                notify(id, "the framework could not be retrieved", true);
                return null;
            }
            try {
                this.framework = await r.json();
            }
            catch (err) {
                console.error("Could not read response");
            }
            return null;
        }
        return null;
    }
    getPlaybooks() {
        if (!this.framework) {
            return html ``;
        }
        let playbooks = nothing;
        playbooks = this.framework.Playbooks.map((fwp) => {
            return html `
        <li
          class="mt-4 py-2.5 px-4 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800"
        >
          <div class="flex group">
            <input
              type="checkbox"
              class="mr-4 ml-2"
              value="${fwp.ID}"
              name="notebooks"
              .checked=${fwp.IsFramework}
            />
            <a href="/notebook/${fwp.ID}" target="_blank" class="font-medium">
              ${fwp.Title ? fwp.Title : `Event - ${new Date(fwp.Created)}`}
            </a>
          </div>

          <div class="flex group">
            <p class="mr-8 flex items-center text-sm font-light">
              <svg
                width="18"
                viewBox="0 0 24 24"
                class="mr-2 fill-none stroke-neutral-900 dark:stroke-neutral-100"
              >
                <path
                  d="M5 20C5 17.5 7 15.6 9.4 15.6H14.5C17 15.6 18.9 17.6 18.9 20M15 5.2C16.7 6.9 16.7 9.6 15 11.2C13.3 12.8 10.6 12.9 9 11.2C7.4 9.5 7.3 6.8 9 5.2C10.7 3.6 13.3 3.6 15 5.2Z"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>${fwp.Owner.Name}</span>
            </p>
            <p class="mr-8 flex items-center text-sm font-light">
              <svg
                width="17"
                viewBox="0 0 17 18"
                class="mr-2 fill-neutral-900 stroke-neutral-900 dark:fill-neutral-100 dark:stroke-neutral-100"
              >
                <path
                  d="M12.2949 2.7791V2.77965H15.4824C15.818 2.77965 16.089 3.05072 16.089 3.38624V15.9845C16.089 16.32 15.818 16.591 15.4824 16.591H1.51815C1.18264 16.591 0.911569 16.32 0.911569 15.9845V3.38624C0.911569 3.05072 1.18264 2.77965 1.51815 2.77965H4.70565V2.7791H4.70621V1.56481C4.70621 1.48164 4.77427 1.41358 4.85744 1.41358H5.91994C6.00311 1.41358 6.07117 1.48164 6.07117 1.56481V2.7791H6.07173V2.77965H10.9289V2.7791H10.9294V1.56481C10.9294 1.48164 10.9975 1.41358 11.0807 1.41358H12.1432C12.2263 1.41358 12.2944 1.48164 12.2944 1.56481V2.7791H12.2949ZM2.27708 15.2255V15.2261H14.7235V15.2255H14.7241V8.0157H14.7235V8.01515H2.27708V8.0157H2.27652V15.2255H2.27708ZM2.27708 4.14517H2.27652V6.72553H2.27708V6.72608H14.7235V6.72553H14.7241V4.14517H14.7235V4.14461H12.2949V4.14517H12.2944V5.05588C12.2944 5.13906 12.2263 5.20711 12.1432 5.20711H11.0807C10.9975 5.20711 10.9294 5.13906 10.9294 5.05588V4.14517H10.9289V4.14461H6.07173V4.14517H6.07117V5.05588C6.07117 5.13906 6.00311 5.20711 5.91994 5.20711H4.85744C4.77427 5.20711 4.70621 5.13906 4.70621 5.05588V4.14517H4.70565V4.14461H2.27708V4.14517Z"
                  stroke-width="0.00111607"
                />
              </svg>
              <span>Last Edit ${fwp.Created}</span>
            </p>
          </div>
        </li>
      `;
        });
        return html `${playbooks}`;
    }
    render() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get("action");
        if (action === "create") {
            return html `<slot name="new"></slot>`;
        }
        else if (action === "edit") {
            if (!this.framework) {
                return html ``;
            }
            return html `
        <div
          class="px-3 py-1 min-w-0 flex flex-col justify-between my-6 mx-6 pb-8 border-b border-solid dark:border-neutral-600"
        >
          <form action="/api/framework?action=save" method="post">
            <input type="hidden" name="id" value="${this.framework?.ID}" />
            <input
              type="hidden"
              name="owner"
              value="${this.framework?.Owner.ID}"
            />
            <input
              type="text"
              name="title"
              class="w-full text-xl px-4 py-3 border-none bg-transparent text-neutral-900 dark:text-neutral-200 dark:border dark:border-neutral-700 dark:hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none"
              placeholder="Title"
              value="${this.framework?.Title}"
              required
            />

            <ul class="pb-8 max-h-full overflow-y-auto">
              ${this.getPlaybooks()}
            </ul>

            <div class="flex items-center justify-end">
              <a href="/frameworks">
                <button
                  class="py-3 px-4 bg-gray-600 rounded text-neutral-200 text-sm font-medium mr-2 w-36 text-center"
                  type="button"
                >
                  Cancel
                </button>
              </a>
              <button
                class="py-3 px-4 bg-yellow-400 rounded text-neutral-900 text-sm font-medium w-36 text-center"
                type="submit"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      `;
        }
    }
}
Framework.properties = {
    framework: { state: true },
};
customElements.define("wt-framework", Framework);
//# sourceMappingURL=framework.js.map