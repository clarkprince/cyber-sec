import { notify } from "./notification";
export const emptyUlid = Array(26).fill("0").join("");
/**
 * @returns null in case of error
 */
export async function fetchPivot(id) {
    const params = new URLSearchParams();
    params.append("action", "read");
    params.append("pivot", id);
    try {
        const pivot = await fetch("/api/pivot?" + params.toString()).then((r) => r.json());
        return pivot;
    }
    catch (err) {
        console.error(`Error: could not fetch pivot ${id}`);
        return null;
    }
}
export async function fetchUser(id) {
    throw new Error("not yet implemented");
}
export async function fetchNotebook(ID) {
    const r = await fetch("/api/notebook?action=read", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ID }),
    });
    if (r.status !== 200) {
        notify(ID, "the notebook could not be retrieved, retrying usually helps", true);
        return null;
    }
    try {
        const notebook = await r.json();
        // API may omit empty fields, add relevant default values
        if (!notebook.Cells) {
            notebook.Cells = [];
        }
        if (!notebook.Title) {
            notebook.Title = "";
        }
        return notebook;
    }
    catch (err) {
        console.error("Could not read response");
    }
    return null;
}
//# sourceMappingURL=api.js.map