export async function openNavigation(page) {
  const toggle = page.getByTestId("sidebar-open");
  if (await toggle.isVisible()) await toggle.click();
}
export async function openSettings(page) {
  await openNavigation(page);
  await page.getByTestId("sidebar-settings").filter({ visible: true }).click();
}
