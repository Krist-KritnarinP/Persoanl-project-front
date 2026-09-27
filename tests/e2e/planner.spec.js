import { test, expect } from "@playwright/test";
const headers = {
  "access-control-allow-origin": "http://127.0.0.1:5188",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};
const plan = {
  tripName: "เชียงใหม่ฉบับร่าง",
  destination: "เชียงใหม่",
  tripDescription: "พักผ่อน",
  assumptions: ["งบรวม 2 คน"],
  days: [
    {
      date: "2026-12-10",
      description: "เที่ยวในเมือง",
      activities: [
        {
          activityType: "ATTRACTION",
          locationName: "วัดพระสิงห์ เชียงใหม่",
          time: "09:30",
          price: 100,
          description: "เดินเที่ยว",
        },
        {
          activityType: "RESTAURANT",
          locationName: "มื้อเที่ยง เชียงใหม่",
          time: "12:00",
          price: 200,
          description: "อาหารเหนือ",
        },
      ],
    },
  ],
};
test("planner calendar, generation failure, editable preview and lost-save retry", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("lang", "th");
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    );
  });
  let generations = 0,
    saves = 0,
    firstPayload;
  await page.route("http://127.0.0.1:8899/api/**", async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    if (req.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers });
    if (path === "/api/trips")
      return route.fulfill({ headers, json: { data: [] } });
    if (path === "/api/planner/draft") {
      generations++;
      if (generations === 1)
        return route.fulfill({ headers, status: 503, json: {} });
      expect(req.postDataJSON()).toMatchObject({
        startDate: "2026-12-10",
        endDate: "2026-12-10",
      });
      return route.fulfill({
        headers,
        json: { data: { draftId: 71, plan: structuredClone(plan) } },
      });
    }
    if (path === "/api/planner/71/confirm") {
      saves++;
      const body = req.postDataJSON();
      if (saves === 1) {
        firstPayload = body;
        return route.abort("failed");
      }
      expect(body).toEqual(firstPayload);
      expect(body.plan.days[0].activities).toHaveLength(1);
      expect(body.plan.days[0].activities[0]).toMatchObject({
        locationName: "เปลี่ยนสถานที่",
        time: "10:30",
        price: 150,
      });
      return route.fulfill({
        headers,
        json: { data: { id: 88, replayed: true } },
      });
    }
    if (path === "/api/trips/88")
      return route.fulfill({
        headers,
        json: { data: { id: 88, ...plan, days: [] } },
      });
    if (path.includes("/weather/"))
      return route.fulfill({ headers, json: { data: [] } });
    throw Error(`Unexpected request ${req.method()} ${path}`);
  });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "✨ ให้ AI ช่วยวางแผน" }).click();
  await page
    .getByLabel("อยากเที่ยวแบบไหน?")
    .fill("เชียงใหม่ 2 คน ชอบเที่ยวในเมือง");
  await page.getByLabel("วันเริ่มเดินทาง").fill("2026-12-10");
  await expect(page.getByRole("note")).toContainText("token");
  await expect(page.getByLabel("อยากเที่ยวแบบไหน?")).toHaveCSS(
    "border-radius",
    "0px",
  );
  await page.getByLabel("วันสิ้นสุด").fill("2026-12-10");
  await page.getByRole("button", { name: "✨ ให้ AI ช่วยวางแผน" }).click();
  await expect(page.getByRole("alert")).toContainText("AI ยังร่างแผนไม่ได้");
  await expect(page.getByLabel("อยากเที่ยวแบบไหน?")).toHaveValue(
    "เชียงใหม่ 2 คน ชอบเที่ยวในเมือง",
  );
  await page.getByRole("button", { name: "✨ ให้ AI ช่วยวางแผน" }).click();
  await expect(
    page.getByRole("heading", { name: "ตรวจแผนก่อนบันทึก" }),
  ).toBeVisible();
  expect(saves).toBe(0);
  await page.getByLabel("สถานที่ / กิจกรรม").first().fill("เปลี่ยนสถานที่");
  await page.getByLabel("เวลา", { exact: true }).first().fill("10:30");
  await page.getByLabel("ประมาณการ (บาท)").first().fill("150");
  await page
    .getByRole("button", { name: "ลบกิจกรรม มื้อเที่ยง เชียงใหม่" })
    .click();
  await expect(
    page.getByText("งบกิจกรรมประมาณการรวมทั้งกลุ่ม: ฿150"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "บันทึกเป็นทริปของฉัน" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "ยังยืนยันผลการบันทึกไม่ได้",
  );
  await expect(page.getByLabel("ชื่อทริป")).toBeDisabled();
  await page.getByRole("button", { name: "ลองบันทึกอีกครั้ง" }).click();
  await expect(page).toHaveURL(/\/trips\/88$/);
  expect(errors).toEqual([]);
});

test("nine-day draft shows token notice and resumes after quota without losing progress", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "authState",
      JSON.stringify({ state: { user: { id: 1 }, token: "test" }, version: 0 }),
    ),
  );
  let calls = 0;
  await page.route("http://127.0.0.1:8899/api/**", async (route) => {
    if (route.request().method() === "OPTIONS")
      return route.fulfill({ status: 204, headers });
    expect(new URL(route.request().url()).pathname).toBe("/api/planner/draft");
    expect(route.request().postDataJSON().endDate).toBe("2026-12-18");
    calls++;
    if (calls === 2) return route.fulfill({ status: 429, headers, json: {} });
    const count = calls === 1 ? 7 : 9;
    return route.fulfill({
      headers,
      json: {
        data: {
          draftId: 72,
          totalDays: 9,
          complete: count === 9,
          tokens: count === 7 ? 3000 : 4000,
          plan: {
            ...plan,
            days: Array.from({ length: count }, (_, i) => ({
              ...plan.days[0],
              date: `2026-12-${10 + i}`,
            })),
          },
        },
      },
    });
  });
  await page.goto("/trips/ai");
  await page
    .getByLabel("อยากเที่ยวแบบไหน?")
    .fill("เชียงใหม่ เที่ยวแบบสบาย ๆ เก้าวัน");
  await page.getByLabel("วันเริ่มเดินทาง").fill("2026-12-10");
  await page.getByLabel("วันสิ้นสุด").fill("2026-12-18");
  await expect(page.getByRole("note")).toContainText("กดครั้งเดียว");
  await page.getByRole("button", { name: "✨ ให้ AI ช่วยวางแผน" }).click();
  await expect(page.getByText(/กำลังจัดแผน 7 \/ 9 วัน/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "บันทึกเป็นทริปของฉัน" }),
  ).toBeDisabled();
  await expect(page.getByLabel("ชื่อทริป")).toBeDisabled();

  await expect(page.getByRole("alert")).toContainText("ขีดจำกัด");
  await expect(page.getByText(/กำลังจัดแผน 7 \/ 9 วัน/)).toBeVisible();
  await page.getByRole("button", { name: "ลองทำต่อ" }).click();
  await expect(page.getByText(/ร่างครบแล้ว 9 \/ 9 วัน/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "บันทึกเป็นทริปของฉัน" }),
  ).toBeEnabled();
  await expect(page.getByLabel("ชื่อทริป")).toBeEnabled();
});
