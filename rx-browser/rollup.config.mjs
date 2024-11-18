import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import minifyHTML from "rollup-plugin-minify-html-literals";

/** @type {import('rollup').RollupOptions} */
export default {
    output: {
        format: "es",
        sourcemap: "inline"
    },
    plugins:
        [
            // minifyHTML is needed because Prosemirror doesn't tolerate spacing in Lit component HTML templates
            minifyHTML.default({ options: { minifyOptions: { removeComments: false, keepClosingSlash: true } } }),
            resolve(), commonjs(), json(),
        ]
};