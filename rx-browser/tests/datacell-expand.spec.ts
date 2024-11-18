import { test, expect } from "@playwright/test";
import DatacellPage from "./datacell-page"

test("expand records", async ({ page }) => {
    const component = new DatacellPage(page)
    await component.loadset("01H64647PM777VY6MMQDNEAAH1")
    
    const expand2 = component.records.nth(1).getByRole('button', {text: "expand-line"})
    await expect(expand2.getByRole('image')).toBeHidden()

    await expand2.hover()
    // this does not seem to trigger. Linked to Tailwind’s “group” trick??
    // await expect(expand2.getByRole('image')).toBeVisible()
    await expand2.click()
    const expanded = page.getByTestId('expanded-record-row')
    await expect(expanded).toBeVisible()

    await expect(expanded.getByRole('row', { name: 'string1 2', exact: true})).toBeVisible()
    await expect(expanded.getByRole('row', { name: 'string2 -2', exact: true})).toBeVisible()
})