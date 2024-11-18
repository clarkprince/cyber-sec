import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/home");
});

test("Create a simple playbook", async ({ page }) => {
  await page.getByRole("link", { name: "Workspace" }).click();
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Create Playbook" }).click();
  const page1 = await page1Promise;
  await page1.getByLabel("notebook-title").click();
  await page1.getByLabel("notebook-title").fill("Testing Event Creation");
  await page1.locator("wt-editor").getByRole("paragraph").click();
  await page1.locator("wt-editor div").first().fill("Writing some text");
  await page1.getByTestId("notebook-cells-wrapper").click();
  await page1.getByRole("link", { name: "Explore" }).click();
  await page1.getByText("Jupyter Logs(Logs)").last().click();

  await expect(page1.locator("wt-data")).toBeVisible();
});
