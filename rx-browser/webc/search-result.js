import { css, html } from "lit";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import schema from "./editor-schema";
import TWElement from "./tw";
const prosestyle = css `
.ProseMirror {
  position: relative;
  padding: 8px;

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

.ProseMirror-hideselection *::selection { background: transparent; }
.ProseMirror-hideselection *::-moz-selection { background: transparent; }
.ProseMirror-hideselection { caret-color: transparent; }

.ProseMirror-selectednode {
  outline: 2px solid #8cf;
}
`;
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
];
class SearchResult extends TWElement {
    constructor() {
        super();
        this.firstUpdated = () => {
            this.readExistingData();
        };
        this.edstate = EditorState.create({ plugins: plugins, schema: schema, });
        const that = this;
        this.view = new EditorView(this, {
            state: this.edstate,
            dispatchTransaction(tr) {
                that.edstate = that.edstate.apply(tr);
            },
            editable: () => false,
        });
    }
    doCommand(cmd) {
        cmd(this.edstate, this.view.dispatch);
    }
    applyStyle(type) {
        this.doCommand(toggleMark(type));
        this.view.focus();
    }
    // @ts-ignore
    async readExistingData() {
        const response = await fetch(`/api/notebook/editor?action=read&notebook=${this.notebook}`);
        let content = await response.json();
        let doc = schema.nodeFromJSON(content);
        this.edstate = EditorState.create({ doc });
    }
    render() {
        this.view.updateState(this.edstate);
        return html `
      <div class="relative dark:text-neutral-200">
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
customElements.define('wt-search-result', SearchResult);
//# sourceMappingURL=search-result.js.map