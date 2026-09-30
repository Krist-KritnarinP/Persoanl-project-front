import { test, expect } from "@playwright/test";
test("Landing presents real features, interactive sample and working login on all languages", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const apiRequests = [];
  page.on("request", (r) => {
    if (r.url().includes(":8899/api/")) apiRequests.push(r.url());
  });
  await page.addInitScript(() => localStorage.setItem("lang", "th"));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "ทริปที่ดี",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,nofollow",
  );
  await page.screenshot({
    path: testInfo.outputPath("landing.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "วันที่ 2", exact: true }).click();
  await expect(page.getByText("ชมวิวดอยสุเทพ", { exact: true })).toBeVisible();
  await page
    .getByText("AI สร้างทริปให้ทั้งหมดเลยไหม?", { exact: true })
    .click();
  await expect(
    page.getByText("ร่างแผนให้ แล้วคุณตรวจแก้ก่อนบันทึก", { exact: false }),
  ).toBeVisible();
  for (const lang of ["en", "zh", "ko", "th"]) {
    await page.locator('select:has(option[value="en"])').selectOption(lang);
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      lang === "zh" ? "zh-CN" : lang,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
  }
  expect(apiRequests).toEqual([]);
  await page.locator(".lp-hero .lp-button").click();
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("link", { name: "ลืมรหัสผ่าน?" })).toBeVisible();
  expect(errors).toEqual([]);
});
test("Private route redirects to login while signed-in users can still see landing", async ({
  page,
}) => {
  await page.goto("/trips/999");
  await expect(page).toHaveURL("/login");
  await page.evaluate(() =>
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    ),
  );
  await page.goto("/");
  await expect(page.locator(".lp-hero .lp-button")).toHaveAttribute(
    "href",
    "/dashboard",
  );
});
