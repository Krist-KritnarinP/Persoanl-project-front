import { test, expect } from "@playwright/test";
import { openNavigation, openSettings } from "./helpers/sidebar";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};
test("sidebar navigates, collapses or traps mobile focus, shows account and logs out", async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    if (!localStorage.getItem("authState"))
      localStorage.setItem(
        "authState",
        JSON.stringify({
          state: {
            user: { id: 1, username: "TestUser", email: "test@example.com" },
            token: "test",
          },
          version: 0,
        }),
      );
  });
  const errors = [];
  let loggedOut = false;
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*tile*", (r) => r.abort());
  await page.route("https://accounts.google.com/**", (r) => r.abort());
  await page.route("http://127.0.0.1:8899/api/**", (r) => {
    if (r.request().method() === "OPTIONS")
      return r.fulfill({ status: 204, headers });
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith("/logout")) loggedOut = true;
    return r.fulfill({
      headers,
      json: path.endsWith("/me")
        ? { username: "TestUser", email: "test@example.com" }
        : { data: [], nextPage: null },
    });
  });
  await page.goto("/dashboard");
  if (!isMobile) {
    await page
      .getByRole("button", { name: "Hide sidebar · Classic layout" })
      .click();
    await expect(page.getByTestId("desktop-sidebar")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Open travel dashboard" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Language" }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("enable-sidebar")).toBeVisible();
    await expect(page.getByTestId("desktop-sidebar")).toHaveCount(0);
    await page.getByTestId("enable-sidebar").click();
  } else {
    await openNavigation(page);
    const dialog = page.getByRole("dialog", { name: "Main navigation" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => document.activeElement.closest("dialog") !== null,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("sidebar-open")).toBeFocused();
    await openNavigation(page);
    await page.mouse.click(370, 400);
    await expect(dialog).toHaveCount(0);
    await openNavigation(page);
    await page
      .getByRole("button", { name: "Hide sidebar · Classic layout" })
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId("sidebar-open")).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Language" }),
    ).toBeVisible();
    await page.getByTestId("enable-sidebar").click();
  }
  for (const [name, url] of [
    ["Overview", "/travel-overview"],
    ["My trips", "/dashboard"],
    ["Plan with AI", "/trips/ai"],
  ]) {
    await openNavigation(page);
    await page
      .getByRole("link", { name, exact: true })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(new RegExp(url + "$"));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await openSettings(page);
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("th");
  await expect(page.getByRole("dialog")).toContainText("ภาษาและธีม");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("en");
  await page.keyboard.press("Escape");
  await openNavigation(page);
  await expect(
    page.getByText("TestUser", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /Profile/i })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/userprofile$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("sidebar.png"),
    fullPage: true,
  });
  await openNavigation(page);
  await page
    .getByRole("button", { name: /log out|logout|sign out/i })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/login$/);
  expect(loggedOut).toBe(true);
  await expect(page.getByTestId("desktop-sidebar")).toHaveCount(0);
  expect(errors).toEqual([]);
});
