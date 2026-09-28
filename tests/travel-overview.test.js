import test from "node:test";
import assert from "node:assert/strict";
import {
  travelStatus,
  tripsOnDate,
  calendarDays,
} from "../src/utils/travelOverview.js";
test("trip status includes entire end date and treats missing dates as undated", () => {
  assert.equal(
    travelStatus("2026-09-01", "2026-09-28", "2026-09-28"),
    "ongoing",
  );
  assert.equal(travelStatus("2026-09-01", "2026-09-27", "2026-09-28"), "past");
  assert.equal(travelStatus("2026-09-29", null, "2026-09-28"), "upcoming");
  assert.equal(travelStatus(null, null), "undated");
});
test("calendar includes overlapping trips across months, leap day and one-day trips", () => {
  const trips = [
    { startDate: "2024-02-28", endDate: "2024-03-02" },
    { startDate: "2024-02-29" },
  ];
  assert.equal(tripsOnDate(trips, "2024-02-29").length, 2);
  assert.equal(tripsOnDate(trips, "2024-03-02").length, 1);
  assert.equal(tripsOnDate(trips, "2024-03-03").length, 0);
  assert.equal(calendarDays(new Date(2024, 1, 1)).length, 42);
});
