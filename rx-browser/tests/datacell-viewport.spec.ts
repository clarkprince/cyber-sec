import { test, expect } from "@playwright/test";
import DatacellPage from "./datacell-page"

test("scroll up and down", async ({ page }) => {
    const component = new DatacellPage(page)
    await component.loadset("01H0824PADZEJY3J4DQKM2QBHY")

    const entry1 = component.records.getByRole('cell').filter({ hasText: /^1$/ })
    const entry25 = component.records.getByRole('cell').filter({ hasText: /^25$/ })
    const entry26 = component.records.getByRole('cell').filter({ hasText: /^26$/ })
    const entry28 = component.records.getByRole('cell').filter({ hasText: /^28$/ })
    const entry299 = component.records.getByRole('cell').filter({ hasText: /^299$/ })

    // 25  is a limit based on human factors, not something completely arbitrary.
    // it is also hard-coded in Go’s viewport
    const has25entries = () => expect(component.records).toHaveCount(25)


    await has25entries()
    await expect(entry1).toBeInViewport()
    await expect(entry25).toBeInViewport()
    await expect(entry28).toBeHidden()

    await test.step("scroll down", async () => {
        await component.cell.hover()
        await page.mouse.wheel(0, 8)

        await has25entries()
        await expect(entry1).toBeHidden()
        await expect(entry25).toBeInViewport()
        await expect(entry28).toBeInViewport()
    })

    await test.step("scroll up", async () => {
        await component.cell.hover()
        await page.mouse.wheel(0, -8)

        await has25entries()
        await expect(entry1).toBeInViewport()
        await expect(entry25).toBeInViewport()
        await expect(entry28).toBeHidden()
    })

    await test.step("keyboard down", async () => {
        await component.cell.hover()
        await page.keyboard.press("ArrowDown")
      
        await has25entries()
        await expect(entry1).toBeHidden()
        await expect(entry26).toBeInViewport()
    })

    await test.step("keyboard up", async () => {
        await component.cell.hover()
        await page.keyboard.press("ArrowUp")

        await has25entries()
        await expect(entry1).toBeInViewport()
        await expect(entry26).toBeHidden()
    })


    await test.step("scroll all the way down", async () => {
        await component.cell.hover()
        // scroll until we find the unit
        while ((await entry299.count()) == 0) {
            await page.mouse.wheel(0, 10)
        }

        await has25entries()
        await expect(entry299).toBeInViewport()
    })
})