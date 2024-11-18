// part of experiment on dedicated Web worker for WASM
// https://www.notion.so/trout-software/Running-Go-in-Web-Worker-c51e753f406c48679e61e0c8c2502fe5?pvs=4
const WASM_URL = '/assets/rxnb.wasm'; // per server configuration
const gomod = WebAssembly.compileStreaming(fetch(WASM_URL));
self.onmessage = (msg) => {
};
//# sourceMappingURL=datacell-worker.js.map