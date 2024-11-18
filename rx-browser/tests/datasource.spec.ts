import { test, expect } from "@playwright/test";

test("setting color of existing datasource, outside of edit mode, will fire a request", async ({ page }) => {
    await page.goto("./components/wt-datasource?color=green&type=s3log&key=01GNMNVY822CTQ9Q6SEM9F05H2")
    // toggle edit mode
    const editBtn = page.getByRole("button", { name: /edit datasource/i })
    await editBtn.click()
    // click button
    const colorBtn = page.getByRole("button", { name: /change color/i })
    // NOTE: when running test in vscode, it will erroneously wait for the request to happen
    // you need to run this test via command line instead
    const updateReq = page.waitForRequest(/api\/datasource/)
    await colorBtn.click()
    await expect(page.getByTestId("color-select-orange-600")).toBeVisible()
    await page.getByTestId("color-select-orange-600").click()
    await expect(colorBtn).toHaveClass(/bg-orange-600/)
    await updateReq
})
// NOTE: requires clarification since it is possible to change the colour in edit mode
test.skip("setting color of existing datasource in edit mode will NOT fire a request", async ({ page }) => {
    await page.goto("./components/wt-datasource?color=green&edited&type=s3log&key=01GNMNVY822CTQ9Q6SEM9F05H2")
    await expect(page.getByRole("listitem", { name: /datasource/i })).toBeVisible()
    const colorBtn = page.getByRole("button", { name: /change color/i })
    let seen = false
    page.on("request", (req) => {
        if (req.url().match(/api\/datasource/)) {
            seen = true
        }
    })
    await colorBtn.click()
    await expect(page.getByTestId("color-select-orange-600")).toBeVisible()
    await page.getByTestId("color-select-orange-600").click()
    await expect(colorBtn).toHaveClass(/bg-orange-600/)
    expect(seen).toBe(false)
})

test("wt-datasource checks input validity", async ({ page }) => {
    await page.goto("/templates/datasource.form-validation.html")
    const inp = page.getByTestId("my-checked-test")
    await expect(inp).toBeVisible()
    const sub = page.getByTitle("Save")
    await expect(sub).toBeVisible()
    await inp.fill("value-invalid") // invalid per regexp in template
    await sub.click()

    // TODO check that this is indeed prevented
})

