import { test as setup, expect } from "@playwright/test";

const authCookie = ".auth/user.cookie";

setup("prime system", async ({ page }) => {
  await setup.step("auth", async () => {
    await page.goto("/");
    await page.getByLabel("User Name").fill("johndoe");
    await page.getByLabel("Password").fill("password");
    await page.getByLabel("Password").press("Enter");
    await page.waitForURL("/home");

    await page.context().storageState({ path: authCookie });
  });

  const testButton = page.getByRole("button", { name: "Test" });

  await setup.step("demo logs: jupyter logs", async () => {
    await page.getByRole("link", { name: "Data Sources" }).click();
    await page.getByRole("combobox").selectOption("filestream");

    await page
      .getByTestId("newds-filestream")
      .getByLabel("Title: *")
      .fill("Jupyter Logs");
    await page
      .getByTestId("newds-filestream")
      .getByLabel("Filename: *")
      .fill("demo_logs/jupyter.log");
    await page
      .getByTestId("newds-filestream")
      .getByLabel("Preprocessor")
      .fill("unixyear");

    await testButton.click();
    await expect(
      page.getByRole("listitem", { name: "Datasource" }).locator("span"),
    ).toHaveClass(/bg-green-600/);

    await page.getByRole("button", { name: "Save" }).click();
  });

  await setup.step("demo logs: access logs", async () => {
    await page.getByRole("link", { name: "Data Sources" }).click();
    await page.getByRole("combobox").selectOption("filestream");

    await page
      .getByTestId("newds-filestream")
      .getByLabel("Title: *")
      .fill("Access Logs");
    await page
      .getByTestId("newds-filestream")
      .getByLabel("Filename: *")
      .fill("demo_logs/auth.log");

    await page.getByRole("button", { name: "Save" }).click();
  });
});
