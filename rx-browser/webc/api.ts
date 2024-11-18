import { Playbook, SavedPivot, User } from "./models";
import { notify } from "./notification";

export const emptyUlid = Array(26).fill("0").join("");

/**
 * @returns null in case of error
 */
export async function fetchPivot(id: string): Promise<SavedPivot | null> {
  const params = new URLSearchParams();
  params.append("action", "read");
  params.append("pivot", id);
  try {
    const pivot = await fetch("/api/pivot?" + params.toString()).then((r) =>
      r.json(),
    );
    return pivot;
  } catch (err) {
    console.error(`Error: could not fetch pivot ${id}`);
    return null;
  }
}

export async function fetchUser(id: string): Promise<User | null> {
  throw new Error("not yet implemented");
}

export async function fetchNotebook(ID: string): Promise<Playbook | null> {
  const r = await fetch("/api/notebook?action=read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ID }),
  });
  if (r.status !== 200) {
    notify(
      ID,
      "the notebook could not be retrieved, retrying usually helps",
      true,
    );
    return null;
  }
  try {
    const notebook: Partial<Playbook> = await r.json();
    // API may omit empty fields, add relevant default values
    if (!notebook.Cells) {
      notebook.Cells = [];
    }
    if (!notebook.Title) {
      notebook.Title = "";
    }
    return notebook as Playbook;
  } catch (err) {
    console.error("Could not read response");
  }
  return null;
}
