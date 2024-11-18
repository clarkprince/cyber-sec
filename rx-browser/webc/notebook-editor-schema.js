import { Schema } from "prosemirror-model";
import { pivotNodes } from "./notebook-editor-pivot";
const getAttributes = (dom) => {
    const result = {};
    const attributes = dom.attributes;
    let attr;
    for (let i = 0; i < attributes.length; i++) {
        attr = attributes[i];
        result[attr.name] = attr.value;
    }
    return result;
};
const commonAttributes = () => {
    return {
        style: { default: null },
        class: { default: null },
        id: { default: null },
    };
};
const hasAttrs = (attrs, exclude) => {
    for (const attr in attrs) {
        if (attr && attrs[attr] !== null && attr !== exclude) {
            return true;
        }
    }
    return false;
};
const getAttrs = (attrs, exclude) => {
    const result = {};
    for (const attr in attrs) {
        if (attr && attrs[attr] !== null && attr !== exclude) {
            result[attr] = attrs[attr];
        }
    }
    return result;
};
const tagMark = (tag) => {
    // https://prosemirror.net/docs/ref/#model.MarkSpec
    return {
        [tag]: {
            name: tag,
            inclusive: true,
            parseDOM: [{ tag: tag }],
            toDOM: () => [tag, hole],
        },
    };
};
const hole = 0;
export { getAttributes, commonAttributes, hasAttrs, getAttrs, tagMark, hole };
const nodes = {
    doc: { content: "block+" },
    paragraph: {
        content: "inline*",
        group: "block",
        parseDOM: [{ tag: "p" }],
        toDOM() { return ["p", 0]; }
    },
    blockquote: {
        content: "block+",
        group: "block",
        defining: true,
        parseDOM: [{ tag: "blockquote" }],
        toDOM() { return ["blockquote", 0]; }
    },
    heading: {
        attrs: { level: { default: 1 } },
        content: "inline*",
        group: "block",
        defining: true,
        parseDOM: [{ tag: "h1", attrs: { level: 1 } },
            { tag: "h2", attrs: { level: 2 } },
            { tag: "h3", attrs: { level: 3 } }],
        toDOM(node) { return ["h" + node.attrs.level, 0]; }
    },
    text: { group: "inline" },
    // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
    // `alt`, and `href` attributes. The latter two default to the empty
    // string.
    image: {
        inline: true,
        attrs: {
            src: {},
            alt: { default: null },
            title: { default: null }
        },
        group: "inline",
        draggable: true,
        parseDOM: [{
                tag: "img[src]", getAttrs(dom) {
                    return {
                        src: dom.getAttribute("src"),
                        title: dom.getAttribute("title"),
                        alt: dom.getAttribute("alt")
                    };
                }
            }],
        toDOM(node) { let { src, alt, title } = node.attrs; return ["img", { src, alt, title }]; }
    },
    hard_break: {
        inline: true,
        group: "inline",
        selectable: false,
        parseDOM: [{ tag: "br" }],
        toDOM() { return ["br"]; }
    },
    ordered_list: {
        content: "list_item+",
        group: "block",
        attrs: {
            ...commonAttributes(),
            type: { default: null },
            order: { default: 1 },
        },
        parseDOM: [
            {
                tag: "ol",
                getAttrs: (dom) => {
                    return {
                        ...getAttributes(dom),
                        order: dom.hasAttribute("start")
                            ? parseInt(dom.getAttribute("start") || "1", 10)
                            : 1,
                    };
                },
            },
        ],
        toDOM: (node) => {
            return node.attrs.order === 1
                ? hasAttrs(node.attrs, "order")
                    ? ["ol", getAttrs(node.attrs, "order"), hole]
                    : ["ol", 0]
                : [
                    "ol",
                    { ...getAttrs(node.attrs, "order"), start: node.attrs.order },
                    hole,
                ];
        },
    },
    bullet_list: {
        content: "list_item+",
        group: "block",
        attrs: { ...commonAttributes() },
        parseDOM: [{ tag: "ul", getAttrs: getAttributes }],
        toDOM: (node) => hasAttrs(node.attrs) ? ["ul", getAttrs(node.attrs), hole] : ["ul", 0],
    },
    list_item: {
        content: "block*",
        attrs: { ...commonAttributes() },
        parseDOM: [{ tag: "li", getAttrs: getAttributes }],
        toDOM: (node) => hasAttrs(node.attrs) ? ["li", getAttrs(node.attrs), hole] : ["li", 0],
        defining: true,
    },
    ...pivotNodes
};
const marks = {
    link: {
        attrs: {
            href: {},
            title: { default: null },
            contentEditable: { default: false }
        },
        inclusive: false,
        parseDOM: [{
                tag: "a[href]", getAttrs(dom) {
                    return {
                        contentEditable: dom.getAttribute("contentEditable"),
                        href: dom.getAttribute("href"),
                        title: dom.getAttribute("title"),
                    };
                }
            }],
        toDOM(node) {
            let { contentEditable, href, title } = node.attrs;
            return ["a", { contentEditable, href, title }, 0];
        }
    },
    // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
    // Has parse rules that also match `<i>` and `font-style: italic`.
    em: {
        parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
        toDOM() { return ["em", 0]; }
    },
    // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
    // also match `<b>` and `font-weight: bold`.
    strong: {
        parseDOM: [{ tag: "strong" },
            // This works around a Google Docs misbehavior where
            // pasted content will be inexplicably wrapped in `<b>`
            // tags with a font-weight normal.
            { tag: "b", getAttrs: (node) => node.style.fontWeight != "normal" && null },
            { style: "font-weight", getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }],
        toDOM() { return ["strong", 0]; }
    },
    underline: {
        parseDOM: [{ tag: "u" }],
        toDOM() { return ["u", 0]; }
    },
    colour_red: {
        parseDOM: [{ tag: "span", getAttrs: node => ({ class: node.getAttribute('class') }) }],
        toDOM() { return ["span", { class: `text-qualitative-red` }, 0]; }
    },
    colour_yellow: {
        parseDOM: [{ tag: "span", getAttrs: node => ({ class: node.getAttribute('class') }) }],
        toDOM() { return ["span", { class: `text-qualitative-yellow` }, 0]; }
    },
    colour_green: {
        parseDOM: [{ tag: "span", getAttrs: node => ({ class: node.getAttribute('class') }) }],
        toDOM() { return ["span", { class: `text-qualitative-green` }, 0]; }
    },
    colour_black: {
        parseDOM: [{ tag: "span", getAttrs: node => ({ class: node.getAttribute('class') }) }],
        toDOM() { return ["span", { class: `text-zinc-800` }, 0]; }
    },
    colour_white: {
        parseDOM: [{ tag: "span", getAttrs: node => ({ class: node.getAttribute('class') }) }],
        toDOM() { return ["span", { class: `text-neutral-200` }, 0]; }
    },
};
export default new Schema({ nodes, marks });
//# sourceMappingURL=notebook-editor-schema.js.map