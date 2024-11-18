import { html, nothing } from "lit";
import TWElement from "./tw";
class Audit extends TWElement {
    constructor() {
        super();
        this.playbooks = [];
    }
    firstUpdated() {
        this.getAudit();
        this.listFrameworkPlaybooks();
    }
    getAudit() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        if (!id) {
            return;
        }
        fetch("/api/framework?action=read&audit=true", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        })
            .then((r) => r.json())
            .then((r) => {
            this.audit = r;
        });
    }
    updateAudit() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        if (!id) {
            return;
        }
        fetch("/api/framework?action=update&audit=true&id=" + id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.audit),
        }).then((r) => {
            if (r.status == 200) {
                window.location.href = "/audits";
            }
        });
    }
    async listFrameworkPlaybooks() {
        const urlParams = new URLSearchParams(window.location.search);
        const framework = urlParams.get("framework");
        if (!framework) {
            return;
        }
        const resp = await fetch("/api/framework?action=list-framework-playbooks&framework=" + framework, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (resp.status == 200) {
            this.playbooks = await resp.json();
        }
    }
    datasourceReplace(playbookId) {
        const ds = document.createElement("wt-datasource-replace");
        ds.setAttribute("notebookId", playbookId);
        ds.setAttribute("isAudit", "true");
        document.body.appendChild(ds);
        // listen for the event to get the new datasource
        ds.addEventListener("replace-datasource", (e) => {
            // update the datasource
            this.updateDatasource(e.detail.notebook);
        });
    }
    updateDatasource(notebook) {
        for (let i = 0; i < this.playbooks.length; i++) {
            if (this.playbooks[i].ID === notebook.ID) {
                const isFw = this.playbooks[i].IsFramework;
                this.playbooks[i] = notebook;
                this.playbooks[i].IsFramework = isFw;
                return;
            }
        }
        this.audit.Playbooks = this.playbooks;
    }
    getPlaybooks() {
        if (!this.playbooks) {
            return html ``;
        }
        let playbooks = nothing;
        playbooks = this.playbooks.map((fwp) => {
            return html `
        <li
          class="mt-4 py-2.5 px-4 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800"
        >
          <div class="flex group items-center">
            <span
              @click="${() => this.datasourceReplace(fwp.ID)}"
              class="flex items-center cursor-pointer"
            >
              <svg
                width="22"
                viewBox="0 0 34 34"
                class="mr-2 fill-neutral-900 dark:fill-neutral-100"
              >
                <path
                  d="M0.78125 15.4063H3.01719C3.17188 15.4063 3.29844 15.2797 3.29844 15.125V6.14962H21.882V8.70196C21.882 8.76876 21.9031 8.83204 21.9453 8.88478C21.969 8.91514 21.9985 8.94052 22.032 8.95944C22.0655 8.97837 22.1025 8.99047 22.1407 8.99504C22.179 8.99962 22.2177 8.99658 22.2548 8.9861C22.2918 8.97562 22.3265 8.95791 22.3566 8.93399L27.3945 4.97892C27.5457 4.80313 27.5211 4.61681 27.3945 4.51485L22.3566 0.563291C22.3048 0.521821 22.2402 0.499474 22.1738 0.500009C22.0121 0.500009 21.8785 0.633603 21.8785 0.795322V3.34767H3.0207C1.63203 3.34767 0.5 4.4797 0.5 5.87188V15.125C0.5 15.2797 0.626562 15.4063 0.78125 15.4063ZM27.2188 12.5938H24.9828C24.8281 12.5938 24.7016 12.7203 24.7016 12.875V21.8504H6.11797V19.2981C6.11797 19.2313 6.09688 19.168 6.05469 19.1152C6.031 19.0849 6.00154 19.0595 5.968 19.0406C5.93446 19.0217 5.89751 19.0096 5.85927 19.005C5.82104 19.0004 5.78227 19.0034 5.74521 19.0139C5.70816 19.0244 5.67354 19.0421 5.64336 19.066L0.605469 23.0211C0.454297 23.1969 0.478906 23.3832 0.605469 23.4852L5.64336 27.4367C5.69609 27.4789 5.75938 27.5 5.82617 27.5C5.98789 27.5 6.12148 27.3664 6.12148 27.2047V24.6524H24.9863C26.375 24.6524 27.507 23.5203 27.507 22.1281V12.875C27.5 12.7203 27.3734 12.5938 27.2188 12.5938Z"
                />
              </svg>
            </span>
            <a href="/notebook/${fwp.ID}" class="font-medium">
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
            return html `<slot name="edit"></slot>`;
        }
        else if (action === "list-framework-playbooks") {
            const id = urlParams.get("id");
            return html `
        <div
          class="my-6 mx-6 pb-8 border-b border-solid dark:border-neutral-600"
        >
          <h3 class="mt-5 text-lg font-medium">Playbooks</h3>
          <ul class="pb-8 max-h-full overflow-y-auto">
            ${this.getPlaybooks()}
          </ul>
          <div class="flex justify-end">
            <a href="/audits?action=delete&audit=true&id=${id}">
              <button
                class="py-3 px-4 bg-gray-600 rounded text-neutral-200 text-sm font-medium mr-2 w-36 text-center"
                type="button"
              >
                Cancel
              </button>
            </a>
            <button
              class="py-3 px-4 bg-yellow-400 rounded text-neutral-900 text-sm font-medium w-36 text-center"
              type="button"
              @click="${() => this.updateAudit()}"
            >
              Save
            </button>
          </div>
        </div>
      `;
        }
    }
}
Audit.properties = {
    playbooks: { state: true },
    audit: { state: true },
};
customElements.define("wt-audit", Audit);
//# sourceMappingURL=audit.js.map