import test from "node:test";
import assert from "node:assert/strict";
import { formatTripDate } from "../src/utils/datetime.js";

test("owner-trip date display retains empty, invalid and localized calendar behavior", () => {
  assert.equal(formatTripDate(null, "en-US"), "-");
  assert.equal(formatTripDate("", "th-TH"), "-");
  assert.equal(formatTripDate(undefined, "en-US", "unset"), "unset");
  assert.equal(formatTripDate("invalid", "en-US"), "Invalid Date");
  assert.equal(formatTripDate("2026-10-01T12:00:00Z", "en-US"), "Oct 1, 2026");
  assert.match(formatTripDate("2026-10-01T12:00:00Z", "th-TH"), /2569/);
});
