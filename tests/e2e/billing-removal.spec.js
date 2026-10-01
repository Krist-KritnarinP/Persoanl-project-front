import { test, expect } from "@playwright/test";

const memberId = "00000000-0000-4000-8000-000000000001";
const billId = "00000000-0000-4000-8000-000000000010";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

test("unpaid bill is editable and removable, then its unused member can be removed", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem("authState", JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }));
  });
  const member = { id: memberId, name: "Alex", version: 1, active: true };
  const input = { title: "Lunch", date: "2026-10-02", activityId: null, lines: [{ name: "Food", amount: "10", split: { mode: "equal", parts: [{ memberId }] } }], charges: [], payments: [{ memberId, amount: "10" }] };
  const bill = { id: billId, title: "Lunch", date: "2026-10-02", version: 1, total: 1000, voided: false, data: { input, lines: [{ name: "Food", total: 1000 }], charges: [], shares: { [memberId]: 1000 }, payments: { [memberId]: 1000 }, debts: [] } };
  let members = [member], bills = [bill];
  const actions = [];
  await page.route("http://127.0.0.1:8899/api/**", async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/billing")) {
      if (route.request().method() === "POST") {
        const command = route.request().postDataJSON();
        actions.push(command.action);
        if (command.action === "bill.remove") bills = [];
        if (command.action === "member.remove") members = [];
        return route.fulfill({ headers, json: { data: {} } });
      }
      return route.fulfill({ headers, json: { data: {
        members, bills, settlements: [], history: [],
        summary: { total: bills.length ? 1000 : 0, members: members.map((m) => ({ ...m, paid: bills.length ? 1000 : 0, share: bills.length ? 1000 : 0, sent: 0, received: 0, owed: 0, receivable: 0 })), debts: [] },
      } } });
    }
    return route.fulfill({ headers, json: { data: { id: 71, tripName: "Example trip", days: [] } } });
  });
  await page.goto("/trips/71/billing");
  await expect(page.getByRole("button", { name: "Delete member" })).toBeDisabled();
  await expect(page.getByText("This member appears in a bill or repayment.", { exact: false })).toBeVisible();
  const card = page.locator("#billing-bills details");
  await expect(card).toHaveCount(1);
  await card.locator("summary").click();
  await card.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.locator("#billing-editor").getByRole("textbox", { name: "Bill title" })).toHaveValue("Lunch");
  await page.locator("#billing-editor").getByRole("button", { name: "Cancel" }).click();
  await card.getByRole("button", { name: "Delete bill" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator("#billing-bills details")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete member" })).toBeEnabled();
  await page.getByRole("button", { name: "Delete member" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByRole("heading", { name: "Alex" })).toHaveCount(0);
  expect(actions).toEqual(["bill.remove", "member.remove"]);
});
