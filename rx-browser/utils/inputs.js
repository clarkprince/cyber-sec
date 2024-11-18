// inputs lists all valid inputs elements in the form
// this is needed since slotted elements are not returned in form
export function* inputs(elements) {
    const isValidInput = (e) => e.matches("button,input,output,select,textarea") && 'name' in e && 'value' in e;
    for (const elt of elements) {
        // direct nodes don’t need no tree walking
        if (isValidInput(elt)) {
            yield elt;
            continue;
        }
        const wlk = document.createTreeWalker(elt, NodeFilter.SHOW_ELEMENT, {
            acceptNode(node) {
                if (node instanceof Element && isValidInput(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                else {
                    return NodeFilter.FILTER_SKIP;
                }
            }
        });
        // start at next node, skip root
        let cn = wlk.nextNode();
        while (cn) {
            yield cn;
            cn = wlk.nextNode();
        }
    }
}
//# sourceMappingURL=inputs.js.map