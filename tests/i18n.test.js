import test from "node:test";
import assert from "node:assert/strict";
import { additions } from "../src/i18n/additions.js";
import { registerSchema, passwordSchema } from "../src/validations/schema.js";
test("new UI dictionaries have complete keys and matching interpolation parameters", () => {
  const keys = Object.keys(additions.th).sort();
  const params = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const language of ["en", "zh", "ko"]) {
    assert.deepEqual(Object.keys(additions[language]).sort(), keys);
    for (const key of keys) {
      assert.ok(additions[language][key]);
      assert.deepEqual(
        params(additions[language][key]),
        params(additions.th[key]),
      );
    }
  }
});
test("validation returns translation keys without changing password rules", () => {
  assert.equal(
    passwordSchema.safeParse("short").error.issues[0].message,
    "auth.passwordRule",
  );
  assert.equal(
    passwordSchema.safeParse("x".repeat(73)).error.issues[0].message,
    "validation.passwordBytes",
  );
  assert.equal(passwordSchema.safeParse("a secure password").success, true);
  const result = registerSchema.safeParse({
    username: "a",
    email: "bad",
    password: "short",
    confirmPassword: "",
  });
  assert.ok(
    result.error.issues.every((i) => /^(auth|validation)\./.test(i.message)),
  );
});
