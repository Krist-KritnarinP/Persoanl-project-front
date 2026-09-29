import { test, expect } from "@playwright/test";
import { openSettings } from "./helpers/sidebar";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};
const ids = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
];
test("billing imports activity, previews charges, records a partial repayment and reverses it in four languages", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem("theme", "liquid-glass");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const members = [],
    bills = [],
    settlements = [];
  let preview;
  const requests = [];
  const summary = () => {
    const outstanding = bills.length
      ? settlements.some((s) => !s.reversed)
        ? 38850
        : 58850
      : 0;
    return {
      total: bills.length ? 122700 : 0,
      members: members.map((m, i) => ({
        ...m,
        paid: bills.length && i === 0 ? 122700 : 0,
        share: bills.length ? (i === 0 ? 63850 : 58850) : 0,
        sent: i === 1 && outstanding === 38850 ? 20000 : 0,
        received: i === 0 && outstanding === 38850 ? 20000 : 0,
        owed: i === 1 ? outstanding : 0,
        receivable: i === 0 ? outstanding : 0,
      })),
      debts: bills.length
        ? [
            {
              fromId: ids[1],
              toId: ids[0],
              billId: bills[0].id,
              title: "Dinner",
              amount: 58850,
              remaining: outstanding,
            },
          ]
        : [],
    };
  };
  await page.route("http://127.0.0.1:8899/api/**", async (r) => {
    if (r.request().method() === "OPTIONS")
      return r.fulfill({ status: 204, headers });
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith("/preview")) {
      const input = r.request().postDataJSON();
      requests.push(input);
      expect(input.activityId).toBe(91);
      expect(input.charges.map((c) => c.kind)).toEqual([
        "service",
        "vat",
        "tip",
      ]);
      preview = {
        input,
        total: 122700,
        paymentTotal: Math.round(Number(input.payments[0].amount) * 100),
        lines: [{ name: "Dinner", total: 100000 }],
        charges: input.charges.map((c, i) => ({
          ...c,
          total: [10000, 7700, 5000][i],
          baseAmount: i === 1 ? 110000 : 100000,
        })),
        shares: { [ids[0]]: 63850, [ids[1]]: 58850 },
        payments: { [ids[0]]: 122700 },
        debts: [{ fromId: ids[1], toId: ids[0], amount: 58850 }],
      };
      return r.fulfill({ headers, json: { data: preview } });
    }
    if (path.endsWith("/billing")) {
      if (r.request().method() === "POST") {
        const c = r.request().postDataJSON();
        expect(c.requestId).toMatch(/^[a-f0-9-]{36}$/);
        if (c.action === "member.add")
          members.push({ id: ids[members.length], version: 1, ...c.member });
        if (c.action === "member.update") {
          const member = members.find((item) => item.id === c.id);
          Object.assign(member, c.member, { version: member.version + 1 });
        }
        if (c.action === "bill.save") {
          expect(c.bill.payments[0].amount).toBe("1227.00");
          bills.push({
            id: "00000000-0000-4000-8000-000000000010",
            title: "Dinner",
            date: c.bill.date,
            version: 1,
            total: 122700,
            data: preview,
          });
        }
        if (c.action === "settlement.add") {
          expect(c.settlement.amount).toBe("200");
          settlements.push({
            id: "00000000-0000-4000-8000-000000000020",
            version: 1,
            fromId: ids[1],
            toId: ids[0],
            amount: 20000,
            date: c.settlement.date,
            allocations: [{ billId: bills[0].id, amount: 20000 }],
          });
        }
        if (c.action === "settlement.reverse") settlements[0].reversed = true;
        return r.fulfill({ headers, json: { data: {} } });
      }
      return r.fulfill({
        headers,
        json: {
          data: {
            members,
            bills,
            settlements,
            summary: summary(),
            history: [],
          },
        },
      });
    }
    return r.fulfill({
      headers,
      json: {
        data: {
          id: 71,
          tripName: "Example trip",
          days: [
            {
              dayDate: "2026-09-28",
              activities: [
                { id: 91, locationName: "Dinner", price: "1000.00" },
              ],
            },
          ],
        },
      },
    });
  });
  await page.goto("/trips/71/billing");
  expect(
    await page.locator("main.billing-workspace").evaluate((main) =>
      Math.abs(window.innerWidth - main.getBoundingClientRect().right),
    ),
  ).toBeLessThan(3);
  for (const name of ["Alice", "Bob"]) {
    await page
      .getByRole("textbox", { name: "Member name", exact: true })
      .fill(name);
    await page.getByRole("button", { name: "Add member", exact: true }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  const renameDialog = page.getByRole("dialog", { name: "Edit" });
  await expect(renameDialog.getByRole("textbox", { name: "Member name" })).toHaveValue("Alice");
  await renameDialog.getByRole("textbox", { name: "Member name" }).fill("Alicia");
  await renameDialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alicia", exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next: add a bill" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Billing sections" })
      .getByRole("link", { name: "Settle during the trip" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add bill", exact: true }).click();
  const form = page.locator("form").filter({
    has: page.getByRole("heading", { name: "Add bill", exact: true }),
  });
  await form.getByLabel("Create from activity").selectOption("91");
  for (const [label, value, type] of [
    ["Service charge", "10", "percent"],
    ["VAT", "7", "percent"],
    ["Tip", "50", "amount"],
  ]) {
    await form.getByRole("checkbox", { name: label, exact: true }).check();
    const section = form.locator("section").filter({
      has: page.getByRole("checkbox", { name: label, exact: true }),
    });
    await section.getByLabel("Value / rate").fill(value);
    await section
      .getByRole("combobox", { name: "Type", exact: true })
      .selectOption(type);
    if (label === "Tip") {
      await section
        .getByLabel("Split method / participants")
        .selectOption("equal");
      await section
        .getByRole("checkbox", { name: "Alicia", exact: true })
        .check();
    }
  }
  await form
    .getByRole("button", { name: "Preview calculation", exact: true })
    .click();
  await expect(
    form.getByRole("heading", { name: "Total: ฿1227.00" }),
  ).toBeVisible();
  await form
    .getByRole("button", { name: "Assign full total to this payer" })
    .click();
  await form
    .getByRole("button", { name: "Preview calculation", exact: true })
    .click();
  await form.getByRole("button", { name: "Confirm bill", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Confirm" }).click();
  await expect(
    page.getByText("Dinner · ฿1227.00", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "From", exact: true })
    .selectOption(ids[1]);
  await page
    .getByRole("combobox", { name: "To", exact: true })
    .selectOption(ids[0]);
  await page
    .getByRole("button", { name: "Select all outstanding bills for this pair" })
    .click();
  await page.getByLabel("Repayment amount", { exact: true }).fill("200");
  await expect(
    page.getByText("Remaining after repayment: ฿388.50"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Record repayment", exact: true })
    .click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Confirm" }).click();
  await expect(
    page.getByText("Bob → Alicia · ฿200.00", { exact: false }),
  ).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: "Dinner · ฿1227.00" })
    .click();
  await expect(
    page.getByRole("button", { name: "Void bill", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Reverse repayment", exact: true })
    .click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Confirm" }).click();
  await expect(
    page.getByRole("button", { name: "Void bill", exact: true }),
  ).toBeEnabled();
  const memberFilter = page.getByRole("combobox", {
    name: "Filter member",
    exact: true,
  });
  await expect(memberFilter).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(memberFilter.locator("option").first()).toHaveCSS(
    "color",
    "rgb(23, 32, 27)",
  );
  await openSettings(page);
  for (const lang of ["th", "zh", "ko", "en"]) {
    await page
      .getByRole("combobox", { name: "Language", exact: true })
      .selectOption(lang);
    await expect(page.locator("h1")).not.toContainText("bill.heading");
  }
  await page
    .getByRole("button", { name: "Switch to dark theme", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(memberFilter).toHaveCSS("background-color", "rgb(32, 41, 35)");
  await expect(memberFilter.locator("option").first()).toHaveCSS(
    "color",
    "rgb(242, 245, 242)",
  );
  expect(requests).toHaveLength(2);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("billing.png"),
    fullPage: true,
  });
});
