let flags = null;
let singleflight = null;
async function fetchFlags() {
    if (singleflight !== null) {
        return await singleflight;
    }
    const res = () => { };
    singleflight = new Promise(res);
    const rsp = (await fetch("/info", { method: "HEAD" })).headers.get("X-Feature-Flags") || "";
    flags = {};
    for (const f of rsp.split(",")) {
        flags[f] = true;
    }
    res();
}
export async function hasFlag(name) {
    if (!flags) {
        await fetchFlags();
    }
    return name in flags;
}
export async function listFlags() {
    if (!flags) {
        await fetchFlags();
    }
    return flags;
}
//# sourceMappingURL=flags.js.map