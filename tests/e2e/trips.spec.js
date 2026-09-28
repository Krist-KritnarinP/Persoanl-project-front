import { openSettings } from "./helpers/sidebar";
import { test, expect } from "@playwright/test";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
};
const token = "demo-share-token";
const fixture = () => ({
  id: 71,
  tripName: "Refactor regression trip",
  destination: "Bangkok",
  startDate: "2026-10-01",
  endDate: "2026-10-02",
  days: [
    {
      id: 81,
      dayCount: 1,
      dayDate: "2026-10-01",
      description: "Original day",
      activities: [
        {
          id: 91,
          dayId: 81,
          activityType: "ATTRACTION",
          locationName: "Saved map pin",
          activityDate: "2026-10-01",
          activityTime: "1970-01-01T09:30:00Z",
          price: "1250.50",
          description: "Original activity",
          status: "planned",
          latitude: 13.7563,
          longitude: 100.5018,
        },
      ],
    },
  ],
});
test("owner trip keeps totals, sharing, day edits, saved pins and theme when opening map", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    if (!localStorage.getItem("theme"))
      localStorage.setItem("theme", "liquid-glass");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  let trip = fixture();
  const mutations = [];
  await page.route("**/*tile*", (route) => route.abort());
  await page.route("**/photon.komoot.io/**", () => {
    throw new Error("Saved DB coordinates must not geocode");
  });
  await page.route("http://127.0.0.1:8899/api/**", async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname,
      method = req.method();
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers });
    let data;
    if (path === "/api/trips/71" && method === "GET") data = trip;
    else if (path.includes("/weather/")) data = [];
    else if (path === "/api/trips/71/share" && method === "POST") {
      mutations.push(method + path);
      trip.shareToken = token;
      data = { shareToken: token };
    } else if (path === "/api/trips/71/share" && method === "DELETE") {
      mutations.push(method + path);
      trip.shareToken = null;
      data = {};
    } else if (path === "/api/days/81" && method === "PUT") {
      const body = req.postDataJSON();
      expect(body.description).toBe("Edited day");
      trip.days[0] = { ...trip.days[0], ...body };
      mutations.push(method + path);
      data = trip.days[0];
    } else throw new Error(`Unexpected API request: ${method} ${path}`);
    await route.fulfill({ status: 200, headers, json: { data } });
  });
  await page.goto("/trips/71");
  await expect(
    page.getByText("Refactor regression trip", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("1,250.5", { exact: false }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page.getByText("/share/" + token, { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /revoke|disable|stop sharing/i })
    .click();
  await expect.poll(() => mutations).toContain("DELETE/api/trips/71/share");
  await openSettings(page);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "liquid-glass-dark",
  );
  // Same page handlers still own the edit request after extracting display components.
  await page
    .getByRole("button", { name: /^Day 1/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: /edit day/i })
    .first()
    .click();
  const form = page.locator(".modal form");
  await form.locator("textarea").fill("Edited day");
  await form.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Edited day", { exact: true }).first(),
  ).toBeVisible();
  expect(mutations).toContain("PUT/api/days/81");
  await page.goto("/trips/71/map");
  await expect(
    page.getByText("Saved map pin", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "liquid-glass-dark",
  );
  expect(errors).toEqual([]);
});
test("public shared trip remains read-only with original date/time and type labels", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("lang", "en"));
  await page.route("**/*tile*", (route) => route.abort());
  await page.route("http://127.0.0.1:8899/api/**", (route) =>
    route.fulfill({
      status: 200,
      headers,
      json: { data: { ...fixture(), sharedBy: "Trip owner" } },
    }),
  );
  await page.goto("/share/" + token);
  await expect(
    page.getByText("Refactor regression trip", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Day 1/ }).click();
  await expect(
    page.getByText("Saved map pin", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("09:30", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /add activity|edit day|share trip/i }),
  ).toHaveCount(0);
});

test("oversized Thai route cannot crash owner or shared trip; a shorter day restores QR", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  const trip = fixture();
  trip.days[0].activities = Array.from({ length: 6 }, (_, i) => ({
    ...trip.days[0].activities[0],
    id: 100 + i,
    locationName: "สถานที่ท่องเที่ยว".repeat(8) + i,
    latitude: null,
    longitude: null,
  }));
  trip.days.push({
    ...fixture().days[0],
    id: 82,
    dayCount: 2,
    dayDate: "2026-10-02",
  });
  await page.route("**/*tile*", (route) => route.abort());
  await page.route("**/photon.komoot.io/**", (route) =>
    route.fulfill({ json: { features: [] } }),
  );
  await page.route("http://127.0.0.1:8899/api/**", (route) =>
    route.fulfill({
      headers,
      json: { data: route.request().url().includes("/weather/") ? [] : trip },
    }),
  );
  for (const path of ["/trips/71", "/share/" + token]) {
    await page.goto(path);
    await expect(
      page.getByText(
        "Route link is too long for a QR code. Select fewer stops on the map.",
      ),
    ).toBeVisible();
    await expect(page.getByText("Unexpected Application Error!")).toHaveCount(
      0,
    );
    await page
      .getByRole("button", { name: /^Day 2/ })
      .first()
      .click();
    await expect(
      page.getByRole("img", { name: "Google Maps route QR" }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});
