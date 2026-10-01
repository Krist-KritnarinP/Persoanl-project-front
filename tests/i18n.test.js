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
test("validation uses the eight-character password minimum and translated errors", () => {
  assert.equal(
    passwordSchema.safeParse("short").error.issues[0].message,
    "auth.passwordRule",
  );
  assert.equal(
    passwordSchema.safeParse("x".repeat(73)).error.issues[0].message,
    "validation.passwordBytes",
  );
  assert.equal(passwordSchema.safeParse("a secure password").success, true);
  assert.equal(passwordSchema.safeParse("1234567").success, false);
  assert.equal(passwordSchema.safeParse("12345678").success, true);
  assert.equal(registerSchema.safeParse({ username: "x".repeat(51), email: "a@example.com", password: "Trip2026", confirmPassword: "Trip2026" }).error.issues[0].message, "validation.usernameMax");
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
