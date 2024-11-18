// filesAttach returns the stream of file items attached to a drop event.
// depending on the browser, we automatically migrate from items to files.
// cf https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
export function filesAttached(ev) {
    if (!ev.dataTransfer)
        return [];
    if (ev.dataTransfer.items) {
        return [...ev.dataTransfer.items]
            .filter((item) => item.kind === "file")
            .map((item) => item.getAsFile())
            .filter((f) => !!f); // TS not infering filter
    }
    else {
        // Use DataTransfer interface to access the file(s)
        return [...ev.dataTransfer.files];
    }
}
export async function uploadFile(e, notebook) {
    e.preventDefault();
    e.stopPropagation();
    const [file] = filesAttached(e);
    if (!file) {
        console.error("No data on file");
        throw new Error("No file data");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    const res = await fetch(`/api/datasource?action=save&type=upload&title=${file.name}&notebook=${notebook}`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        console.error(`Error uploading file: ${res.statusText}`);
        throw new Error(`Failed to upload file: ${res.statusText}`);
    }
    const data = await res.json();
    return { dataSource: data.Streams[0], title: file.name };
}
//# sourceMappingURL=file-upload.js.map