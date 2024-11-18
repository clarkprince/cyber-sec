import { test, expect, Page, Locator } from "@playwright/test";


// notebook and cell don’t matter here, but need to exist for the Go WASM to work
const datacellUrl = (datasource: string, args?: object) => {
    const mfst = {
        ID: "01GWSBV5RHAMFFH4EK3DY7GKFX",
        DataSource: datasource,
        Notebook: "01GY097DH7DCDMZ1K1XCAMEBPV",
        ...args
    }
    return `/components/wt-data?data-testid=datacell&manifest='${JSON.stringify(mfst)}'`
}

async function accessCell(page: Page, datasource: string) {
    await page.goto("/")
    // NOTE: we can't use a closure value in "page.evaluate"
    // => we can't make flag an argument of accessCell function
    await page.evaluate(() => { window.localStorage.setItem("FLAGS", "patterneditor") })
    // threerecords.start
    await page.goto(datacellUrl(datasource))
    const cell = page.getByTestId("datacell")
    await expect(cell).toBeVisible()
    return cell
}

// failing due to a race condition between setting the flag and having it passed to Go
// rdo will look into it.
test.skip("datacell open pattern editor and use 1st line as sample", async ({ page }) => {
    // threrecords
    // TODO(eric): send_record doesn't add separators, making test logs unparsable atm
    const cell = await accessCell(page, "01GS5JBNQ63ABMZQZ98BQ0DHAX")
    // open pattern editor
    const patternToggle = cell.getByRole("button", { name: /toggle pattern editor/i })
    const patternEditor = cell.getByTestId("patterneditor")
    await expect(patternEditor).not.toBeVisible()
    await expect(patternToggle).toBeVisible()
    await patternToggle.click()
    await expect(patternEditor).toBeVisible()
    const patternInput = patternEditor.getByLabel(/parse logs with pattern/i)
    await expect(patternInput).toHaveValue("1234122192.0.2.0")
    // change value
    await patternInput.clear()
    await patternInput.type("<val><ip>")
    await patternInput.blur()
    await expect(patternInput).toHaveValue("<val><ip>")
})