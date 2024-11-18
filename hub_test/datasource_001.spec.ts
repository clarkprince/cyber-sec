import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/home");
});

test("modify data source information", async ({ page }) => {
  await page.getByRole("link", { name: "Data Sources" }).click();

  const jdt = page
    .locator("wt-datasource")
    .filter({
      has: page.getByRole("heading", { name: "Jupyter Logs (Local File)" }),
    })
    .first(); // allow for multiple runs without cleaning

  await jdt.getByLabel("Edit datasource").click();
  // not sure why we need to go back to page – probably locator already resolved?
  await expect(
    page.getByRole("textbox", { name: "Preprocessor:" }),
  ).toHaveValue("unixyear");
});
