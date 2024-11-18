export const triggerDownload = (url, filename) => {
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "";
    document.body.appendChild(a);
    a.click();
    a.remove();
};
export const downloadFromContent = async (filename, filecontent) => {
    const blob = new File([filecontent], filename);
    var url = window.URL.createObjectURL(blob);
    triggerDownload(url, filename);
};
//# sourceMappingURL=download.js.map