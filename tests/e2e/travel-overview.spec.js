import { openNavigation, openSettings } from "./helpers/sidebar";
import { test, expect } from "@playwright/test";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,OPTIONS",
};
const trips = [
  {
    id: 1,
    tripName: "Past trip",
    startDate: "2026-09-01",
    endDate: "2026-09-03",
    totalCost: 1200.25,
    points: [
      { id: 1, name: "Bangkok", lat: 13.75, lng: 100.5, date: "2026-09-02" },
    ],
  },
  {
    id: 2,
    tripName: "Current trip",
    startDate: "2026-09-27",
    endDate: "2026-09-28",
    totalCost: 300.5,
    points: [
      { id: 2, name: "Chiang Mai", lat: 18.78, lng: 98.98, date: "2026-09-28" },
    ],
  },
  {
    id: 3,
    tripName: "Next trip",
    startDate: "2026-09-29",
    endDate: "2026-10-02",
    totalCost: 500,
    points: [],
  },
  {
    id: 4,
    tripName: "Draft trip",
    startDate: null,
    endDate: null,
    totalCost: 0,
    points: [],
  },
];
test("travel card opens overview, filters map/calendar/costs and supports four languages", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-09-28T12:00:00"));
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://*.tile.openstreetmap.org/**", (r) => r.abort());
  await page.route("http://127.0.0.1:8899/api/**", (r) => {
    if (r.request().method() === "OPTIONS")
      return r.fulfill({ status: 204, headers });
    const url = new URL(r.request().url());
    const overview = url.pathname.endsWith("/overview");
    return r.fulfill({
      headers,
      json: {
        data: overview
          ? url.searchParams.get("page") === "2"
            ? trips.slice(2)
            : trips.slice(0, 2)
          : trips,
        nextPage: overview && url.searchParams.get("page") !== "2" ? 2 : null,
      },
    });
  });
  await page.goto("/dashboard");
  await openNavigation(page);
  await page
    .getByRole("link", { name: "Overview", exact: true })
    .filter({ visible: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Travel overview", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("travel-trip")).toHaveCount(4);
  await expect(page.getByText(/2,000.75/)).toBeVisible();
  await expect(page.locator(".leaflet-interactive")).toHaveCount(2);
  await page.getByRole("button", { name: "Ongoing", exact: true }).click();
  await expect(page.getByTestId("travel-trip")).toHaveCount(1);
  await expect(page.getByTestId("travel-trip")).toContainText("Current trip");
  await expect(page.locator(".leaflet-interactive")).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: /2026-09-29 ·/ }).click();
  await expect(page.getByTestId("travel-trip")).toHaveCount(1);
  await expect(page.getByTestId("travel-trip")).toContainText("Next trip");
  await expect(
    page.getByText("No coordinates in this selection"),
  ).toBeVisible();
  await page.getByRole("button", { name: /Clear selected date/ }).click();
  await page.getByRole("button", { name: "Next month", exact: true }).click();
  await page.getByRole("button", { name: /2026-10-01 ·/ }).click();
  await expect(page.getByTestId("travel-trip")).toContainText("Next trip");
  await page.getByRole("button", { name: /Clear selected date/ }).click();
  await openSettings(page);
  for (const [language, title] of [
    ["th", "ภาพรวมการเดินทาง"],
    ["zh", "旅行总览"],
    ["ko", "여행 개요"],
    ["en", "Travel overview"],
  ]) {
    await page
      .getByRole("combobox", { name: "Language", exact: true })
      .selectOption(language);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `/private/tmp/travel-overview-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("overview error retries and empty account renders without invented statistics", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  let fail = true;
  await page.route("https://*.tile.openstreetmap.org/**", (r) => r.abort());
  await page.route("http://127.0.0.1:8899/api/**", (r) => {
    if (r.request().method() === "OPTIONS")
      return r.fulfill({ status: 204, headers });
    return r.fulfill({
      status: fail ? 500 : 200,
      headers,
      json: fail ? {} : { data: [], nextPage: null },
    });
  });
  await page.goto("/travel-overview");
  await expect(page.getByRole("alert")).toContainText("Unable to load");
  fail = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByText("No trips in this selection")).toBeVisible();
});
