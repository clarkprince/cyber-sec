import { test, expect, Page, Locator } from "@playwright/test";
import DatacellPage from "./datacell-page";


test("sorting", async ({ page }) => {
    const component = new DatacellPage(page)
    await component.loadset("01GS5JBNQ63ABMZQZ98BQ0DHAX")

    const ipSort = component.headers.filter({ hasText: /ip/i })
    const ipCells = component.records.filter({ hasText: /192.0.2/i })
    
    // check that dataset is ok
    // (if test fails here, check if the dataset respects this order)
    const ips = ["192.0.2.0", "192.0.2.2", "192.0.2.1"]
    await expect(ipCells).toContainText([ips[0], ips[1], ips[2]])

    await test.step("asc", async () => {
        await ipSort.click()
        await expect(ipCells).toContainText([ips[0], ips[2], ips[1]])
    })
    await test.step("desc", async () => {
        await ipSort.click()
        await expect(ipCells).toContainText([ips[1], ips[2], ips[0]])
    })
    await test.step("reset", async () => {
        await ipSort.click()
        await expect(ipCells).toContainText([ips[0], ips[1], ips[2]])
    })
})

test("hiding", async ({ page }) => {
    const component = new DatacellPage(page)
    await component.loadset("01GS5JBNQ63ABMZQZ98BQ0DHAX")

    const menu = page.getByTestId("columnsbtn")

    // menu only visible on parent hover
    await test.step("show menu", async () => {
        await expect(menu).toBeHidden()
        await menu.locator('..').hover()
        await expect(menu).toBeVisible()
    })

    /*
        const hideButton = cell.getByRole("button", { name: /hide all columns/i })
        await hideButton.click()
        const showButton = cell.getByRole("button", { name: /show all columns/i })
        await showButton.click()
        await expect(cell).toContainText(/all columns are displayed/i)
    */
})

test("filtering", async ({ page }) => {
    // we rely on the change event, which seems not to be dispatched by fill method => fired manually
    const component = new DatacellPage(page)
    await component.loadset("01GNMNVY822CTQ9Q6SEM9F05H2")
    const f = component.filter
    await expect(f).toBeVisible()

    await test.step("filter one", async () => {
        await f.fill("192.0.2.2")
        await f.dispatchEvent("change")
        await expect(component.records).not.toContainText("192.0.2.1")
    })

    await test.step("filter none", async () => {
        await f.fill("ddddd")
        await f.dispatchEvent("change")
        await expect(component.cell).toContainText(/filtered out/i)
    })

    await test.step("clear", async () => {
        await expect(f).toBeVisible()
        await f.clear()
        await f.dispatchEvent("change")
        await expect(component.records).toHaveCount(3)
    })

    await test.step("scroll then filter", async() => {
        await component.loadset("01H4E7450D048PEVXZHHX7MZTX");
        await component.records.first().hover();
        await page.mouse.wheel(0, 10);
        await f.fill("401");
        await f.dispatchEvent("change");
        await expect(component.records.first()).toContainText("401");
    })
})

test("ignore empty lines", async ({ page }) => {
    // when multiple lines are empty, they should be ignored from the disply
    const component = new DatacellPage(page)
    await component.loadset("01H4EB1NCFE199VM703K9HDXEW")
    await expect(component.records).toHaveCount(3)
})