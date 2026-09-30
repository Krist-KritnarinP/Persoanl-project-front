import { openSettings } from "./helpers/sidebar";
import { test, expect } from "@playwright/test";
test.setTimeout(90000);
import { additions } from "../../src/i18n/additions.js";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};
const trip = {
  id: 71,
  tripName: "Example trip",
  destination: "Example city",
  startDate: "2026-10-01",
  endDate: "2026-10-01",
  days: [
    {
      id: 81,
      dayCount: 1,
      dayDate: "2026-10-01",
      activities: [
        {
          id: 91,
          locationName: "Example place",
          activityType: "ATTRACTION",
          activityTime: "1970-01-01T09:30:00Z",
          price: 100,
          latitude: 13.75,
          longitude: 100.5,
        },
      ],
    },
  ],
};
test("all pages support switching all four languages without rendering errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://accounts.google.com/**", (r) => r.abort());
  await page.route("**/*tile*", (r) => r.abort());
  await page.route("http://127.0.0.1:8899/api/**", (r) => {
    const path = new URL(r.request().url()).pathname;
    if (r.request().method() === "OPTIONS")
      return r.fulfill({ status: 204, headers });
    const data =
      path === "/api/users/me"
        ? { username: "ExampleUser" }
        : path === "/api/trips"
          ? [trip]
          : path.includes("/weather/")
            ? []
            : trip;
    return r.fulfill({
      headers,
      json: path === "/api/users/me" ? data : { data },
    });
  });
  for (const path of ["/", "/login", "/forgot-password", "/reset-password"]) {
    await page.goto(path);
    for (const lang of ["en", "zh", "ko", "th"]) {
      await page.locator('select:has(option[value="en"])').selectOption(lang);
      if (lang !== "th") {
        const visibleCopy = await page.evaluate(() => {
          const root = document.body.cloneNode(true);
          root
            .querySelectorAll("select,script")
            .forEach((node) => node.remove());
          return root.textContent;
        });
        expect(visibleCopy, `Thai UI leaked on ${path} in ${lang}`).not.toMatch(
          /[ก-๙]/,
        );
      }
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        lang === "zh" ? "zh-CN" : lang,
      );
      await expect(
        page.getByRole("button", { name: additions[lang]["ui.dark"] }),
      ).toBeVisible();
    }
  }
  await page.evaluate(() =>
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    ),
  );
  for (const path of [
    "/dashboard",
    "/trips/ai",
    "/userprofile",
    "/trips",
    "/trips/71",
    "/trips/71/map",
    "/share/example",
  ]) {
    await page.goto(path);
    if (!path.startsWith("/share/")) await openSettings(page);
    for (const lang of ["en", "zh", "ko", "th"]) {
      await page.locator('select:has(option[value="en"])').selectOption(lang);
      if (lang !== "th") {
        const visibleCopy = await page.evaluate(() => {
          const root = document.body.cloneNode(true);
          root
            .querySelectorAll("select,script")
            .forEach((node) => node.remove());
          return root.textContent;
        });
        expect(visibleCopy, `Thai UI leaked on ${path} in ${lang}`).not.toMatch(
          /[ก-๙]/,
        );
      }
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        lang === "zh" ? "zh-CN" : lang,
      );
      await expect(
        page.getByRole("button", { name: additions[lang]["ui.dark"] }),
      ).toBeVisible();
      if (path === "/trips/ai")
        await expect(
          page.getByRole("heading", { name: additions[lang]["planner.title"] }),
        ).toBeVisible();
      if (path === "/dashboard")
        await expect(
          page.getByRole("button", { name: additions[lang]["planner.create"] }),
        ).toBeVisible();
      await expect(page.getByText("Unexpected Application Error!")).toHaveCount(
        0,
      );
    }
  }
  expect(errors).toEqual([]);
});

test("planner sends the selected language and translates preview and validation without editing content", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  await page.route("http://127.0.0.1:8899/api/**", async (r) => {
    if (r.request().method() === "OPTIONS")
      return r.fulfill({ status: 204, headers });
    const path = new URL(r.request().url()).pathname;
    if (path === "/api/social/notifications/unread-count" || path === "/api/collaboration/invitations")
      return r.fulfill({headers,json:{data:path.endsWith("unread-count")?0:[]}});
    const request = r.request().postDataJSON();
    expect(request.language).toBe("en");
    return r.fulfill({
      headers,
      json: {
        data: {
          draftId: 1,
          request,
          complete: true,
          totalDays: 1,
          plan: {
            tripName: "Keep my draft",
            destination: "Example",
            assumptions: ["Original content"],
            days: [
              {
                date: request.startDate,
                description: "Original day",
                activities: [],
              },
            ],
          },
        },
      },
    });
  });
  await page.goto("/trips/ai");
  await page
    .getByLabel(additions.en["planner.requirements"])
    .fill("A relaxed trip to Chiang Mai");
  await page.getByLabel(additions.en["planner.start"]).fill("2026-10-01");
  await page.getByLabel(additions.en["planner.end"]).fill("2026-10-01");
  await page
    .getByRole("button", { name: additions.en["planner.generate"] })
    .click();
  for (const lang of ["en", "zh", "ko", "th"]) {
    await openSettings(page);
    await page.locator('select:has(option[value="en"])').selectOption(lang);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: additions[lang]["planner.review"] }),
    ).toBeVisible();
    await expect(
      page.getByLabel(additions[lang]["planner.tripName"]),
    ).toHaveValue("Keep my draft");
    await expect(
      page.getByRole("button", { name: additions[lang]["planner.save"] }),
    ).toBeVisible();
  }
});
