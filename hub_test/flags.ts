import { test } from "@playwright/test";

export default async function (
  pw: typeof import("playwright-core"),
  name: string,
) {
  let ctx = await pw.request.newContext();
  const rsp = (await ctx.head("/info")).headers()["x-feature-flags"];
  test.skip(
    !Array.from(rsp.split(",")).includes(name),
    `feature ${name} not enabled`,
  );
}
