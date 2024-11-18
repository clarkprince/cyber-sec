import { test, expect, TestInfo } from "@playwright/test";
function outputPath(testInfo: TestInfo, name?: string, ext: string = "png") {
    return testInfo.outputPath(testInfo.title + (name?.length ? "-" + name : "") + "." + ext)
}


test("display empty state when appropriate", async ({ page }, testInfo) => {
    page.route("**/datasources/list", route => {
        return route.fulfill({
            status: 200,
            body: "[]"
            // body: "[{Streams:[{Title:'foo'}]}]"
        })
    })
    await page.goto("./components/wt-notebook-datasources")
    let txt = page.getByText(/No Data Source yet/i)
    await page.screenshot({ path: outputPath(testInfo, "empty-ds-list.png") })
    await expect(txt).toBeVisible()
    // we got data
    page.route("**/datasources/list", route => {
        return route.fulfill({
            status: 200,
            body: JSON.stringify(
                // TODO: typescript this
                [{ Streams: [{ Title: 'foo' }] }]
            )
        })
    })
    await page.goto("./components/wt-notebook-datasources")
    await page.screenshot({ path: outputPath(testInfo, "non-empty-ds-list.png") })
    txt = page.getByText(/No Data Source yet/i)
    await expect(txt).not.toBeVisible()
})
test.skip("display empty search results", async ({ page }) => {
    // TODO: NOT YET IMPLEMENTED
    // Should display a specific message when search input is not empty
    // and there are no results
})