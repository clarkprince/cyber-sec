export default function debounce(f, timeoutMS) {
    let lastcall;
    return (...args) => {
        // not yet called || called a while ago
        if (!lastcall || lastcall + timeoutMS < performance.now()) {
            lastcall = performance.now();
            window.setTimeout(() => f(...args), timeoutMS);
        }
    };
}
//# sourceMappingURL=debounce.js.map