import { css, html, svg, nothing } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { classMap } from "lit/directives/class-map.js";
import { baseKeymap, setBlockType, toggleMark, } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import schema from "./notebook-editor-schema";
import TWElement from "./tw";
import { FocusStatus, MouseStatus } from "./notebook-editor-controllers";
import { acceptPivotDrop, insertPivot } from "./notebook-editor-pivot";
import { dropCursor } from "prosemirror-dropcursor";
const pathes = {
    "strong": svg `<path d="M16.9768 11.6829C17.8768 10.7454 18.4286 9.4784 18.4286 8.08555V7.81233C18.4286 4.93019 16.0687 2.5918 13.1598 2.5918H5.23393C4.82946 2.5918 4.5 2.92126 4.5 3.32573V21.5159C4.5 21.9525 4.85357 22.3061 5.29018 22.3061H13.8268C16.9607 22.3061 19.5 19.7829 19.5 16.6677V16.373C19.5 14.4177 18.4982 12.6954 16.9768 11.6829ZM7.07143 5.16323H13.0902C14.6196 5.16323 15.8571 6.35251 15.8571 7.82305V8.07751C15.8571 9.54537 14.617 10.7373 13.0902 10.7373H7.07143V5.16323ZM16.8911 16.665C16.8911 18.3498 15.5062 19.7159 13.7973 19.7159H7.07143V13.3248H13.7973C15.5062 13.3248 16.8911 14.6909 16.8911 16.3757V16.665Z"/>`,
    "em": svg `<path d="M19.6609 3.07227H8.08949C7.97163 3.07227 7.8752 3.16869 7.8752 3.28655V5.00084C7.8752 5.11869 7.97163 5.21512 8.08949 5.21512H12.9431L8.76449 19.7866H4.41984C4.30199 19.7866 4.20556 19.883 4.20556 20.0008V21.7151C4.20556 21.833 4.30199 21.9294 4.41984 21.9294H15.9913C16.1091 21.9294 16.2056 21.833 16.2056 21.7151V20.0008C16.2056 19.883 16.1091 19.7866 15.9913 19.7866H10.9931L15.1716 5.21512H19.6609C19.7788 5.21512 19.8752 5.11869 19.8752 5.00084V3.28655C19.8752 3.16869 19.7788 3.07227 19.6609 3.07227Z"/>`,
    "underline": svg `<path d="M20.3578 20.3231H3.64347C3.52561 20.3231 3.42918 20.4142 3.42918 20.5267V22.1552C3.42918 22.2677 3.52561 22.3588 3.64347 22.3588H20.3578C20.4756 22.3588 20.572 22.2677 20.572 22.1552V20.5267C20.572 20.4142 20.4756 20.3231 20.3578 20.3231ZM12.0006 18.2874C13.8595 18.2874 15.606 17.5615 16.9238 16.2463C18.2417 14.9311 18.9649 13.182 18.9649 11.3231V2.96596C18.9649 2.78917 18.8203 2.64453 18.6435 2.64453H17.0363C16.8595 2.64453 16.7149 2.78917 16.7149 2.96596V11.3231C16.7149 13.9213 14.5988 16.0374 12.0006 16.0374C9.4024 16.0374 7.28633 13.9213 7.28633 11.3231V2.96596C7.28633 2.78917 7.14168 2.64453 6.9649 2.64453H5.35776C5.18097 2.64453 5.03633 2.78917 5.03633 2.96596V11.3231C5.03633 13.182 5.76222 14.9285 7.0774 16.2463C8.39258 17.5642 10.1417 18.2874 12.0006 18.2874Z"/>`,
    "title": svg `<path d="M22.9284 9.92941H14.7855C14.6677 9.92941 14.5712 10.0258 14.5712 10.1437V13.1437C14.5712 13.2616 14.6677 13.358 14.7855 13.358H16.0712C16.1891 13.358 16.2855 13.2616 16.2855 13.1437V11.6437H17.8927V20.2151H16.6605C16.5427 20.2151 16.4462 20.3116 16.4462 20.4294V21.7151C16.4462 21.833 16.5427 21.9294 16.6605 21.9294H21.0534C21.1712 21.9294 21.2677 21.833 21.2677 21.7151V20.4294C21.2677 20.3116 21.1712 20.2151 21.0534 20.2151H19.8212V11.6437H21.4284V13.1437C21.4284 13.2616 21.5248 13.358 21.6427 13.358H22.9284C23.0462 13.358 23.1427 13.2616 23.1427 13.1437V10.1437C23.1427 10.0258 23.0462 9.92941 22.9284 9.92941ZM15.8569 6.71512V3.28655C15.8569 3.16869 15.7605 3.07227 15.6426 3.07227H1.07122C0.953362 3.07227 0.856934 3.16869 0.856934 3.28655V6.71512C0.856934 6.83298 0.953362 6.92941 1.07122 6.92941H2.57122C2.68908 6.92941 2.78551 6.83298 2.78551 6.71512V5.00084H7.28551V20.0008H4.82122C4.70336 20.0008 4.60693 20.0973 4.60693 20.2151V21.7151C4.60693 21.833 4.70336 21.9294 4.82122 21.9294H11.8926C12.0105 21.9294 12.1069 21.833 12.1069 21.7151V20.2151C12.1069 20.0973 12.0105 20.0008 11.8926 20.0008H9.42836V5.00084H13.9284V6.71512C13.9284 6.83298 14.0248 6.92941 14.1426 6.92941H15.6426C15.7605 6.92941 15.8569 6.83298 15.8569 6.71512Z"/>`,
    "ordered_list": svg `<path d="M22.9298 19.1445H7.28691C7.16905 19.1445 7.07262 19.241 7.07262 19.3588V20.8588C7.07262 20.9767 7.16905 21.0731 7.28691 21.0731H22.9298C23.0476 21.0731 23.1441 20.9767 23.1441 20.8588V19.3588C23.1441 19.241 23.0476 19.1445 22.9298 19.1445ZM22.9298 3.93025H7.28691C7.16905 3.93025 7.07262 4.02667 7.07262 4.14453V5.64453C7.07262 5.76239 7.16905 5.85882 7.28691 5.85882H22.9298C23.0476 5.85882 23.1441 5.76239 23.1441 5.64453V4.14453C23.1441 4.02667 23.0476 3.93025 22.9298 3.93025ZM22.9298 11.5374H7.28691C7.16905 11.5374 7.07262 11.6338 7.07262 11.7517V13.2517C7.07262 13.3695 7.16905 13.466 7.28691 13.466H22.9298C23.0476 13.466 23.1441 13.3695 23.1441 13.2517V11.7517C23.1441 11.6338 23.0476 11.5374 22.9298 11.5374ZM4.07262 17.8588H0.96548C0.906552 17.8588 0.858337 17.907 0.858337 17.966V18.8767C0.858337 18.9356 0.906552 18.9838 0.96548 18.9838H2.90477V19.5329H1.94852C1.88959 19.5329 1.84137 19.5811 1.84137 19.6401V20.5508C1.84137 20.6097 1.88959 20.6579 1.94852 20.6579H2.90477V21.2338H0.96548C0.906552 21.2338 0.858337 21.282 0.858337 21.341V22.2517C0.858337 22.3106 0.906552 22.3588 0.96548 22.3588H4.07262C4.13155 22.3588 4.17977 22.3106 4.17977 22.2517V17.966C4.17977 17.907 4.13155 17.8588 4.07262 17.8588ZM0.96548 3.8231H1.98334V7.03739C1.98334 7.09632 2.03155 7.14453 2.09048 7.14453H3.16191C3.22084 7.14453 3.26905 7.09632 3.26905 7.03739V2.85882C3.26905 2.74096 3.17262 2.64453 3.05477 2.64453H0.96548C0.906552 2.64453 0.858337 2.69275 0.858337 2.75167V3.71596C0.858337 3.77489 0.906552 3.8231 0.96548 3.8231ZM4.07262 10.2517H0.96548C0.906552 10.2517 0.858337 10.2999 0.858337 10.3588V11.3231C0.858337 11.382 0.906552 11.4302 0.96548 11.4302H2.79762L0.914587 13.5115C0.879071 13.5514 0.859104 13.6027 0.858337 13.6561V14.6445C0.858337 14.7035 0.906552 14.7517 0.96548 14.7517H4.07262C4.13155 14.7517 4.17977 14.7035 4.17977 14.6445V13.6802C4.17977 13.6213 4.13155 13.5731 4.07262 13.5731H2.24048L4.12352 11.4919C4.15903 11.452 4.179 11.4006 4.17977 11.3472V10.3588C4.17977 10.2999 4.13155 10.2517 4.07262 10.2517Z"/>`,
    "bullet_list": svg `<path d="M22.7151 3.93025H7.07227C6.95441 3.93025 6.85798 4.02667 6.85798 4.14453V5.64453C6.85798 5.76239 6.95441 5.85882 7.07227 5.85882H22.7151C22.833 5.85882 22.9294 5.76239 22.9294 5.64453V4.14453C22.9294 4.02667 22.833 3.93025 22.7151 3.93025ZM22.7151 11.5374H7.07227C6.95441 11.5374 6.85798 11.6338 6.85798 11.7517V13.2517C6.85798 13.3695 6.95441 13.466 7.07227 13.466H22.7151C22.833 13.466 22.9294 13.3695 22.9294 13.2517V11.7517C22.9294 11.6338 22.833 11.5374 22.7151 11.5374ZM22.7151 19.1445H7.07227C6.95441 19.1445 6.85798 19.241 6.85798 19.3588V20.8588C6.85798 20.9767 6.95441 21.0731 7.07227 21.0731H22.7151C22.833 21.0731 22.9294 20.9767 22.9294 20.8588V19.3588C22.9294 19.241 22.833 19.1445 22.7151 19.1445ZM1.07227 4.89453C1.07227 5.09151 1.11106 5.28657 1.18645 5.46856C1.26183 5.65054 1.37232 5.8159 1.51161 5.95519C1.65089 6.09448 1.81625 6.20497 1.99824 6.28035C2.18023 6.35573 2.37528 6.39453 2.57227 6.39453C2.76925 6.39453 2.9643 6.35573 3.14629 6.28035C3.32828 6.20497 3.49364 6.09448 3.63293 5.95519C3.77221 5.8159 3.8827 5.65054 3.95809 5.46856C4.03347 5.28657 4.07227 5.09151 4.07227 4.89453C4.07227 4.69755 4.03347 4.50249 3.95809 4.32051C3.8827 4.13852 3.77221 3.97316 3.63293 3.83387C3.49364 3.69458 3.32828 3.58409 3.14629 3.50871C2.9643 3.43333 2.76925 3.39453 2.57227 3.39453C2.37528 3.39453 2.18023 3.43333 1.99824 3.50871C1.81625 3.58409 1.65089 3.69458 1.51161 3.83387C1.37232 3.97316 1.26183 4.13852 1.18645 4.32051C1.11106 4.50249 1.07227 4.69755 1.07227 4.89453ZM1.07227 12.5017C1.07227 12.6987 1.11106 12.8937 1.18645 13.0757C1.26183 13.2577 1.37232 13.423 1.51161 13.5623C1.65089 13.7016 1.81625 13.8121 1.99824 13.8875C2.18023 13.9629 2.37528 14.0017 2.57227 14.0017C2.76925 14.0017 2.9643 13.9629 3.14629 13.8875C3.32828 13.8121 3.49364 13.7016 3.63293 13.5623C3.77221 13.423 3.8827 13.2577 3.95809 13.0757C4.03347 12.8937 4.07227 12.6987 4.07227 12.5017C4.07227 12.3047 4.03347 12.1096 3.95809 11.9276C3.8827 11.7457 3.77221 11.5803 3.63293 11.441C3.49364 11.3017 3.32828 11.1912 3.14629 11.1159C2.9643 11.0405 2.76925 11.0017 2.57227 11.0017C2.37528 11.0017 2.18023 11.0405 1.99824 11.1159C1.81625 11.1912 1.65089 11.3017 1.51161 11.441C1.37232 11.5803 1.26183 11.7457 1.18645 11.9276C1.11106 12.1096 1.07227 12.3047 1.07227 12.5017ZM1.07227 20.1088C1.07227 20.3058 1.11106 20.5009 1.18645 20.6828C1.26183 20.8648 1.37232 21.0302 1.51161 21.1695C1.65089 21.3088 1.81625 21.4193 1.99824 21.4946C2.18023 21.57 2.37528 21.6088 2.57227 21.6088C2.76925 21.6088 2.9643 21.57 3.14629 21.4946C3.32828 21.4193 3.49364 21.3088 3.63293 21.1695C3.77221 21.0302 3.8827 20.8648 3.95809 20.6828C4.03347 20.5009 4.07227 20.3058 4.07227 20.1088C4.07227 19.9118 4.03347 19.7168 3.95809 19.5348C3.8827 19.3528 3.77221 19.1874 3.63293 19.0482C3.49364 18.9089 3.32828 18.7984 3.14629 18.723C2.9643 18.6476 2.76925 18.6088 2.57227 18.6088C2.37528 18.6088 2.18023 18.6476 1.99824 18.723C1.81625 18.7984 1.65089 18.9089 1.51161 19.0482C1.37232 19.1874 1.26183 19.3528 1.18645 19.5348C1.11106 19.7168 1.07227 19.9118 1.07227 20.1088Z"/>`,
    "colour": svg `<path d="M28.2221 27.3293C29.9779 27.3293 31.4122 25.8748 31.4122 24.0949C31.4122 21.9454 28.2221 18.4378 28.2221 18.4378C28.2221 18.4378 25.0319 21.9454 25.0319 24.0949C25.0319 25.8748 26.4663 27.3293 28.2221 27.3293ZM13.0707 25.5574C13.356 25.8427 13.818 25.8427 14.0993 25.5574L24.389 15.2717C24.6743 14.9864 24.6743 14.5244 24.389 14.2431L14.1033 3.95741C14.0792 3.9333 14.0511 3.9092 14.023 3.88911L10.881 0.747142C10.8125 0.679519 10.7201 0.641602 10.6238 0.641602C10.5276 0.641602 10.4352 0.679519 10.3667 0.747142L8.43813 2.67571C8.37051 2.74422 8.33259 2.8366 8.33259 2.93286C8.33259 3.02911 8.37051 3.1215 8.43813 3.19L11.1381 5.89L2.78902 14.2431C2.50375 14.5284 2.50375 14.9904 2.78902 15.2717L13.0707 25.5574ZM13.589 7.5333L20.777 14.7213H6.40509L13.589 7.5333ZM33.7506 30.2101H2.25063C2.07384 30.2101 1.9292 30.3547 1.9292 30.5315V33.7458C1.9292 33.9226 2.07384 34.0672 2.25063 34.0672H33.7506C33.9274 34.0672 34.0721 33.9226 34.0721 33.7458V30.5315C34.0721 30.3547 33.9274 30.2101 33.7506 30.2101Z"/>`
};
const icons = {
    "strong": html `<svg width="16" height="16" viewBox="0 0 24 25">${pathes.strong}</svg>`,
    "em": html `<svg width="16" height="16" viewBox="0 0 24 25">${pathes.em}</svg>`,
    "underline": html `<svg width="16" height="16" viewBox="0 0 24 25">${pathes.underline}</svg>`,
    "title": html `<svg width="16" height="16" viewBox="0 0 24 25">${pathes.title}</svg>`,
    "ordered_list": html `<svg width="16" height="16" viewBox="0 0 24 25">${pathes.ordered_list}</svg>`,
    "bullet_list": html `<svg width="16" height="16" viewBox="0 0 24 25">${pathes.bullet_list}</svg>`,
    "colour": html `<svg width="16" height="16" viewBox="0 0 36 36">${pathes.colour}</svg>`
};
const prosestyle = css `
.ProseMirror {
  position: relative;
  padding: 8px;
  height: 100%;

  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror pre {
  white-space: pre-wrap;
}

.ProseMirror li {
  position: relative;
}

.ProseMirror-hideselection *::selection { background: transparent; }
.ProseMirror-hideselection *::-moz-selection { background: transparent; }
.ProseMirror-hideselection { caret-color: transparent; }

.ProseMirror-selectednode {
  outline: 2px solid #8cf;
}

/* Make sure li selections wrap around markers */

li.ProseMirror-selectednode {
  outline: none;
}

li.ProseMirror-selectednode:after {
  content: "";
  position: absolute;
  left: -32px;
  right: -2px; top: -2px; bottom: -2px;
  border: 2px solid #8cf;
  pointer-events: none;
}

/* Protect against generic img rules */

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
}

.ProseMirror ul {
  list-style-type: disc;
  padding-left: 30px;
}

.ProseMirror ol {
  list-style-type: decimal;
  padding-left: 30px;
}

.ProseMirror h1 {
  font-size: 32px;
}

.ProseMirror h2 {
  font-size: 28px;
}

.ProseMirror h3 {
  font-size: 24px;
}
`;
const menu_machine = {
    nomenu: 0,
    tooltip: 1,
    size: 2,
    link: 3,
    color: 4,
};
const plugins = [
    history(),
    keymap({
        ...baseKeymap,
        "Mod-z": undo,
        "Mod-y": redo,
        "Mod-b": toggleMark(schema.marks.strong),
        "Mod-i": toggleMark(schema.marks.em),
        "Mod-u": toggleMark(schema.marks.underline),
    }),
    dropCursor({
        class: "bg-yellow-400",
        // @see https://github.com/ProseMirror/prosemirror-dropcursor/pull/17
        //color: null,
        color: "rgb(250 204 21)",
        width: 4
    })
];
class Editor extends TWElement {
    constructor() {
        super();
        this.focusStatus = new FocusStatus(this);
        this.mouseStatus = new MouseStatus(this);
        this.tooltip = createRef();
        this.firstUpdated = () => {
            this.loadEditorContent();
        };
        this.handleBlur = (evt) => {
            this.saveNotebookEditor();
        };
        this.positionTooltip = () => {
            if (!this.tooltip.value) {
                console.log("no tooltip ref yet");
                return;
            }
            const coord_from = this.view.coordsAtPos(this.edstate.selection.from);
            const coord_this = this.getBoundingClientRect();
            const left = coord_from.left - coord_this.left;
            const top = coord_from.top - coord_this.top - 5;
            this.tooltip.value.style.setProperty("top", `${top}px`);
            this.tooltip.value.style.setProperty("left", `${left}px`);
        };
        /**
         * Initialize the view with actual content
         * if it fails, view will stay non-editable
         */
        this.loadEditorContent = async () => {
            const state = await this.readExistingData();
            if (!state) {
                // we keep the initial dummy view, that is not editable
                return;
            }
            this.edstate = state;
            const that = this;
            this.view.update({
                state: this.edstate,
                dispatchTransaction(tr) {
                    that.edstate = that.edstate.apply(tr);
                },
            });
            this.view.editable = true;
            // there is no rerender before this step =>
            // it's important that "this.view" stays the same object as the one from constructor
            // otherwise the blur event will be tied to an element that will disappear on ntext render
            const editorContent = this.renderRoot.querySelector(".ProseMirror");
            if (!editorContent)
                throw new Error("ProseMirror element not found, can't add event listeners");
            editorContent.addEventListener("blur", this.handleBlur);
        };
        this.showmenu = menu_machine.nomenu;
        this.showFontSizeMenu = false;
        this.initEditor();
        this.addEventListener("drop", (e) => {
            if (!acceptPivotDrop(e)) {
                return;
            }
            this.doCommand(insertPivot(e));
        });
    }
    /**
     * Initialize with a dummy state and non-editable view,
     * in order to have prose-mirror view in the DOM
     */
    initEditor() {
        this.edstate = EditorState.create({ schema });
        this.view = new EditorView(null, {
            state: this.edstate,
            nodeViews: {
            // not sure if needed, can allow interaction with the pill on click
            // could be useful to allow one click removal?
            //pill(node) { return new PillView(node) }
            }
        });
        this.view.editable = false;
    }
    willUpdate() {
        const hasHighlight = this.mouseStatus.isup
            && !this.edstate.selection.empty
            && this.focusStatus.hasfocus;
        // @ts-ignore
        if (hasHighlight) {
            this.showmenu = menu_machine.tooltip;
        }
        else {
            this.showmenu = menu_machine.nomenu;
            this.showFontSizeMenu = false;
            this.showColourMenu = false;
        }
    }
    updated() {
        this.positionTooltip();
    }
    doCommand(cmd) {
        cmd(this.edstate, this.view.dispatch);
    }
    applyStyle(type) {
        this.doCommand(toggleMark(type));
        // give the focus back to ProseMirror
        // => needed so it can update the current selection
        // TODO: we sould not lose focus in the first place? or maybe it can't be avoided with buttons?
        // other lit users/prose mirror users don't seem to experience this issue with buttons...
        // @see https://github.com/ProseMirror/prosemirror/issues/1097
        this.view.focus();
    }
    toggleList(type) {
        const innerNode = this.edstate.selection.$from.node(1);
        if (innerNode && this.isList(innerNode)) {
            this.doCommand(liftListItem(schema.nodes.list_item));
        }
        else {
            this.doCommand(wrapInList(type));
        }
    }
    isList(node) {
        return node.type === schema.nodes.bullet_list || node.type === schema.nodes.ordered_list;
    }
    toggleFontSizeMenu() {
        this.showAddLinkMenu = false;
        this.showColourMenu = false;
        this.showFontSizeMenu = !this.showFontSizeMenu;
    }
    makeHeadline(level) {
        if (level === 0) {
            this.doCommand(setBlockType(schema.nodes.paragraph));
        }
        else {
            this.doCommand(setBlockType(schema.nodes.heading, { level }));
        }
    }
    changeColour(mt) {
        for (const mark of [schema.marks.colour_red, schema.marks.colour_yellow, schema.marks.colour_green, schema.marks.colour_black, schema.marks.colour_white]) {
            if (mt == mark) {
                this.doCommand(toggleMark(mt));
            }
            else {
                if (this.markInSelection(mark)) {
                    this.doCommand(toggleMark(mark));
                }
            }
        }
    }
    toggleLink(e) {
        e.stopImmediatePropagation();
        let attrs = {};
        if (!this.markInSelection(schema.marks.link)) {
            attrs = { href: this.linkValue };
        }
        this.doCommand(toggleMark(schema.marks.link, attrs));
        this.linkValue = '';
        this.showAddLinkMenu = false;
    }
    setLinkValue(event) {
        this.linkValue = event.target.value;
    }
    toggleAddLinkMenu() {
        this.showFontSizeMenu = false;
        this.showColourMenu = false;
        this.showAddLinkMenu = !this.showAddLinkMenu;
    }
    toggleColourMenu() {
        this.showAddLinkMenu = false;
        this.showFontSizeMenu = false;
        this.showColourMenu = !this.showColourMenu;
    }
    markInSelection(mt) {
        let { doc, selection } = this.edstate;
        return doc.rangeHasMark(selection.from, selection.to, mt);
    }
    nodeInSelection(node) {
        const node1 = this.edstate.selection.$from.node(1);
        if (!node1) {
            // TODO: fixme, can reproduce by pressing ctrl+a
            // @see https://www.notion.so/trout-software/PKG-highlighting-all-with-ctrl-a-will-not-display-the-right-button-as-focused-8f6f31952bf440a7b283a26803c199d7?pvs=4
            console.warn("no node(1)");
        }
        return node1?.type == node;
    }
    headingInSelection(level) {
        const attrs = this.edstate.selection.$from.node(this.edstate.selection.$from.depth).attrs;
        if (attrs) {
            if (attrs.level)
                return attrs.level == level;
            else
                return level == 0;
        }
        else
            return false;
    }
    saveNotebookEditor() {
        fetch(`/api/notebook/editor?action=save&notebook=${this.notebook}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.edstate.doc.toJSON()),
        });
    }
    /**
     * Return saved editor state or a new one
     */
    async readExistingData() {
        const commonOpts = { plugins };
        const response = await fetch(`/api/notebook/editor?action=read&notebook=${this.notebook}`);
        if (!response.ok) {
            console.warn("Warning: we couldn't load the text editor content from server, an unexpected error has occurred. Please try to refresh the page.");
            return null;
        }
        else if (response.status === 204) {
            // no content, initialize with schema
            return EditorState.create({ ...commonOpts, schema: schema, });
        }
        else {
            // previously saved content, initialize with previous state
            try {
                let content = await response.json();
                // TODO: if the document nodes cannot be parsed, display just as text? even if corrupted it's better than nothing?
                let doc = schema.nodeFromJSON(content);
                return EditorState.create({ ...commonOpts, doc });
            }
            catch (err) {
                console.warn("Warning: we found saved text editor content but it is not in a valid format. We will remove this content. Error:", err);
                // /!\ this will delete existing data
                return EditorState.create({ ...commonOpts });
            }
        }
    }
    render() {
        this.view.updateState(this.edstate);
        let tooltip = nothing;
        const buttons = [];
        const btn_class = "h-8 w-8 flex items-center justify-center aria-selected:fill-sky-300 dark:fill-neutral-200 dark:aria-selected:fill-sky-600 first:rounded-l";
        // bold/italic/underline
        for (const mt of [schema.marks.strong, schema.marks.em, schema.marks.underline]) {
            buttons.push(html `
          <button class=${btn_class}
                  aria-selected=${this.markInSelection(mt)}
                  @click="${(ev) => { ev.stopImmediatePropagation(); this.applyStyle(mt); }}">
            ${icons[mt.name]}
          </button>
      `);
        }
        // colour
        buttons.push(html `
      <button class=${btn_class} @click="${() => this.toggleColourMenu()}">
        ${icons["colour"]}
      </button>
    `);
        // titles
        buttons.push(html `
      <button class=${btn_class} @click="${() => this.toggleFontSizeMenu()}">
        ${icons["title"]}
      </button>
    `);
        for (const mt of [schema.nodes.bullet_list, schema.nodes.ordered_list]) {
            buttons.push(html `
          <button class=${btn_class}
                  aria-selected=${this.nodeInSelection(mt)}
                  @click="${() => this.toggleList(mt)}">
            ${icons[mt.name]}
          </button>
      `);
        }
        const color_buttons = [
            [schema.marks.colour_red, "text-qualitative-red", "Red"],
            [schema.marks.colour_yellow, "text-qualitative-yellow", "Yellow"],
            [schema.marks.colour_green, "text-qualitative-green", "Green"],
            [schema.marks.colour_black, "text-zinc-800", "Black"],
            [schema.marks.colour_white, "text-neutral-200", "White"],
        ].map(([mark, col, name]) => html `<li class="mb-1">
    <button class="px-2 py-0.5 h-full rounded-t"
            aria-selected=${this.markInSelection(mark)}
            @click="${() => this.changeColour(mark)}">
            <span class="px-0.5 mr-1 border border-zinc-300 dark:border-neutral-400 rounded-sm ${col}">A</span> ${name}
    </button>
    </li>`);
        const titles = [
            [1, "Heading 1"],
            [2, "Heading 2"],
            [3, "Heading 3"],
            [0, "Text"],
        ].map(([level, name]) => html `<li class="mb-1">
    <button class="px-2 py-0.5 w-full rounded-t text-left"
            aria-selected=${this.headingInSelection(level)}
            @click="${() => this.makeHeadline(level)}">
      ${name}
    </button>
    </li>`);
        // mounting the tooltip but making it invisible with CSS
        // allows to compute the right dimension on first render
        // and thus to position it cleanly when it appears
        tooltip = html `
      <div
          ${ref(this.tooltip)}
          id="wt-editor-tooltip"
          class=${classMap({
            "flex absolute z-20 -translate-y-full border bg-zinc-100 dark:bg-neutral-700 border-zinc-300 dark:border-neutral-400 rounded-sm": true,
            "invisible": this.showmenu != menu_machine.tooltip
        })}>
        ${buttons}
        <ul class=${classMap({
            "list-none pl-0 mb-0 absolute top-full left-24 z-20 translate-y-2.5 bg-zinc-100 dark:bg-neutral-700 border-zinc-300 dark:border-neutral-400 rounded-sm": true,
            "invisible": this.showmenu != menu_machine.tooltip || !this.showColourMenu
        })}>
          ${color_buttons}
        </ul>
      
        <ul class=${classMap({
            "list-none pl-0 mb-0 absolute top-full left-24 z-20 translate-y-2.5 bg-zinc-100 dark:bg-neutral-700 border-zinc-300 dark:border-neutral-400 rounded-sm": true,
            "invisible": this.showmenu != menu_machine.tooltip || !this.showFontSizeMenu
        })}>
          ${titles}
          </ul>
      </div>
    `;
        // The slot is needed to correctly display the dropCursor
        return html `
        ${tooltip}
        ${this.view.dom}
        <slot></slot>
    `;
    }
}
Editor.properties = {
    notebook: { type: String },
    showmenu: { state: true, type: Number },
    // Tracking the editor state tells Lit to render after a ProseMirror transaction
    edstate: { state: true },
    showFontSizeMenu: { state: true },
    showColourMenu: { state: true }
};
Editor.styles = [prosestyle, css `{position: static}`];
customElements.define('wt-editor', Editor);
//# sourceMappingURL=notebook-editor.js.map