import { css, html } from "lit";
import TWElement from "./tw";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import schema from "./editor/schema";
const prosestyle = css `
  .ProseMirror {
    word-wrap: break-word;
    white-space: normal;
  }

  .ProseMirror pre {
    white-space: pre-wrap;
  }
`;
class AuditEditor extends TWElement {
    constructor() {
        super();
        this.firstUpdated = () => {
            this.readAuditData();
        };
        this.edstate = EditorState.create({ schema: schema });
        this.view = new EditorView(this, {
            state: this.edstate,
            editable: () => false,
        });
    }
    async readAuditData() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        if (!id) {
            return;
        }
        // try {
        //     const response = await fetch(`/api/framework?action=read&id=${id}`);
        //     let content = await response.json();
        //     let doc = schema.nodeFromJSON(content);
        //     this.edstate = EditorState.create({ doc });
        // } catch (error) {
        //     console.error(error);
        // }
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
AuditEditor.properties = {};
AuditEditor.styles = [prosestyle, css `{position: static}`];
customElements.define("wt-audit-editor", AuditEditor);
//# sourceMappingURL=audit-editor.js.map