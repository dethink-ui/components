import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("URL paging preserves the document, other examples, and scroll; Back/Forward restores pages", async ({
  page,
}) => {
  await page.goto("/components/pagination?page=7&filter=active");
  const basic = page.getByRole("region", {
    name: "Bounded callback controls",
    exact: true,
  });
  await basic.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(basic.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 5 of 12",
  );
  const links = page.getByRole("region", {
    name: "Route-backed links",
    exact: true,
  });
  await links.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  let documentRequests = 0;
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.resourceType() === "document")
      documentRequests++;
  });
  await expect(links.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 7 of 18",
  );
  const next = links.getByRole("link", { name: "Next page", exact: true });
  await next.focus();
  await next.click();
  await expect(page).toHaveURL(/page=8&filter=active$/);
  await expect(links.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 8 of 18",
  );
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scroll, 0);
  await next.press("Enter");
  await expect(links.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 9 of 18",
  );
  await expect(next).toBeFocused();
  await page.goBack();
  await expect(links.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 8 of 18",
  );
  await page.goForward();
  await expect(links.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 9 of 18",
  );
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
  expect(documentRequests).toBe(0);
  await expect(basic.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 5 of 12",
  );
  await expect(
    links.getByRole("link", { name: "Next page", exact: true }),
  ).toHaveAttribute("href", "/components/pagination?page=10&filter=active");
});

test("callback controls stay in place through every page", async ({
  page,
}, info) => {
  await page.goto("/components/pagination");
  const basic = page.getByRole("region", {
    name: "Bounded callback controls",
    exact: true,
  });
  const previous = basic.getByRole("button", {
    name: "Previous page",
    exact: true,
  });
  const next = basic.getByRole("button", { name: "Next page", exact: true });
  await basic.scrollIntoViewIfNeeded();
  for (let i = 4; i > 1; i--) await previous.click();
  const previousBox = (await previous.boundingBox())!;
  const nextBox = (await next.boundingBox())!;
  for (let current = 1; current <= 12; current++) {
    await expect(basic.locator('[data-slot="pagination-status"]')).toHaveText(
      `Page ${current} of 12`,
    );
    const a = (await previous.boundingBox())!,
      b = (await next.boundingBox())!;
    expect(a.x).toBeCloseTo(previousBox.x, 0);
    expect(a.y).toBeCloseTo(previousBox.y, 0);
    expect(b.x).toBeCloseTo(nextBox.x, 0);
    expect(b.y).toBeCloseTo(nextBox.y, 0);
    if (current < 12) await next.click();
  }
  await expect(next).toBeDisabled();
  expect(
    await basic
      .locator('[data-slot="pagination"]')
      .evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  await basic.screenshot({
    path: `test-results/${info.project.name}-pagination.png`,
  });
  const axe = await new AxeBuilder({ page })
    .include('[data-slot="pagination"]')
    .analyze();
  expect(axe.violations).toEqual([]);
});

test("deep links handle invalid pages and native new-tab navigation remains available", async ({
  page,
  context,
}, info) => {
  await page.goto("/components/pagination?page=999");
  const links = page.getByRole("region", {
    name: "Route-backed links",
    exact: true,
  });
  await expect(links.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 18 of 18",
  );
  await expect(
    links.getByRole("button", { name: "Next page", exact: true }),
  ).toBeDisabled();
  await page.goto("/components/pagination?page=invalid");
  await expect(links.locator('[data-slot="pagination-status"]')).toHaveText(
    "Page 6 of 18",
  );
  if (info.project.name !== "mobile") {
    const opened = context.waitForEvent("page");
    await links
      .getByRole("link", { name: "Next page", exact: true })
      .click({ modifiers: ["ControlOrMeta"] });
    const tab = await opened;
    await tab.waitForLoadState();
    await expect(tab).toHaveURL(/page=7$/);
    await expect(page).toHaveURL(/page=invalid$/);
    await tab.close();
  }
});
