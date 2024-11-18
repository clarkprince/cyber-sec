import { expect, test, TestInfo } from "@playwright/test"

function outputPath(testInfo: TestInfo, nameWithExt?: string) {
    return testInfo.outputPath(testInfo.title + (nameWithExt?.length ? "-" + nameWithExt : ".png"))
}

test("search display error properly", async ({ page }, testInfo) => {
    // no mock => 404, should show an error
    await page.goto("/components/wt-search")
    const input = page.getByLabel(/search input/i)
    await input.type(".")
    // should appear then disappear on error
    const loading = page.getByText(/loading/i)
    await page.screenshot({ path: outputPath(testInfo, "loading.png") })
    await expect(loading).toBeVisible()
    await expect(loading).not.toBeVisible()
    const error = page.getByText(/search failed/i)
    await page.screenshot({ path: outputPath(testInfo, "error.png") })
    await expect(error).toBeVisible()
})

test.describe("constrained viewport", () => {
    test.use({ viewport: { width: 600, height: 300 } });
    test("display search in a constrained div", async ({ page }, testInfo) => {
        await page.goto("/components/wt-search") // we need a page that loads the relevant JS
        await page.screenshot({ path: outputPath(testInfo) })
    })
})