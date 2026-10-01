import { test, expect } from "@playwright/test";

test("login dog loops, pauses and respects motion preference without blocking auth controls", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem("theme", "liquid-glass");
  });
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.goto("/login");
  const scene = page.locator(".login-journey");
  const traveler = scene.locator(".login-journey__traveler");
  await expect(scene).toHaveAttribute("aria-hidden", "true");
  await expect(scene).toHaveCSS("pointer-events", "none");
  await expect(traveler).toHaveCSS("animation-iteration-count", "infinite");
  await page.getByRole("button", { name: "Pause scenery" }).click();
  await expect(traveler).toHaveCSS("animation-play-state", "paused");
  await expect(scene.locator(".journey-loading__tail")).toHaveCSS("animation-play-state", "paused");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("traveler@example.invalid");
  await page.getByRole("button", { name: "Create new account", exact: true }).click();
  await expect(page.locator("#createaccount")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("login-scene-light.png"), fullPage: true });
  await page.locator("html").evaluate(el => el.dataset.theme = "liquid-glass-dark");
  await page.screenshot({ path: test.info().outputPath("login-scene-dark.png"), fullPage: true });
  await page.getByRole("button", { name: "Play scenery" }).click();
  await expect(traveler).toHaveCSS("animation-play-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(traveler).toHaveCSS("animation-name", "none");
  await expect(scene.locator(".journey-loading__dog")).toHaveCSS("animation-name", "none");
  await expect(page.getByRole("button", { name: "Pause scenery" })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("illustrated feature coverage stays readable across four languages and both themes", async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("lang", "th"); localStorage.setItem("theme", "liquid-glass"); });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/#features");
  await expect(page.locator(".lp-infographic")).toHaveCount(9);
  const features = page.locator("#features");
  await features.screenshot({ path: test.info().outputPath("features-light.png") });
  for (const lang of ["en", "zh", "ko", "th"]) {
    await page.locator('.lp-nav-end select').selectOption(lang);
    const overflowingText = await page.locator(".lp-diagram").evaluateAll(diagrams => diagrams.flatMap(svg => {
      const bounds = svg.getBoundingClientRect();
      return [...svg.querySelectorAll("text")].filter(text => {
        const rect = text.getBoundingClientRect();
        return rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
      }).map(text => text.textContent);
    }));
    expect(overflowingText, lang).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.locator("html").evaluate(el => el.dataset.theme = "liquid-glass-dark");
  await features.screenshot({ path: test.info().outputPath("features-dark.png") });
  expect(errors).toEqual([]);
});
