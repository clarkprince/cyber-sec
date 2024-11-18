import { test, expect } from "@playwright/test";
import requireflag from "./flags";

test("Adjust Cell", async ({ page, playwright }) => {
  await requireflag(playwright, "adjust-cell");

  let pbook: any;
  await test.step("create playbook and add cells", async () => {
    await page.goto("/home");
    await page.getByRole("link", { name: "Workspace" }).click();

    const waitPBook = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Create Playbook" }).click();
    pbook = await waitPBook;
    await pbook.getByLabel("notebook-title").click();
    await pbook.getByLabel("notebook-title").fill("Adjust Cell Size");
    await pbook.locator("wt-editor").getByRole("paragraph").click();
    await pbook.locator("wt-editor div").first().fill("Writing some text");
    await pbook.getByTestId("notebook-cells-wrapper").click();

    // add 3 cells
    await pbook.getByRole("link", { name: "Explore" }).click();
    await pbook.getByText("Jupyter Logs(Logs)").last().click();

    await pbook.getByRole("link", { name: "Explore" }).click();
    await pbook.getByText("Jupyter Logs(Logs)").last().click();

    await pbook.getByRole("link", { name: "Explore" }).click();
    await pbook.getByText("Jupyter Logs(Logs)").last().click();

    await expect(pbook.locator("wt-data")).toHaveCount(3);
  });

  await test.step("move up", async () => {
    await pbook.getByLabel("cell-menu").nth(2).click();
    await pbook.getByLabel("move-up").first().click();

    await expect(pbook.getByLabel("cell-wrapper").first()).toHaveClass(
      "w-full",
    );
  });

  await test.step("move down", async () => {
    await pbook.getByLabel("cell-menu").first().click();
    await pbook.getByLabel("move-down").first().click();

    await expect(pbook.getByLabel("cell-wrapper").first()).toHaveClass(
      "w-full",
    );
  });

  await test.step("adjust width", async () => {
    await pbook.getByLabel("cell-menu").first().click();
    await pbook.getByLabel("adjust-width").first().click();

    await pbook.getByLabel("cell-menu").first().click();
    await pbook.getByLabel("adjust-width").first().click();

    await expect(pbook.getByLabel("cell-wrapper").first()).toHaveClass(
      "w-1/3 pr-2",
    );
  });

  await test.step("change height", async () => {
    await pbook.getByLabel("cell-menu").first().click();
    await pbook.getByLabel("adjust-height").first().click();

    await expect(pbook.getByLabel("cell-body-wrapper").first()).toHaveClass(
      new RegExp("h-[36rem]*"),
    );
  });
});
