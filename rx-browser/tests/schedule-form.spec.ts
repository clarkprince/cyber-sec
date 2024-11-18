import { expect, test, TestInfo } from "@playwright/test"

test("schedule creates valid spec", async ({ page }) => {
	await page.goto('templates/scheduler.list-playbooks.html');

	await page.getByLabel("control to schedule").selectOption({ label: "My Playbook One" });
	await page.getByLabel("frequency of repetitions").fill("4");
	await page.getByLabel("interval of repetitions").selectOption({ label: "week(s)" });
	await page.getByLabel("start date").fill("2022-02-10");
	await page.getByLabel("hour of day").fill("10");
	await page.getByLabel("number of repetitions").fill("8");



	const schedProm = page.waitForRequest("schedule/add");
	await page.getByRole('button', { name: 'Schedule' }).click();
	const sched = await schedProm;

	// both notebook id, and specification of schedule
	expect(sched.postData()).toContain("R8/2022-02-10T10/P4W");
	expect(sched.postData()).toContain("opt1");
})