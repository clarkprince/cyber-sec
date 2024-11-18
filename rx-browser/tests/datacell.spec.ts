import { test, expect } from "@playwright/test";
import DatacellPage from "./datacell-page";


// notebook and cell don’t matter here, but need to exist for the Go WASM to work
const datacellUrl = (datasource: string, args?: object) => {
    const mfst = {
        ID: "01GWSBV5RHAMFFH4EK3DY7GKFX",
        DataSource: datasource,
        Notebook: "01GY097DH7DCDMZ1K1XCAMEBPV",
        ...args
    }
    return `/components/wt-data?data-testid=datacell&manifest=${JSON.stringify(mfst)}`
}

test("wt-datacell loads data set", async ({ page }) => {
    await page.goto(datacellUrl("01GNMNVY822CTQ9Q6SEM9F05H2"))
    const cell = page.getByTestId("datacell")
    await expect(cell).toBeVisible()
    await expect(cell).toContainText("192.0.2.1")
})

test("wt-datacell shows more logs when scrolling down", async ({ page }) => {
    await page.goto(datacellUrl("01H1Y72CEDR6AY3ZE2K3FBRAEV"))
    const cell = page.getByTestId("datacell")
    await expect(cell).toBeVisible()

    const firstLog = page.getByText("first log")
    await expect(firstLog).toBeVisible()

    await page.mouse.move(150, 150);

    await page.mouse.wheel(0, 800);

    await expect(firstLog).not.toBeVisible()

    const middleLog = page.getByText("interesting log")
    await expect(middleLog).toBeVisible()
})

test("wt-datacell show refresh button in case of error", async ({ page }, testInfo) => {
    // NOTE: this datasource doesn't exist, on purpose
    // but we need to have a correct id length for the test to work
    await page.goto(datacellUrl("01GS5JBNQ6TDZ2AYKG4N4321RV"))
    const cell = page.getByTestId("datacell")
    await expect(cell).toBeVisible()
    const refreshBtn = cell.getByText("Refresh")
    expect(refreshBtn).toBeVisible()
    const dataRequest = page.waitForRequest("./api/notebook/data")
    await refreshBtn.click()
    await dataRequest
    await page.screenshot({ path: testInfo.outputPath(testInfo.title + ".png") })
    // TODO: this basic scenario doesn't check that refresh actually refreshes the lioli data
    // we should setup the test so it fails once, display refresh button, then gets the data
})

// Selection

test("select a different node in same record", async ({ page }) => {
    // TODO: update me
    await page.goto(datacellUrl("01GNMNVY822CTQ9Q6SEM9F05H2"))
    const cell = page.getByTestId("datacell")
    await expect(cell).toBeVisible()
    const row = cell.locator("[data-record]").first()
    const ip = row.getByRole("cell", { name: "192.0.2.0" })
    await ip.click()
    await expect(ip).toHaveAttribute("aria-selected", "true")
    const src = row.getByRole("cell", { name: "1234122" })
    await src.click()
    await expect(src).toHaveAttribute("aria-selected", "true")
})

test("empty lioli", async ({ page }, testInfo) => {
    const component = new DatacellPage(page)
    await component.loadset("01GS5JBNQ5YEG86P5Z2ARYQ0Y5")
    
    await expect(component.cell).toBeVisible()
    await expect(component.cell).toContainText(/no data/i)

    // scroll should be simply ignored => fail on error
    page.on('pageerror', (ex) => { throw ex })
    await component.cell.hover()
    await page.mouse.wheel(0, -1)


    await expect(component.cell).toContainText("No data")
})
