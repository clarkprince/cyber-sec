import { test, Page, expect, Locator } from "@playwright/test";

class EditorPage {
    readonly page: Page

    readonly editor: Locator
    readonly tooltip: Locator

    constructor(page: Page) {
        this.page = page
        this.editor = page.locator(".ProseMirror")
        this.tooltip = page.locator("#wt-editor-tooltip")
    }

    async load_notebook(name: string) {
        await this.page.goto(`./components/wt-editor?notebook=${name}`)
        await this.editor.isVisible()
    }

    /**
     * Playwright built-in "editor.clear()"" is not reliable
     * because it keeps blocks around
     * This function is meant at actually emptying the editor
     * 
     * TODO: the fact that "editor.clear()" doesn't clear may be considered a bug?
     * Backspace shortcut will always keep a "<p>" around
     */
    async clearEditor() {
        await this.editor.evaluate(node => node.innerHTML = "")
    }

    tooltipButton(name: "bullet_list" | "ordered_list") {
        // Because the tooltip is floating, the locator has to be tied to the page
        return this.page.getByRole("button", { name })
    }
}


// TODO(rdo) review and fix
test("can load notebook with empty text", async ({ page }) => {
    page.on("pageerror", (err) => {
        expect(false).toBe(true)
        console.log(err.message)
    })
    await page.goto("./components/wt-editor?notebook=empty")
    const editor = page.locator(".ProseMirror")
    await expect(editor).toBeVisible()
    await editor.type("foobar")
    await expect(editor).toHaveText("foobar")
})
test("invalid content is ignored", async ({ page }) => {
    await page.goto("./components/wt-editor?notebook=jsonerror")
    const editor = page.locator(".ProseMirror")
    await expect(editor).toBeVisible()
    await expect(editor).toHaveText("")
})
test("server error is ignored", async ({ page }) => {
    await page.goto("./components/wt-editor?notebook=servererror")
    const editor = page.locator(".ProseMirror")
    await expect(editor).toBeVisible()
    await editor.type("hello\nworld")
    await editor.blur()
    await expect(editor).toHaveText("")
})


test("[editor] edit, format and save", async ({ page }) => {
    const component = new EditorPage(page)
    await component.load_notebook("01GNMNVY822CTQ9Q6SEM9F05H2")

    await test.step("enter initial test, expect save", async () => {
        // TODO: editor.press("Enter") doesn't add content correctly, a focus is perhaps needed?
        await component.editor.type("hello\nworld\n", { delay: 100 })
        const saveReq = page.waitForRequest(/action=save/)
        await component.editor.blur()

        await expect(component.editor).toHaveText("hello\nworld\nfoo\nbar", { useInnerText: true })
        await saveReq
    })

    await test.step("format values", async () => {
        await expect(component.tooltip).not.toBeVisible()
        await component.editor.press("Control+a")
        await expect(component.tooltip).toBeVisible()
    })
})


test("clicking on any button will close submenus", async ({ page }) => {
    await page.goto("./components/wt-editor?notebook=01GNMNVY822CTQ9Q6SEM9F05H2")
    // select some text
    const editor = page.locator(".ProseMirror")
    await editor.press("Control+a")
    const tooltip = page.locator("#wt-editor-tooltip")
    await expect(tooltip).toBeVisible()
    // TODO: tooltip.getByLabel() won't work
    const colorBtn = page.getByLabel(/Change text color/i)
    await expect(colorBtn).toBeVisible()
    await colorBtn.click()
    // TODO: tooltip.locator won't work
    const subMenu = page.locator(".tooltip-submenu")
    await expect(subMenu).toBeVisible()
    const boldBtn = page.getByLabel(/make text strong/i)
    await boldBtn.click()
    await expect(tooltip).toBeVisible()
    await expect(subMenu).not.toBeVisible()
})

/**
 * Reusable paste utility
 * Will paste as "text/plain" unless "text/html" or any other type is specified
 */
async function paste(l: Locator, content: string, type: string = "text/plain") {
    // it's not a closure => arguments must be passed explicitely to "evaluate" and its callback
    await l.evaluate((el, { content, type }) => {
        const text = content;
        const clipboardData = new DataTransfer();
        clipboardData.setData(type, text);
        const clipboardEvent = new ClipboardEvent('paste', {
            clipboardData
        });
        el.dispatchEvent(clipboardEvent);
    }, { content, type });
}
test("pasted html span will be unstyled", async ({ page }) => {
    const editorPage = new EditorPage(page)
    await editorPage.load_notebook("01GNMNVY822CTQ9Q6SEM9F05H2")
    const editor = page.locator(".ProseMirror")
    await editor.clear()
    await paste(editor, `<span>pasted</span>`, "text/html")
    await expect(editor).toHaveText("pasted")
    const h = await editor.innerHTML()
    expect(h).not.toContain("class")
})
test("pasted html span will not keep unused classes", async ({ page }) => {
    const editorPage = new EditorPage(page)
    await editorPage.load_notebook("01GNMNVY822CTQ9Q6SEM9F05H2")
    await editorPage.clearEditor()
    await paste(editorPage.editor, `<span class="whatever text-qualitative-red">pasted</span>`, "text/html")
    await expect(editorPage.editor).toHaveText("pasted")
    const h = await editorPage.editor.innerHTML()
    expect(h).not.toContain("whatever")
    expect(h).toContain("text-qualitative-red")
})

test("markdown shortcuts", async ({ page }) => {
    // spec: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
    function repeat(c: string, nb: number) {
        return Array(nb).fill(c).join('')
    }
    const editorPage = new EditorPage(page)
    await editorPage.load_notebook("01GNMNVY822CTQ9Q6SEM9F05H2")
    await editorPage.clearEditor()

    await test.step("set a valid heading level", async () => {
        for (let level = 1; level <= 6; level++) {
            await editorPage.clearEditor()
            await editorPage.editor.type(repeat("#", level) + " ")
            const editorHtml = await editorPage.editor.innerHTML()
            expect(editorHtml).toMatch("<h" + level + ">")
        }
    })
    await test.step("pressing backspace at beggining of heading removes the previously set heading level", async () => {
        await editorPage.clearEditor()
        await editorPage.editor.type(repeat("#", 1) + " ")
        await editorPage.editor.press("Backspace")
        const editorHtml = await editorPage.editor.innerHTML()
        expect(editorHtml).not.toMatch("<h")
    })
    await test.step("invalid heading level", async () => {
        await editorPage.clearEditor()
        await editorPage.editor.type(repeat("#", 7) + " ")
        const editorHtml = await editorPage.editor.innerHTML()
        expect(editorHtml).not.toMatch("<h")
    })
    await test.step("list", async () => {
        await editorPage.clearEditor()
        await editorPage.editor.type("- foo")
        let editorHtml = await editorPage.editor.innerHTML()
        expect(editorHtml).toMatch("<ul><li><p>foo</p></li></ul>")
        // press Enter twice to leave the list
        await editorPage.editor.press("Enter")
        await editorPage.editor.press("Enter")
        await editorPage.editor.type("- bar")
        editorHtml = await editorPage.editor.innerHTML()
        // the list items should be wrapped
        expect(editorHtml).toMatch("<ul><li><p>foo</p></li><li><p>bar</p></li></ul>")
    })

    await test.step("marks", async () => {
        await editorPage.clearEditor()
        await editorPage.editor.type("***foo***")
        let editorHtml = await editorPage.editor.innerHTML()
        // TODO: we don't actually care about order, the test should reflect that
        expect(editorHtml).toMatch("<em><strong>foo</strong></em>")

        await editorPage.clearEditor()
        await editorPage.editor.type("**foo**")
        editorHtml = await editorPage.editor.innerHTML()
        expect(editorHtml).toMatch("<strong>foo</strong>")

        await editorPage.clearEditor()
        await editorPage.editor.type("*foo*")
        editorHtml = await editorPage.editor.innerHTML()
        // the list items should be wrapped
        expect(editorHtml).toMatch("<em>foo</em>")
    })
})

/**  Can only hilight based on elements, 
* not the middle of a sentence without any wrapping span
* Set only "from" to highlight one element
* /!\ do not call if elements are already highlighted
*/
async function highlight({ page, from, to = from }: { page: Page, from: Locator, to?: Locator }) {
    // TODO: find a way to remove previous highlight
    // otherwise calling twice on the same element create issues
    const aBox = (await from.boundingBox())!
    const bBox = (await to.boundingBox())!
    await page.mouse.click(aBox.x, aBox.y)
    await page.mouse.move(aBox.x, aBox.y + aBox?.height / 2)
    await page.mouse.down()
    await page.mouse.move(bBox.x + bBox.width, bBox.y + bBox.height / 2)
    await page.mouse.up()
}
test("list merging", async ({ page }) => {
    const editorPage = new EditorPage(page)
    await editorPage.load_notebook("01GNMNVY822CTQ9Q6SEM9F05H2")
    await editorPage.clearEditor()
    const editor = editorPage.editor
    await test.step("create bullet list", async () => {
        for (const letter of ["a", "b", "c", "d"]) {
            await editor.type(letter)
            await editor.press("Enter")
        }
        const a = editor.getByText("a")
        const b = editor.getByText("b")
        await highlight({ page, from: a, to: b })
        const tooltip = editorPage.tooltip
        await expect(tooltip).toBeVisible()
        const blButton = editorPage.tooltipButton("bullet_list")
        await blButton.click()
        await expect(editor.locator("ul")).toHaveCount(1)
        await expect(editor.locator("li")).toHaveCount(2)
    })
    await test.step("create an order list => no joining", async () => {
        // create a separate list
        const d = editor.getByText("d")
        await highlight({ page, from: d })
        const blButton = editorPage.tooltipButton("bullet_list")
        await blButton.click()
        await expect(editor.locator("ul")).toHaveCount(2)
        await expect(editor.locator("li")).toHaveCount(3)
        // and now one in the middle => should be merged with a and b
        const c = editor.getByText("c")
        const olButton = editorPage.tooltipButton("ordered_list")
        await highlight({ page, from: c })
        await olButton.click()
        await expect(editor.locator("ul")).toHaveCount(2)
        await expect(editor.locator("ol")).toHaveCount(1)
        await expect(editor.locator("li")).toHaveCount(4)
    })
    await test.step("switch to bullet list => will provoke a join", async () => {
        const c = editor.getByText("c")
        // already highlighted from previous step
        //await highlight({ page, from: c })
        await expect(editorPage.tooltip).toBeVisible()
        const blButton = editorPage.tooltipButton("bullet_list")
        await blButton.click()
        await expect(editor.locator("ul")).toHaveCount(1)
        await expect(editor.locator("ol")).toHaveCount(0)
        await expect(editor.locator("li")).toHaveCount(4)
    })
})

test("tasklists", async ({ page }) => {
    const editorPage = new EditorPage(page)
    await editorPage.load_notebook("01GNMNVY822CTQ9Q6SEM9F05H2")
    const editor = editorPage.editor
    const checkbox = editor.locator("input[type=checkbox]")
    const items = editor.locator("li")
    await test.step("create a first task", async () => {
        await editorPage.clearEditor()
        await editor.type("[ ] foobar")
        await expect(checkbox).toBeVisible()
        await expect(items.first()).toHaveText("foobar")
    })
    await test.step("check the task", async () => {
        await expect(checkbox).not.toBeChecked()
        await checkbox.check()
        await expect(checkbox).toBeChecked()
        // TODO: ideally we should also test that the check state is preserved upon refresh
        // need a test backend
    })
    await test.step("create a new unchecked task by pressing enter", async () => {
        await editor.press("Enter")
        expect(await checkbox.all()).toHaveLength(2)
        const newCheckbox = checkbox.last()
        // this validates that prosemirror doesn't copy the node with "checked" attribute
        await expect(newCheckbox).not.toBeChecked()
    })
    // create a checked task directly
    await test.step("use markdown shortcusts", async () => {
        // unchecked
        for (const shortcut of ["[] foobar ", "[ ] foobar "]) {
            await editorPage.clearEditor()
            await editor.type(shortcut)
            await expect(checkbox).toBeVisible()
            await expect(items.first()).toHaveText("foobar")
            await expect(checkbox).not.toBeChecked()
        }
        // checked
        await editorPage.clearEditor()
        await editor.type("[x] foobar")
        await expect(checkbox).toBeVisible()
        await expect(items.first()).toHaveText("foobar")
        await expect(checkbox).toBeChecked()
    })
})