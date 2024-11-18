export const triggerDownload = (url: string, filename?: string) => {
  var a = document.createElement("a");
  a.href = url;
  a.download = filename || "";
  document.body.appendChild(a);
  a.click();
  a.remove();
};
export const downloadFromContent = async (
  filename: string,
  filecontent: string,
) => {
  const blob = new File([filecontent], filename);
  var url = window.URL.createObjectURL(blob);
  triggerDownload(url, filename);
};
