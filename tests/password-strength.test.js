import test from "node:test";
import assert from "node:assert/strict";
import { getPasswordStrength } from "../src/utils/passwordStrength.js";

test("strength guide distinguishes minimum, longer and predictable passwords", () => {
  assert.equal(getPasswordStrength(""), 0);
  assert.equal(getPasswordStrength("1234567"), 0);
  assert.equal(getPasswordStrength("Trip2026!"), 1);
  assert.equal(getPasswordStrength("TripPlans2026"), 2);
  assert.equal(getPasswordStrength("OurTripPlans2026!"), 3);
  assert.equal(getPasswordStrength("aaaaaaaaaaaaaaaa"), 1);
  assert.equal(getPasswordStrength("password12345678"), 1);
});
