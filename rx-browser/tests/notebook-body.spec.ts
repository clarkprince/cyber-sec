import { expect, test } from "@playwright/test";

const getComponentURL = function (id: "urgent" | "resolved" | "default" | "urgent-resolved" = "default") {
    return `./components/wt-notebook-body?data-testid=notebook-body&notebook-id=${id}&owner=Jorge&user=01GS8B2H18KHRJ8PDAB3MKW697&created=2023-02-16 15:49:43" : ""}`
}

test("notebook has the specified title on the input and tab", async ({ page }) => {
    await page.goto(getComponentURL())
    const notebookBody = page.getByTestId("notebook-body")
    await expect(notebookBody).toBeVisible()

    const notebookTitle = page.getByLabel("notebook-title");
    await expect(notebookTitle).toHaveValue("data-theft")
    // NOTE: it's important to check the input value before the tab title,
    // otherwise the test would be flaky
    const tabTitle = await page.title();
    expect(tabTitle).toBe("data-theft")
})

test("user can change the title of the notebook", async ({ page }) => {
    await page.goto(getComponentURL())

    const notebookTitle = page.getByLabel("notebook-title");

    await notebookTitle.fill('missing data')

    await expect(notebookTitle).toHaveValue('missing data')
})

test("notebook has the name of the owner", async ({ page }) => {
    await page.goto(getComponentURL())

    const ownerName = page.getByText("Jorge")
    await expect(ownerName).toBeVisible()
})

test("notebook shows its metadata (owner, creation date, and status) as specified in its attributes", async ({ page }) => {
    await page.goto(getComponentURL("urgent-resolved"))

    const ownerName = page.getByText("Jorge")
    await expect(ownerName).toBeVisible()

    // TODO(jorge) how does that work with i18n?
    const creationDate = page.getByText(/2023-02-16/)
    await expect(creationDate).toBeVisible()

    const priorityStatus = page.getByText("Urgent")
    await expect(priorityStatus).toBeVisible()

    const progressionStatus = page.getByText("Resolved")
    await expect(progressionStatus).toBeVisible()
})

test("notebook has routine and in progress status when specified", async ({ page }) => {
    await page.goto(getComponentURL())

    const priorityStatus = page.getByText("Routine")
    await expect(priorityStatus).toBeVisible()

    const progressionStatus = page.getByText("In progress")
    await expect(progressionStatus).toBeVisible()
})

test.skip("notebook priority status changes when user clicks on it", async ({ page }) => {
    await page.goto(getComponentURL())

    const routineStatus = page.getByText("Routine")
    await expect(routineStatus).toBeVisible()

    await routineStatus.click()
    // TODO:
    // - we don't simulate updates in WTR yet, so on next read, the notebook urgent state is "lost"
    // - the UI is optimistic => event without mocking, the "urgent" status will be enabled for a split second
    // Possibles solutions are therefore:
    // - simulating the update in WTR
    // - OR figuring why playwright doesn't catch fast changes
    await expect(routineStatus).not.toBeVisible()

    const urgentStatus = page.getByText("Urgent")
    await expect(urgentStatus).toBeVisible()

    await urgentStatus.click()
    await expect(urgentStatus).not.toBeVisible()
    await expect(routineStatus).toBeVisible()
})

// TODO: require mocking notebook updates in WTR
test.skip("notebook progression status changes when user clicks on it", async ({ page }) => {
    await page.goto(getComponentURL())

    const inProgressStatus = page.getByText("In Progress")
    await expect(inProgressStatus).toBeVisible()

    await inProgressStatus.click()
    await expect(inProgressStatus).not.toBeVisible()

    const resolvedStatus = page.getByText("Resolved")
    await expect(resolvedStatus).toBeVisible()

    await resolvedStatus.click()
    await expect(resolvedStatus).not.toBeVisible()
    await expect(inProgressStatus).toBeVisible()
})

test("user can click on Share button to copy the link of the notebook to the clipboard", async ({ page }) => {
    await page.goto(getComponentURL())

    const shareButton = page.getByTestId("share-button")

    await shareButton.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    // in WTR we can't have the right final URL,
    // so we stick to testing that we have a URL even if it's not "/notebook/ID"
    expect(clipboardText).toContain("https://localhost:8000/");
})

test("logs dropzone has enough space in terms of height", async ({ page }) => {
    await page.goto(getComponentURL())

    const notebookBody = page.getByTestId("notebook-body")
    await expect(notebookBody).toBeVisible()

    const dropzonesWrapper = page.getByTestId("notebook-cells-wrapper")
    await expect(dropzonesWrapper).toBeVisible()

    const dropzonesWrapperBox = await dropzonesWrapper.boundingBox()

    const logsDropzoneHeight = dropzonesWrapperBox!.height
    expect(logsDropzoneHeight).toBeGreaterThan(600)
})
