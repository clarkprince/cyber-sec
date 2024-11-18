import { html, svg } from "lit";
import { when } from "lit/directives/when.js";
import { createRef, ref } from "lit/directives/ref.js";
import TWElement from "./tw";
import { Alert } from "./alert";
import { dispatchDatasourceChange } from "./datasource-events";
import { inputs } from "../utils/inputs";
import { hasFlag } from "../utils/flags";
const icons = {
    pencil: svg `<path d="M3.45872 12.2841C3.49443 12.2841 3.53015 12.2805 3.56586 12.2752L6.56943 11.7484C6.60515 11.7412 6.63908 11.7252 6.66408 11.6984L14.2337 4.12874C14.2503 4.11222 14.2634 4.0926 14.2724 4.071C14.2813 4.0494 14.2859 4.02624 14.2859 4.00285C14.2859 3.97946 14.2813 3.95631 14.2724 3.9347C14.2634 3.9131 14.2503 3.89348 14.2337 3.87696L11.2659 0.907316C11.2319 0.873387 11.1873 0.85553 11.1391 0.85553C11.0909 0.85553 11.0462 0.873387 11.0123 0.907316L3.44265 8.47696C3.41586 8.50374 3.39979 8.53589 3.39265 8.5716L2.86586 11.5752C2.84849 11.6708 2.8547 11.7693 2.88395 11.862C2.91319 11.9547 2.9646 12.0389 3.03372 12.1073C3.15158 12.2216 3.29979 12.2841 3.45872 12.2841ZM4.66229 9.16982L11.1391 2.69482L12.448 4.00374L5.97122 10.4787L4.38372 10.7591L4.66229 9.16982ZM14.5712 13.7841H1.42836C1.11229 13.7841 0.856934 14.0395 0.856934 14.3555V14.9984C0.856934 15.077 0.921219 15.1412 0.999791 15.1412H14.9998C15.0784 15.1412 15.1426 15.077 15.1426 14.9984V14.3555C15.1426 14.0395 14.8873 13.7841 14.5712 13.7841Z"/>`,
    arrow: svg `<path d="M14.6427 3.42871H13.3034C13.2123 3.42871 13.1266 3.47335 13.073 3.54657L7.99981 10.5394L2.92659 3.54657C2.87302 3.47335 2.78731 3.42871 2.69624 3.42871H1.35695C1.24088 3.42871 1.17302 3.56085 1.24088 3.6555L7.53731 12.3359C7.76588 12.6501 8.23374 12.6501 8.46052 12.3359L14.757 3.6555C14.8266 3.56085 14.7587 3.42871 14.6427 3.42871Z"/>`,
    check: svg `<path d="M5 13L9 17L19 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    socket: svg `<path d="M23.9316 1.31519L22.6845 0.067672C22.6374 0.0205959 22.5786 0 22.5168 0C22.455 0 22.3962 0.0235382 22.3492 0.067672L20.1108 2.30673C19.1377 1.64723 17.9889 1.29561 16.8135 1.29754C15.3075 1.29754 13.8016 1.87128 12.6515 3.0217L9.65425 6.01986C9.61046 6.0641 9.58589 6.12384 9.58589 6.1861C9.58589 6.24835 9.61046 6.3081 9.65425 6.35233L17.6459 14.3465C17.693 14.3935 17.7518 14.4141 17.8136 14.4141C17.8724 14.4141 17.9342 14.3906 17.9812 14.3465L20.9785 11.3483C23.0051 9.31813 23.2433 6.17874 21.6932 3.88967L23.9316 1.65061C24.0228 1.55645 24.0228 1.4064 23.9316 1.31519ZM19.5608 9.93306L17.8136 11.6808L12.3191 6.18463L14.0663 4.43692C14.7987 3.7043 15.7752 3.29827 16.8135 3.29827C17.8518 3.29827 18.8254 3.70136 19.5608 4.43692C20.2931 5.16955 20.6991 6.14638 20.6991 7.18499C20.6991 8.22361 20.2931 9.1975 19.5608 9.93306ZM13.9663 13.0224C13.9221 12.9786 13.8623 12.9541 13.8001 12.9541C13.7379 12.9541 13.6781 12.9786 13.6339 13.0224L11.675 14.982L9.01892 12.3251L10.9808 10.3626C11.072 10.2714 11.072 10.1214 10.9808 10.0302L9.91015 8.95918C9.86592 8.91537 9.8062 8.8908 9.74396 8.8908C9.68172 8.8908 9.622 8.91537 9.57778 8.95918L7.61589 10.9217L6.3511 9.65649C6.32914 9.63451 6.30298 9.61719 6.27417 9.60556C6.24536 9.59393 6.2145 9.58824 6.18344 9.58882C6.12462 9.58882 6.06285 9.61236 6.01579 9.65649L3.02148 12.6547C0.994886 14.6848 0.756636 17.8242 2.30673 20.1133L0.0683574 22.3523C0.0245658 22.3966 0 22.4563 0 22.5186C0 22.5808 0.0245658 22.6406 0.0683574 22.6848L1.31549 23.9323C1.36256 23.9794 1.42138 24 1.48315 24C1.54492 24 1.60375 23.9765 1.65081 23.9323L3.88918 21.6933C4.88042 22.367 6.03344 22.7025 7.18645 22.7025C8.69243 22.7025 10.1984 22.1287 11.3485 20.9783L14.3457 17.9801C14.4369 17.8889 14.4369 17.7389 14.3457 17.6477L13.0809 16.3825L15.0428 14.42C15.134 14.3288 15.134 14.1787 15.0428 14.0875L13.9663 13.0224ZM9.93074 19.566C9.57074 19.928 9.1426 20.215 8.67106 20.4104C8.19952 20.6058 7.69392 20.7059 7.18351 20.7047C6.14521 20.7047 5.17162 20.3016 4.43628 19.566C4.07444 19.2059 3.78753 18.7776 3.59215 18.306C3.39677 17.8343 3.29678 17.3285 3.29797 16.8179C3.29797 15.7793 3.70094 14.8054 4.43628 14.0699L6.18344 12.3222L11.6779 17.8183L9.93074 19.566Z"/>`,
    // when copying from Figma, be careful to remove irrelevant fill
    delete: svg `
        <path d="M17 5.70001H1C0.901509 5.70001 0.803982 5.68061 0.712987 5.64292C0.621993 5.60523 0.539314 5.54999 0.46967 5.48034C0.400026 5.4107 0.344781 5.32802 0.30709 5.23703C0.269399 5.14603 0.25 5.0485 0.25 4.95001C0.25 4.85152 0.269399 4.75399 0.30709 4.663C0.344781 4.57201 0.400026 4.48933 0.46967 4.41968C0.539314 4.35004 0.621993 4.29479 0.712987 4.2571C0.803982 4.21941 0.901509 4.20001 1 4.20001H17C17.1989 4.20001 17.3897 4.27903 17.5303 4.41968C17.671 4.56033 17.75 4.7511 17.75 4.95001C17.75 5.14892 17.671 5.33969 17.5303 5.48034C17.3897 5.621 17.1989 5.70001 17 5.70001Z" />
        <path d="M13.44 17.75H4.56C4.24309 17.7717 3.92503 17.7302 3.62427 17.628C3.3235 17.5259 3.04601 17.365 2.80788 17.1548C2.56975 16.9446 2.37572 16.6891 2.23704 16.4034C2.09836 16.1176 2.01779 15.8071 2 15.49V4.99998C2 4.80107 2.07902 4.61031 2.21967 4.46965C2.36032 4.329 2.55109 4.24998 2.75 4.24998C2.94891 4.24998 3.13968 4.329 3.28033 4.46965C3.42098 4.61031 3.5 4.80107 3.5 4.99998V15.49C3.5 15.9 3.97 16.25 4.5 16.25H13.38C13.94 16.25 14.38 15.9 14.38 15.49V4.99998C14.38 4.78516 14.4653 4.57913 14.6172 4.42723C14.7691 4.27532 14.9752 4.18998 15.19 4.18998C15.4048 4.18998 15.6109 4.27532 15.7628 4.42723C15.9147 4.57913 16 4.78516 16 4.99998V15.49C15.9822 15.8071 15.9016 16.1176 15.763 16.4034C15.6243 16.6891 15.4303 16.9446 15.1921 17.1548C14.954 17.365 14.6765 17.5259 14.3757 17.628C14.075 17.7302 13.7569 17.7717 13.44 17.75ZM13.56 4.74998C13.4611 4.75133 13.363 4.73285 13.2714 4.69563C13.1798 4.65842 13.0966 4.60323 13.0267 4.53331C12.9568 4.4634 12.9016 4.38018 12.8644 4.28858C12.8271 4.19698 12.8087 4.09885 12.81 3.99998V2.50998C12.81 2.09999 12.33 1.74998 11.81 1.74998H6.22C5.67 1.74998 5.22 2.09999 5.22 2.50998V3.99998C5.22 4.1989 5.14098 4.38966 5.00033 4.53031C4.85968 4.67097 4.66891 4.74998 4.47 4.74998C4.27109 4.74998 4.08032 4.67097 3.93967 4.53031C3.79902 4.38966 3.72 4.1989 3.72 3.99998V2.50998C3.75872 1.8813 4.04203 1.29275 4.50929 0.87035C4.97655 0.447951 5.5906 0.225271 6.22 0.249985H11.78C12.4145 0.217172 13.0362 0.436204 13.51 0.859437C13.9838 1.28267 14.2713 1.87586 14.31 2.50998V3.99998C14.3113 4.09931 14.2929 4.19792 14.2558 4.29007C14.2187 4.38222 14.1637 4.46608 14.0939 4.53679C14.0241 4.6075 13.941 4.66364 13.8493 4.70195C13.7577 4.74027 13.6593 4.75999 13.56 4.75998V4.74998Z"/>
        <path d="M7.21997 14C7.02186 13.9974 6.8326 13.9175 6.6925 13.7774C6.55241 13.6373 6.47256 13.4481 6.46997 13.25V8.71997C6.46997 8.52106 6.54899 8.33029 6.68964 8.18964C6.83029 8.04899 7.02106 7.96997 7.21997 7.96997C7.41888 7.96997 7.60965 8.04899 7.7503 8.18964C7.89095 8.33029 7.96997 8.52106 7.96997 8.71997V13.24C7.9713 13.3393 7.95287 13.4379 7.91578 13.5301C7.87868 13.6222 7.82364 13.7061 7.75387 13.7768C7.68409 13.8475 7.60096 13.9036 7.50931 13.9419C7.41766 13.9803 7.31931 14 7.21997 14Z"/>
        <path d="M10.78 14C10.5811 14 10.3904 13.921 10.2497 13.7803C10.109 13.6396 10.03 13.4489 10.03 13.25V8.71997C10.03 8.52106 10.109 8.33029 10.2497 8.18964C10.3904 8.04899 10.5811 7.96997 10.78 7.96997C10.9789 7.96997 11.1697 8.04899 11.3104 8.18964C11.451 8.33029 11.53 8.52106 11.53 8.71997V13.24C11.53 13.4398 11.4513 13.6316 11.311 13.7739C11.1706 13.9161 10.9799 13.9973 10.78 14Z"/>`,
    replace: svg `<path d="M0.78125 15.4063H3.01719C3.17188 15.4063 3.29844 15.2797 3.29844 15.125V6.14962H21.882V8.70196C21.882 8.76876 21.9031 8.83204 21.9453 8.88478C21.969 8.91514 21.9985 8.94052 22.032 8.95944C22.0655 8.97837 22.1025 8.99047 22.1407 8.99504C22.179 8.99962 22.2177 8.99658 22.2548 8.9861C22.2918 8.97562 22.3265 8.95791 22.3566 8.93399L27.3945 4.97892C27.5457 4.80313 27.5211 4.61681 27.3945 4.51485L22.3566 0.563291C22.3048 0.521821 22.2402 0.499474 22.1738 0.500009C22.0121 0.500009 21.8785 0.633603 21.8785 0.795322V3.34767H3.0207C1.63203 3.34767 0.5 4.4797 0.5 5.87188V15.125C0.5 15.2797 0.626562 15.4063 0.78125 15.4063ZM27.2188 12.5938H24.9828C24.8281 12.5938 24.7016 12.7203 24.7016 12.875V21.8504H6.11797V19.2981C6.11797 19.2313 6.09688 19.168 6.05469 19.1152C6.031 19.0849 6.00154 19.0595 5.968 19.0406C5.93446 19.0217 5.89751 19.0096 5.85927 19.005C5.82104 19.0004 5.78227 19.0034 5.74521 19.0139C5.70816 19.0244 5.67354 19.0421 5.64336 19.066L0.605469 23.0211C0.454297 23.1969 0.478906 23.3832 0.605469 23.4852L5.64336 27.4367C5.69609 27.4789 5.75938 27.5 5.82617 27.5C5.98789 27.5 6.12148 27.3664 6.12148 27.2047V24.6524H24.9863C26.375 24.6524 27.507 23.5203 27.507 22.1281V12.875C27.5 12.7203 27.3734 12.5938 27.2188 12.5938Z"/>`,
};
const colorMap = {
    // NOTE: tailwind class have to appear explicitely at some point
    // otherwise they won't be included in the bundle
    // hence the "bg-" prefix
    blue: "bg-sky-600",
    green: "bg-lime-600",
    "orange-600": "bg-orange-600",
    "orange-500": "bg-orange-500",
    "orange-300": "bg-orange-300",
};
class DatasourceCard extends TWElement {
    constructor() {
        super();
        this.slotFormElement = createRef();
        this.isColourChanged = false;
        this.isExpanded = false;
        this.isTested = -1;
        this.isAlert = false;
        this.alertMessage = "";
        this.height = 0;
    }
    connectedCallback() {
        super.connectedCallback();
        // put new datasources in edit mode
        if (!this.key) {
            this.isEdited = true;
        }
        if (this.isEdited) {
            this.isExpanded = true;
        }
        window.addEventListener("load", () => {
            this.height = this.offsetHeight;
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("load", () => {
            this.height = this.offsetHeight;
        });
    }
    async firstUpdated() {
        this.hasOrganizingNotebooks = await hasFlag("organizing_notebooks");
    }
    setAlert() {
        const alert = new Alert("danger", this.alertMessage);
        alert.open();
        return alert.render();
    }
    replace() {
        let data = new Array();
        for (const elt of inputs(this.slotFormElement.value.assignedElements({ flatten: true }))) {
            if (!elt.reportValidity()) {
                continue;
            }
            data.push({ name: elt.name, value: elt.value });
        }
        dispatchDatasourceChange(JSON.stringify(data), this);
    }
    defaultView() {
        const pencilSvg = html `<svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      class="dark:fill-white"
    >
      ${icons.pencil}
    </svg>`;
        const replaceSvg = html `<svg
      width="20"
      height="20"
      viewBox="0 0 32 32"
      class="dark:fill-white"
    >
      ${icons.replace}
    </svg>`;
        const deleteSvg = html `<svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      class="dark:fill-white"
    >
      ${icons.delete}
    </svg>`;
        const arrowSvg = html `<svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      class="dark:fill-white"
    >
      ${icons.arrow}
    </svg>`;
        let rotateClass = "";
        if (this.isExpanded) {
            rotateClass = "rotate-180";
        }
        const replaceBtn = html `<button
      type="button"
      class="py-1 bg-transparent border-0"
      @click=${this.replace}
    >
      ${replaceSvg}
    </button>`;
        return html `
      <div class="min-w-0 grow flex justify-between">
        <slot name="configs">
          <div class="text-center m-2 w-full text-xs italic">
            New datasource, click the edit button to connect
          </div>
        </slot>

        <!-- bring in scope inputs from back-end -->
        <slot ${ref(this.slotFormElement)} name="form" class="hidden"></slot>

        <div class="flex flex-col justify-between items-center mr-2.5">
          <div class="flex flex-col">
            <button
              type="button"
              class="mt-1.5 py-1 bg-transparent border-0"
              aria-label="Edit datasource"
              @click=${this.edit.bind(this)}
            >
              ${pencilSvg}
            </button>
            <button
              type="button"
              name="action"
              value="delete"
              class="py-1 bg-transparent border-0"
              @click=${(e) => {
            e.stopPropagation();
            this.submit(e);
        }}
            >
              ${deleteSvg}
            </button>
            ${this.hasOrganizingNotebooks ? replaceBtn : ""}
          </div>

          <button
            type="button"
            class="${rotateClass} ${this.height < 96
            ? "hidden"
            : ""} py-1 transition-transform duration-300 bg-transparent border-0"
            @click=${(e) => {
            e.stopPropagation();
            this.isExpanded = !this.isExpanded;
        }}
          >
            ${arrowSvg}
          </button>
        </div>
      </div>
    `;
    }
    edit(e) {
        e.stopPropagation();
        this.isEdited = !this.isEdited;
        this.isExpanded = true;
    }
    editView() {
        const checkSvg = html `<svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      ${icons.check}
    </svg>`;
        const socketSvg = html `<svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      class="dark:fill-white"
    >
      ${icons.socket}
    </svg>`;
        let testClass = "";
        switch (this.isTested) {
            case 0: {
                testClass = "bg-red-600";
                break;
            }
            case 1: {
                testClass = "bg-green-600";
                break;
            }
            default: {
                testClass = "bg-neutral-100";
            }
        }
        return html `
      <form class="min-w-0 grow flex justify-between">
        <slot ${ref(this.slotFormElement)} name="form"></slot>

        <div class="p-3 flex flex-col">
          <button
            type="submit"
            name="action"
            value="save"
            title="Save"
            class="mb-2 p-0 bg-yellow-400 border-0 rounded"
            @click="${this.submit.bind(this)}"
          >
            ${checkSvg}
          </button>

          <div class="flex relative">
            <button
              type="submit"
              name="action"
              value="test"
              title="Test"
              class="p-0.5 bg-transparent border-0"
              @click="${this.submit.bind(this)}"
            >
              ${socketSvg}
            </button>

            <span
              class="${testClass} h-2 w-2 block absolute -bottom-1 -right-1 z-20 rounded"
            ></span>
          </div>
        </div>

        ${when(this.isAlert, this.setAlert.bind(this), () => {
            return html ``;
        })}
      </form>
    `;
    }
    async submit(e) {
        e.preventDefault();
        e.stopPropagation();
        let action = e.currentTarget.value;
        // form data does not pass the slotted barriers
        let data = new FormData();
        if (action === "delete") {
            if (!confirm("Are you sure you want to delete this datasource?")) {
                return;
            }
        }
        data.append("action", action);
        data.append("color", this.color);
        // @ts-ignore
        for (const elt of inputs(this.slotFormElement.value.assignedElements({ flatten: true }))) {
            if (!elt.reportValidity()) {
                console.error("invalid input");
                return;
            }
            data.append(elt.name, elt.value);
        }
        const rsp = await fetch("/api/datasource", {
            method: "POST",
            body: data,
        }).then((r) => r.json());
        switch (action) {
            case "save": {
                this.isEdited = false;
                // force server-side refresh
                window.location.reload();
                break;
            }
            case "test": {
                if (rsp.Result == "ok") {
                    this.isTested = 1;
                    this.alertMessage = "";
                    this.isAlert = false;
                }
                else {
                    this.isTested = 0;
                    this.alertMessage = rsp.Message;
                    this.isAlert = true;
                }
                break;
            }
            case "delete": {
                window.location.reload();
                break;
            }
        }
    }
    render() {
        let colourButtons = [];
        for (const [color, colorDisplay] of Object.entries(colorMap)) {
            colourButtons.push(html `
        <button
          data-testid="color-select-${color}"
          type="button"
          value="save"
          class="h-6 w-6 ${colorDisplay} border-0"
          @click=${(e) => {
                this.color = color;
                this.isColourChanged = false;
                this.submit(e);
            }}
        ></button>
      `);
        }
        let heightClass = "";
        if (this.isExpanded) {
            heightClass = "max-h-128";
        }
        else {
            heightClass = "max-h-24";
        }
        return html `
      <div
        role="listitem"
        class="${heightClass} flex relative overflow-hidden transition-all duration-300 rounded dark:bg-neutral-600 dark:text-white"
        aria-label="Datasource ${this.key}"
      >
        <button
          data-testid="change-color"
          aria-label="Change color"
          type="button"
          class="w-5 shrink-0 ${colorMap[this.color || "blue"]} border-0"
          @click=${(e) => {
            e.stopPropagation();
            this.isColourChanged = true;
        }}
        ></button>

        ${when(this.isColourChanged, () => {
            return html `<div
            id="color-choice-menu"
            class="py-2.5 px-3 absolute top-3 left-3 z-20 flex gap-x-2 bg-white border border-zinc-100 dark:bg-neutral-700"
          >
            ${colourButtons}
          </div>`;
        })}
        ${when(this.isEdited, this.editView.bind(this), this.defaultView.bind(this))}
      </div>
    `;
    }
}
DatasourceCard.properties = {
    color: { type: String },
    isEdited: { type: Boolean, attribute: "edited" },
    isColourChanged: { state: true },
    isExpanded: { state: true },
    isTested: { state: true },
    key: { type: String },
    type: { type: String },
    isAlert: { type: Boolean },
    alertMessage: { type: String },
    height: { state: true },
};
customElements.define("wt-datasource", DatasourceCard);
//# sourceMappingURL=datasource.js.map