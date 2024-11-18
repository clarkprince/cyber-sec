import { css, html } from "lit";
import TWElement from './tw';
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import schema from "./editor/schema";
const prosestyle = css `
.ProseMirror {
  position: relative;
  padding: 8px;
  height: 100%;
  overflow: auto;

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
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror ol, .ProseMirror ul {
  margin-bottom: 8px;
  /* space for numbering */
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
class FrameworkEditor extends TWElement {
    constructor() {
        super();
        this.firstUpdated = async () => {
            this.readFrameworkData();
            const editorContent = this.renderRoot.querySelector(".ProseMirror");
            if (!editorContent)
                throw new Error("ProseMirror element not found, can't add event listeners");
            editorContent.addEventListener("blur", this.saveFrameworkData);
        };
        this.readFrameworkData = async () => {
            const response = await fetch(`/api/framework/editor?action=read&framework=${this.framework}`);
            let content = await response.json();
            let doc = schema.nodeFromJSON(content);
            this.edstate = EditorState.create({ doc });
        };
        this.saveFrameworkData = async () => {
            const content = JSON.stringify(this.edstate.doc.toJSON());
            await fetch(`/api/framework/editor?action=save&framework=${this.framework}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: content,
            });
        };
        this.edstate = EditorState.create({ schema: schema });
        this.view = new EditorView(this, {
            state: this.edstate,
            editable: () => true,
        });
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
FrameworkEditor.properties = {
    framework: { type: String },
    edstate: { state: true },
};
FrameworkEditor.styles = [prosestyle, css `{position: static}`];
customElements.define('wt-framework-editor', FrameworkEditor);
//# sourceMappingURL=framework-editor.js.map