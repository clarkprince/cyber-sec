import { test, expect, Locator } from "@playwright/test"
import DatacellPage from './datacell-page'

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

test("basic pivot manipulation", async ({ page }) => {
    const w = new DatacellPage(page)
    await w.loadset("01GNMNVY822CTQ9Q6SEM9F05H2")

    const dragto = async (src: Locator, dst: Locator) => {
        await src.hover()
        await page.mouse.down()
        await dst.hover()
        await dst.hover() // twice is the charm – makes sure both dragover _and_ drop are fired
        await page.mouse.up()
    }

    await test.step("drag from value creates pivot", async () => {
        const cell = w.cellByName('192.0.2.1')

        // first select the value
        await cell.click()
        await expect(cell).toHaveAttribute("aria-selected", "true")

        await dragto(cell, w.pivotRack)        

        const pivot = w.pivotRack.getByText('|= "192.0.2.1"')
        await expect(pivot).toBeVisible()
    })

    await test.step("drag from pivot rack applies it", async () => {
        const pivot = w.pivotRack.getByText('|= "192.0.2.1"')
        const dest = w.cellByName('192.0.2.1')

        await dragto(pivot, dest)

        const appliedPivot = w.pivotRack.getByText('ip|= "192.0.2.1"')
        await expect(appliedPivot).toBeVisible()

        await appliedPivot.getByRole('button', { name: 'Remove' }).click()
        await expect(pivot).toHaveCount(0)  
    })
    
    await test.step("double-click creates and apply", async () => {
        const selectableItem = w.records.getByText("192.0.2.1")
        await selectableItem.dblclick()

        const pivot = w.pivotRack.getByText('ip|= "192.0.2.1"')
        await expect(pivot).toBeVisible()

        await pivot.getByRole('button', { name: 'Remove' }).click()
        await expect(pivot).toHaveCount(0)       
    })
})


test("drag and drop multiple values creates pivot with multiple fields", async ({ page }) => {
    await page.goto(datacellUrl("01GNMNVY822CTQ9Q6SEM9F05H2"))
    const cell = page.getByTestId("datacell")
    await expect(cell).toBeVisible()

    const first = cell.getByText("192.0.2.1")
    const second = cell.getByText("192.0.2.2")

    await first.click({ modifiers: ['Control'] })
    await second.click({ modifiers: ['Control'] })

    await page.keyboard.up('Control')

    const rack = page.getByTestId("pivot-rack")
    await expect(rack).toBeVisible()

    // then drag it to the location
    // this should drag both values
    await first.hover()
    await page.mouse.down()
    await rack.hover()
    await rack.hover() // twice is the charm – makes sure both dragover _and_ drop are fired
    await page.mouse.up()

    const cellControls = page.getByTestId("cell-controls")
    const pivot = cellControls.getByText("|= \"192.0.2.1\"")
    await expect(pivot).toBeVisible()
    await expect(pivot.locator("input")).toHaveCount(0)
})


test("maintain sort between edits", async ({ page }) => {
    const component = new DatacellPage(page)
    await component.loadset("01H4E7450D048PEVXZHHX7MZTX")

    const datesort = component.headers.filter({ hasText: /date/i })
    await datesort.click()

    await expect(datesort).toHaveAttribute("aria-sort", "ascending")

    await component.pivotRack.dblclick()
    const pill = component.pivotRack.getByPlaceholder("|=")
    await pill.fill('|= "yoyo"')
    await pill.press('Enter')

    await pill.isHidden() // technically, the _input_ is now a <p>. But force the wait

    await component.pivotRack.getByText('|= "yoyo"').isVisible()
    await expect(datesort).toHaveAttribute("aria-sort", "ascending")
})