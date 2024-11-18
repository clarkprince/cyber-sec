import { test, expect } from '@playwright/test';

test.beforeAll(async ({ request }) => {
	const rsp = await request.post('/toggle-flag', { form: { name: "myshinyfeature" } })
	expect(rsp.ok()).toBeTruthy()
})

test.afterAll(async ({ request }) => {
	const rsp = await request.post('/toggle-flag', { form: { name: "myshinyfeature" } })
	expect(rsp.ok()).toBeTruthy()
})

test("enable feature flag", async ({ request }) => {
	const rsp = await request.head("/info")
	expect(rsp.headers()["x-feature-flags"].split(",")).toContain("myshinyfeature")
})