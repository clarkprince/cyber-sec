import { test, expect } from "@playwright/test";

test("Create a single schedule", async ({ page }) => {
  await test.step("create playbook", async () => {
    await page.goto("/home");

    await page.getByRole("link", { name: "Workspace" }).click();

    const waitPBook = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Create Playbook" }).click();
    const pbook = await waitPBook;
    await pbook.getByLabel("notebook-title").click();
    await pbook
      .getByLabel("notebook-title")
      .fill("Testing Notebook Scheduling");
    await pbook.locator("wt-editor").getByRole("paragraph").click();
    await pbook.locator("wt-editor div").first().fill("Writing some text");
    await pbook.getByTestId("notebook-cells-wrapper").click();
    await pbook.getByRole("link", { name: "Explore" }).click();
    await pbook.getByText("Jupyter Logs(Logs)").last().click();

    await expect(pbook.locator("wt-data")).toBeVisible();
  });

  await test.step("schedule it", async () => {
    await page.goto("/home");

    await page.getByRole("link", { name: "Schedules" }).click();
    await page
      .locator('select[name="notebookList"]')
      .selectOption({ label: "Testing Notebook Scheduling" });
    await page.getByPlaceholder("3").click();
    await page.getByPlaceholder("3").fill("3");
    await page.getByLabel("start date").click();
    await page.getByLabel("start date").fill("2023-08-10");
    await page.getByLabel("hour of day").click();
    await page.getByLabel("hour of day").fill("12");
    await page.getByPlaceholder("10").click();
    await page.getByPlaceholder("10").fill("11");
    await page.getByRole("button", { name: "Schedule" }).click();

    await expect(
      page.getByRole("cell", { name: "Testing Notebook Scheduling" }).first(),
    ).toBeVisible();
  });
});
