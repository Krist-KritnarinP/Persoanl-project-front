import { test, expect } from "@playwright/test";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};
test("weather keeps fixed bounds, scrolls long reports, and opens complete old/new history in accessible modal", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const text =
    "Seasonal estimate overview\n---DETAILS---\n" +
    Array.from(
      { length: 25 },
      (_, i) =>
        `D${i + 1} 2027-01-01\nMorning: mountain activity, cool seasonal conditions; bring layers.\nAfternoon: city activity, possible seasonal rain; pack a rain jacket.\nEvening: no activity scheduled; location uncertain.\nUncertainty: no live weather data.`,
    ).join("\n");
  const history = [
    { id: 1, content: text, createdAt: "2026-09-28T10:00:00Z" },
    {
      id: 2,
      content:
        "Legacy report without marker\n" +
        "Legacy detail\n".repeat(50) +
        "END OF LEGACY REPORT",
      createdAt: "2026-09-27T10:00:00Z",
    },
  ];
  await page.route("http://127.0.0.1:8899/api/**", async (r) => {
    const path = new URL(r.request().url()).pathname;
    if (r.request().method() === "OPTIONS")
      return r.fulfill({ status: 204, headers });
    if (path.endsWith("/predict-weather")) {
      expect(r.request().postDataJSON()).toEqual({
        tripId: 71,
        language: "en",
      });
      return r.fulfill({ headers, json: { prediction: text } });
    }
    return r.fulfill({
      headers,
      json: {
        data: path.includes("/weather/")
          ? history
          : { id: 71, tripName: "Weather trip", days: [] },
      },
    });
  });
  await page.goto("/trips/71");
  const card = page.getByTestId("weather-card");
  await expect(card).toBeVisible();
  const height = (await card.boundingBox()).height;
  const historyButtons = page.getByRole("button", {
    name: /Read saved report/,
  });
  await historyButtons.first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Seasonal estimate overview")).toBeVisible();
  const scroll = page.getByTestId("weather-reader-scroll");
  expect(await scroll.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  await scroll.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(
    dialog.getByRole("heading", { name: "D25 2027-01-01" }),
  ).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await historyButtons.nth(1).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByTestId("weather-reader-scroll")
    .evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(
    page.getByText("END OF LEGACY REPORT", { exact: true }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  const predict = card.getByRole("button").first();
  await predict.click();
  const preview = page.getByTestId("weather-preview-scroll");
  await expect(preview).toContainText("D25");
  expect(
    await preview.evaluate((el) => el.scrollHeight > el.clientHeight),
  ).toBe(true);
  expect(Math.abs((await card.boundingBox()).height - height)).toBeLessThan(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 2,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
