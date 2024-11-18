/**
 * Split class string to allow using "classList.add"
 * @example "foo  bar hello " => ["foo", "bar", "hello"]
 */
export function splitClasses(className) {
    return className.split(" ").map(c => c && c.trim()).filter(c => !!c);
}
/**
 * Merge classes
 * Falsies won't be rendered
 * @example clsx("foo bar", condition && "some-class")
 */
export function clsx(...classNames) {
    return classNames.map(c => c && c.trim()).filter(c => !!c).join(" ");
}
//# sourceMappingURL=classNames.js.map