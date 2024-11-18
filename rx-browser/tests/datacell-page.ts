import { Locator, Page } from '@playwright/test';

export default class DatacellPage {
	readonly page: Page

	readonly pivotRack: Locator
	readonly cell: Locator
	readonly headers: Locator
	readonly records: Locator
	readonly filter: Locator

	cellByName(name: string): Locator { return this.page.getByRole('cell', { name })}

	constructor(page: Page) {
		this.page = page
		this.pivotRack = page.getByTestId("pivot-rack")
		this.cell = page.getByTestId("datacell")
		this.headers = page.getByRole("columnheader")
		this.records = page.getByLabel("log records").getByRole("row")
		this.filter = page.getByTestId("regexp-filter")
	}

	async loadset(datasource: string, args?: object) {
		const mfst = {
			ID: "01GWSBV5RHAMFFH4EK3DY7GKFX",
			DataSource: datasource,
			Notebook: "01GY097DH7DCDMZ1K1XCAMEBPV",
			...args
		}
		await this.page.goto(`/components/wt-data?data-testid=datacell&manifest=${JSON.stringify(mfst)}`)
	}
}